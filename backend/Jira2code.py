import json
import os
import requests
import google.generativeai as genai
from pprint import pprint
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Jira configuration from environment variables
JIRA_DOMAIN = os.getenv("JIRA_DOMAIN")
JIRA_API_URL = f"https://{JIRA_DOMAIN}/rest/api/2/search"
JIRA_EMAIL = os.getenv("JIRA_EMAIL")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")
PROJECT_KEY = os.getenv("PROJECT_KEY")

# Gemini configuration
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")
genai.configure(api_key=API_KEY)

if not all([JIRA_DOMAIN, JIRA_EMAIL, JIRA_API_TOKEN, PROJECT_KEY]):
    raise ValueError("Missing required Jira configuration in environment variables")

def get_jira_issues(jql: str = None, max_results: int = 50) -> list:
    """
    Retrieve Jira issues with retry mechanism and validation.
    """
    # Debug environment variables (without exposing sensitive data)
    print("Checking Jira configuration...")
    print(f"JIRA_DOMAIN: {JIRA_DOMAIN}")
    print(f"PROJECT_KEY: {PROJECT_KEY}")
    print(f"JIRA_EMAIL configured: {'Yes' if JIRA_EMAIL else 'No'}")
    print(f"JIRA_API_TOKEN configured: {'Yes' if JIRA_API_TOKEN else 'No'}")
    
    if not all([JIRA_EMAIL, JIRA_API_TOKEN]):
        error_msg = "Jira credentials not properly configured"
        print(error_msg)
        raise ValueError(error_msg)

    if jql is None:
        jql = f"project = {PROJECT_KEY} AND issuetype = Story ORDER BY created DESC"
    
    print(f"Using JQL query: {jql}")  # Debug log
    
    params = {
        "jql": jql,
        "maxResults": max_results,
        "fields": "summary,description,priority,status,assignee,created,updated"
    }
    auth = (JIRA_EMAIL, JIRA_API_TOKEN)
    headers = {"Content-Type": "application/json"}

    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"Attempt {attempt + 1}: Making request to Jira API...")  # Debug log
            r = requests.get(JIRA_API_URL, params=params, auth=auth, headers=headers, timeout=10)
            r.raise_for_status()
            data = r.json()
            issues_count = len(data.get("issues", []))
            print(f"Successfully retrieved {issues_count} issues")
            if issues_count == 0:
                print("Warning: No issues found with the current query")
            return data.get("issues", [])
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {str(e)}")  # Debug log
            if attempt == max_retries - 1:
                print(f"Failed to retrieve issues after {max_retries} attempts: {str(e)}")
                return []
            print(f"Attempt {attempt + 1} failed, retrying...")
            continue

def display_issues(issues: list):
    """
    Display a numbered list of Jira issues (user stories).
    """
    print("\nUser Stories in Jira:")
    for idx, issue in enumerate(issues, start=1):
        summary = issue.get("fields", {}).get("summary", "No Summary")
        print(f"{idx}. {summary}")

def select_issue(issues: list) -> dict:
    """
    Ask the user to select one issue by its number.
    """
    try:
        choice = int(input("\nEnter the number of the user story you want to generate code for: "))
        if 1 <= choice <= len(issues):
            return issues[choice - 1]
        else:
            print("Invalid selection.")
            return None
    except ValueError:
        print("Please enter a valid number.")
        return None

def validate_code_size(code: dict, max_size: int = 2000) -> dict:
    """
    Validates and potentially splits large code sections.
    """
    validated_code = {"frontend": {}, "backend": {}}
    
    for section in ["frontend", "backend"]:
        if section not in code:
            continue
            
        for key, content in code[section].items():
            if not content:
                validated_code[section][key] = ""
                continue
                
            if len(content) > max_size:
                print(f"Warning: {section}.{key} exceeds {max_size} characters ({len(content)} chars)")
                validated_code[section][key] = content[:max_size]
                print(f"Truncated {section}.{key} to {max_size} characters")
            else:
                validated_code[section][key] = content
    
    return validated_code

def generate_code_for_story(story: dict) -> dict:
    """
    Generate full-stack code with improved structure and validation.
    Handles large responses and improves JSON parsing.
    """
    summary = story.get("fields", {}).get("summary", "")
    description = story.get("fields", {}).get("description", "")
    
    prompt = f"""Generate a full-stack code implementation for the following user story.
Output a valid JSON object with the following structure:
{{
    "frontend": {{
        "html": "HTML code with semantic tags and accessibility features",
        "css": "Modern CSS with responsive design",
        "javascript": "Clean JavaScript with error handling"
    }},
    "backend": {{
        "python": "Flask API endpoints with proper error handling",
        "models": "SQLAlchemy models if needed",
        "tests": "Basic unit tests"
    }}
}}

User Story:
Title: {summary}
Description: {description}

Requirements:
- Use modern HTML5 semantic elements
- Implement responsive design
- Include proper error handling
- Follow RESTful API principles
- Add basic input validation
- Include comments for complex logic
- Follow PEP 8 style guide for Python code
- Keep each code section under 2000 characters
"""
    
    try:
        model = genai.GenerativeModel(
            'gemini-2.0-flash',
            generation_config={
                'temperature': 0.3,
                'top_p': 0.9,
                'max_output_tokens': 8000  # Increased token limit
            }
        )
        response = model.generate_content(prompt)
        
        # Clean and validate the response
        cleaned_text = response.text.strip()
        
        # Remove any markdown code block markers
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        cleaned_text = cleaned_text.strip()
        
        try:
            # First attempt to parse the JSON
            code_json = json.loads(cleaned_text)
            
            # Validate the structure
            required_sections = {
                "frontend": ["html", "css", "javascript"],
                "backend": ["python", "models", "tests"]
            }
            
            for section, subsections in required_sections.items():
                if section not in code_json:
                    print(f"Missing required section: {section}")
                    return {}
                for subsection in subsections:
                    if subsection not in code_json[section]:
                        print(f"Missing required subsection: {section}.{subsection}")
                        return {}
            
            # Validate and potentially split large code sections
            code_json = validate_code_size(code_json)
            
            return code_json
            
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON from generated code: {str(e)}")
            print("Raw output length:", len(cleaned_text))
            print("First 500 characters of raw output:", cleaned_text[:500])
            print("Last 500 characters of raw output:", cleaned_text[-500:])
            
            # Attempt to fix common JSON issues
            try:
                # Try to fix truncated SON
                if not cleaned_text.endswith("}"):
                    cleaned_text = cleaned_text + "}"
                if cleaned_text.count("{") > cleaned_text.count("}"):
                    cleaned_text = cleaned_text + "}" * (cleaned_text.count("{") - cleaned_text.count("}"))
                
                code_json = json.loads(cleaned_text)
                print("Successfully fixed and parsed JSON")
                
                # Validate the fixed JSON
                code_json = validate_code_size(code_json)
                return code_json
            except:
                print("Failed to fix JSON")
                return {}
            
    except Exception as e:
        print(f"Error generating code: {str(e)}")
        return {}

def push_code_to_files(code: dict, issue_key: str) -> str:
    """
    Save the generated code to files with proper organization.
    
    Args:
        code: Dictionary containing code snippets
        issue_key: Jira issue key
        
    Returns:
        Path to the generated code folder
    """
    from datetime import datetime
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    folder = f"generated_code/{issue_key}_{timestamp}"
    
    try:
        # Create main directory
        os.makedirs(folder, exist_ok=True)

        # Create frontend and backend directories
        frontend_dir = os.path.join(folder, "frontend")
        backend_dir = os.path.join(folder, "backend")
        os.makedirs(frontend_dir, exist_ok=True)
        os.makedirs(backend_dir, exist_ok=True)

        # Save frontend files
        frontend = code.get("frontend", {})
        for key, content in frontend.items():
            extension = "js" if key == "javascript" else key
            filename = os.path.join(frontend_dir, f"index.{extension}")
            with open(filename, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Saved {filename}")

        # Save backend files
        backend = code.get("backend", {})
        for key, content in backend.items():
            filename = os.path.join(backend_dir, f"{key}.py")
            with open(filename, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Saved {filename}")

        # Create a README.md with story details
        readme_content = f"""# Generated Code for {issue_key}

Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## Structure
- frontend/
  - index.html
  - index.css
  - index.js
- backend/
  - python.py
  - models.py
  - tests.py

## Setup
1. Install backend dependencies:
   ```bash
   pip install flask sqlalchemy pytest
   ```
2. Run the Flask server:
   ```bash
   python backend/python.py
   ```
3. Open frontend/index.html in your browser
"""
        with open(os.path.join(folder, "README.md"), "w", encoding="utf-8") as f:
            f.write(readme_content)
        print(f"Saved README.md")

        return folder

    except Exception as e:
        print(f"Error saving code files: {str(e)}")
        return None

def main():
    try:
        issues = get_jira_issues()
        if not issues:
            print("No issues found.")
            return

        print("\nUser Stories in Jira:")
        for idx, issue in enumerate(issues, start=1):
            summary = issue.get("fields", {}).get("summary", "No Summary")
            status = issue.get("fields", {}).get("status", {}).get("name", "Unknown")
            print(f"{idx}. [{status}] {summary}")

        try:
            choice = int(input("\nEnter the number of the user story to generate code for: "))
            if not 1 <= choice <= len(issues):
                print("Invalid selection.")
                return
        except ValueError:
            print("Please enter a valid number.")
            return

        selected_issue = issues[choice - 1]
        print("\nSelected User Story:")
        pprint(selected_issue.get("fields", {}).get("summary", "No Summary"))
        
        if input("Generate code for this story? (y/n): ").strip().lower() != "y":
            return

        code = generate_code_for_story(selected_issue)
        if not code:
            print("No code was generated.")
            return

        print("\nCode Generation Summary:")
        for section, files in code.items():
            print(f"\n{section.title()} Files:")
            for file_type in files:
                print(f"- {file_type}")

        if input("\nSave the generated code to files? (y/n): ").strip().lower() == "y":
            folder = push_code_to_files(code, selected_issue.get("key", "NO_KEY"))
            if folder:
                print(f"\nCode saved to: {folder}")
            else:
                print("\nFailed to save code files.")

    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()
