from flask import Blueprint, request, jsonify
import json
from services.jira_service import (
    get_jira_issues,
    generate_code_for_story,
    push_code_to_files
)

jira_blueprint = Blueprint('jira', __name__)

@jira_blueprint.route('/issues', methods=['GET'])
def get_issues():
    try:
        jql = request.args.get('jql')
        max_results = request.args.get('max_results', 50, type=int)
        issues = get_jira_issues(jql, max_results)
        return jsonify({"success": True, "issues": issues})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@jira_blueprint.route('/generate-code', methods=['POST'])
def generate_code():
    try:
        data = request.get_json()
        story = data.get('story')
        if not story:
            return jsonify({"success": False, "error": "No story provided"}), 400
        
        code = generate_code_for_story(story)
        if not code:
            return jsonify({"success": False, "error": "Failed to generate code"}), 500
        
        # Optionally save the code to files
        if data.get('save_to_files', False):
            issue_key = story.get('key', 'NO_KEY')
            push_code_to_files(code, issue_key)
        
        return jsonify({
            "success": True,
            "code": code
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500 