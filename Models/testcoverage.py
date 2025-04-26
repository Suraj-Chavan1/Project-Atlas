import requests
import json
from openai import AzureOpenAI
from typing import Dict, Any
from rich.console import Console
from rich.table import Table

# Azure OpenAI configuration
endpoint = "https://suraj-m9lgdbv9-eastus2.cognitiveservices.azure.com/"
deployment = "gpt-4.1"
api_key = "75PVa3SAy9S2ZR590gZesyTNDMZtb3Oa5EdHlRbqWeQ89bmoOGl4JQQJ99BDACHYHv6XJ3w3AAAAACOGUP8d"
api_version = "2024-12-01-preview"

def get_coverage() -> Dict[str, Any]:
    """Get coverage data from the API."""
    response = requests.get('https://atlas-test-cases-f2kg.vercel.app/coverage')
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code}")
        return None

def format_coverage_with_openai(coverage_data: Dict[str, Any]) -> str:
    """Format coverage data using Azure OpenAI."""
    client = AzureOpenAI(
        azure_endpoint=endpoint,
        api_key=api_key,
        api_version=api_version
    )

    # Create a prompt for formatting
    prompt = f"""
    Analyze this code coverage data and format it exactly as follows:
    
    First line should be "Overall Coverage: X%"
    
    Then for each file, show:
    File: [filename]
    Coverage: X%
    Lines Not Covered: [list of line numbers]
    Recommendation: [one-line suggestion for improvement]
    
    Here's the coverage data:
    {json.dumps(coverage_data, indent=2)}
    """

    try:
        response = client.chat.completions.create(
            model=deployment,
            messages=[
                {
                    "role": "system",
                    "content": "You are a code coverage analyzer. Format output exactly as specified."
                },
                {"role": "user", "content": prompt}
            ],
            max_tokens=4096,
            temperature=0.3
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error formatting with OpenAI: {str(e)}")
        return json.dumps(coverage_data, indent=2)

def display_coverage(formatted_output: str):
    """Display coverage data in a formatted table."""
    console = Console()
    
    lines = formatted_output.split('\n')
    overall = lines[0]
    console.print(f"\n[bold cyan]{overall}[/bold cyan]\n")
    
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("File", style="dim")
    table.add_column("Coverage", justify="right")
    table.add_column("Uncovered Lines", justify="left")
    table.add_column("Recommendation", style="italic")
    
    current_file = {}
    for line in lines[2:]:  # Skip overall coverage and first blank line
        if line.startswith('File: '):
            if current_file:
                table.add_row(
                    current_file.get('name', ''),
                    current_file.get('coverage', ''),
                    current_file.get('lines', ''),
                    current_file.get('recommendation', '')
                )
            current_file = {'name': line.replace('File: ', '')}
        elif line.startswith('Coverage: '):
            current_file['coverage'] = line.replace('Coverage: ', '')
        elif line.startswith('Lines Not Covered: '):
            current_file['lines'] = line.replace('Lines Not Covered: ', '')
        elif line.startswith('Recommendation: '):
            current_file['recommendation'] = line.replace('Recommendation: ', '')
    
    # Add last file
    if current_file:
        table.add_row(
            current_file.get('name', ''),
            current_file.get('coverage', ''),
            current_file.get('lines', ''),
            current_file.get('recommendation', '')
        )
    
    console.print(table)

if __name__ == '__main__':
    coverage_data = get_coverage()
    if coverage_data:
        formatted_output = format_coverage_with_openai(coverage_data)
        display_coverage(formatted_output)