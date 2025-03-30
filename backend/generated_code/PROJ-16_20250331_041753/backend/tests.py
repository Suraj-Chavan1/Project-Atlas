# test_app.py
import unittest
import json
from app import app

class TestApp(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_approve_loan_success(self):
        data = {
            'amount': 10000,
            'income': 50000,
            'credit_score': 700
        }
        response = self.app.post('/api/approve_loan',
                                 data=json.dumps(data),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.data)['message'], 'Loan Approved!')

    def test_approve_loan_failure(self):
        data = {
            'amount': 50000,
            'income': 25000,
            'credit_score': 500
        }
        response = self.app.post('/api/approve_loan',
                                 data=json.dumps(data),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.data)['message'], 'Loan Denied.')

    def test_approve_loan_missing_params(self):
        data = {
            'amount': 10000,
            'income': 50000
        }
        response = self.app.post('/api/approve_loan',
                                 data=json.dumps(data),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(json.loads(response.data)['message'], 'Missing parameters')

if __name__ == '__main__':
    unittest.main()