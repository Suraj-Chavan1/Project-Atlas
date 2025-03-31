import google.generativeai as genai
import os
from dotenv import load_dotenv
import traceback

# Load environment variables
load_dotenv()

# Configure your generative AI API key from environment variable
API_KEY = os.getenv('GEMINI_API_KEY')
if not API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables")
    API_KEY = None

def validate_api_key():
    """Validate the API key and configure the Gemini client."""
    if not API_KEY:
        return False, "GEMINI_API_KEY not found in environment variables"
    
    try:
        genai.configure(api_key=API_KEY)
        # Test the API key with a simple request
        model = genai.GenerativeModel('gemini-2.0-flash')
        model.generate_content("Test")
        return True, "API key validated successfully"
    except Exception as e:
        return False, f"Invalid or expired Gemini API key: {str(e)}"

# Initialize API key validation
is_valid, message = validate_api_key()
if not is_valid:
    print(f"Warning: {message}")

def ask_question(question):
    """Ask a question and return the client's answer."""
    return input(question + "\n> ")

def gather_requirements():
    """
    Interactively gather requirements from the client.
    The model will ask a base set of questions and may add follow-up questions.
    The entire conversation is maintained in a transcript.
    """
    transcript = ""
    
    # Define a list of base questions.
    base_questions = [
        "What is the main purpose of your project?",
        "Who is your target audience?",
        "What are the primary features you require?",
        "What is your timeline for the project?",
        "Are there any specific technologies or platforms you prefer?",
    ]
    
    # Ask each base question.
    for question in base_questions:
        answer = ask_question(question)
        transcript += f"Q: {question}\nA: {answer}\n\n"
        
        # Example: Ask a follow-up question if certain keywords appear.
        if "custom" in answer.lower() or "other" in answer.lower():
            follow_up = ask_question("Could you please provide more details about that?")
            transcript += f"Q: Follow-up on: {question}\nA: {follow_up}\n\n"
    
    # Optionally, ask up to 5 additional dynamic questions based on previous responses.
    extra_questions = 0
    while extra_questions < 5:
        extra = ask_question("Do you have any additional requirements or details to share? (Leave blank to continue)")
        if extra.strip() == "":
            break
        transcript += f"Q: Additional input\nA: {extra}\n\n"
        extra_questions += 1
        
    return transcript

def generate_requirements_document(transcript):
    """
    Use the transcript to generate a client requirements document.
    The entire conversation is passed as context to the generative model.
    """
    if not API_KEY:
        return "Error: Gemini API key not configured. Please check your environment variables."
        
    try:
        # Build the prompt for the AI model.
        prompt = (
            "Based on the following conversation with a client, generate a detailed client requirements document. "
            "The document should summarize the project's purpose, target audience, features, timeline, technology preferences, "
            "and any additional details provided by the client. Use clear and professional language.\n\n"
            "Conversation Transcript:\n\n" + transcript
        )
        
        print("Initializing Gemini model...")
        model = genai.GenerativeModel(
            'gemini-2.0-flash',
            generation_config={
                'temperature': 0.3,
                'top_p': 0.9,
                'max_output_tokens': 3000
            }
        )
        
        print("Generating content...")
        try:
            response = model.generate_content(prompt)
        except Exception as e:
            print(f"Error generating content with Gemini API: {str(e)}")
            if "API key" in str(e).lower():
                return "Error: Invalid or expired Gemini API key. Please check your API key configuration."
            return f"Error generating requirements: {str(e)}"
        
        if not response or not response.text:
            print("No response generated from the model")
            return "Error: No response generated from the model"
            
        document = response.text.strip()
        print(f"Generated document length: {len(document)} characters")
        return document
        
    except Exception as e:
        print(f"Error in generate_requirements_document: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return f"Error generating requirements: {str(e)}"

def main():
    print("Welcome to the Interactive Requirements Gathering Tool!")
    transcript = gather_requirements()
    
    # Optionally, store the transcript in a text file.
    transcript_file = "client_chat_history.txt"
    try:
        with open(transcript_file, "w", encoding="utf-8") as f:
            f.write(transcript)
        print(f"\nChat history saved to '{transcript_file}'.")
    except Exception as e:
        print(f"Failed to save chat history: {e}")
    
    print("\nThank you. Now generating your client requirements document...\n")
    requirements_document = generate_requirements_document(transcript)
    
    if requirements_document:
        print("=== Client Requirements Document ===")
        print(requirements_document)
        # Optionally, save the document to a text file.
        requirements_file = "client_requirements_document.txt"
        try:
            with open(requirements_file, "w", encoding="utf-8") as f:
                f.write(requirements_document)
            print(f"\nDocument saved as '{requirements_file}'.")
        except Exception as e:
            print(f"Failed to save requirements document: {e}")
    else:
        print("Failed to generate a requirements document.")

if __name__ == "__main__":
    main()
