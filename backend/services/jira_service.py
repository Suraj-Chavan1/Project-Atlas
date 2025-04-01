import json
import os
import requests
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Jira configuration
JIRA_DOMAIN = os.getenv('JIRA_DOMAIN', 'prathamgadkari.atlassian.net')
JIRA_API_URL = f"https://{JIRA_DOMAIN}/rest/api/2/search"
JIRA_EMAIL = os.getenv('JIRA_EMAIL', 'prathamgadkari@gmail.com')
JIRA_API_TOKEN = os.getenv('JIRA_API_TOKEN')
PROJECT_KEY = os.getenv('PROJECT_KEY', 'SCRUM')

# Gemini configuration
API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=API_KEY)

def get_jira_issues(jql: str = None, max_results: int = 50) -> list:
    """
    Retrieve Jira issues (user stories) from the project.
    Defaults to retrieving all Story issues in the project.
    """
    if jql is None:
        jql = f"project = {PROJECT_KEY} AND issuetype = Story"
    params = {"jql": jql, "maxResults": max_results, "fields": "summary,description"}
    auth = (JIRA_EMAIL, JIRA_API_TOKEN)
    headers = {"Content-Type": "application/json"}
    r = requests.get(JIRA_API_URL, params=params, auth=auth, headers=headers)
    if r.status_code == 200:
        data = r.json()
        return data.get("issues", [])
    else:
        raise Exception(f"Error retrieving issues: {r.status_code} - {r.text}")

def generate_code_for_story(story: dict) -> dict:
    """
    Generate full-stack code for the given user story using Gemini Flash 2.
    The model is prompted to return a JSON object with keys 'html', 'css', and 'python'.
    """
    summary = story.get("fields", {}).get("summary", "")
    description = story.get("fields", {}).get("description", "")
    
    prompt = (
        "Generate a full-stack code implementation for the following user story. "
        "Output a valid JSON object with three keys: 'html', 'css', and 'python'. "
        "Each key's value should be a complete code snippet in that language. "
        "Do not include any extra text or comments.\n\n"
        "User Story:\n"
        f"Title: {summary}\n"
        f"Description: {description}\n"
        "Assume the tech stack is HTML, CSS, and Python (Flask)."
    )
    
    try:
        model = genai.GenerativeModel(
            'gemini-2.0-flash',
            generation_config={
                'temperature': 0.3,
                'top_p': 0.9,
                'max_output_tokens': 2000
            }
        )
        response = model.generate_content(prompt)
        cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
        try:
            code_json = json.loads(cleaned_text)
            return code_json
        except json.JSONDecodeError:
            raise Exception("Failed to parse JSON from generated code")
    except Exception as e:
        raise Exception(f"Error generating code for the story: {e}")

def push_code_to_files(code: dict, issue_key: str):
    """
    Save the generated code to separate files inside a folder named after the issue key.
    """
    folder = f"generated_code/{issue_key}"
    os.makedirs(folder, exist_ok=True)
    for key in ["html", "css", "python"]:
        filename = f"{folder}/{key}.txt"
        with open(filename, "w", encoding="utf-8") as f:
            f.write(code.get(key, "")) 