import io
import base64
import json
from pathlib import Path
import re
import google.generativeai as genai
import PyPDF2
import pandas as pd
import docx
from PIL import Image
import requests  # Ensure this is installed: pip install requests
import os

# Use your API key as provided.
API_KEY = "AIzaSyDRVj0Z_4xI3fy55Ux657tHnNGoC7JHl5g"
genai.configure(api_key=API_KEY)

def load_file_text(file_path: str) -> str:
    """
    Extract text from various file types.
    Supports: PDF, DOCX, XLS/XLSX, TXT, and common image formats.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"{file_path} does not exist.")
    
    suffix = path.suffix.lower()
    try:
        if suffix in ['.jpg', '.jpeg', '.png', '.gif', '.bmp']:
            return process_image(path)
        elif suffix == '.pdf':
            return extract_pdf_text(path)
        elif suffix == '.docx':
            return extract_docx_text(path)
        elif suffix in ['.xls', '.xlsx']:
            return extract_excel_text(path)
        elif suffix == '.txt':
            return path.read_text(encoding="utf-8")
        else:
            raise ValueError(f"Unsupported file type: {suffix}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return ""

def process_image(path: Path) -> str:
    """
    Process an image file: resize if needed, encode to base64,
    and have the model describe it.
    """
    with Image.open(path) as img:
        max_size = (800, 800)
        img.thumbnail(max_size)
        buffer = io.BytesIO()
        fmt = img.format if img.format else "JPEG"
        img.save(buffer, format=fmt)
        buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    
    prompt = [
        "Thoroughly describe the contents of this image. Extract any visible text and provide a comprehensive analysis.",
        {"mime_type": "image/jpeg", "data": image_base64}
    ]
    try:
        response = genai.GenerativeModel('gemini-2.0-flash').generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error processing image: {e}")
        return ""

def extract_pdf_text(path: Path) -> str:
    """Extract text from a PDF file."""
    with path.open("rb") as file:
        reader = PyPDF2.PdfReader(file)
        texts = [page.extract_text() for page in reader.pages if page.extract_text()]
        return "\n".join(texts)

def extract_docx_text(path: Path) -> str:
    """Extract text from a DOCX file."""
    doc = docx.Document(path)
    return "\n".join(paragraph.text for paragraph in doc.paragraphs)

def extract_excel_text(path: Path) -> str:
    """Extract text from an Excel file."""
    df = pd.read_excel(path)
    return df.to_string()

def extract_user_stories_json(document: str) -> list:
    """
    Generate functional user stories from a technical document.
    
    The model is instructed to output ONLY a valid JSON array.
    Each JSON object must have the keys:
      'title', 'user_role', 'goal', 'benefit', 'acceptance_criteria', 'priority', and 'document'.
    
    Guidelines:
      - Extract only functional user stories.
      - Ensure clarity and avoid technical jargon.
      - Group related stories if applicable.
      - Use the MoSCoW prioritization framework for the "priority" field.
    
    IMPORTANT: Output must be valid JSON with no extra characters.
    """
    prompt = (
        "Extract user stories from the following technical requirement document and output ONLY a valid JSON array. "
        "Each element in the array must be a JSON object with the keys: 'title', 'user_role', 'goal', 'benefit', "
        "'acceptance_criteria', 'priority', and 'document'. "
        "The 'priority' field should be one of: 'Must Have', 'Should Have', 'Could Have', or 'Won't Have'. "
        "Do not output anything else besides the JSON array.\n\n"
        "Document:\n\n{document}\n\n"
        "Guidelines:\n"
        "- Extract only functional user stories.\n"
        "- Ensure clarity and avoid technical jargon.\n"
        "- Group related stories if applicable.\n"
        "- Use the MoSCoW prioritization framework for the priority field."
    ).format(document=document)
    
    try:
        model = genai.GenerativeModel(
            'gemini-2.0-flash',
            generation_config={
                'temperature': 0.3,
                'top_p': 0.9,
                'max_output_tokens': 3000
            }
        )
        response = model.generate_content(prompt)
        cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
        
        # Attempt to parse the JSON
        try:
            stories = json.loads(cleaned_text)
            return stories
        except json.JSONDecodeError:
            # Attempt to extract the JSON array substring
            match = re.search(r'\[.*\]', cleaned_text, re.DOTALL)
            if match:
                json_text = match.group(0)
                try:
                    stories = json.loads(json_text)
                    return stories
                except json.JSONDecodeError as e:
                    print("Warning: Failed to parse JSON after substring extraction:", e)
                    print("Extracted substring:")
                    print(json_text)
                    # As a final hack, if missing a closing bracket, add it.
                    if not json_text.strip().endswith("]"):
                        fixed_text = json_text.strip() + "]"
                        try:
                            stories = json.loads(fixed_text)
                            return stories
                        except Exception as e:
                            print("Warning: Failed to fix JSON by appending closing bracket:", e)
                    return []
            else:
                print("Warning: No JSON array found in the response.")
                print("Raw cleaned response:")
                print(cleaned_text)
                return []
    except Exception as e:
        print(f"Error generating user stories: {e}")
        return []

def push_story_to_jira(story: dict):
    """
    Push a user story to Jira.
    Customize the Jira URL, authentication, and payload fields as required.
    """
    jira_domain = os.getenv("JIRA_DOMAIN")
    jira_email = os.getenv("JIRA_EMAIL")
    jira_api_token = os.getenv("JIRA_API_TOKEN")
    project_key = os.getenv("PROJECT_KEY")

    if not all([jira_domain, jira_email, jira_api_token, project_key]):
        raise ValueError("Missing required Jira configuration in environment variables")

    jira_url = f"https://{jira_domain}/rest/api/2/issue"
    auth = (jira_email, jira_api_token)
    headers = {"Content-Type": "application/json"}
    
    payload = {
        "fields": {
            "project": {"key": project_key},
            "summary": story.get("title", "User Story"),
            "description": json.dumps(story, indent=2),
            "issuetype": {"name": "Story"}
        }
    }
    try:
        response = requests.post(jira_url, auth=auth, headers=headers, data=json.dumps(payload))
        if response.status_code == 201:
            print(f"Story '{story.get('title')}' successfully pushed to Jira.")
        else:
            print(f"Failed to push story '{story.get('title')}' to Jira. Status code: {response.status_code}. Response: {response.text}")
    except Exception as e:
        print(f"Error pushing story '{story.get('title')}' to Jira: {e}")

def main():
    file_path = input("Enter the path to your document: ").strip()
    try:
        document_text = load_file_text(file_path)
    except Exception as e:
        print(f"Failed to load document: {e}")
        return
    
    if not document_text:
        print("No text could be extracted from the document.")
        return

    print("\nGenerating user stories in JSON format from the document...\n")
    stories = extract_user_stories_json(document_text)
    if stories:
        print("Extracted User Stories (JSON):\n")
        print(json.dumps(stories, indent=2))
        
        # Save JSON output for reference.
        output_file = Path("user_stories.json")
        with output_file.open("w", encoding="utf-8") as f:
            json.dump(stories, f, indent=2)
        print(f"\nUser stories saved to '{output_file}'.")
        
        # Wait for user input to push to Jira.
        push_input = input("\nPress 'y' to push these stories to Jira, or any other key to exit: ").strip().lower()
        if push_input == "y":
            for story in stories:
                push_story_to_jira(story)
        else:
            print("Skipping Jira push.")
    else:
        print("No user stories could be extracted.")

if __name__ == "__main__":
    main()
