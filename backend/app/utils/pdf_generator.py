# backend/app/utils/pdf_generator.py
"""
PDF Ticket Generator using ReportLab
Install required package: pip install reportlab
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib import colors
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.graphics import renderPDF
from reportlab.lib.utils import ImageReader
import io
import qrcode
from datetime import datetime
import os

def generate_ticket_pdf(order):
    """
    Generate PDF ticket for a paid order
    """
    try:
        print(f"Generating PDF for order {order.order_id}")
        
        # Create a file-like buffer to receive PDF data
        buffer = io.BytesIO()
        
        # Create the PDF object using the buffer as its "file"
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # Container for the 'Flowable' objects
        story = []
        
        # Get styles
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#3b82f6')
        )
        
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=20,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#6b7280')
        )
        
        # Header
        story.append(Paragraph("🎵 ConcertTix", title_style))
        story.append(Paragraph("Concert Ticket", subtitle_style))
        story.append(Spacer(1, 20))
        
        # Order Information
        order_info = [
            ['Order Number:', f"#{order.order_id}"],
            ['Customer:', order.user.name],
            ['Email:', order.user.email],
            ['Order Date:', order.created_at.strftime('%B %d, %Y at %I:%M %p')],
            ['Total Amount:', f"Rp {order.total_amount:,.0f}"],
            ['Payment Status:', '✅ CONFIRMED']
        ]
        
        order_table = Table(order_info, colWidths=[2*inch, 3*inch])
        order_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        story.append(order_table)
        story.append(Spacer(1, 30))
        
        # Tickets Section
        story.append(Paragraph("Ticket Details", styles['Heading2']))
        story.append(Spacer(1, 20))
        
        # Group tickets by concert
        concerts_tickets = {}
        for item in order.order_items:
            concert = item.ticket_type.concert
            if concert.concert_id not in concerts_tickets:
                concerts_tickets[concert.concert_id] = {
                    'concert': concert,
                    'tickets': []
                }
            concerts_tickets[concert.concert_id]['tickets'].append(item)
        
        # Generate tickets for each concert
        for concert_id, data in concerts_tickets.items():
            concert = data['concert']
            tickets = data['tickets']
            
            # Concert Header
            concert_title = Paragraph(f"<b>{concert.title}</b>", styles['Heading3'])
            story.append(concert_title)
            
            concert_details = [
                ['Date:', concert.date.strftime('%B %d, %Y')],
                ['Time:', concert.time.strftime('%I:%M %p')],
                ['Venue:', concert.venue],
            ]
            
            concert_table = Table(concert_details, colWidths=[1*inch, 4*inch])
            concert_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ]))
            
            story.append(concert_table)
            story.append(Spacer(1, 15))
            
            # Individual Tickets
            for ticket_item in tickets:
                for ticket_num in range(ticket_item.quantity):
                    # Generate unique ticket number
                    ticket_number = f"{order.order_id}{concert_id}{ticket_item.ticket_type_id}{ticket_num+1:02d}"
                    
                    # Create ticket box
                    ticket_data = create_ticket_box(
                        ticket_number=ticket_number,
                        ticket_type=ticket_item.ticket_type.name,
                        concert=concert,
                        price=ticket_item.price_per_unit,
                        order_id=order.order_id
                    )
                    
                    story.append(ticket_data)
                    story.append(Spacer(1, 20))
        
        # Footer
        story.append(Spacer(1, 30))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=10,
            alignment=TA_CENTER,
            textColor=colors.grey
        )
        
        story.append(Paragraph("Thank you for choosing ConcertTix!", footer_style))
        story.append(Paragraph("Present this ticket at the venue entrance", footer_style))
        story.append(Paragraph("For support: support@concerttix.com", footer_style))
        
        # Build PDF
        doc.build(story)
        
        print(f"PDF generated successfully for order {order.order_id}")
        return buffer
        
    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return None

def create_ticket_box(ticket_number, ticket_type, concert, price, order_id):
    """
    Create a styled ticket box with QR code
    """
    try:
        # Generate QR Code
        qr_data = f"TICKET:{ticket_number}|ORDER:{order_id}|CONCERT:{concert.concert_id}"
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        qr_img = qr.make_image(fill_color="black", back_color="white")
        qr_buffer = io.BytesIO()
        qr_img.save(qr_buffer, format='PNG')
        qr_buffer.seek(0)
        
        # Create ticket table
        ticket_info = [
            ['TICKET NUMBER:', ticket_number],
            ['TICKET TYPE:', ticket_type],
            ['CONCERT:', concert.title],
            ['DATE:', concert.date.strftime('%B %d, %Y')],
            ['TIME:', concert.time.strftime('%I:%M %p')],
            ['VENUE:', concert.venue],
            ['PRICE:', f"Rp {price:,.0f}"],
        ]
        
        # QR Code image
        qr_image = Image(qr_buffer, width=1.5*inch, height=1.5*inch)
        
        # Create two-column layout: ticket info + QR code
        main_table_data = [
            [
                Table(ticket_info, colWidths=[1.5*inch, 3*inch]),
                qr_image
            ]
        ]
        
        main_table = Table(main_table_data, colWidths=[4.5*inch, 2*inch])
        main_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8f9fa')),
            ('PADDING', (0, 0), (-1, -1), 10),
        ]))
        
        # Style for ticket info table
        ticket_table = main_table_data[0][0]
        ticket_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
        ]))
        
        return main_table
        
    except Exception as e:
        print(f"Error creating ticket box: {str(e)}")
        # Return a simple text fallback
        from reportlab.platypus import Paragraph
        from reportlab.lib.styles import getSampleStyleSheet
        styles = getSampleStyleSheet()
        return Paragraph(f"TICKET: {ticket_number} - {ticket_type}", styles['Normal'])

def test_pdf_generation():
    """
    Test function to verify PDF generation works
    """
    try:
        # Create a simple test PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        
        styles = getSampleStyleSheet()
        story = []
        
        story.append(Paragraph("PDF Generation Test", styles['Title']))
        story.append(Paragraph("This is a test to verify ReportLab is working correctly.", styles['Normal']))
        
        doc.build(story)
        
        print("✅ PDF generation test successful!")
        return True
        
    except Exception as e:
        print(f"❌ PDF generation test failed: {str(e)}")
        return False

if __name__ == "__main__":
    test_pdf_generation()