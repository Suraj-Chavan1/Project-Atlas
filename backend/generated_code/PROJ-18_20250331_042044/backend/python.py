# app.py
from flask import Flask, jsonify, abort
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Mock customer data (replace with database integration later)
customers = {
    1: {"id": 1, "name": "John Doe", "email": "john.doe@example.com", "loan_amount": 60000},
    2: {"id": 2, "name": "Jane Smith", "email": "jane.smith@example.com", "loan_amount": 40000},
    3: {"id": 3, "name": "Peter Jones", "email": "peter.jones@example.com", "loan_amount": 75000}
}

@app.route('/api/customers/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    if customer_id not in customers:
        abort(404, description="Customer not found")
    return jsonify(customers[customer_id])

@app.errorhandler(404)
def resource_not_found(e):
    return jsonify(error=str(e)), 404

if __name__ == '__main__':
    app.run(debug=True)