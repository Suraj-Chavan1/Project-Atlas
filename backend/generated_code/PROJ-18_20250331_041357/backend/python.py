# app.py
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///:memory:')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the Customer model
class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    age = db.Column(db.Integer)
    loan_amount = db.Column(db.Float)
    risk_score = db.Column(db.Float)
    approval_status = db.Column(db.String(20))

    def __repr__(self):
        return f'<Customer {self.name}>'

# Create the database tables within the app context
with app.app_context():
    db.create_all()

    # Add some sample data if the database is empty
    if Customer.query.count() == 0:
        customer1 = Customer(name='John Doe', age=30, loan_amount=10000, risk_score=0.7, approval_status='Approved')
        customer2 = Customer(name='Jane Smith', age=25, loan_amount=5000, risk_score=0.5, approval_status='Pending')
        db.session.add(customer1)
        db.session.add(customer2)
        db.session.commit()


@app.route('/api/customer/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    try:
        customer = Customer.query.get_or_404(customer_id)
        customer_data = {
            'id': customer.id,
            'name': customer.name,
            'age': customer.age,
            'loan_amount': customer.loan_amount,
            'risk_score': customer.risk_score,
            'approval_status': customer.approval_status
        }
        return jsonify(customer_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)