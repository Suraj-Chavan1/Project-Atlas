import json
import os
import re
import requests
from openai import AzureOpenAI
import httpx
from pprint import pprint
from typing import Dict, Optional, List
from datetime import datetime

# Azure OpenAI Configuration
AZURE_ENDPOINT = "https://suraj-m9lgdbv9-eastus2.cognitiveservices.azure.com/"
AZURE_API_KEY = "75PVa3SAy9S2ZR590gZesyTNDMZtb3Oa5EdHlRbqWeQ89bmoOGl4JQQJ99BDACHYHv6XJ3w3AAAAACOGUP8d"
AZURE_API_VERSION = "2024-12-01-preview"  # Updated API version
DEPLOYMENT_NAME = "gpt-4.1"  # Updated deployment name

# Initialize Azure OpenAI client
client = AzureOpenAI(
    azure_endpoint=AZURE_ENDPOINT,
    api_key=AZURE_API_KEY,
    api_version=AZURE_API_VERSION
)

# Jira configuration 
JIRA_DOMAIN = "prathamgadkari.atlassian.net"
JIRA_API_URL = f"https://{JIRA_DOMAIN}/rest/api/2/search"
JIRA_EMAIL = "prathamgadkari@gmail.com"
JIRA_API_TOKEN = "ATATT3xFfGF0LXSWvbAlLm1lVXyxSroefrBXONpTLDg5mzfknXUUxTYAjQ0u59wKKGh3ObCEnducPVGqRwCLoxDu8oc4xx3aBAHj6A9Tzuj2OqiUszHVo3UvYrpmblYC2xHttFxo5ULieeRE2LNIfR3w_l2YNJTvACQ_zmBnkt6Tjvenqyu2pEM=99E9EA51"
PROJECT_KEY = "SCRUM"

# Validate configurations
if not all([JIRA_DOMAIN, JIRA_EMAIL, JIRA_API_TOKEN, PROJECT_KEY]):
    raise ValueError("Missing required Jira configuration")

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

def generate_code_for_story(story: dict, tech_stack: Optional[Dict[str, str]] = None) -> dict:
    """
    Generate full-stack code with improved structure and validation.
    """
    summary = story.get("fields", {}).get("summary", "")
    description = story.get("fields", {}).get("description", "")
    
    # Default tech stack if none provided
    if not tech_stack:
        tech_stack = {
            "frontend_framework": "vanilla",
            "css_framework": "vanilla",
            "backend_framework": "flask",
            "database": "sqlite",
            "auth": "jwt"
        }
    
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

Technical Requirements:
Frontend:
- Framework: {tech_stack['frontend_framework']}
- CSS Framework: {tech_stack['css_framework']}
- Use modern HTML5 semantic elements
- Implement responsive design
- Include proper error handling

Backend:
- Framework: {tech_stack['backend_framework']}
- Database: {tech_stack['database']}
- Authentication: {tech_stack['auth']}
- Follow RESTful API principles
- Add basic input validation
- Include comments for complex logic
- Follow PEP 8 style guide for Python code
- Keep each code section under 2000 characters
"""
    
    try:
        response = client.chat.completions.create(
            model=DEPLOYMENT_NAME,
            messages=[
                {"role": "system", "content": "You are an expert full-stack developer. Always respond with valid JSON only."},
                {"role": "user", "content": prompt + "\n IMPORTANT: Respond with ONLY the JSON object, no additional text or notes."}
            ],
            max_tokens=8000,
            temperature=0.3,
            top_p=0.9
        )
        
        # Clean and validate the response
        cleaned_text = response.choices[0].message.content.strip()
        
        # Remove any markdown code block markers and extra text
        if "```" in cleaned_text:
            # Extract text between first ``` and last ```
            start = cleaned_text.find("```") + 3
            end = cleaned_text.rfind("```")
            if start < end:
                cleaned_text = cleaned_text[start:end]
            
            # Remove language identifier if present (e.g., ```json)
            if cleaned_text.lower().startswith("json\n"):
                cleaned_text = cleaned_text[5:]
        
        # Remove any text after the last closing brace
        last_brace = cleaned_text.rfind("}")
        if last_brace != -1:
            cleaned_text = cleaned_text[:last_brace + 1]

        # Remove any text before the first opening brace
        first_brace = cleaned_text.find("{")
        if first_brace != -1:
            cleaned_text = cleaned_text[first_brace:]
        
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
                # Try to fix truncated JSON
                if not cleaned_text.endswith("}"):
                    cleaned_text = cleaned_text + "}"
                if cleaned_text.count("{") > cleaned_text.count("}"):
                    cleaned_text = cleaned_text + "}" * (cleaned_text.count("{") - cleaned_text.count("}"))
                
                # Remove any trailing commas before closing braces
                cleaned_text = re.sub(r',(\s*})', r'\1', cleaned_text)
                
                # Fix any missing quotes around property names
                cleaned_text = re.sub(r'([{,]\s*)(\w+)(:)', r'\1"\2"\3', cleaned_text)
                
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

def get_file_structure(tech_stack: Dict[str, str]) -> Dict[str, list]:
    """
    Get the appropriate file structure based on selected tech stack
    """
    file_structure = {
        "frontend": [],
        "backend": []
    }
    
    # Frontend files based on framework
    if tech_stack["frontend_framework"] == "react":
        file_structure["frontend"] = ["App.jsx", "components/", "styles/", "index.jsx"]
    elif tech_stack["frontend_framework"] == "vue":
        file_structure["frontend"] = ["App.vue", "components/", "router.js", "store.js"]
    elif tech_stack["frontend_framework"] == "angular":
        file_structure["frontend"] = ["app.component.ts", "app.module.ts", "app-routing.module.ts", "styles.scss"]
    else:  # vanilla
        file_structure["frontend"] = ["index.html", "styles.css", "main.js"]
    
    # CSS files based on framework
    if tech_stack["css_framework"] == "tailwind":
        file_structure["frontend"].extend(["tailwind.config.js", "postcss.config.js"])
    elif tech_stack["css_framework"] == "material":
        file_structure["frontend"].append("theme.js")
    
    # Backend files based on framework
    if tech_stack["backend_framework"] == "flask":
        file_structure["backend"] = ["app.py", "models.py", "routes/", "tests/", "config.py"]
    elif tech_stack["backend_framework"] == "fastapi":
        file_structure["backend"] = ["main.py", "models.py", "schemas.py", "database.py", "routers/", "tests/"]
    elif tech_stack["backend_framework"] == "django":
        file_structure["backend"] = [
            "manage.py",
            "requirements.txt",
            "project/settings.py",
            "project/urls.py",
            "app/models.py",
            "app/views.py",
            "app/serializers.py",
            "app/tests.py"
        ]
    elif tech_stack["backend_framework"] == "express":
        file_structure["backend"] = [
            "server.js",
            "package.json",
            "routes/",
            "controllers/",
            "models/",
            "middleware/",
            "tests/"
        ]
    
    return file_structure

def push_code_to_files(code: dict, issue_key: str, tech_stack: Dict[str, str]) -> str:
    """
    Save the generated code to files with proper organization based on tech stack.
    
    Args:
        code: Dictionary containing code snippets
        issue_key: Jira issue key
        tech_stack: Dictionary containing tech stack choices
        
    Returns:
        Path to the generated code folder
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    folder = f"generated_code/{issue_key}_{timestamp}"
    
    try:
        # Create main directory
        os.makedirs(folder, exist_ok=True)

        # Get file structure based on tech stack
        file_structure = get_file_structure(tech_stack)

        # Create frontend directory and files
        frontend_dir = os.path.join(folder, "frontend")
        os.makedirs(frontend_dir, exist_ok=True)
        
        # Create any nested frontend directories
        for file_path in file_structure["frontend"]:
            if file_path.endswith("/"):
                os.makedirs(os.path.join(frontend_dir, file_path.rstrip("/")), exist_ok=True)
                continue
                
            # Get content based on file type
            content = ""
            if file_path.endswith((".js", ".jsx", ".ts", ".tsx")):
                content = code["frontend"].get("javascript", "")
            elif file_path.endswith((".css", ".scss")):
                content = code["frontend"].get("css", "")
            elif file_path.endswith(".html"):
                content = code["frontend"].get("html", "")
            elif file_path.endswith(".vue"):
                content = "\n".join([
                    code["frontend"].get("html", ""),
                    "<script>\n" + code["frontend"].get("javascript", "") + "\n</script>",
                    "<style>\n" + code["frontend"].get("css", "") + "\n</style>"
                ])
            
            # Write the file
            full_path = os.path.join(frontend_dir, file_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Saved {full_path}")

        # Create backend directory and files
        backend_dir = os.path.join(folder, "backend")
        os.makedirs(backend_dir, exist_ok=True)
        
        # Create any nested backend directories
        for file_path in file_structure["backend"]:
            if file_path.endswith("/"):
                os.makedirs(os.path.join(backend_dir, file_path.rstrip("/")), exist_ok=True)
                continue
                
            # Get content based on file type
            content = ""
            if "models" in file_path:
                content = code["backend"].get("models", "")
            elif "tests" in file_path:
                content = code["backend"].get("tests", "")
            else:
                content = code["backend"].get("python", "")  # or main backend code
            
            # Write the file
            full_path = os.path.join(backend_dir, file_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Saved {full_path}")

        # Create a dynamic README.md based on tech stack
        readme_content = f"""# Generated Code for {issue_key}

Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## Tech Stack
- Frontend: {tech_stack['frontend_framework'].title()}
- CSS Framework: {tech_stack['css_framework'].title()}
- Backend: {tech_stack['backend_framework'].title()}
- Database: {tech_stack['database'].title()}
- Authentication: {tech_stack['auth'].upper()}

## Structure
Frontend:
{chr(10).join('- ' + f for f in file_structure['frontend'])}

Backend:
{chr(10).join('- ' + f for f in file_structure['backend'])}

## Setup
"""
        # Add setup instructions based on tech stack
        if tech_stack["frontend_framework"] in ["react", "vue", "angular"]:
            readme_content += """1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
   """
        
        if tech_stack["backend_framework"] == "flask":
            readme_content += """2. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
3. Run the Flask server:
   ```bash
   python app.py
   ```
   """
        elif tech_stack["backend_framework"] == "fastapi":
            readme_content += """2. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
3. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   """
        elif tech_stack["backend_framework"] == "django":
            readme_content += """2. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
3. Setup database:
   ```bash
   python manage.py migrate
   ```
4. Run the Django server:
   ```bash
   python manage.py runserver
   ```
   """
        elif tech_stack["backend_framework"] == "express":
            readme_content += """2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Run the Express server:
   ```bash
   npm start
   ```
   """
            
        if tech_stack["frontend_framework"] in ["react", "vue", "angular"]:
            readme_content += """4. Run the frontend development server:
   ```bash
   cd frontend
   npm start
   ```
   """
        else:
            readme_content += """4. Open frontend/index.html in your browser"""

        with open(os.path.join(folder, "README.md"), "w", encoding="utf-8") as f:
            f.write(readme_content)
        print(f"Saved README.md")

        return folder

    except Exception as e:
        print(f"Error saving code files: {str(e)}")
        return None

def get_tech_stack_choice():
    """
    Get user's preferred tech stack choices
    """
    print("\nSelect Frontend Framework:")
    print("1. React")
    print("2. Vue")
    print("3. Angular")
    print("4. Vanilla JavaScript")
    frontend_choice = input("Enter your choice (1-4): ").strip()
    
    frontend_framework = {
        "1": "react",
        "2": "vue",
        "3": "angular",
        "4": "vanilla"
    }.get(frontend_choice, "vanilla")

    print("\nSelect CSS Framework:")
    print("1. Tailwind")
    print("2. Bootstrap")
    print("3. Material UI")
    print("4. Vanilla CSS")
    css_choice = input("Enter your choice (1-4): ").strip()
    
    css_framework = {
        "1": "tailwind",
        "2": "bootstrap",
        "3": "material",
        "4": "vanilla"
    }.get(css_choice, "vanilla")

    print("\nSelect Backend Framework:")
    print("1. Flask")
    print("2. FastAPI")
    print("3. Django")
    print("4. Express.js")
    backend_choice = input("Enter your choice (1-4): ").strip()
    
    backend_framework = {
        "1": "flask",
        "2": "fastapi",
        "3": "django",
        "4": "express"
    }.get(backend_choice, "flask")

    print("\nSelect Database:")
    print("1. SQLite")
    print("2. PostgreSQL")
    print("3. MongoDB")
    print("4. MySQL")
    db_choice = input("Enter your choice (1-4): ").strip()
    
    database = {
        "1": "sqlite",
        "2": "postgresql",
        "3": "mongodb",
        "4": "mysql"
    }.get(db_choice, "sqlite")

    print("\nSelect Authentication Method:")
    print("1. JWT")
    print("2. Session-based")
    print("3. OAuth")
    print("4. Basic Auth")
    auth_choice = input("Enter your choice (1-4): ").strip()
    
    auth = {
        "1": "jwt",
        "2": "session",
        "3": "oauth",
        "4": "basic"
    }.get(auth_choice, "jwt")

    return {
        "frontend_framework": frontend_framework,
        "css_framework": css_framework,
        "backend_framework": backend_framework,
        "database": database,
        "auth": auth
    }

def regenerate_code_with_context(story: dict, tech_stack: Dict[str, str], additional_context: str) -> dict:
    """
    Regenerate code for a user story with additional context provided by the user.
    
    Args:
        story: The user story dictionary
        tech_stack: Dictionary containing tech stack choices
        additional_context: Additional context or requirements from the user
        
    Returns:
        Dictionary containing the regenerated code
    """
    summary = story.get("fields", {}).get("summary", "")
    description = story.get("fields", {}).get("description", "")
    
    prompt = f"""Regenerate a full-stack code implementation for the following user story with the additional context provided.
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

Additional Context:
{additional_context}

Technical Requirements:
Frontend:
- Framework: {tech_stack['frontend_framework']}
- CSS Framework: {tech_stack['css_framework']}
- Use modern HTML5 semantic elements
- Implement responsive design
- Include proper error handling

Backend:
- Framework: {tech_stack['backend_framework']}
- Database: {tech_stack['database']}
- Authentication: {tech_stack['auth']}
- Follow RESTful API principles
- Add basic input validation
- Include comments for complex logic
- Follow PEP 8 style guide for Python code
- Keep each code section under 2000 characters
"""
    
    try:
        response = client.chat.completions.create(
            model=DEPLOYMENT_NAME,
            messages=[
                {"role": "system", "content": "You are an expert full-stack developer. Always respond with valid JSON only."},
                {"role": "user", "content": prompt + "\n IMPORTANT: Respond with ONLY the JSON object, no additional text or notes."}
            ],
            max_tokens=8000,
            temperature=0.3,
            top_p=0.9
        )
        # Clean and validate the response
        cleaned_text = response.choices[0].message.content.strip()
        
        # Remove any markdown code block markers and extra text
        if "```" in cleaned_text:
            # Extract text between first ``` and last ```
            start = cleaned_text.find("```") + 3
            end = cleaned_text.rfind("```")
            if start < end:
                cleaned_text = cleaned_text[start:end]
            
            # Remove language identifier if present (e.g., ```json)
            if cleaned_text.lower().startswith("json\n"):
                cleaned_text = cleaned_text[5:]
        
        # Remove any text after the last closing brace
        last_brace = cleaned_text.rfind("}")
        if last_brace != -1:
            cleaned_text = cleaned_text[:last_brace + 1]

        # Remove any text before the first opening brace
        first_brace = cleaned_text.find("{")
        if first_brace != -1:
            cleaned_text = cleaned_text[first_brace:]
        
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
                # Try to fix truncated JSON
                if not cleaned_text.endswith("}"):
                    cleaned_text = cleaned_text + "}"
                if cleaned_text.count("{") > cleaned_text.count("}"):
                    cleaned_text = cleaned_text + "}" * (cleaned_text.count("{") - cleaned_text.count("}"))
                
                # Remove any trailing commas before closing braces
                cleaned_text = re.sub(r',(\s*})', r'\1', cleaned_text)
                
                # Fix any missing quotes around property names
                cleaned_text = re.sub(r'([{,]\s*)(\w+)(:)', r'\1"\2"\3', cleaned_text)
                
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

def is_url(path_or_url: str) -> bool:
    """
    Check if the input is a URL.
    
    Args:
        path_or_url: The input string to check
        
    Returns:
        True if the input is a URL, False otherwise
    """
    return path_or_url.startswith(('http://', 'https://'))

def download_from_url(url: str) -> str:
    """
    Download a file from a URL and return the local path.
    
    Args:
        url: The URL to download from
        
    Returns:
        The local path to the downloaded file
    """
    import tempfile
    import requests
    from urllib.parse import urlparse
    
    # Create a temporary file with the same extension as the URL
    parsed_url = urlparse(url)
    file_name = os.path.basename(parsed_url.path)
    if not file_name:
        file_name = "downloaded_file.pdf"  # Default to PDF if no extension found
    
    temp_dir = tempfile.mkdtemp()
    local_path = os.path.join(temp_dir, file_name)
    
    # Download the file
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    with open(local_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    return local_path

def extract_from_url(url: str) -> str:
    """
    Extract text from a document at a URL using Azure Document Intelligence.
    
    Args:
        url: The URL of the document
        
    Returns:
        The extracted text
    """
    # Download the file from the URL
    local_path = download_from_url(url)
    
    try:
        # Extract text using the existing function
        text = load_file_text(local_path)
        return text
    finally:
        # Clean up the temporary file
        try:
            os.remove(local_path)
            os.rmdir(os.path.dirname(local_path))
        except:
            pass

def load_file_text(file_path: str) -> str:
    """
    Load text from a file or URL.
    
    Args:
        file_path: Path to the file or URL
        
    Returns:
        The text content
    """
    if is_url(file_path):
        return extract_from_url(file_path)
    
    # Handle local file
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    # Extract text based on file type
    file_ext = os.path.splitext(file_path)[1].lower()
    
    if file_ext == '.pdf':
        return extract_from_pdf(file_path)
    elif file_ext in ['.doc', '.docx']:
        return extract_from_docx(file_path)
    elif file_ext in ['.txt', '.md']:
        return extract_from_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_ext}")

def process_multiple_documents(document_paths: List[str]) -> str:
    """
    Process multiple documents and combine their content.
    
    Args:
        document_paths: List of file paths or URLs
        
    Returns:
        Combined text from all documents
    """
    combined_text = ""
    
    for path in document_paths:
        try:
            print(f"Processing document: {path}")
            text = load_file_text(path)
            combined_text += f"\n\n--- Content from {path} ---\n\n{text}"
        except Exception as e:
            print(f"Error processing {path}: {str(e)}")
    
    return combined_text

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

        # Get tech stack choices from user
        tech_stack = get_tech_stack_choice()
        
        # Ask if user wants to provide additional context
        additional_context = ""
        if input("Do you want to provide additional context or requirements? (y/n): ").strip().lower() == "y":
            print("\nEnter your additional context or requirements (press Enter twice to finish):")
            lines = []
            while True:
                line = input()
                if line == "" and lines and lines[-1] == "":
                    break
                lines.append(line)
            additional_context = "\n".join(lines[:-1])  # Remove the last empty line
        
        # Ask if user wants to provide document paths or URLs
        document_paths = []
        if input("Do you want to provide document paths or URLs? (y/n): ").strip().lower() == "y":
            print("\nEnter document paths or URLs (one per line, press Enter twice to finish):")
            print("Supported formats: PDF, DOCX, TXT, MD, and blob storage URLs")
            lines = []
            while True:
                line = input()
                if line == "" and lines and lines[-1] == "":
                    break
                lines.append(line)
            document_paths = lines[:-1]  # Remove the last empty line
        
        # Process documents if provided
        document_content = ""
        if document_paths:
            print("\nProcessing documents...")
            document_content = process_multiple_documents(document_paths)
            print(f"Successfully processed {len(document_paths)} documents.")
            
            # Add document content to additional context
            if additional_context:
                additional_context += "\n\nDocument Content:\n" + document_content
            else:
                additional_context = "Document Content:\n" + document_content
        
        # Generate code with or without additional context
        if additional_context:
            print("\nGenerating code with additional context...")
            code = regenerate_code_with_context(selected_issue, tech_stack, additional_context)
        else:
            print("\nGenerating code...")
            code = generate_code_for_story(selected_issue, tech_stack)
            
        if not code:
            print("No code was generated.")
            return

        print("\nCode Generation Summary:")
        print("\nTech Stack:")
        print(f"Frontend Framework: {tech_stack['frontend_framework']}")
        print(f"CSS Framework: {tech_stack['css_framework']}")
        print(f"Backend Framework: {tech_stack['backend_framework']}")
        print(f"Database: {tech_stack['database']}")
        print(f"Authentication: {tech_stack['auth']}")
        
        if additional_context:
            print("\nAdditional Context was provided and incorporated into the code generation.")
        
        print("\nGenerated Files:")
        for section, files in code.items():
            print(f"\n{section.title()} Files:")
            for file_type in files:
                print(f"- {file_type}")

        # Ask if user wants to provide more context and regenerate code
        while True:
            if input("\nDo you want to provide more context and regenerate the code? (y/n): ").strip().lower() == "y":
                print("\nEnter your additional context or requirements (press Enter twice to finish):")
                lines = []
                while True:
                    line = input()
                    if line == "" and lines and lines[-1] == "":
                        break
                    lines.append(line)
                new_context = "\n".join(lines[:-1])  # Remove the last empty line
                
                # Combine with previous context
                combined_context = additional_context + "\n\nAdditional Requirements:\n" + new_context
                additional_context = combined_context
                
                print("\nRegenerating code with updated context...")
                code = regenerate_code_with_context(selected_issue, tech_stack, combined_context)
                
                if not code:
                    print("No code was generated.")
                    break
                
                print("\nCode Regeneration Summary:")
                print("\nTech Stack:")
                print(f"Frontend Framework: {tech_stack['frontend_framework']}")
                print(f"CSS Framework: {tech_stack['css_framework']}")
                print(f"Backend Framework: {tech_stack['backend_framework']}")
                print(f"Database: {tech_stack['database']}")
                print(f"Authentication: {tech_stack['auth']}")
                
                print("\nAdditional Context was incorporated into the code regeneration.")
                
                print("\nGenerated Files:")
                for section, files in code.items():
                    print(f"\n{section.title()} Files:")
                    for file_type in files:
                        print(f"- {file_type}")
            else:
                break

        # Save the code to files
        folder = None
        if input("\nSave the generated code to files? (y/n): ").strip().lower() == "y":
            folder = push_code_to_files(code, selected_issue.get("key", "NO_KEY"), tech_stack)
            if folder:
                print(f"\nCode saved to: {folder}")
            else:
                print("\nFailed to save code files.")
                return
        
        # After saving, ask if user wants to regenerate and resave in the same folder
        if folder:
            while True:
                if input("\nDo you want to regenerate the code and resave in the same folder? (y/n): ").strip().lower() == "y":
                    print("\nEnter your additional context or requirements (press Enter twice to finish):")
                    lines = []
                    while True:
                        line = input()
                        if line == "" and lines and lines[-1] == "":
                            break
                        lines.append(line)
                    new_context = "\n".join(lines[:-1])  # Remove the last empty line
                    
                    # Combine with previous context
                    combined_context = additional_context + "\n\nAdditional Requirements:\n" + new_context
                    additional_context = combined_context
                    
                    print("\nRegenerating code with updated context...")
                    code = regenerate_code_with_context(selected_issue, tech_stack, combined_context)
                    
                    if not code:
                        print("No code was generated.")
                        break
                    
                    print("\nCode Regeneration Summary:")
                    print("\nTech Stack:")
                    print(f"Frontend Framework: {tech_stack['frontend_framework']}")
                    print(f"CSS Framework: {tech_stack['css_framework']}")
                    print(f"Backend Framework: {tech_stack['backend_framework']}")
                    print(f"Database: {tech_stack['database']}")
                    print(f"Authentication: {tech_stack['auth']}")
                    
                    print("\nAdditional Context was incorporated into the code regeneration.")
                    
                    # Resave in the same folder
                    print(f"\nResaving code to: {folder}")
                    resave_code_to_folder(code, folder, tech_stack)
                else:
                    break

    except Exception as e:
        print(f"An error occurred: {str(e)}")

def resave_code_to_folder(code: dict, folder: str, tech_stack: Dict[str, str]) -> bool:
    """
    Resave the regenerated code to the same folder, overwriting existing files.
    
    Args:
        code: Dictionary containing code snippets
        folder: Path to the folder where code should be saved
        tech_stack: Dictionary containing tech stack choices
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Get file structure based on tech stack
        file_structure = get_file_structure(tech_stack)

        # Create frontend directory and files
        frontend_dir = os.path.join(folder, "frontend")
        os.makedirs(frontend_dir, exist_ok=True)
        
        # Create any nested frontend directories
        for file_path in file_structure["frontend"]:
            if file_path.endswith("/"):
                os.makedirs(os.path.join(frontend_dir, file_path.rstrip("/")), exist_ok=True)
                continue
                
            # Get content based on file type
            content = ""
            if file_path.endswith((".js", ".jsx", ".ts", ".tsx")):
                content = code["frontend"].get("javascript", "")
            elif file_path.endswith((".css", ".scss")):
                content = code["frontend"].get("css", "")
            elif file_path.endswith(".html"):
                content = code["frontend"].get("html", "")
            elif file_path.endswith(".vue"):
                content = "\n".join([
                    code["frontend"].get("html", ""),
                    "<script>\n" + code["frontend"].get("javascript", "") + "\n</script>",
                    "<style>\n" + code["frontend"].get("css", "") + "\n</style>"
                ])
            
            # Write the file
            full_path = os.path.join(frontend_dir, file_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {full_path}")

        # Create backend directory and files
        backend_dir = os.path.join(folder, "backend")
        os.makedirs(backend_dir, exist_ok=True)
        
        # Create any nested backend directories
        for file_path in file_structure["backend"]:
            if file_path.endswith("/"):
                os.makedirs(os.path.join(backend_dir, file_path.rstrip("/")), exist_ok=True)
                continue
                
            # Get content based on file type
            content = ""
            if "models" in file_path:
                content = code["backend"].get("models", "")
            elif "tests" in file_path:
                content = code["backend"].get("tests", "")
            else:
                content = code["backend"].get("python", "")  # or main backend code
            
            # Write the file
            full_path = os.path.join(backend_dir, file_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {full_path}")

        # Update the README.md with the new timestamp
        readme_path = os.path.join(folder, "README.md")
        if os.path.exists(readme_path):
            with open(readme_path, "r", encoding="utf-8") as f:
                readme_content = f.read()
            
            # Update the timestamp in the README
            updated_readme = re.sub(
                r"Generated on: .*",
                f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                readme_content
            )
            
            with open(readme_path, "w", encoding="utf-8") as f:
                f.write(updated_readme)
            print(f"Updated README.md with new timestamp")

        print(f"\nCode successfully resaved to: {folder}")
        return True

    except Exception as e:
        print(f"Error resaving code files: {str(e)}")
        return False

if __name__ == "__main__":
    main()