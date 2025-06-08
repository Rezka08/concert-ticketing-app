from flask import Blueprint, request, jsonify
from datetime import datetime
from app import db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.ticket_type import TicketType
from app.models.concert import Concert
from app.utils.auth import user_required, admin_required
from app.utils.helpers import success_response, error_response, paginate_query

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('', methods=['GET'])
@user_required
def get_user_orders(current_user):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', None)
        
        # Base query
        query = Order.query.filter_by(user_id=current_user.user_id)
        
        # Filter by status
        if status and status in ['pending', 'paid', 'cancelled']:
            query = query.filter(Order.status == status)
        
        # Order by created_at desc
        query = query.order_by(Order.created_at.desc())
        
        # Paginate
        result = paginate_query(query, page, per_page)
        
        return success_response(result, 'Orders retrieved successfully')
        
    except Exception as e:
        return error_response('Failed to retrieve orders', 500)

@orders_bp.route('/<int:order_id>', methods=['GET'])
@user_required
def get_order(current_user, order_id):
    try:
        order = Order.query.filter_by(
            order_id=order_id,
            user_id=current_user.user_id
        ).first()
        
        if not order:
            return error_response('Order not found', 404)
        
        return success_response(order.to_dict(), 'Order retrieved successfully')
        
    except Exception as e:
        return error_response('Failed to retrieve order', 500)

@orders_bp.route('', methods=['POST'])
@user_required
def create_order(current_user):
    try:
        data = request.get_json()
        
        # Validasi input
        if not data.get('items') or not isinstance(data['items'], list):
            return error_response('Order items are required', 400)
        
        payment_method = data.get('payment_method', '').strip()
        
        # Buat order baru
        order = Order(
            user_id=current_user.user_id,
            total_amount=0,
            payment_method=payment_method,
            status='pending'
        )
        
        db.session.add(order)
        db.session.flush()  # Get order ID
        
        total_amount = 0
        order_items = []
        
        # Process order items
        for item_data in data['items']:
            ticket_type_id = item_data.get('ticket_type_id')
            quantity = item_data.get('quantity', 0)
            
            if not ticket_type_id or quantity <= 0:
                db.session.rollback()
                return error_response('Invalid ticket type or quantity', 400)
            
            # Get ticket type
            ticket_type = TicketType.query.get(ticket_type_id)
            if not ticket_type:
                db.session.rollback()
                return error_response(f'Ticket type {ticket_type_id} not found', 404)
            
            # Check availability
            if ticket_type.quantity_available < quantity:
                db.session.rollback()
                return error_response(f'Not enough tickets available for {ticket_type.name}', 400)
            
            # Calculate subtotal
            subtotal = float(ticket_type.price) * quantity
            total_amount += subtotal
            
            # Create order item
            order_item = OrderItem(
                order_id=order.order_id,
                ticket_type_id=ticket_type_id,
                quantity=quantity,
                price_per_unit=ticket_type.price,
                subtotal=subtotal
            )
            
            order_items.append(order_item)
            
            # Update ticket availability
            ticket_type.quantity_available -= quantity
        
        # Update order total
        order.total_amount = total_amount
        
        # Add all order items
        for order_item in order_items:
            db.session.add(order_item)
        
        db.session.commit()
        
        return success_response(order.to_dict(), 'Order created successfully', 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response('Failed to create order', 500)

@orders_bp.route('/<int:order_id>/pay', methods=['PUT'])
@user_required
def pay_order(current_user, order_id):
    try:
        order = Order.query.filter_by(
            order_id=order_id,
            user_id=current_user.user_id
        ).first()
        
        if not order:
            return error_response('Order not found', 404)
        
        if order.status != 'pending':
            return error_response('Order is not in pending status', 400)
        
        data = request.get_json()
        payment_method = data.get('payment_method', order.payment_method)
        
        # Update order status
        order.status = 'paid'
        if payment_method:
            order.payment_method = payment_method
        
        db.session.commit()
        
        return success_response(order.to_dict(), 'Payment processed successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Failed to process payment', 500)

@orders_bp.route('/<int:order_id>/cancel', methods=['PUT'])
@user_required
def cancel_order(current_user, order_id):
    try:
        order = Order.query.filter_by(
            order_id=order_id,
            user_id=current_user.user_id
        ).first()
        
        if not order:
            return error_response('Order not found', 404)
        
        if order.status != 'pending':
            return error_response('Only pending orders can be cancelled', 400)
        
        # Restore ticket quantities
        for order_item in order.order_items:
            ticket_type = order_item.ticket_type
            ticket_type.quantity_available += order_item.quantity
        
        # Update order status
        order.status = 'cancelled'
        
        db.session.commit()
        
        return success_response(order.to_dict(), 'Order cancelled successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Failed to cancel order', 500)