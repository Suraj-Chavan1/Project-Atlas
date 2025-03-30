import boto3
import bcrypt
from datetime import datetime

# Initialize the DynamoDB resource
dynamodb = boto3.resource('dynamodb', region_name="ap-south-1")

def create_auth_table():
    # Check if the table already exists
    existing_tables = dynamodb.meta.client.list_tables()['TableNames']

    if 'UserAuth' not in existing_tables:
        # Create the DynamoDB table
        table = dynamodb.create_table(
            TableName='UserAuth',
            KeySchema=[
                {
                    'AttributeName': 'username',
                    'KeyType': 'HASH'  # Partition key
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'username',
                    'AttributeType': 'S'  # String
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )

        # Wait until the table exists
        table.meta.client.get_waiter('table_exists').wait(TableName='UserAuth')
        print(f"Table UserAuth created successfully!")
        
        # Insert initial users with hashed passwords
        insert_initial_users()
    else:
        print("Table 'UserAuth' already exists!")

def insert_initial_users():
    table = dynamodb.Table('UserAuth')
    
    # Initial users data
    users = [
        {
            'username': 'johndoe',
            'password': 'password123',  # In real app, never hardcode passwords
            'email': 'john@example.com',
            'created_at': datetime.now().isoformat()
        },
        {
            'username': 'janedoe',
            'password': 'password123',
            'email': 'jane@example.com',
            'created_at': datetime.now().isoformat()
        }
    ]

    # Insert users with hashed passwords
    for user in users:
        # Hash the password
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(user['password'].encode('utf-8'), salt)
        
        # Store user with hashed password
        table.put_item(Item={
            'username': user['username'],
            'password_hash': hashed.decode('utf-8'),  # Store hash as string
            'email': user['email'],
            'created_at': user['created_at']
        })
        print(f"Created user: {user['username']}")

if __name__ == "__main__":
    create_auth_table() 