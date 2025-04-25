import requests, time, os
from openai import AzureOpenAI  # Updated import for newer OpenAI client

# Hard-coded configuration values
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT = "https://suraj-m9lgdbv9-eastus2.cognitiveservices.azure.com/"
AZURE_OPENAI_DEPLOYMENT = "gpt-4o"
AZURE_OPENAI_API_KEY = "75PVa3SAy9S2ZR590gZesyTNDMZtb3Oa5EdHlRbqWeQ89bmoOGl4JQQJ99BDACHYHv6XJ3w3AAAAACOGUP8d"
AZURE_OPENAI_API_VERSION = "2024-12-01-preview"

# AssemblyAI Configuration
ASSEMBLYAI_API_KEY = "0667c74576824436a9ccad687763a847"

# Initialize the Azure OpenAI client
client = AzureOpenAI(
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_key=AZURE_OPENAI_API_KEY,
    api_version=AZURE_OPENAI_API_VERSION
)

# 1. Upload MP3 file
def upload_audio(filename):
    """Upload audio file to AssemblyAI"""
    print(f"Uploading audio file: {filename}")
    headers = {'authorization': ASSEMBLYAI_API_KEY}
    with open(filename, 'rb') as f:
        response = requests.post('https://api.assemblyai.com/v2/upload', headers=headers, files={'file': f})
    return response.json()['upload_url']

# 2. Start transcription
def start_transcription(audio_url):
    """Start transcription process with AssemblyAI
    
    Parameters:
    audio_url (str): URL to the audio file. Can be a URL to a public audio file or an upload URL from AssemblyAI
    """
    print(f"Starting transcription process with URL: {audio_url[:50]}...")
    endpoint = "https://api.assemblyai.com/v2/transcript"
    json = {"audio_url": audio_url}
    headers = {"authorization": ASSEMBLYAI_API_KEY}
    response = requests.post(endpoint, json=json, headers=headers)
    
    if not response.ok:
        print(f"Error starting transcription: {response.status_code}, {response.text}")
        raise Exception(f"AssemblyAI API error: {response.status_code}, {response.text}")
        
    return response.json()['id']

# 3. Poll for result
def poll_transcription(transcript_id):
    """Poll for transcription results from AssemblyAI"""
    print(f"Polling for results (ID: {transcript_id})...")
    endpoint = f"https://api.assemblyai.com/v2/transcript/{transcript_id}"
    headers = {"authorization": ASSEMBLYAI_API_KEY}
    while True:
        response = requests.get(endpoint, headers=headers).json()
        if response['status'] == 'completed':
            print("Transcription completed successfully")
            return response['text']
        elif response['status'] == 'error':
            raise Exception("Transcription failed:", response['error'])
        print("Waiting for transcription to complete...")
        time.sleep(5)

# 4. Send transcript to Azure OpenAI for summarization
def summarize_text(text):
    """Summarize the transcript text using Azure OpenAI"""
    try:
        # Log once when the function starts
        print("Generating summary with Azure OpenAI...")
        
        # Using updated API format for OpenAI 1.0.0+
        response = client.chat.completions.create(
            model=AZURE_OPENAI_DEPLOYMENT,  # For Azure, use the deployment name here
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes audio transcripts. Provide a clear, concise summary that captures the main points, key details, and any important information from the transcript."},
                {"role": "user", "content": f"Summarize this transcript:\n\n{text}"}
            ],
            max_tokens=1024,
            temperature=0.7
        )
        
        # Updated response parsing
        summary = response.choices[0].message.content
        print("Summary generation complete")
        return summary

    except Exception as e:
        print(f"Error in summarizing text: {str(e)}")
        return None

def process_audio_file(audio_path):
    """Process an audio file from start to finish: transcribe and summarize"""
    try:
        # Check if the file exists
        if not os.path.exists(audio_path):
            print(f"Error: Audio file not found at {audio_path}")
            return None, None
        
        print(f"Processing audio file: {audio_path}")
        url = upload_audio(audio_path)
        transcript_id = start_transcription(url)
        transcript = poll_transcription(transcript_id)
        summary = summarize_text(transcript)
        
        return transcript, summary
    except Exception as e:
        print(f"Error processing audio file: {str(e)}")
        return None, None

def process_audio_from_url(audio_url):
    """Process an audio file from a URL: transcribe and summarize"""
    try:
        print(f"Processing audio from URL: {audio_url[:50]}...")
        transcript_id = start_transcription(audio_url)
        transcript = poll_transcription(transcript_id)
        summary = summarize_text(transcript)
        
        return transcript, summary
    except Exception as e:
        print(f"Error processing audio URL: {str(e)}")
        return None, None

def save_results_to_file(transcript, summary, output_file=None):
    """Save transcript and summary to a file"""
    if not output_file:
        output_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "transcript_output.txt")
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("SPEECH TO TEXT TRANSCRIPT:\n")
            f.write("="*80 + "\n")
            f.write(transcript or "Transcription failed")
            f.write("\n\nSUMMARY:\n")
            f.write("="*80 + "\n")
            f.write(summary or "Summary generation failed")
        print(f"\nTranscript and summary saved to: {output_file}")
        return True
    except Exception as e:
        print(f"Error saving transcript to file: {str(e)}")
        return False

# 🎯 Main Runner
if __name__ == "__main__":
    print(f"Using Azure OpenAI:")
    print(f"- Endpoint: {AZURE_OPENAI_ENDPOINT}")
    print(f"- Deployment: {AZURE_OPENAI_DEPLOYMENT}")
    print(f"- API Version: {AZURE_OPENAI_API_VERSION}")
    
    # Use proper path formatting with raw string to avoid escape character issues
    audio_path = os.path.join("d:", os.sep, "Barlays", "Project-Atlas", "Models", "temp_audio.mp3")
    print(f"Using audio file: {audio_path}")
    
    # Check if the file exists
    if not os.path.exists(audio_path):
        print(f"Error: Audio file not found at {audio_path}")
        # Try the harvard.wav file as fallback
        audio_path = os.path.join("d:", os.sep, "Barlays", "Project-Atlas", "Models", "harvard.wav")
        if os.path.exists(audio_path):
            print(f"Using fallback audio file: {audio_path}")
        else:
            print(f"Error: Fallback audio file not found either")
            exit(1)
    
    transcript, summary = process_audio_file(audio_path)
    
    # Print results
    if transcript:
        print("\n" + "="*80)
        print("📄 SPEECH TO TEXT TRANSCRIPT:")
        print("="*80)
        print(transcript)
        print("="*80 + "\n")

    if summary:
        print("✅ Summary:\n")
        print(summary)
    
    # Save to file
    save_results_to_file(transcript, summary)
