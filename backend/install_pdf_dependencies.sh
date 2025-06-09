#!/bin/bash
# backend/install_pdf_dependencies.sh

echo "🔧 Installing PDF generation dependencies..."

# Check if virtual environment is activated
if [[ "$VIRTUAL_ENV" != "" ]]; then
    echo "✅ Virtual environment detected: $VIRTUAL_ENV"
else
    echo "⚠️  Warning: No virtual environment detected. Please activate your venv first."
    echo "   Run: source venv/bin/activate (Linux/Mac) or venv\\Scripts\\activate (Windows)"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install PDF generation packages
echo "📦 Installing ReportLab for PDF generation..."
pip install reportlab==4.0.4

echo "📱 Installing QR Code generation..."
pip install qrcode==7.4.2

echo "🖼️  Installing Pillow for image processing..."
pip install Pillow==10.0.0

echo "✅ PDF dependencies installed successfully!"

# Test installation
echo "🧪 Testing PDF generation..."
python3 -c "
try:
    import reportlab
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate
    import qrcode
    from PIL import Image
    print('✅ All PDF dependencies are working correctly!')
    print(f'   - ReportLab version: {reportlab.Version}')
    print(f'   - QRCode installed: OK')
    print(f'   - Pillow installed: OK')
except ImportError as e:
    print(f'❌ Import error: {e}')
    print('Please check the installation.')
    exit(1)
"

echo "🎉 PDF generation setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Restart your Flask application"
echo "2. Test PDF download functionality"
echo "3. Check logs for any PDF generation errors"