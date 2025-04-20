import json
import os
import re
import requests
from openai import AzureOpenAI
import httpx
from pprint import pprint
from typing import Dict, Optional, List
from datetime import datetime
from pathlib import Path

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
        choice = int(input("\nEnter the number of the user story you want to generate test cases for: "))
        if 1 <= choice <= len(issues):
            return issues[choice - 1]
        else:
            print("Invalid selection.")
            return None
    except ValueError:
        print("Please enter a valid number.")
        return None

def generate_test_cases(story: dict, language: str = "javascript", framework: str = "jest") -> dict:
    """
    Generate test cases for a user story in the specified language and framework.
    
    Args:
        story: The user story dictionary from Jira
        language: The programming language for test cases (javascript or python)
        framework: The testing framework to use (jest, mocha, pytest, etc.)
        
    Returns:
        Dictionary containing test case files with their content
    """
    summary = story.get("fields", {}).get("summary", "")
    description = story.get("fields", {}).get("description", "")
    issue_key = story.get("key", "NO_KEY")
    
    # Determine file extension based on language
    file_ext = ".js" if language.lower() == "javascript" else ".py"
    
    # Determine test file naming based on language and framework
    if language.lower() == "javascript":
        if framework.lower() == "jest":
            test_file = f"{issue_key}.test{file_ext}"
        elif framework.lower() == "mocha":
            test_file = f"{issue_key}.spec{file_ext}"
        else:
            test_file = f"{issue_key}.test{file_ext}"
    else:  # Python
        if framework.lower() == "pytest":
            test_file = f"test_{issue_key}{file_ext}"
        else:
            test_file = f"{issue_key}_test{file_ext}"
    
    prompt = f"""Generate comprehensive test cases for the following user story.
Output a valid JSON object with the following structure:
{{
    "{test_file}": "Complete test code for the user story"
}}

User Story:
Title: {summary}
Description: {description}

Technical Requirements:
- Language: {language}
- Framework: {framework}
- Include both positive and negative test cases
- Cover all acceptance criteria in the user story
- Include proper setup and teardown
- Use modern syntax and best practices
- Include comments explaining the purpose of each test
- Follow the naming conventions for {framework} tests
- Include proper error handling and assertions
"""
    
    try:
        response = client.chat.completions.create(
            model=DEPLOYMENT_NAME,
            messages=[
                {"role": "system", "content": f"You are a QA engineer that creates comprehensive {language} test cases using {framework}. Always respond with valid JSON only."},
                {"role": "user", "content": prompt + "\n IMPORTANT: Respond with ONLY the JSON object, no additional text or notes."}
            ],
            max_tokens=4000,
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
            test_cases = json.loads(cleaned_text)
            return test_cases
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON from generated test cases: {str(e)}")
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
                
                test_cases = json.loads(cleaned_text)
                print("Successfully fixed and parsed JSON")
                return test_cases
            except:
                print("Failed to fix JSON")
                return {}
            
    except Exception as e:
        print(f"Error generating test cases: {str(e)}")
        return {}

def save_test_cases(test_cases: dict, issue_key: str, language: str) -> str:
    """
    Save the generated test cases to files.
    
    Args:
        test_cases: Dictionary containing test case files with their content
        issue_key: Jira issue key
        language: The programming language for test cases
        
    Returns:
        Path to the generated test cases folder
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    folder = f"generated_tests/{issue_key}_{timestamp}"
    
    try:
        # Create main directory
        os.makedirs(folder, exist_ok=True)
        
        # Create language-specific directory
        language_dir = os.path.join(folder, language.lower())
        os.makedirs(language_dir, exist_ok=True)
        
        # Save test files
        for file_name, content in test_cases.items():
            file_path = os.path.join(language_dir, file_name)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Saved {file_path}")
        
        # Create a README.md with information about the test cases
        readme_content = f"""# Test Cases for {issue_key}

Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## Language
{language.title()}

## Test Files
"""
        for file_name in test_cases.keys():
            readme_content += f"- {file_name}\n"
        
        readme_content += """
## Running the Tests
"""
        if language.lower() == "javascript":
            readme_content += """```bash
# Install dependencies
npm install

# Run tests
npm test
```
"""
        else:  # Python
            readme_content += """```bash
# Install dependencies
pip install -r requirements.txt

# Run tests
pytest
```
"""
        
        with open(os.path.join(folder, "README.md"), "w", encoding="utf-8") as f:
            f.write(readme_content)
        print(f"Saved README.md")
        
        return folder
        
    except Exception as e:
        print(f"Error saving test case files: {str(e)}")
        return None

def get_language_choice():
    """
    Get user's preferred programming language for test cases
    """
    print("\nSelect Programming Language:")
    print("1. JavaScript")
    print("2. Python")
    language_choice = input("Enter your choice (1-2): ").strip()
    
    language = {
        "1": "javascript",
        "2": "python"
    }.get(language_choice, "javascript")
    
    return language

def get_framework_choice(language: str):
    """
    Get user's preferred testing framework based on the selected language
    """
    if language.lower() == "javascript":
        print("\nSelect JavaScript Testing Framework:")
        print("1. Jest")
        print("2. Mocha")
        print("3. Jasmine")
        framework_choice = input("Enter your choice (1-3): ").strip()
        
        framework = {
            "1": "jest",
            "2": "mocha",
            "3": "jasmine"
        }.get(framework_choice, "jest")
    else:  # Python
        print("\nSelect Python Testing Framework:")
        print("1. pytest")
        print("2. unittest")
        print("3. nose")
        framework_choice = input("Enter your choice (1-3): ").strip()
        
        framework = {
            "1": "pytest",
            "2": "unittest",
            "3": "nose"
        }.get(framework_choice, "pytest")
    
    return framework

def main():
    try:
        # Get user stories from Jira
        print("Retrieving user stories from Jira...")
        issues = get_jira_issues()
        if not issues:
            print("No issues found.")
            return

        # Display user stories
        display_issues(issues)
        
        # Select a user story
        selected_issue = select_issue(issues)
        if not selected_issue:
            return
        
        print("\nSelected User Story:")
        pprint(selected_issue.get("fields", {}).get("summary", "No Summary"))
        
        if input("Generate test cases for this story? (y/n): ").strip().lower() != "y":
            return
        
        # Get language and framework choices
        language = get_language_choice()
        framework = get_framework_choice(language)
        
        # Generate test cases
        print(f"\nGenerating {language} test cases using {framework}...")
        test_cases = generate_test_cases(selected_issue, language, framework)
        
        if not test_cases:
            print("No test cases were generated.")
            return
        
        # Save test cases to files
        folder = save_test_cases(test_cases, selected_issue.get("key", "NO_KEY"), language)
        if folder:
            print(f"\nTest cases saved to: {folder}")
        else:
            print("\nFailed to save test case files.")
            return
        
        # Ask if user wants to generate test cases for another story
        if input("\nGenerate test cases for another story? (y/n): ").strip().lower() == "y":
            main()
        
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main() 