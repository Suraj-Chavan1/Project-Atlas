# test_app.py
import unittest
import json
from app import app

class TestApp(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_get_customer_success(self):
        response = self.app.get('/api/customers/1')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode('utf-8'))
        self.assertEqual(data['name'], 'John Doe')

    def test_get_customer_not_found(self):
        response = self.app.get('/api/customers/999')
        self.assertEqual(response.status_code, 404)
        data = json.loads(response.data.decode('utf-8'))
        self.assertEqual(data['error'], 'Customer not found')

if __name__ == '__main__':
    unittest.main()