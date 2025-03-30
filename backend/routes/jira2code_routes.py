from flask import Blueprint, jsonify, request, send_file
from Jira2code import get_jira_issues, generate_code_for_story, push_code_to_files
import os
import tempfile
import shutil
import zipfile
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

jira2code_bp = Blueprint('jira2code', __name__)

@jira2code_bp.route('/stories', methods=['GET'])
def get_stories():
    """
    Fetch Jira stories for the frontend.
    Returns a structure matching the Jira API format.
    """
    try:
        logger.info("Fetching Jira stories...")
        issues = get_jira_issues()
        logger.info(f"Retrieved {len(issues)} issues")
        
        if not isinstance(issues, list):
            logger.warning("Issues is not a list, returning empty array")
            return jsonify({'issues': [], 'message': 'No issues found'})
            
        if not issues:
            logger.info("No issues found")
            return jsonify({'issues': [], 'message': 'No issues found'})
            
        logger.info(f"First issue summary: {issues[0].get('fields', {}).get('summary') if issues else 'None'}")
        return jsonify({'issues': issues, 'message': 'Successfully retrieved issues'})
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error fetching stories: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to fetch Jira stories'}), 500

@jira2code_bp.route('/generate', methods=['POST'])
def generate_code():
    """
    Generate code for a selected story.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        story_id = data.get('story_id')
        if not story_id:
            return jsonify({'error': 'No story ID provided'}), 400

        logger.info(f"Generating code for story: {story_id}")
        issues = get_jira_issues(f"key = {story_id}")
        
        if not issues:
            logger.warning(f"Story not found: {story_id}")
            return jsonify({'error': 'Story not found'}), 404

        story = issues[0]
        code = generate_code_for_story(story)
        
        if not code:
            logger.error("Failed to generate code")
            return jsonify({'error': 'Failed to generate code'}), 500

        folder = push_code_to_files(code, story_id)
        
        if not folder:
            logger.error("Failed to save generated code")
            return jsonify({'error': 'Failed to save generated code'}), 500

        logger.info(f"Successfully generated code in folder: {folder}")
        return jsonify({
            'folder': folder,
            'frontend': code['frontend'],
            'backend': code['backend'],
            'message': 'Code generated successfully'
        })

    except Exception as e:
        logger.error(f"Error generating code: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@jira2code_bp.route('/download/<path:folder>', methods=['GET'])
def download_code(folder):
    """
    Download the generated code as a zip file.
    """
    temp_dir = None
    try:
        # Add debug logging for paths
        logger.info(f"Download requested for folder: {folder}")
        
        # Validate and sanitize the folder path
        if not folder or '..' in folder:
            logger.error("Invalid folder path")
            return jsonify({'error': 'Invalid folder path'}), 400

        # Clean the folder name of any path separators at start/end and get just the folder name
        folder = os.path.basename(folder.strip('/\\'))
        logger.info(f"Cleaned folder name: {folder}")
        
        # Ensure the folder is within the generated_code directory
        base_dir = os.path.abspath('generated_code')
        logger.info(f"Base directory absolute path: {base_dir}")
        
        if not os.path.exists(base_dir):
            logger.error(f"Base directory does not exist: {base_dir}")
            try:
                os.makedirs(base_dir)
                logger.info(f"Created base directory: {base_dir}")
            except Exception as e:
                logger.error(f"Failed to create base directory: {str(e)}")
                return jsonify({'error': 'Failed to create generated code directory'}), 500
            
        folder_path = os.path.join(base_dir, folder)
        folder_path = os.path.abspath(folder_path)
        
        logger.info(f"Current working directory: {os.getcwd()}")
        logger.info(f"Base directory: {base_dir}")
        logger.info(f"Full folder path: {folder_path}")
        
        try:
            # List available folders for debugging
            available_folders = [f for f in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, f))]
            logger.info(f"Available folders: {available_folders}")
        except Exception as e:
            logger.error(f"Error listing available folders: {str(e)}")
            return jsonify({'error': 'Failed to list available folders'}), 500
        
        if folder not in available_folders:
            logger.warning(f"Requested folder '{folder}' not found in available folders: {available_folders}")
            return jsonify({
                'error': f'Generated code not found. Available folders: {", ".join(available_folders)}'
            }), 404

        if not os.path.exists(folder_path):
            logger.warning(f"Generated code not found: {folder_path}")
            return jsonify({
                'error': f'Generated code not found. Available folders: {", ".join(available_folders)}'
            }), 404

        if not os.path.isdir(folder_path):
            logger.error(f"Path is not a directory: {folder_path}")
            return jsonify({'error': 'Invalid folder path'}), 400

        # List directory contents for debugging
        logger.info("Directory contents:")
        files_list = []
        try:
            for root, dirs, files in os.walk(folder_path):
                rel_path = os.path.relpath(root, folder_path)
                rel_path = '.' if rel_path == '.' else rel_path
                for f in files:
                    file_path = os.path.join(rel_path, f)
                    files_list.append(file_path)
                    logger.info(f"Found file: {file_path}")
        except Exception as e:
            logger.error(f"Error walking directory: {str(e)}")
            return jsonify({'error': 'Failed to list directory contents'}), 500

        if not files_list:
            logger.error("No files found in directory")
            return jsonify({'error': 'No files found in the specified directory'}), 404

        logger.info(f"Found {len(files_list)} files to zip")
        
        # Create a temporary directory in the backend folder
        try:
            temp_dir = os.path.join(os.getcwd(), 'temp')
            if not os.path.exists(temp_dir):
                os.makedirs(temp_dir)
            logger.info(f"Created temporary directory: {temp_dir}")
            
            zip_path = os.path.join(temp_dir, f"{folder}.zip")
            logger.info(f"Zip file path: {zip_path}")
            
            # Remove existing zip file if it exists
            if os.path.exists(zip_path):
                os.remove(zip_path)
                logger.info(f"Removed existing zip file: {zip_path}")
            
            # Create the zip file
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for file_path in files_list:
                    full_path = os.path.join(folder_path, file_path)
                    try:
                        if os.path.exists(full_path):
                            zipf.write(full_path, file_path)
                            logger.debug(f"Added file to zip: {file_path}")
                        else:
                            logger.warning(f"File not found: {full_path}")
                    except Exception as e:
                        logger.error(f"Error adding file to zip: {file_path} - {str(e)}")
                        continue

            logger.info("Zip file created successfully")
            
            # Check if the zip file was created and has content
            if not os.path.exists(zip_path):
                logger.error("Zip file was not created")
                return jsonify({'error': 'Failed to create zip file'}), 500
                
            zip_size = os.path.getsize(zip_path)
            logger.info(f"Zip file size: {zip_size} bytes")
            
            if zip_size == 0:
                logger.error("Created zip file is empty")
                return jsonify({'error': 'Generated zip file is empty'}), 500

            try:
                response = send_file(
                    zip_path,
                    mimetype='application/zip',
                    as_attachment=True,
                    download_name=f"{folder}.zip"
                )
                logger.info("File sent successfully")
                return response
                
            except Exception as e:
                logger.error(f"Error sending file: {str(e)}")
                return jsonify({'error': f'Failed to send zip file: {str(e)}'}), 500

        except Exception as e:
            logger.error(f"Error in zip creation: {str(e)}")
            return jsonify({'error': f'Failed to create zip file: {str(e)}'}), 500

    except Exception as e:
        logger.error(f"Error in download route: {str(e)}", exc_info=True)
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500
        
    finally:
        # Clean up temporary directory
        if temp_dir and os.path.exists(temp_dir):
            try:
                shutil.rmtree(temp_dir)
                logger.info(f"Cleaned up temporary directory: {temp_dir}")
            except Exception as e:
                logger.warning(f"Failed to clean up temporary directory: {str(e)}") 