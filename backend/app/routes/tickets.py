from flask import Blueprint, request, jsonify, send_file
from app import db
from app.models.ticket_type import TicketType
from app.models.concert import Concert
from app.models.order import Order
from app.models.order_item import OrderItem
from app.utils.auth import admin_required, user_required
from app.utils.helpers import success_response, error_response
from app.utils.pdf_generator import generate_ticket_pdf
import io
import os

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

# NEW: Download PDF Ticket
@tickets_bp.route('/download/<int:order_id>', methods=['GET'])
@user_required
def download_ticket_pdf(current_user, order_id):
    try:
        print(f"=== PDF TICKET DOWNLOAD REQUEST ===")
        print(f"User: {current_user.name} (ID: {current_user.user_id})")
        print(f"Order ID: {order_id}")
        
        # Get order and verify ownership (unless admin)
        order = Order.query.get(order_id)
        
        if not order:
            print("Order not found")
            return error_response('Order not found', 404)
        
        # Check if user owns this order (admin can download any)
        if current_user.role != 'admin' and order.user_id != current_user.user_id:
            print(f"Access denied: Order belongs to user {order.user_id}, current user is {current_user.user_id}")
            return error_response('Access denied', 403)
        
        # Check if order is paid
        if order.status != 'paid':
            print(f"Order not paid: status is {order.status}")
            return error_response('Tickets can only be downloaded for paid orders', 400)
        
        print("Generating PDF ticket...")
        
        # Generate PDF
        pdf_buffer = generate_ticket_pdf(order)
        
        if not pdf_buffer:
            print("Failed to generate PDF")
            return error_response('Failed to generate ticket PDF', 500)
        
        pdf_buffer.seek(0)
        
        filename = f"Concert_Tickets_Order_{order_id}.pdf"
        print(f"PDF generated successfully: {filename}")
        
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        print(f"Error generating PDF ticket: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return error_response('Failed to generate ticket PDF', 500)

# NEW: Preview PDF Ticket (opens in browser)
@tickets_bp.route('/preview/<int:order_id>', methods=['GET'])
@user_required
def preview_ticket_pdf(current_user, order_id):
    try:
        print(f"=== PDF TICKET PREVIEW REQUEST ===")
        print(f"User: {current_user.name} (ID: {current_user.user_id})")
        print(f"Order ID: {order_id}")
        
        # Get order and verify ownership (unless admin)
        order = Order.query.get(order_id)
        
        if not order:
            return error_response('Order not found', 404)
        
        # Check if user owns this order (admin can preview any)
        if current_user.role != 'admin' and order.user_id != current_user.user_id:
            return error_response('Access denied', 403)
        
        # Check if order is paid
        if order.status != 'paid':
            return error_response('Tickets can only be previewed for paid orders', 400)
        
        print("Generating PDF preview...")
        
        # Generate PDF
        pdf_buffer = generate_ticket_pdf(order)
        
        if not pdf_buffer:
            return error_response('Failed to generate ticket PDF', 500)
        
        pdf_buffer.seek(0)
        
        print("PDF preview generated successfully")
        
        return send_file(
            pdf_buffer,
            as_attachment=False,  # Preview mode - open in browser
            mimetype='application/pdf'
        )
        
    except Exception as e:
        print(f"Error generating PDF preview: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return error_response('Failed to generate ticket preview', 500)