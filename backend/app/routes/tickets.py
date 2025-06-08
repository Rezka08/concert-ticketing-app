from flask import Blueprint, request, jsonify
from app import db
from app.models.ticket_type import TicketType
from app.models.concert import Concert
from app.utils.auth import admin_required
from app.utils.helpers import success_response, error_response

tickets_bp = Blueprint('tickets', __name__)

@tickets_bp.route('/<int:ticket_id>', methods=['GET'])
def get_ticket(ticket_id):
    try:
        ticket = TicketType.query.get(ticket_id)
        
        if not ticket:
            return error_response('Ticket type not found', 404)
        
        return success_response(ticket.to_dict(), 'Ticket type retrieved successfully')
        
    except Exception as e:
        return error_response('Failed to retrieve ticket type', 500)

@tickets_bp.route('/<int:ticket_id>', methods=['PUT'])
@admin_required
def update_ticket(current_user, ticket_id):
    try:
        ticket = TicketType.query.get(ticket_id)
        
        if not ticket:
            return error_response('Ticket type not found', 404)
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            ticket.name = data['name'].strip()
        
        if 'price' in data:
            try:
                price = float(data['price'])
                if price <= 0:
                    return error_response('Price must be greater than 0', 400)
                ticket.price = price
            except (ValueError, TypeError):
                return error_response('Invalid price format', 400)
        
        if 'quantity_total' in data:
            try:
                quantity = int(data['quantity_total'])
                if quantity <= 0:
                    return error_response('Quantity must be greater than 0', 400)
                
                # Update available quantity proportionally
                sold = ticket.quantity_total - ticket.quantity_available
                ticket.quantity_total = quantity
                ticket.quantity_available = max(0, quantity - sold)
                
            except (ValueError, TypeError):
                return error_response('Invalid quantity format', 400)
        
        db.session.commit()
        
        return success_response(ticket.to_dict(), 'Ticket type updated successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Failed to update ticket type', 500)

@tickets_bp.route('/<int:ticket_id>', methods=['DELETE'])
@admin_required
def delete_ticket(current_user, ticket_id):
    try:
        ticket = TicketType.query.get(ticket_id)
        
        if not ticket:
            return error_response('Ticket type not found', 404)
        
        # Check if ticket type has orders
        from app.models.order_item import OrderItem
        has_orders = OrderItem.query.filter_by(ticket_type_id=ticket_id).first()
        
        if has_orders:
            return error_response('Cannot delete ticket type with existing orders', 400)
        
        db.session.delete(ticket)
        db.session.commit()
        
        return success_response(None, 'Ticket type deleted successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Failed to delete ticket type', 500)