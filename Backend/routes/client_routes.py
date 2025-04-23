import os
import json
import asyncio
from datetime import datetime
from azure.cosmos.aio import CosmosClient
from azure.cosmos.exceptions import CosmosResourceExistsError
from azure.cosmos.partition_key import PartitionKey
from azure.storage.blob import BlobServiceClient, ContentSettings
from openai import AzureOpenAI
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
import uuid
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
import httpx
from flask import Blueprint, request, jsonify
import ssl
import traceback

# Azure OpenAI Configuration
AZURE_ENDPOINT = "https://suraj-m9lgdbv9-eastus2.cognitiveservices.azure.com/"
AZURE_API_KEY = "75PVa3SAy9S2ZR590gZesyTNDMZtb3Oa5EdHlRbqWeQ89bmoOGl4JQQJ99BDACHYHv6XJ3w3AAAAACOGUP8d"
AZURE_API_VERSION = "2024-02-15-preview"
DEPLOYMENT_NAME = "gpt-4o"  # Updated deployment name to match v1 model

# Cosmos DB Configuration
COSMOS_URL = "https://barclaysdb.documents.azure.com:443/"
COSMOS_KEY = "ercuc7wFNt4RPsxcx2QTzKP8AhKUDnjJrt0mpZrW2Yi2IQGAa7wDrEbhKRHsurGu0P7GuGny4IZRACDbtecfNQ=="
DATABASE_NAME = 'RequirementsDB'
CONTAINER_NAME = 'RequirementDocs'

# Blob Storage Configuration
BLOB_CONNECTION_STRING = 'DefaultEndpointsProtocol=https;AccountName=barclaysstorage;AccountKey=w7fJMnkuaZR4RX9LJbTRld8v90S6KDupj1BDHNZ1+Ch9Do7Et56nQKAd2HVXJqgZYEVbcGY/CGRj+AStE2NEXQ==;EndpointSuffix=core.windows.net'
BLOB_CONTAINER_NAME = 'data'

# Form Recognizer Configuration
FORM_RECOGNIZER_ENDPOINT = "https://barclaysform.cognitiveservices.azure.com/"
FORM_RECOGNIZER_KEY = "63spGg0VYFV0kWZB3nmsFDp8yEbi40zmEnCvIl6D8Seih4YyLsp9JQQJ99BDACYeBjFXJ3w3AAALACOGh5hu"

# Client Template Definition
CLIENT_TEMPLATE = """Clientele / Focus Group – SRS Input Template
1. User Roles & Personas
- Primary users
- User goals and behaviors
- Accessibility needs
2. Feature Requests & Preferences
- Desired features
- Pain points with current solutions
- Quality expectations (UX/UI, speed, etc.)
3. Usage Scenarios
- Real-life use case stories
- Frequency and context of use
- Device/browser preferences
4. Feedback on Prototypes (if applicable)
- Usability feedback
- Confusion points
- Suggestions for improvement
5. Constraints and Concerns
- Budget/time constraints
- Privacy concerns
- Localization or language needs"""

# Template sections
CLIENT_SECTIONS = [
    "User Roles & Personas",
    "Feature Requests & Preferences",
    "Usage Scenarios",
    "Feedback on Prototypes (if applicable)",
    "Constraints and Concerns"
]

# Global Cosmos DB client
cosmos_client = None

# Global event loop
event_loop = None

async def get_event_loop():
    """Get or create the global event loop."""
    global event_loop
    if event_loop is None:
        event_loop = asyncio.new_event_loop()
        asyncio.set_event_loop(event_loop)
    return event_loop

class FormRecognizerExtractor:
    def __init__(self, endpoint, api_key):
        """Initialize the Form Recognizer client with Azure credentials."""
        if not endpoint or not api_key:
            raise ValueError("Both endpoint and api_key are required")
            
        self.endpoint = endpoint
        self.api_key = api_key
        try:
            self.document_analysis_client = DocumentAnalysisClient(
                endpoint=self.endpoint,
                credential=AzureKeyCredential(self.api_key)
            )
        except Exception as e:
            raise Exception(f"Failed to initialize Form Recognizer client: {str(e)}")

    def extract_text_from_file(self, file_path):
        """Extract text from a document file."""
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")

            print(f"Analyzing document: {file_path}")

            with open(file_path, "rb") as document:
                poller = self.document_analysis_client.begin_analyze_document(
                    "prebuilt-document", document
                )
                result = poller.result()

            text_content = []
            for paragraph in getattr(result, "paragraphs", []):
                text_content.append(paragraph.content)

            return "\n".join(text_content)

        except Exception as e:
            print(f"Error extracting text from document: {str(e)}")
            return None

    def is_url(self, input_string):
        """Check if the input string is a URL."""
        return input_string.startswith("http://") or input_string.startswith("https://")

    def extract_text_from_url(self, url):
        """Extract text from a document URL."""
        try:
            response = httpx.get(url)
            response.raise_for_status()
            with open("temp_document", "wb") as temp_file:
                temp_file.write(response.content)
            return self.extract_text_from_file("temp_document")
        except Exception as e:
            print(f"Error extracting text from URL: {str(e)}")
            return None

class RequirementsManager:
    def __init__(self):
        self.requirements = []
        self.reference_counter = 1
        self.doc_extractor = FormRecognizerExtractor(FORM_RECOGNIZER_ENDPOINT, FORM_RECOGNIZER_KEY)

    def add_requirement(self, text, source_type="text", reference=None):
        """Add a requirement with source information."""
        if reference:
            ref_number = self.reference_counter
            self.reference_counter += 1
        else:
            ref_number = None

        self.requirements.append({
            "text": text,
            "timestamp": datetime.now(),
            "source": source_type,
            "reference": reference,
            "ref_number": ref_number
        })

    def process_input(self, input_text):
        """Process input text, which can be a file path, URL, or direct text."""
        if self.doc_extractor.is_url(input_text):
            print(f"Processing document from URL: {input_text}")
            text = self.doc_extractor.extract_text_from_url(input_text)
            if text:
                self.add_requirement(text, "document (URL)", input_text)
                print("Document processed successfully")
            else:
                print("Failed to process document URL")
        elif os.path.exists(input_text):
            print(f"Processing document: {input_text}")
            text = self.doc_extractor.extract_text_from_file(input_text)
            if text:
                self.add_requirement(text, "document (file)", input_text)
                print("Document processed successfully")
            else:
                print("Failed to process document")
        else:
            self.add_requirement(input_text, "text")

    def get_all_requirements(self):
        """Get all requirements as a single string."""
        return '\n'.join(req['text'] for req in self.requirements)

    def clear_requirements(self):
        """Clear all requirements."""
        self.requirements = []
        self.reference_counter = 1

# Initialize Azure OpenAI client
openai_client = AzureOpenAI(
    api_version=AZURE_API_VERSION,
    api_key=AZURE_API_KEY,
    azure_endpoint=AZURE_ENDPOINT
)

async def get_cosmos_container():
    """Get or create the Cosmos DB container."""
    global cosmos_client
    
    if cosmos_client is None:
        cosmos_client = CosmosClient(COSMOS_URL, credential=COSMOS_KEY)
    
    try:
        database = cosmos_client.get_database_client(DATABASE_NAME)
    except Exception:
        database = await cosmos_client.create_database(DATABASE_NAME)
        print(f"Created database: {DATABASE_NAME}")
    
    try:
        container = database.get_container_client(CONTAINER_NAME)
    except Exception:
        container = await database.create_container(
            id=CONTAINER_NAME,
            partition_key=PartitionKey(path='/project_id')
        )
        print(f"Created container: {CONTAINER_NAME}")
    
    return container

def get_blob_container():
    """Get or create the Blob Storage container."""
    blob_service_client = BlobServiceClient.from_connection_string(BLOB_CONNECTION_STRING)
    
    # Check if container exists, create if it doesn't
    container_exists = False
    for container in blob_service_client.list_containers():
        if container.name == BLOB_CONTAINER_NAME:
            container_exists = True
            break
    
    if not container_exists:
        print(f"Creating container: {BLOB_CONTAINER_NAME}")
        blob_service_client.create_container(BLOB_CONTAINER_NAME)
    
    return blob_service_client.get_container_client(BLOB_CONTAINER_NAME)

async def generate_client_content(requirements_text, openai_client, deployment_name):
    """Generate content for Client template sections using Azure OpenAI."""
    content = {}
    for section in CLIENT_SECTIONS:
        prompt = f"""
        You are a Client Representative or Focus Group member providing input for a project. 
        Based on the following requirements, provide brief information for the section: {section}
        
        Requirements: {requirements_text}
        
        Provide a very concise response with 2-3 key points maximum.
        Focus only on the most important user/client details.
        Keep it short and to the point.
        """
        
        try:
            response = openai_client.chat.completions.create(
                model=deployment_name,
                messages=[
                    {"role": "system", "content": "You are a Client Representative providing brief user-focused input."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=150  # Significantly reduced token limit for very concise content
            )
            
            # Store the response content
            content[section] = response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error generating content for {section}: {e}")
            content[section] = f"Error generating content for {section}"
    
    return content

async def process_client_template(project_id, requirements_text):
    """Process and generate Client template content."""
    try:
        # Check for existing document
        container = await get_cosmos_container()
        query = f"SELECT * FROM {CONTAINER_NAME} c WHERE c.project_id = '{project_id}' AND c.template_type = 'client'"
        items = [item async for item in container.query_items(query=query)]
        
        # Generate content
        content = await generate_client_content(
            requirements_text,
            openai_client,
            DEPLOYMENT_NAME
        )
        
        # Create combined text from all sections
        combined_text = ""
        for section, section_content in content.items():
            combined_text += f"{section_content}\n\n"
        
        # Generate PDF
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        pdf_filename = f"client_requirements_{project_id}_{timestamp}.pdf"
        pdf_path = os.path.join(os.path.dirname(__file__), pdf_filename)
        
        # Generate the PDF
        generate_pdf(content, pdf_path)
        print(f"Generated PDF at: {pdf_path}")
        
        # Upload to blob storage
        blob_name = f"requirements/{pdf_filename}"
        blob_url = upload_to_blob_storage(pdf_path, blob_name)
        print(f"Uploaded PDF to blob storage: {blob_url}")
        
        # Clean up local PDF file
        try:
            os.remove(pdf_path)
            print(f"Cleaned up local PDF file: {pdf_path}")
        except Exception as e:
            print(f"Error cleaning up local PDF file: {str(e)}")
        
        # If document exists, update it
        if items:
            doc = items[0]
            doc["content"] = content
            doc["combined_text"] = combined_text.strip()
            doc["timestamp"] = datetime.utcnow().isoformat()
            doc["blob_url"] = blob_url
            doc["pdf_filename"] = pdf_filename
            
            await container.upsert_item(doc)
            print(f"Updated existing document with ID: {doc['id']}")
            return doc['id'], doc
        else:
            # Create new document
            doc_id = f"client_requirements_{project_id}_{timestamp}"
            requirements_data = {
                "id": doc_id,
                "template_type": "client",
                "content": content,
                "combined_text": combined_text.strip(),
                "project_id": project_id,
                "timestamp": datetime.utcnow().isoformat(),
                "blob_url": blob_url,
                "pdf_filename": pdf_filename
            }
            
            await container.create_item(body=requirements_data)
            print(f"Created new document with ID: {doc_id}")
            return doc_id, requirements_data
        
    except Exception as e:
        print(f"Error processing Client template: {str(e)}")
        raise

def generate_pdf(data, output_path):
    """Generate a professional PDF document from the requirements data."""
    # Set up the document with proper margins
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=50,
        bottomMargin=50
    )
    
    # Define enhanced styles
    styles = getSampleStyleSheet()
    
    # Professional title style - smaller font
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=22,
        alignment=1,  # Center alignment
        spaceAfter=12,
        textColor=colors.HexColor('#1B365D')  # Dark blue
    )
    
    # Modern subtitle style - smaller font
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#2E5C8A'),  # Medium blue
        spaceBefore=10,
        spaceAfter=6,
        alignment=0,  # Left alignment
        borderWidth=0
    )
    
    # Section header style - smaller font
    section_style = ParagraphStyle(
        'Section',
        parent=styles['Heading3'],
        fontSize=13,
        textColor=colors.HexColor('#4A4A4A'),  # Dark gray
        spaceBefore=10,
        spaceAfter=4,
        leftIndent=0
    )
    
    # Clean normal text style - smaller font
    normal_style = ParagraphStyle(
        'Normal',
        parent=styles['Normal'],
        fontSize=10,
        leading=12,
        textColor=colors.HexColor('#333333')  # Soft black
    )
    
    # Build document content
    content = []
    
    # Header section - more compact
    timestamp = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    
    content.append(Paragraph("Client Requirements Specification", title_style))
    content.append(Spacer(1, 8))
    content.append(Paragraph(f"Generated on: {timestamp}", ParagraphStyle(
        'Timestamp', 
        parent=normal_style,
        textColor=colors.HexColor('#666666'),  # Medium gray
        alignment=1  # Center aligned
    )))
    content.append(Spacer(1, 15))
    
    # Process each section
    for section, section_content in data.items():
        # Skip the combined_text field if it exists
        if section == "combined_text":
            continue
            
        # Add section header
        content.append(Paragraph(section, subtitle_style))
        
        # Add horizontal rule
        hr_table = Table([['']],colWidths=[doc.width-20],rowHeights=[1])
        hr_table.setStyle(TableStyle([
            ('LINEABOVE', (0,0), (-1,0), 1, colors.HexColor('#DDDDDD')),  # Light gray line
        ]))
        content.append(hr_table)
        content.append(Spacer(1, 8))
        
        # Format and add section content
        formatted_content = str(section_content).replace('•', '⚫')  # Replace bullet points with circles
        
        # Split content into paragraphs to avoid large tables
        paragraphs = formatted_content.split('\n')
        
        # Process each paragraph
        for para in paragraphs:
            if para.strip():
                # Create a small table for each paragraph
                data_table = [[Paragraph(para, normal_style)]]
                section_table = Table(data_table, colWidths=[doc.width - 40])
                section_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8F8F8')),  # Very light gray
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#333333')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#DDDDDD')),
                    ('LEFTPADDING', (0, 0), (-1, -1), 10),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                    ('TOPPADDING', (0, 0), (-1, -1), 6),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6)
                ]))
                content.append(section_table)
                content.append(Spacer(1, 6))
        
        content.append(Spacer(1, 10))
    
    # Add footer with page numbers
    def add_page_number(canvas, doc):
        page_num = canvas.getPageNumber()
        canvas.saveState()
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor('#666666'))
        
        # Add header line
        canvas.setStrokeColor(colors.HexColor('#DDDDDD'))
        canvas.line(doc.leftMargin, doc.pagesize[1] - 35, doc.width + doc.rightMargin, doc.pagesize[1] - 35)
        
        # Add footer line
        canvas.line(doc.leftMargin, 45, doc.width + doc.rightMargin, 45)
        
        # Add page number
        canvas.drawRightString(doc.width + doc.rightMargin, 25, f"Page {page_num}")
        
        # Add document title in footer
        canvas.drawString(doc.leftMargin, 25, "Client Requirements Specification")
        canvas.restoreState()
    
    # Build the PDF with page numbers and headers/footers
    doc.build(content, onFirstPage=add_page_number, onLaterPages=add_page_number)
    
    print(f"Generated PDF at: {output_path}")
    return output_path

def upload_to_blob_storage(file_path, blob_name):
    """Upload a file to Azure Blob Storage and return the URL."""
    container_client = get_blob_container()
    blob_client = container_client.get_blob_client(blob_name)
    
    # Set content type based on file extension
    content_type = 'application/pdf' if file_path.endswith('.pdf') else 'text/plain'
    content_settings = ContentSettings(content_type=content_type)
    
    with open(file_path, "rb") as data:
        blob_client.upload_blob(data, overwrite=True, content_settings=content_settings)
    
    return blob_client.url

async def update_document_url(doc_id, blob_url):
    """Update the document URL in Cosmos DB."""
    container = await get_cosmos_container()
    
    # Get the existing document
    query = f"SELECT * FROM {CONTAINER_NAME} c WHERE c.id = '{doc_id}'"
    items = [item async for item in container.query_items(query=query)]
    
    if items:
        doc = items[0]
        doc["blob_url"] = blob_url
        await container.upsert_item(doc)
        print(f"Updated document URL in Cosmos DB: {blob_url}")
    else:
        print(f"Document with ID {doc_id} not found in Cosmos DB")

async def close_cosmos_client():
    """Close the Cosmos DB client."""
    global cosmos_client
    if cosmos_client:
        await cosmos_client.close()
        cosmos_client = None

async def main():
    """Main function to process Client template using document input."""
    try:
        # Get project details from user
        project_id = input("Enter project ID: ").strip()
        project_name = input("Enter project name: ").strip()
        
        # Initialize requirements manager
        requirements_manager = RequirementsManager()
        
        # Process continuous input until user types 'freeze'
        print("\nEnter your requirements (text, file paths, or URLs)")
        print("To add a reference, use format: [ref: your_reference] on a new line")
        print("Type 'freeze' on a new line when done")
        
        current_text = ""
        current_reference = ""
        
        while True:
            line = input().strip()
            
            if line.lower() == 'freeze':
                # Add any remaining text with reference
                if current_text:
                    requirements_manager.add_requirement(current_text.strip(), "text", current_reference)
                break
            
            # Check if line is a reference
            if line.startswith('[ref:'):
                if current_text:  # Save previous text if exists
                    requirements_manager.add_requirement(current_text.strip(), "text", current_reference)
                    current_text = ""
                current_reference = line[5:].strip().rstrip(']')
                continue
            
            # Process the line
            requirements_manager.process_input(line)
        
        # Get the extracted requirements
        requirements_text = requirements_manager.get_all_requirements()
        
        if not requirements_text:
            print("Error: No requirements were extracted.")
            return
        
        # Generate Client requirements
        print(f"\nGenerating Client requirements for project: {project_name}")
        doc_id, requirements_data = await process_client_template(project_id, requirements_text)
        
        # Generate PDF
        print("\nGenerating PDF document...")
        pdf_path = f"Client_Requirements_{project_id}.pdf"
        generate_pdf(requirements_data["content"], pdf_path)
        
        # Upload to Blob Storage
        print("\nUploading PDF to Blob Storage...")
        blob_name = f"client_requirements/{project_id}/{pdf_path}"
        blob_url = upload_to_blob_storage(pdf_path, blob_name)
        
        # Update document URL in Cosmos DB
        print("\nUpdating document URL in Cosmos DB...")
        await update_document_url(doc_id, blob_url)
        
        print("\nProcess completed successfully!")
        print(f"Document URL: {blob_url}")
        
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        # Close the Cosmos DB client
        await close_cosmos_client()

# Create Blueprint
client = Blueprint('client', __name__, url_prefix='/client')

@client.route('/generate-document', methods=['POST'])
async def generate_client_document():
    try:
        print("\n=== Starting Client document generation ===")
        print("Request headers:", request.headers)
        data = request.json
        print("Request data:", data)
        
        # Accept either project_id or projectId
        project_id = data.get('project_id') or data.get('projectId')
        if not project_id:
            print("Error: Missing project_id in request")
            return jsonify({
                'success': False,
                'message': 'Project ID is required'
            }), 400

        requirements_text = data.get('requirements_text', '')
        user_id = data.get('userId')
        
        print(f"Processing Client template for project {project_id}")
        print(f"User ID: {user_id}")
        print(f"Requirements text length: {len(requirements_text)}")

        if not requirements_text:
            print("Error: Empty requirements text provided")
            return jsonify({
                'success': False,
                'message': 'Requirements text cannot be empty'
            }), 400

        # Process the Client template
        try:
            print("Getting event loop...")
            loop = await get_event_loop()
            print("Event loop retrieved")
            
            print("Configuring SSL context...")
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            print("SSL context configured")
            
            print("Setting up Cosmos client...")
            global cosmos_client
            if cosmos_client is None:
                print("Initializing new Cosmos client")
                cosmos_client = CosmosClient(
                    COSMOS_URL, 
                    credential=COSMOS_KEY,
                    connection_verify=False
                )
                print("Cosmos client initialized")
            else:
                print("Using existing Cosmos client")
            
            print("Starting template processing...")
            result = await process_client_template(project_id, requirements_text)
            print("Template processing completed successfully")
            print("Result:", result)
            
            print("Cleaning up resources...")
            await close_cosmos_client()
            print("Cosmos client closed")
            
        except Exception as template_error:
            print("\nError in template processing:")
            print("Error type:", type(template_error))
            print("Error message:", str(template_error))
            print("Error traceback:", traceback.format_exc())
            
            # Ensure cleanup even on error
            try:
                print("Attempting cleanup on error...")
                await close_cosmos_client()
                print("Cosmos client closed")
            except Exception as cleanup_error:
                print("Error during cleanup:", str(cleanup_error))
            raise template_error

        print("\nSending success response")
        return jsonify({
            'success': True,
            'message': 'Document generated successfully',
            'document_id': result[0],
            'data': result[1],
            'download_url': result[1].get('blob_url'),
            'blob_url': result[1].get('blob_url')  # Explicitly include blob URL
        }), 200

    except Exception as e:
        print("\nError in generate_client_document:")
        print("Error type:", type(e))
        print("Error message:", str(e))
        print("Error traceback:", traceback.format_exc())
        return jsonify({
            'success': False,
            'message': f'Error generating document: {str(e)}'
        }), 500

@client.route('/get-document/<project_id>', methods=['GET'])
async def get_client_document(project_id):
    print(f"Fetching Client document for project {project_id}")
    try:
        # Get the event loop
        loop = asyncio.get_event_loop()
        if loop.is_closed():
            print("Creating new event loop")
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        # Create SSL context
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE

        # Initialize Cosmos client
        print("Initializing Cosmos client")
        cosmos_client = CosmosClient(
            COSMOS_URL,
            credential=COSMOS_KEY,
            connection_verify=False,
            consistency_level="Session"
        )

        # Get database and container
        print("Getting database and container")
        database = cosmos_client.get_database_client(DATABASE_NAME)
        container = database.get_container_client(CONTAINER_NAME)

        # Query for the document
        print("Querying for document")
        query = f"SELECT * FROM c WHERE c.project_id = '{project_id}' AND c.template_type = 'client'"
        items = []
        async for item in container.query_items(query=query):
            items.append(item)

        # Close the Cosmos client
        await cosmos_client.close()

        if items:
            print("Document found")
            # Get the most recent document
            document = max(items, key=lambda x: x.get('timestamp', ''))
            return jsonify({
                'success': True,
                'exists': True,
                'document': {
                    'id': document.get('id'),
                    'content': document.get('content'),
                    'combined_text': document.get('combined_text'),
                    'timestamp': document.get('timestamp'),
                    'blob_url': document.get('blob_url')
                }
            })
        else:
            print("No document found")
            return jsonify({
                'success': True,
                'exists': False,
                'message': 'No Client document found for this project'
            })

    except Exception as e:
        print(f"Error fetching Client document: {str(e)}")
        print(f"Error type: {type(e)}")
        print(f"Error traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == "__main__":
    asyncio.run(main()) 