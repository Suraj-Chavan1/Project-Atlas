# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Mock loan approval logic
def approve_loan(amount, income, credit_score):
    # Basic approval criteria
    if amount > 0 and income > 20000 and credit_score > 600:
        if amount / income < 0.5:
            return True
    return False

@app.route('/api/approve_loan', methods=['POST'])
def api_approve_loan():
    try:
        data = request.get_json()
        amount = data.get('amount')
        income = data.get('income')
        credit_score = data.get('credit_score')

        if not all([amount, income, credit_score]):
            return jsonify({'message': 'Missing parameters'}), 400

        approved = approve_loan(amount, income, credit_score)

        if approved:
            return jsonify({'message': 'Loan Approved!'}), 200
        else:
            return jsonify({'message': 'Loan Denied.'}), 200

    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

if __name__ == '__main__':
    app.run(debug=True)