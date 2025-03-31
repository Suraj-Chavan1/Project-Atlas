from flask import Blueprint, request, jsonify
from AIrequirementgenerator import gather_requirements, generate_requirements_document
import traceback

ai_requirement_bp = Blueprint('ai_requirement', __name__)

@ai_requirement_bp.route('/generate', methods=['POST'])
def generate_requirements():
    try:
        # Get the conversation data from the request
        data = request.get_json()
        if not data or 'transcript' not in data:
            return jsonify({'error': 'No transcript provided'}), 400
            
        transcript = data['transcript']
        print(f"Received transcript: {transcript[:100]}...")  # Log first 100 chars
        
        requirements_document = generate_requirements_document(transcript)
        
        if requirements_document.startswith('Error:'):
            return jsonify({
                'status': 'error',
                'message': requirements_document
            }), 500
            
        return jsonify({
            'status': 'success',
            'requirements': requirements_document
        })
            
    except Exception as e:
        print(f"Error in generate_requirements: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'traceback': traceback.format_exc()
        }), 500

@ai_requirement_bp.route('/gather', methods=['POST'])
def gather():
    try:
        # Get the questions data from the request
        data = request.get_json()
        if not data or 'questions' not in data:
            return jsonify({'error': 'No questions provided'}), 400
            
        questions = data['questions']
        transcript = ""
        
        # Process each question and answer
        for qa in questions:
            if 'question' in qa and 'answer' in qa:
                transcript += f"Q: {qa['question']}\nA: {qa['answer']}\n\n"
        
        return jsonify({
            'status': 'success',
            'transcript': transcript
        })
            
    except Exception as e:
        print(f"Error in gather: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'traceback': traceback.format_exc()
        }), 500 