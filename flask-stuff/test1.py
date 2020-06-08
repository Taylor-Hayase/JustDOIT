import unittest
import simplejson as json
import names

from sample_backend import app

class FlaskTests(unittest.TestCase):

	def test_root(self):
		tester = app.test_client(self)
		response = tester.get('/', content_type='html/text')
		self.assertEqual(response.data, b'Hello, World!');

	def test_sign_in_not_user(self):
		app.testing = True
		tester = app.test_client(self)
		response = tester.post('/', data=json.dumps(dict(username='AlexT',
														password='1234')),
							content_type='application/json')
		self.assertEqual(response.status_code, 204)

	def test_sign_in_no_password(self):
		app.testing = True
		tester = app.test_client(self)
		response = tester.post('/', data=json.dumps(dict(username='AlexT')),
							content_type='application/json')
		self.assertEqual(response.status_code, 204)

	def test_sign_in_blank(self):
		app.testing = True
		tester = app.test_client(self)
		response = tester.post('/', data=json.dumps(dict()),
							content_type='application/json')
		self.assertEqual(response.status_code, 204)

	def test_signup_no_username(self):
		app.testing = True
		tester = app.test_client(self)
		response = tester.post('/signup', data=json.dumps(dict(username='',
															password='123',
															first_name='Bruno',
															last_name='Da Silva')),
							content_type='application/json')
		self.assertEqual(response.status_code, 204)

	def test_signup_no_password(self):
		app.testing = True
		tester = app.test_client(self)
		response = tester.post('/signup', data=json.dumps(dict(username='Brand',
															password='',
															first_name='Bruno',
															last_name='Da Silva')),
							content_type='application/json')
		self.assertEqual(response.status_code, 204)

	def test_signup_good(self):
		app.testing = True
		tester = app.test_client(self)
		response = tester.post('/signup', data=json.dumps(dict(username=names.get_first_name(),
															password='1234',
															first_name='Bruno',
															last_name='Da Silva')),
							content_type='application/json')
		self.assertEqual(response.status_code, 200)



if __name__ == '__main__':
	unittest.main()
