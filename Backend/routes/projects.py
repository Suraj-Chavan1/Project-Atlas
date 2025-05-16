from flask import Blueprint, request, jsonify
from azure.cosmos import CosmosClient, PartitionKey, exceptions
from datetime import datetime
import uuid

# Initialize the Blueprint
projects = Blueprint('projects', __name__, url_prefix='/projects')

# Cosmos DB Configuration (reuse from auth.py)
URL = "https://barclaysdb.documents.azure.com:443/"
KEY = " "
DATABASE_NAME = "RequirementsDB"
PROJECT_CONTAINER = "Projects"
USER_CONTAINER = "Users"

# Initialize Cosmos DB client
client = CosmosClient(URL, credential=KEY)
database = client.get_database_client(DATABASE_NAME)

# Get or create containers
def get_or_create_container(container_name, partition_key_path):
    try:
        container = database.create_container(
            id=container_name,
            partition_key=PartitionKey(path=partition_key_path)
        )
        print(f"Created container: {container_name}")
    except exceptions.CosmosResourceExistsError:
        container = database.get_container_client(container_name)
        print(f"Using existing container: {container_name}")
    return container

# Initialize containers
projects_container = get_or_create_container(PROJECT_CONTAINER, "/id")
users_container = database.get_container_client(USER_CONTAINER)

@projects.route('/list-users', methods=['GET'])
def list_users():
    """Get all users for stakeholder selection"""
    try:
        query = "SELECT c.id, c.name, c.email, c.roles FROM c"
        users = list(users_container.query_items(
            query=query,
            enable_cross_partition_query=True
        ))
        
        return jsonify({
            'success': True,
            'users': users
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching users: {str(e)}'
        }), 500

@projects.route('/create', methods=['POST'])
def create_project():
    """Create a new project with stakeholders"""
    try:
        data = request.json
        required_fields = ['name', 'projectKey']
        
        # Validate required fields
        if not all(field in data for field in required_fields):
            return jsonify({
                'success': False,
                'message': 'Missing required fields'
            }), 400

        # Get creator's user ID from header
        creator_id = request.headers.get('X-User-ID')
        if not creator_id:
            return jsonify({
                'success': False,
                'message': 'User ID is required'
            }), 400

        # Get creator's details including their role
        query = "SELECT c.id, c.name, c.email, c.roles FROM c WHERE c.id = @id"
        parameters = [{"name": "@id", "value": creator_id}]
        creator_list = list(users_container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))

        if not creator_list:
            return jsonify({
                'success': False,
                'message': 'Creator user not found'
            }), 404

        creator = creator_list[0]

        # Initialize stakeholders list with creator as owner
        stakeholders = [
            {
                'id': creator['id'],
                'name': creator['name'],
                'email': creator['email'],
                'position': 'owner',  # Changed from 'role' to 'position'
                'role': creator['roles'][0] if creator.get('roles') else 'Client'  # User's role (DevOps/SDE/BA/Client)
            }
        ]

        # Add additional stakeholders if provided
        if 'stakeholders' in data and data['stakeholders']:
            # Get all stakeholder details at once for efficiency
            stakeholder_ids = [s['id'] for s in data['stakeholders'] if s['id'] != creator_id]
            if stakeholder_ids:
                query = "SELECT c.id, c.name, c.email, c.roles FROM c WHERE c.id IN ({})".format(
                    ','.join([f"'{id}'" for id in stakeholder_ids])
                )
                stakeholder_users = list(users_container.query_items(
                    query=query,
                    enable_cross_partition_query=True
                ))
                
                # Create a lookup dictionary for efficiency
                stakeholder_details = {user['id']: user for user in stakeholder_users}
                
                # Add stakeholders with both position and role
                for stakeholder in data['stakeholders']:
                    if stakeholder['id'] != creator_id:
                        user_details = stakeholder_details.get(stakeholder['id'])
                        if user_details:
                            stakeholders.append({
                                'id': user_details['id'],
                                'name': user_details['name'],
                                'email': user_details['email'],
                                'position': stakeholder.get('position', 'member'),  # Default position is 'member'
                                'role': user_details.get('roles', ['Client'])[0]  # User's role (DevOps/SDE/BA/Client)
                            })

        # Create new project document with role tracking
        new_project = {
            'id': str(uuid.uuid4()),
            'name': data['name'],
            'projectKey': data['projectKey'],
            'stakeholders': stakeholders,
            'created_at': datetime.utcnow().isoformat(),
            'created_by': creator_id,
            'owner_id': creator_id,
            'status': 'active',
            'requirements': [],
            'documents': [],
            # Track number of each role for template generation
            'role_counts': {
                'DevOps': len([s for s in stakeholders if s.get('role') == 'DevOps']),
                'SDE': len([s for s in stakeholders if s.get('role') == 'SDE']),
                'BA': len([s for s in stakeholders if s.get('role') == 'BA']),
                'Client': len([s for s in stakeholders if s.get('role') == 'Client'])
            }
        }

        # Save project to database
        projects_container.create_item(new_project)

        # Update each user's active_projects
        for stakeholder in stakeholders:
            user_id = stakeholder['id']
            query = "SELECT * FROM c WHERE c.id = @id"
            parameters = [{"name": "@id", "value": user_id}]
            users = list(users_container.query_items(
                query=query,
                parameters=parameters,
                enable_cross_partition_query=True
            ))
            if users:
                user = users[0]
                if 'active_projects' not in user:
                    user['active_projects'] = []
                user['active_projects'].append({
                    'project_id': new_project['id'],
                    'project_name': new_project['name'],
                    'position': stakeholder['position'],  # Changed from 'role' to 'position'
                    'role': stakeholder['role']  # Added user's role
                })
                users_container.replace_item(user['id'], user)

        return jsonify({
            'success': True,
            'message': 'Project created successfully',
            'project': new_project
        }), 201

    except Exception as e:
        print(f"Error in create_project: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error creating project: {str(e)}'
        }), 500

@projects.route('/user/<user_id>', methods=['GET'])
def get_user_projects(user_id):
    """Get all projects for a specific user"""
    try:
        # Get user's projects
        query = "SELECT * FROM c WHERE c.id = @id"
        parameters = [{"name": "@id", "value": user_id}]
        users = list(users_container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))

        if not users:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404

        user = users[0]
        active_projects = user.get('active_projects', [])

        # Get full project details
        projects = []
        for project_ref in active_projects:
            query = "SELECT * FROM c WHERE c.id = @id"
            parameters = [{"name": "@id", "value": project_ref['project_id']}]
            project_list = list(projects_container.query_items(
                query=query,
                parameters=parameters,
                enable_cross_partition_query=True
            ))
            if project_list:
                projects.append(project_list[0])

        return jsonify({
            'success': True,
            'projects': projects
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching user projects: {str(e)}'
        }), 500

@projects.route('/<project_id>', methods=['GET'])
def get_project(project_id):
    """Get project details including stakeholders"""
    try:
        query = "SELECT * FROM c WHERE c.id = @project_id"
        parameters = [{"name": "@project_id", "value": project_id}]
        
        projects = list(projects_container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))

        if not projects:
            return jsonify({
                'success': False,
                'message': 'Project not found'
            }), 404

        return jsonify({
            'success': True,
            'project': projects[0]
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching project: {str(e)}'
        }), 500

@projects.route('/stakeholders/<project_id>', methods=['GET'])
def get_project_stakeholders(project_id):
    try:
        # Get the database and container
        database = client.get_database_client("RequirementsDB")
        container = database.get_container_client("Projects")
        
        # Query for the specific project
        query = f"SELECT * FROM c WHERE c.id = '{project_id}'"
        items = list(container.query_items(
            query=query,
            enable_cross_partition_query=True
        ))
        
        if not items:
            return jsonify({"error": "Project not found"}), 404
            
        project = items[0]
        
        # Extract stakeholders and role counts
        response_data = {
            "stakeholders": project.get("stakeholders", []),
            "role_counts": project.get("role_counts", {})
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"Error fetching stakeholders: {str(e)}")
        return jsonify({"error": str(e)}), 500 
