from flask import Blueprint, request, jsonify, send_file
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions, ContentSettings
from azure.cosmos import CosmosClient, PartitionKey, exceptions
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
from datetime import datetime, timedelta
import urllib.parse
import uuid
import os
from io import BytesIO
from werkzeug.utils import secure_filename

resources = Blueprint('resources', __name__, url_prefix='/resources')

# Azure Storage Configuration
ACCOUNT_NAME = 'barclaysstorage'
ACCOUNT_KEY = 'w7fJMnkuaZR4RX9LJbTRld8v90S6KDupj1BDHNZ1+Ch9Do7Et56nQKAd2HVXJqgZYEVbcGY/CGRj+AStE2NEXQ=='
BLOB_CONTAINER = 'resources'

# Create Blob Service Client
connect_str = f'DefaultEndpointsProtocol=https;AccountName={ACCOUNT_NAME};AccountKey={ACCOUNT_KEY};EndpointSuffix=core.windows.net'
blob_service_client = BlobServiceClient.from_connection_string(connect_str)

# Get or create container
try:
    container_client = blob_service_client.get_container_client(BLOB_CONTAINER)
    container_client.get_container_properties()
except Exception:
    container_client = blob_service_client.create_container(BLOB_CONTAINER)

# Cosmos DB Configuration
COSMOS_URL = "https://barclaysdb.documents.azure.com:443/"
COSMOS_KEY = "ercuc7wFNt4RPsxcx2QTzKP8AhKUDnjJrt0mpZrW2Yi2IQGAa7wDrEbhKRHsurGu0P7GuGny4IZRACDbtecfNQ=="
DATABASE_NAME = "RequirementsDB"
RESOURCES_CONTAINER = "Resources"

# Initialize Cosmos DB client
cosmos_client = CosmosClient(COSMOS_URL, credential=COSMOS_KEY)
database = cosmos_client.get_database_client(DATABASE_NAME)
resources_container = database.get_container_client(RESOURCES_CONTAINER)

# Form Recognizer Configuration
FORM_RECOGNIZER_ENDPOINT = "https://barclaysform.cognitiveservices.azure.com/"
FORM_RECOGNIZER_KEY = "63spGg0VYFV0kWZB3nmsFDp8yEbi40zmEnCvIl6D8Seih4YyLsp9JQQJ99BDACYeBjFXJ3w3AAALACOGh5hu"

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'tiff', 'docx', 'txt', 'csv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_content_type(file_ext):
    content_types = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.csv': 'text/csv',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.txt': 'text/plain'
    }
    return content_types.get(file_ext.lower(), 'application/octet-stream')

def generate_sas_url(blob_name):
    """Generate a SAS URL for the blob that expires in 24 hours"""
    sas_token = generate_blob_sas(
        account_name=ACCOUNT_NAME,
        container_name=BLOB_CONTAINER,
        blob_name=blob_name,
        account_key=ACCOUNT_KEY,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.utcnow() + timedelta(hours=24)
    )
    
    encoded_blob_name = urllib.parse.quote(blob_name)
    return f'https://{ACCOUNT_NAME}.blob.core.windows.net/{BLOB_CONTAINER}/{encoded_blob_name}?{sas_token}'

def extract_text_from_bytes(file_bytes):
    """Extract text from a document using Azure Form Recognizer"""
    try:
        document_analysis_client = DocumentAnalysisClient(
            endpoint=FORM_RECOGNIZER_ENDPOINT,
            credential=AzureKeyCredential(FORM_RECOGNIZER_KEY)
        )

        poller = document_analysis_client.begin_analyze_document(
            "prebuilt-document", file_bytes
        )
        result = poller.result()

        text_content = []
        for paragraph in getattr(result, 'paragraphs', []):
            text_content.append(paragraph.content)

        return "\n".join(text_content)

    except Exception as e:
        print(f"Error extracting text: {str(e)}")
        return None

def upload_to_blob_storage_from_memory(file_bytes, blob_name, content_type):
    """Upload file from memory to Azure Blob Storage with proper content type"""
    try:
        blob_client = container_client.get_blob_client(blob_name)
        content_settings = ContentSettings(content_type=content_type)
        
        blob_client.upload_blob(
            file_bytes,
            overwrite=True,
            content_settings=content_settings
        )
        
        return generate_sas_url(blob_name)

    except Exception as e:
        print(f"Error uploading to blob storage: {str(e)}")
        return None

@resources.route('/add', methods=['POST'])
def add_resource():
    try:
        project_id = request.form.get('projectId')
        resource_name = request.form.get('resourceName')
        tagged_users = request.form.getlist('taggedUsers[]')
        
        if not project_id or not resource_name:
            return jsonify({
                'success': False,
                'message': 'Project ID and resource name are required'
            }), 400

        file = request.files.get('file')
        text_content = request.form.get('textContent')
        
        resource_data = {
            'id': str(uuid.uuid4()),
            'project_id': project_id,
            'name': resource_name,
            'tagged_users': tagged_users,
            'created_at': datetime.utcnow().isoformat(),
            'created_by': request.headers.get('X-User-ID'),
            'type': 'text' if text_content else 'file'
        }

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_bytes = file.read()
            
            # Extract text using Form Recognizer
            extracted_text = extract_text_from_bytes(file_bytes)
            
            # Upload to Blob Storage
            blob_name = f"{project_id}/{resource_data['id']}/{filename}"
            content_type = get_content_type(os.path.splitext(filename)[1])
            blob_url = upload_to_blob_storage_from_memory(file_bytes, blob_name, content_type)
            
            resource_data.update({
                'file_name': filename,
                'context': extracted_text,
                'url': blob_url,
                'content_type': content_type
            })
            
        elif text_content:
            resource_data.update({
                'context': text_content,
                'content_type': 'text/plain'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'No content provided'
            }), 400

        # Save to Cosmos DB
        resources_container.create_item(resource_data)

        return jsonify({
            'success': True,
            'message': 'Resource added successfully',
            'resource': resource_data
        }), 201

    except Exception as e:
        print(f"Error adding resource: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error adding resource: {str(e)}'
        }), 500

@resources.route('/project/<project_id>', methods=['GET'])
def get_project_resources(project_id):
    try:
        query = "SELECT * FROM c WHERE c.project_id = @project_id ORDER BY c.created_at DESC"
        parameters = [{"name": "@project_id", "value": project_id}]
        
        resources = list(resources_container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))

        # Generate fresh SAS URLs for file resources
        for resource in resources:
            if resource.get('type') == 'file' and resource.get('url'):
                blob_name = f"{project_id}/{resource['id']}/{resource['file_name']}"
                resource['url'] = generate_sas_url(blob_name)

        return jsonify({
            'success': True,
            'resources': resources
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching resources: {str(e)}'
        }), 500 