 # models.py (Example using SQLAlchemy)
# from flask_sqlalchemy import SQLAlchemy

# db = SQLAlchemy()

# class Customer(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(80), nullable=False)
#     email = db.Column(db.String(120), unique=True, nullable=False)
#     loan_amount = db.Column(db.Float, nullable=False)

#     def __repr__(self):
#         return f'<Customer {self.name}>'