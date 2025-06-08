from flask import jsonify
from math import ceil

def success_response(data=None, message="Success", status_code=200):
    response = {
        'success': True,
        'message': message
    }
    if data is not None:
        response['data'] = data
    return jsonify(response), status_code

def error_response(message="Error occurred", status_code=400, errors=None):
    response = {
        'success': False,
        'message': message
    }
    if errors:
        response['errors'] = errors
    return jsonify(response), status_code

def paginate_query(query, page=1, per_page=10):
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        'items': [item.to_dict() for item in items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': ceil(total / per_page),
            'has_prev': page > 1,
            'has_next': page < ceil(total / per_page)
        }
    }