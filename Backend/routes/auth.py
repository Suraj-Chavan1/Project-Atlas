from flask import Blueprint, request, jsonify
from azure.cosmos import CosmosClient, PartitionKey, exceptions
from datetime import datetime
import uuid

# Initialize the Blueprint
auth = Blueprint('auth', __name__, url_prefix='/auth')

# Cosmos DB Configuration
URL = "https://barclaysdb.documents.azure.com:443/"
KEY = "ercuc7wFNt4RPsxcx2QTzKP8AhKUDnjJrt0mpZrW2Yi2IQGAa7wDrEbhKRHsurGu0P7GuGny4IZRACDbtecfNQ=="
DATABASE_NAME = "RequirementsDB"
USER_CONTAINER = "Users"
SESSION_CONTAINER = "Sessions"

# Initialize Cosmos DB client
client = CosmosClient(URL, credential=KEY)

# Get or create database
try:
    database = client.create_database(DATABASE_NAME)
    print(f"Created database: {DATABASE_NAME}")
except exceptions.CosmosResourceExistsError:
    database = client.get_database_client(DATABASE_NAME)
    print(f"Using existing database: {DATABASE_NAME}")

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
users_container = get_or_create_container(USER_CONTAINER, "/id")
sessions_container = get_or_create_container(SESSION_CONTAINER, "/id")

@auth.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        required_fields = ['email', 'password', 'name', 'roles']
        
        # Validate required fields
        if not all(field in data for field in required_fields):
            return jsonify({
                'success': False,
                'message': 'Missing required fields'
            }), 400

        # Check if user already exists
        query = "SELECT * FROM c WHERE c.email = @email"
        parameters = [{"name": "@email", "value": data['email']}]
        
        existing_users = list(users_container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))

        if existing_users:
            return jsonify({
                'success': False,
                'message': 'User already exists'
            }), 409

        # Create new user document
        new_user = {
            'id': str(uuid.uuid4()),
            'email': data['email'],
            'password': data['password'],  # In production, hash the password
            'name': data['name'],
            'roles': data['roles'],
            'created_at': datetime.utcnow().isoformat(),
            'last_login': None,
            'active_projects': [],
            'preferences': {
                'theme': 'light',
                'notifications': True
            }
        }

        # Save user to database
        users_container.create_item(new_user)

        # Remove password from response
        response_user = new_user.copy()
        del response_user['password']
        
        return jsonify({
            'success': True,
            'message': 'User created successfully',
            'user': response_user
        }), 201

    except Exception as e:
        print(f"Error in signup: {str(e)}")  # Add debug print
        return jsonify({
            'success': False,
            'message': f'Error creating user: {str(e)}'
        }), 500

@auth.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        if not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Email and password are required'
            }), 400

        # Find user
        query = "SELECT * FROM c WHERE c.email = @email"
        parameters = [{"name": "@email", "value": data['email']}]
        
        users = list(users_container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))

        if not users or users[0]['password'] != data['password']:  # In production, compare hashed passwords
            return jsonify({
                'success': False,
                'message': 'Invalid credentials'
            }), 401

        user = users[0]

        # Create session
        session = {
            'id': str(uuid.uuid4()),
            'user_id': user['id'],
            'created_at': datetime.utcnow().isoformat(),
            'last_active': datetime.utcnow().isoformat(),
            'roles': user['roles'],
            'active': True
        }

        # Save session
        sessions_container.create_item(session)

        # Update user's last login
        user['last_login'] = datetime.utcnow().isoformat()
        users_container.replace_item(user['id'], user)

        # Remove password from response
        del user['password']

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user,
            'session_id': session['id']
        }), 200

    except Exception as e:
        print(f"Error in login: {str(e)}")  # Add debug print
        return jsonify({
            'success': False,
            'message': f'Error during login: {str(e)}'
        }), 500

@auth.route('/logout', methods=['POST'])
def logout():
    try:
        session_id = request.headers.get('X-Session-ID')
        if not session_id:
            return jsonify({
                'success': False,
                'message': 'Session ID is required'
            }), 400

        # Find and update session
        query = "SELECT * FROM c WHERE c.id = @session_id"
        parameters = [{"name": "@session_id", "value": session_id}]
        
        sessions = list(sessions_container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))

        if not sessions:
            return jsonify({
                'success': False,
                'message': 'Session not found'
            }), 404

        session = sessions[0]
        # Mark session as inactive
        session['active'] = False
        session['ended_at'] = datetime.utcnow().isoformat()
        sessions_container.replace_item(session['id'], session)

        return jsonify({
            'success': True,
            'message': 'Logout successful'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error during logout: {str(e)}'
        }), 500

@auth.route('/check-session', methods=['GET'])
def check_session():
    try:
        session_id = request.headers.get('X-Session-ID')
        if not session_id:
            return jsonify({
                'success': False,
                'message': 'Session ID is required'
            }), 400

        # Find active session
        query = "SELECT * FROM c WHERE c.id = @session_id AND c.active = true"
        parameters = [{"name": "@session_id", "value": session_id}]
        
        sessions = list(sessions_container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))

        if not sessions:
            return jsonify({
                'success': False,
                'message': 'Invalid or expired session'
            }), 401

        session = sessions[0]

        # Get user details
        query = "SELECT * FROM c WHERE c.id = @user_id"
        parameters = [{"name": "@user_id", "value": session['user_id']}]
        
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
        # Remove sensitive information
        del user['password']

        # Update session last active time
        session['last_active'] = datetime.utcnow().isoformat()
        sessions_container.replace_item(session['id'], session)

        return jsonify({
            'success': True,
            'session': session,
            'user': user
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error checking session: {str(e)}'
        }), 500 