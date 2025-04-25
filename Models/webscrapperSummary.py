import requests
from bs4 import BeautifulSoup
import os
from openai import AzureOpenAI
import httpx
import time
from urllib.parse import urlparse

# Azure OpenAI configuration
endpoint = "https://suraj-m9lgdbv9-eastus2.cognitiveservices.azure.com/"
deployment = "gpt-4o"
api_key = "75PVa3SAy9S2ZR590gZesyTNDMZtb3Oa5EdHlRbqWeQ89bmoOGl4JQQJ99BDACHYHv6XJ3w3AAAAACOGUP8d"
api_version = "2024-12-01-preview"

def validate_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def scrape_website(url):
    try:
        if not validate_url(url):
            return "Invalid URL format"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        
        # Add basic rate limiting
        time.sleep(1)
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        # Remove unwanted elements
        for element in soup(['script', 'style', 'header', 'footer', 'nav']):
            element.decompose()

        # Extract text from multiple important tags
        text_elements = []
        important_tags = ['p', 'h1', 'h2', 'h3', 'article', 'section']
        
        for tag in important_tags:
            elements = soup.find_all(tag)
            text_elements.extend([elem.get_text() for elem in elements])

        # Clean and join the text
        text = ' '.join(text_elements)
        text = ' '.join(text.split())  # Remove extra whitespace
        return text.strip()

    except requests.Timeout:
        return "Error: Request timed out"
    except requests.RequestException as e:
        return f"Error scraping the site: {str(e)}"

def summarize_content(content):
    try:
        if not content or content.startswith("Error"):
            return "No valid content to summarize."

        prompt = (
            "Provide a professional analysis of this website content following this structure:\n\n"
            "**Website Overview:**\n"
            "- Main purpose and target audience\n\n"
            "**Key Components:**\n"
            "- Important sections and features\n"
            "- Notable products or services\n\n"
            "**Notable Elements:**\n"
            "- Recent updates or announcements\n"
            "- Special features or unique selling points\n\n"
            "**Summary:**\n"
            "- Overall value proposition\n\n"
            f"Content to analyze:\n{content}"
        )

        response = client.chat.completions.create(
            model=deployment,
            messages=[
                {"role": "system", "content": "You are a professional web content analyst."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"Error summarizing content: {str(e)}"

# Initialize Azure OpenAI client
client = AzureOpenAI(
    azure_endpoint=endpoint,
    api_key=api_key,
    api_version=api_version,
    http_client=httpx.Client()
)

if __name__ == "__main__":
    while True:
        url = input("\nEnter website URL (or 'quit' to exit): ")
        if url.lower() == 'quit':
            break
            
        print("\nScraping website...")
        content = scrape_website(url)
        print("\n[Scraped Content Preview]\n", content[:300], "...\n")

        print("Generating summary...")
        summary = summarize_content(content)
        print("\n[Website Analysis]\n", summary)