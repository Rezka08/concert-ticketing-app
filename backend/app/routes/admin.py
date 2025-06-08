from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from sqlalchemy import func, desc
from app import db
from app.models.user import User
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.concert import Concert
from app.models.ticket_type import TicketType
from app.utils.auth import admin_required
from app.utils.helpers import success_response, error_response, paginate_query

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def get_dashboard_stats(current_user):
    try:
        # Total users
        total_users = User.query.filter_by(role='user').count()
        
        # Total concerts
        total_concerts = Concert.query.count()
        
        # Total orders
        total_orders = Order.query.count()
        
        # Total revenue
        total_revenue = db.session.query(func.sum(Order.total_amount)).filter_by(status='paid').scalar() or 0
        
        # Recent orders (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_orders = Order.query.filter(Order.created_at >= seven_days_ago).count()
        
        # Revenue this month
        start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_revenue = db.session.query(func.sum(Order.total_amount)).filter(
            Order.status == 'paid',
            Order.created_at >= start_of_month
        ).scalar() or 0
        
        # Top selling concerts
        top_concerts = db.session.query(
            Concert.title,
            Concert.venue,
            func.count(OrderItem.order_item_id).label('total_tickets_sold'),
            func.sum(OrderItem.subtotal).label('total_revenue')
        ).join(
            TicketType, Concert.concert_id == TicketType.concert_id
        ).join(
            OrderItem, TicketType.ticket_type_id == OrderItem.ticket_type_id
        ).join(
            Order, OrderItem.order_id == Order.order_id
        ).filter(
            Order.status == 'paid'
        ).group_by(
            Concert.concert_id
        ).order_by(
            desc('total_tickets_sold')
        ).limit(5).all()
        
        stats = {
            'total_users': total_users,
            'total_concerts': total_concerts,
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'recent_orders': recent_orders,
            'monthly_revenue': float(monthly_revenue),
            'top_concerts': [{
                'title': concert.title,
                'venue': concert.venue,
                'tickets_sold': concert.total_tickets_sold,
                'revenue': float(concert.total_revenue)
            } for concert in top_concerts]
        }
        
        return success_response(stats, 'Dashboard stats retrieved successfully')
        
    except Exception as e:
        return error_response('Failed to retrieve dashboard stats', 500)

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users(current_user):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', None)
        role = request.args.get('role', None)
        
        # Base query
        query = User.query
        
        # Filter by role
        if role and role in ['user', 'admin']:
            query = query.filter(User.role == role)
        
        # Search by name or email
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    User.name.ilike(search_term),
                    User.email.ilike(search_term)
                )
            )
        
        # Order by created_at desc
        query = query.order_by(User.created_at.desc())
        
        # Paginate
        result = paginate_query(query, page, per_page)
        
        return success_response(result, 'Users retrieved successfully')
        
    except Exception as e:
        return error_response('Failed to retrieve users', 500)

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user(current_user, user_id):
    try:
        user = User.query.get(user_id)
        
        if not user:
            return error_response('User not found', 404)
        
        # Get user statistics
        user_orders = Order.query.filter_by(user_id=user_id).count()
        user_total_spent = db.session.query(func.sum(Order.total_amount)).filter_by(
            user_id=user_id, 
            status='paid'
        ).scalar() or 0
        
        user_data = user.to_dict()
        user_data['statistics'] = {
            'total_orders': user_orders,
            'total_spent': float(user_total_spent)
        }
        
        return success_response(user_data, 'User retrieved successfully')
        
    except Exception as e:
        return error_response('Failed to retrieve user', 500)

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(current_user, user_id):
    try:
        user = User.query.get(user_id)
        
        if not user:
            return error_response('User not found', 404)
        
        data = request.get_json()
        
        # Update allowed fields
        if 'name' in data:
            user.name = data['name'].strip()
        
        if 'phone' in data:
            user.phone = data['phone'].strip()
        
        if 'role' in data and data['role'] in ['user', 'admin']:
            user.role = data['role']
        
        db.session.commit()
        
        return success_response(user.to_dict(), 'User updated successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Failed to update user', 500)

@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_all_orders(current_user):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', None)
        
        # Base query
        query = Order.query
        
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

@admin_bp.route('/orders/<int:order_id>/verify', methods=['PUT'])
@admin_required
def verify_payment(current_user, order_id):
    try:
        order = Order.query.get(order_id)
        
        if not order:
            return error_response('Order not found', 404)
        
        data = request.get_json()
        status = data.get('status', 'paid')
        
        if status not in ['paid', 'cancelled']:
            return error_response('Invalid status', 400)
        
        if order.status == 'paid' and status == 'cancelled':
            # If changing from paid to cancelled, restore ticket quantities
            for order_item in order.order_items:
                ticket_type = order_item.ticket_type
                ticket_type.quantity_available += order_item.quantity
        elif order.status == 'cancelled' and status == 'paid':
            # If changing from cancelled to paid, check availability
            for order_item in order.order_items:
                ticket_type = order_item.ticket_type
                if ticket_type.quantity_available < order_item.quantity:
                    return error_response(f'Not enough tickets available for {ticket_type.name}', 400)
            
            # Reduce availability
            for order_item in order.order_items:
                ticket_type = order_item.ticket_type
                ticket_type.quantity_available -= order_item.quantity
        
        order.status = status
        db.session.commit()
        
        return success_response(order.to_dict(), f'Order {status} successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Failed to verify payment', 500)

@admin_bp.route('/sales-report', methods=['GET'])
@admin_required
def get_sales_report(current_user):
    try:
        # Query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        concert_id = request.args.get('concert_id', type=int)
        
        # Base query for paid orders
        query = db.session.query(
            Concert.title.label('concert_title'),
            Concert.venue,
            Concert.date.label('concert_date'),
            TicketType.name.label('ticket_name'),
            TicketType.price,
            func.sum(OrderItem.quantity).label('total_sold'),
            func.sum(OrderItem.subtotal).label('total_revenue')
        ).select_from(Order).join(
            OrderItem, Order.order_id == OrderItem.order_id
        ).join(
            TicketType, OrderItem.ticket_type_id == TicketType.ticket_type_id
        ).join(
            Concert, TicketType.concert_id == Concert.concert_id
        ).filter(Order.status == 'paid')
        
        # Date range filter
        if start_date:
            try:
                start = datetime.strptime(start_date, '%Y-%m-%d')
                query = query.filter(Order.created_at >= start)
            except ValueError:
                return error_response('Invalid start_date format. Use YYYY-MM-DD', 400)
        
        if end_date:
            try:
                end = datetime.strptime(end_date, '%Y-%m-%d')
                end = end.replace(hour=23, minute=59, second=59)
                query = query.filter(Order.created_at <= end)
            except ValueError:
                return error_response('Invalid end_date format. Use YYYY-MM-DD', 400)
        
        # Concert filter
        if concert_id:
            query = query.filter(Concert.concert_id == concert_id)
        
        # Group by and order
        query = query.group_by(
            Concert.concert_id,
            TicketType.ticket_type_id
        ).order_by(
            Concert.date.desc(),
            Concert.title,
            TicketType.name
        )
        
        results = query.all()
        
        # Format results
        report_data = []
        total_revenue = 0
        total_tickets = 0
        
        for row in results:
            item = {
                'concert_title': row.concert_title,
                'venue': row.venue,
                'concert_date': row.concert_date.isoformat() if row.concert_date else None,
                'ticket_name': row.ticket_name,
                'price': float(row.price),
                'total_sold': row.total_sold,
                'total_revenue': float(row.total_revenue)
            }
            report_data.append(item)
            total_revenue += float(row.total_revenue)
            total_tickets += row.total_sold
        
        summary = {
            'total_revenue': total_revenue,
            'total_tickets_sold': total_tickets,
            'total_concerts': len(set(item['concert_title'] for item in report_data))
        }
        
        return success_response({
            'summary': summary,
            'details': report_data
        }, 'Sales report generated successfully')
        
    except Exception as e:
        return error_response('Failed to generate sales report', 500)