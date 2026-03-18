# app.py — the heart of your Flask backend
# This file creates the API that your React frontend will talk to

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Create the Flask application
# __name__ tells Flask where to look for files
app = Flask(__name__)

# CORS = Cross-Origin Resource Sharing
# Without this, your browser BLOCKS React (port 3000)
# from talking to Flask (port 5000) — a security rule
# CORS(app) says "allow all origins" — fine for development
CORS(app)


# ─────────────────────────────────────────
# ROUTE 1: Health Check
# ─────────────────────────────────────────
# A health check is standard in every API
# It lets you quickly verify the server is running
# Visit http://localhost:5000/ to test this
@app.route("/")
def health_check():
    return jsonify({
        "status": "running",
        "message": "AI Job Market Pulse API is live",
        "version": "1.0.0"
    })


# ─────────────────────────────────────────
# ROUTE 2: Get All Jobs
# ─────────────────────────────────────────
# GET /api/jobs returns a list of job postings
# We use /api/ prefix on all data routes — this is convention
@app.route("/api/jobs")
def get_jobs():
    # For now we return mock (fake) data
    # On Day 3 we replace this with real MongoDB data
    mock_jobs = [
        {
            "id": 1,
            "title": "Data Analyst",
            "company": "Infosys",
            "location": "Bangalore",
            "skills": ["Python", "SQL", "Excel", "Power BI"],
            "salary_range": "4-8 LPA",
            "job_type": "Full-time",
            "date_posted": "2024-01-15"
        },
        {
            "id": 2,
            "title": "Machine Learning Engineer",
            "company": "TCS",
            "location": "Hyderabad",
            "skills": ["Python", "TensorFlow", "scikit-learn", "Docker"],
            "salary_range": "8-15 LPA",
            "job_type": "Full-time",
            "date_posted": "2024-01-14"
        },
        {
            "id": 3,
            "title": "Data Scientist",
            "company": "Wipro",
            "location": "Pune",
            "skills": ["Python", "R", "Machine Learning", "Statistics", "SQL"],
            "salary_range": "6-12 LPA",
            "job_type": "Full-time",
            "date_posted": "2024-01-13"
        },
        {
            "id": 4,
            "title": "Data Engineer",
            "company": "HCL Technologies",
            "location": "Chennai",
            "skills": ["Python", "Spark", "Hadoop", "SQL", "AWS"],
            "salary_range": "7-14 LPA",
            "job_type": "Full-time",
            "date_posted": "2024-01-12"
        },
        {
            "id": 5,
            "title": "Business Intelligence Analyst",
            "company": "Accenture",
            "location": "Mumbai",
            "skills": ["SQL", "Tableau", "Power BI", "Excel"],
            "salary_range": "5-10 LPA",
            "job_type": "Full-time",
            "date_posted": "2024-01-11"
        }
    ]

    return jsonify({
        "success": True,
        "count": len(mock_jobs),
        "data": mock_jobs
    })


# ─────────────────────────────────────────
# ROUTE 3: Get Top Skills
# ─────────────────────────────────────────
# GET /api/skills returns skill frequency data
# This will power the bar chart in your dashboard
@app.route("/api/skills")
def get_skills():
    # Mock skill frequency data
    # Number = how many job postings mention this skill
    mock_skills = [
        {"skill": "Python", "count": 450, "category": "Programming"},
        {"skill": "SQL", "count": 380, "category": "Database"},
        {"skill": "Machine Learning", "count": 290, "category": "AI/ML"},
        {"skill": "Power BI", "count": 240, "category": "Visualization"},
        {"skill": "Excel", "count": 220, "category": "Tools"},
        {"skill": "Tableau", "count": 180, "category": "Visualization"},
        {"skill": "TensorFlow", "count": 160, "category": "AI/ML"},
        {"skill": "AWS", "count": 150, "category": "Cloud"},
        {"skill": "Statistics", "count": 140, "category": "Mathematics"},
        {"skill": "R", "count": 120, "category": "Programming"},
    ]

    return jsonify({
        "success": True,
        "count": len(mock_skills),
        "data": mock_skills
    })


# ─────────────────────────────────────────
# ROUTE 4: Get Single Job by ID
# ─────────────────────────────────────────
# The <int:job_id> part is a URL parameter
# GET /api/jobs/1 will call this with job_id = 1
@app.route("/api/jobs/<int:job_id>")
def get_job(job_id):
    # Placeholder — will connect to MongoDB on Day 3
    return jsonify({
        "success": True,
        "message": f"Job {job_id} details coming on Day 3 with MongoDB"
    })


# ─────────────────────────────────────────
# Run the server
# ─────────────────────────────────────────
# debug=True means: auto-restart when you save changes
# You never need to stop and restart the server manually
if __name__ == "__main__":
    app.run(debug=True, port=5000)
