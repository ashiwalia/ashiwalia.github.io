#!/bin/bash

# Simple HTTP server launcher for testing the portfolio locally

echo "🚀 Starting local server for portfolio..."
echo "📁 Serving from: $(pwd)"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✅ Using Python 3"
    echo "🌐 Open your browser to: http://localhost:8000"
    echo "⏹️  Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8000
# Check if Python 2 is available
elif command -v python &> /dev/null; then
    echo "✅ Using Python 2"
    echo "🌐 Open your browser to: http://localhost:8000"
    echo "⏹️  Press Ctrl+C to stop the server"
    echo ""
    python -m SimpleHTTPServer 8000
else
    echo "❌ Python is not installed. Please install Python to run a local server."
    echo ""
    echo "Alternative: You can also use any other local server like:"
    echo "  - npx http-server"
    echo "  - php -S localhost:8000"
    exit 1
fi
