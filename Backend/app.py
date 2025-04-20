from flask import Flask
from flask_cors import CORS
from routes.auth import auth
from routes.projects import projects
from routes.resources import resources
from routes.sde_routes import sde
from routes.ba_routes import ba
from routes.devops_routes import devops
from routes.client_routes import client
from routes.srs_and_brd_routes import srs_brd_bp
from routes.srs_and_brd_to_userstories import srs_brd_to_stories_bp
from azure.cosmos import CosmosClient
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "X-Session-ID", "X-User-ID"]
}})

# Azure Cosmos DB Configuration
COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT", "https://barclaysdb.documents.azure.com:443/")
COSMOS_KEY = os.getenv("COSMOS_KEY", "ercuc7wFNt4RPsxcx2QTzKP8AhKUDnjJrt0mpZrW2Yi2IQGAa7wDrEbhKRHsurGu0P7GuGny4IZRACDbtecfNQ==")
COSMOS_DATABASE = "RequirementsDB"

# Initialize Cosmos DB client
cosmos_client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
database = cosmos_client.get_database_client(COSMOS_DATABASE)

# Register blueprints
app.register_blueprint(auth)
app.register_blueprint(projects)
app.register_blueprint(resources)
app.register_blueprint(sde)
app.register_blueprint(ba)
app.register_blueprint(devops)
app.register_blueprint(client)
app.register_blueprint(srs_brd_bp, url_prefix='/srs_brd')
app.register_blueprint(srs_brd_to_stories_bp, url_prefix='/srs_brd_to_stories')

@app.route('/', methods=['GET'])
def hello_world():
    return 'Server is running!'

# Add route to fetch stories

if __name__ == '__main__':
    app.run(debug=True)