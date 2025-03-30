# tests.py
import unittest
import json
from app import app, db, Customer

class AppTest(unittest.TestCase):

    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app = app.test_client()
        with app.app_context():
            db.create_all()
            # Create a test customer
            test_customer = Customer(name='Test User', age=40, loan_amount=15000, risk_score=0.6, approval_status='Approved')
            db.session.add(test_customer)
            db.session.commit()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_get_customer(self):
        response = self.app.get('/api/customer/1')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode('utf-8'))
        self.assertEqual(data['name'], 'Test User')

    def test_get_customer_not_found(self):
        response = self.app.get('/api/customer/999')
        self.assertEqual(response.status_code, 404)

if __name__ == '__main__':
    unittest.main()