 # models.py (Example using SQLAlchemy, not strictly required for this simple example)
# from flask_sqlalchemy import SQLAlchemy

# db = SQLAlchemy()

# class Customer(db.Model):
#     id = db.Column(db.String(20), primary_key=True)
#     name = db.Column(db.String(100), nullable=False)
#     age = db.Column(db.Integer, nullable=False)
#     address = db.Column(db.String(200))

#     def __repr__(self):
#         return f'<Customer {self.name}>'