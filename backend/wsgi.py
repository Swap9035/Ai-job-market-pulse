# wsgi.py — entry point for production server (gunicorn)
# Gunicorn looks for an 'app' object in this file
# Usage: gunicorn backend.wsgi:app

from backend.app import app

if __name__ == "__main__":
    app.run()