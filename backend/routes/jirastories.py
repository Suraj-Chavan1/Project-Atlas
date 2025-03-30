from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from Userstories import load_file_text, extract_user_stories_json, push_story_to_jira

jirastories_bp = Blueprint('jirastories', __name__)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'xls', 'xlsx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@jirastories_bp.route('/process', methods=['POST'])
def process_document():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        try:
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            # Extract text from the document
            document_text = load_file_text(filepath)
            
            # Generate user stories
            stories = extract_user_stories_json(document_text)
            
            # Clean up the uploaded file
            os.remove(filepath)
            
            return jsonify({
                'success': True,
                'stories': stories
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': str(e)
            }), 500
    
    return jsonify({
        'success': False,
        'message': 'File type not allowed'
    }), 400

@jirastories_bp.route('/push-to-jira', methods=['POST'])
def push_to_jira():
    try:
        data = request.json
        if not data or 'story' not in data:
            return jsonify({
                'success': False,
                'message': 'No story data provided'
            }), 400
        
        story = data['story']
        push_story_to_jira(story)
        
        return jsonify({
            'success': True,
            'message': 'Story successfully pushed to Jira'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500 