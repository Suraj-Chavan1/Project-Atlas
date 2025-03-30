# tests.py
import unittest
import json
from app import app

class TestCustomerAPI(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_get_customer_success(self):
        response = self.app.get('/api/customer/123')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.get_data(as_text=True))
        self.assertEqual(data['name'], 'Alice Smith')

    def test_get_customer_not_found(self):
        response = self.app.get('/api/customer/999')
        self.assertEqual(response.status_code, 404)
        data = json.loads(response.get_data(as_text=True))
        self.assertEqual(data['error'], 'Not found')

    def test_get_customer_invalid_id(self):
        response = self.app.get('/api/customer/invalid-id!')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.get_data(as_text=True))
        self.assertEqual(data['error'], 'Bad Request')

if __name__ == '__main__':
    unittest.main()