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
import requests
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure Gemini AI
API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=API_KEY)

# Jira configuration
JIRA_DOMAIN = os.getenv('JIRA_DOMAIN', 'prathamgadkari.atlassian.net')
JIRA_EMAIL = os.getenv('JIRA_EMAIL', 'prathamgadkari@gmail.com')
JIRA_API_TOKEN = os.getenv('JIRA_API_TOKEN')

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
        raise Exception(f"Error processing {file_path}: {e}")

def process_image(path: Path) -> str:
    """Process an image file using Gemini Vision."""
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
        raise Exception(f"Error processing image: {e}")

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
    Generate functional user stories from a technical document using Gemini AI.
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
        
        try:
            stories = json.loads(cleaned_text)
            return stories
        except json.JSONDecodeError:
            match = re.search(r'\[.*\]', cleaned_text, re.DOTALL)
            if match:
                json_text = match.group(0)
                try:
                    stories = json.loads(json_text)
                    return stories
                except json.JSONDecodeError:
                    if not json_text.strip().endswith("]"):
                        fixed_text = json_text.strip() + "]"
                        try:
                            stories = json.loads(fixed_text)
                            return stories
                        except Exception:
                            raise Exception("Failed to parse JSON after fixes")
                    raise Exception("Failed to parse JSON from extracted substring")
            else:
                raise Exception("No JSON array found in the response")
    except Exception as e:
        raise Exception(f"Error generating user stories: {e}")

def push_story_to_jira(story: dict):
    """Push a user story to Jira."""
    jira_url = f"https://{JIRA_DOMAIN}/rest/api/2/issue"
    auth = (JIRA_EMAIL, JIRA_API_TOKEN)
    headers = {"Content-Type": "application/json"}
    
    payload = {
        "fields": {
            "project": {"key": "PROJ"},
            "summary": story.get("title", "User Story"),
            "description": json.dumps(story, indent=2),
            "issuetype": {"name": "Story"}
        }
    }
    
    response = requests.post(jira_url, auth=auth, headers=headers, data=json.dumps(payload))
    if response.status_code != 201:
        raise Exception(f"Failed to push story to Jira. Status code: {response.status_code}. Response: {response.text}") 