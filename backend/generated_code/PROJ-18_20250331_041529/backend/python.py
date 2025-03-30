# app.py
from flask import Flask, jsonify, abort
from flask_cors import CORS # Import CORS

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Mock customer data (replace with database interaction)
customers = {
    '123': {'id': '123', 'name': 'Alice Smith', 'age': 30, 'address': '123 Main St', 'loan_risk': 'Low'},
    '456': {'id': '456', 'name': 'Bob Johnson', 'age': 45, 'address': '456 Oak Ave', 'loan_risk': 'Medium'},
    '789': {'id': '789', 'name': 'Charlie Brown', 'age': 25, 'address': '789 Pine Ln', 'loan_risk': 'High'}
}

@app.route('/api/customer/<customer_id>', methods=['GET'])
def get_customer(customer_id):
    # Input validation
    if not customer_id.isalnum():
        abort(400, description="Invalid customer ID")

    if customer_id in customers:
        return jsonify(customers[customer_id])
    else:
        abort(404, description="Customer not found")

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found', 'message': error.description}), 404

@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad Request', 'message': error.description}), 400

if __name__ == '__main__':
    app.run(debug=True)