from flask import Blueprint, request, jsonify
from datetime import datetime, date, time
from app import db
from app.models.concert import Concert
from app.models.ticket_type import TicketType
from app.models.order_item import OrderItem
from app.utils.auth import admin_required, user_required
from app.utils.helpers import success_response, error_response, paginate_query

concerts_bp = Blueprint('concerts', __name__)

@concerts_bp.route('', methods=['GET'])
def get_concerts():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', None)
        search = request.args.get('search', None)
        
        # Base query
        query = Concert.query
        
        # Filter by status
        if status and status in ['upcoming', 'ongoing', 'completed']:
            query = query.filter(Concert.status == status)
        
        # Search by title or venue
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    Concert.title.ilike(search_term),
                    Concert.venue.ilike(search_term)
                )
            )
        
        # Order by date
        query = query.order_by(Concert.date.desc(), Concert.time.desc())
        
        # Paginate
        result = paginate_query(query, page, per_page)
        
        return success_response(result, 'Concerts retrieved successfully')
        
    except Exception as e:
        return error_response('Failed to retrieve concerts', 500)

@concerts_bp.route('/<int:concert_id>', methods=['GET'])
def get_concert(concert_id):
    try:
        concert = Concert.query.get(concert_id)
        
        if not concert:
            return error_response('Concert not found', 404)
        
        # Include ticket types in the response
        concert_data = concert.to_dict()
        
        return success_response(concert_data, 'Concert retrieved successfully')
        
    except Exception as e:
        return error_response('Failed to retrieve concert', 500)

@concerts_bp.route('', methods=['POST'])
@admin_required
def create_concert(current_user):
    try:
        data = request.get_json()
        
        # Validasi input
        required_fields = ['title', 'venue', 'date', 'time']
        for field in required_fields:
            if not data.get(field):
                return error_response(f'{field} is required', 400)
        
        # Parse date and time
        try:
            concert_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            concert_time = datetime.strptime(data['time'], '%H:%M').time()
        except ValueError:
            return error_response('Invalid date or time format. Use YYYY-MM-DD for date and HH:MM for time', 400)
        
        # Validasi tanggal tidak boleh di masa lalu
        if concert_date < date.today():
            return error_response('Concert date cannot be in the past', 400)
        
        # Buat concert baru
        concert = Concert(
            title=data['title'].strip(),
            description=data.get('description', '').strip(),
            venue=data['venue'].strip(),
            date=concert_date,
            time=concert_time,
            banner_image=data.get('banner_image', '').strip(),
            status=data.get('status', 'upcoming')
        )
        
        db.session.add(concert)
        db.session.commit()
        
        return success_response(concert.to_dict(), 'Concert created successfully', 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response('Failed to create concert', 500)

@concerts_bp.route('/<int:concert_id>', methods=['PUT'])
@admin_required
def update_concert(current_user, concert_id):
    try:
        concert = Concert.query.get(concert_id)
        
        if not concert:
            return error_response('Concert not found', 404)
        
        data = request.get_json()
        
        # Update fields
        if 'title' in data:
            concert.title = data['title'].strip()
        
        if 'description' in data:
            concert.description = data['description'].strip()
        
        if 'venue' in data:
            concert.venue = data['venue'].strip()
        
        if 'date' in data:
            try:
                concert_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
                if concert_date < date.today():
                    return error_response('Concert date cannot be in the past', 400)
                concert.date = concert_date
            except ValueError:
                return error_response('Invalid date format. Use YYYY-MM-DD', 400)
        
        if 'time' in data:
            try:
                concert.time = datetime.strptime(data['time'], '%H:%M').time()
            except ValueError:
                return error_response('Invalid time format. Use HH:MM', 400)
        
        if 'banner_image' in data:
            concert.banner_image = data['banner_image'].strip()
        
        if 'status' in data and data['status'] in ['upcoming', 'ongoing', 'completed']:
            concert.status = data['status']
        
        db.session.commit()
        
        return success_response(concert.to_dict(), 'Concert updated successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Failed to update concert', 500)

@concerts_bp.route('/<int:concert_id>', methods=['DELETE'])
@admin_required
def delete_concert(current_user, concert_id):
    try:
        print(f"🗑️ Admin {current_user.name} attempting to delete concert #{concert_id}")
        
        # Get the concert
        concert = Concert.query.get(concert_id)
        
        if not concert:
            print(f"❌ Concert #{concert_id} not found")
            return error_response('Concert not found', 404)
        
        print(f"📋 Found concert: {concert.title}")
        
        ticket_types = TicketType.query.filter_by(concert_id=concert_id).all()
        
        if ticket_types:
            # Get all ticket type IDs
            ticket_type_ids = [tt.ticket_type_id for tt in ticket_types]
            
            # Check if any order items exist for these ticket types
            existing_orders = OrderItem.query.filter(
                OrderItem.ticket_type_id.in_(ticket_type_ids)
            ).first()
            
            if existing_orders:
                print(f"❌ Cannot delete concert #{concert_id}: Has existing orders")
                return error_response('Cannot delete concert with existing orders', 400)
        
        print(f"✅ Concert #{concert_id} is safe to delete (no existing orders)")
        
        # Delete the concert
        db.session.delete(concert)
        db.session.commit()
        
        print(f"🗑️ Concert #{concert_id} deleted successfully")
        
        return success_response(None, 'Concert deleted successfully')
        
    except Exception as e:
        print(f"❌ Error deleting concert #{concert_id}: {str(e)}")
        print(f"🔍 Exception details: {type(e).__name__}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        
        db.session.rollback()
        return error_response('Failed to delete concert', 500)

@concerts_bp.route('/<int:concert_id>/tickets', methods=['GET'])
def get_concert_tickets(concert_id):
    try:
        concert = Concert.query.get(concert_id)
        
        if not concert:
            return error_response('Concert not found', 404)
        
        tickets = TicketType.query.filter_by(concert_id=concert_id).all()
        tickets_data = [ticket.to_dict() for ticket in tickets]
        
        return success_response(tickets_data, 'Concert tickets retrieved successfully')
        
    except Exception as e:
        return error_response('Failed to retrieve concert tickets', 500)

@concerts_bp.route('/<int:concert_id>/tickets', methods=['POST'])
@admin_required
def create_concert_ticket(current_user, concert_id):
    try:
        concert = Concert.query.get(concert_id)
        
        if not concert:
            return error_response('Concert not found', 404)
        
        data = request.get_json()
        
        # Validasi input
        required_fields = ['name', 'price', 'quantity_total']
        for field in required_fields:
            if field not in data:
                return error_response(f'{field} is required', 400)
        
        # Validasi price dan quantity
        try:
            price = float(data['price'])
            quantity = int(data['quantity_total'])
            
            if price <= 0:
                return error_response('Price must be greater than 0', 400)
            
            if quantity <= 0:
                return error_response('Quantity must be greater than 0', 400)
                
        except (ValueError, TypeError):
            return error_response('Invalid price or quantity format', 400)
        
        # Buat ticket type baru
        ticket_type = TicketType(
            concert_id=concert_id,
            name=data['name'].strip(),
            price=price,
            quantity_total=quantity,
            quantity_available=quantity
        )
        
        db.session.add(ticket_type)
        db.session.commit()
        
        return success_response(ticket_type.to_dict(), 'Ticket type created successfully', 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response('Failed to create ticket type', 500)