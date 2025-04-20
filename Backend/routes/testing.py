from flask import Blueprint

ts = Blueprint('testing', __name__, url_prefix='/test')

@ts.route('/testing', methods=['GET'])
def testing():
    return 'Testing Serve in running!'