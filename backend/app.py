# ============================================================
# app.py — AI Job Market Pulse: Flask REST API
# ============================================================
# This is the main backend file. It creates all API endpoints
# that the React frontend calls to get data.
#
# Architecture:
#   React (port 3000) → HTTP Request → Flask (port 5000) → MongoDB
#
# To run: python app.py (with venv activated)
# ============================================================

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from db import jobs_collection, skills_collection
from services.analytics import (
    get_salary_stats,
    get_skill_trends,
    get_auto_insights,
    get_category_distribution,
    get_experience_summary
)
import os

load_dotenv()

app = Flask(__name__)

# CORS allows React on port 3000 to call Flask on port 5000
# Without this, browsers block cross-origin requests (security rule)
CORS(app)


# ────────────────────────────────────────────────────────────
# ROUTE 1: Health Check
# ────────────────────────────────────────────────────────────
# Purpose : Verify the API server is running
# Method  : GET
# Params  : None
# Returns : JSON with status message and version
# Usage   : Visit http://localhost:5000/ to confirm server is up
# ────────────────────────────────────────────────────────────
@app.route("/")
def health_check():
    return jsonify({
        "status": "running",
        "message": "AI Job Market Pulse API is live",
        "version": "1.0.0"
    })


# ────────────────────────────────────────────────────────────
# ROUTE 2: Get All Jobs
# ────────────────────────────────────────────────────────────
# Purpose : Fetch all job postings from MongoDB
# Method  : GET
# Params  : None
# Returns : JSON array of job documents
#           { success, count, data: [job, job, ...] }
# Note    : {"_id": 0} excludes MongoDB's internal ID field
#           because it's not JSON serializable by default
# ────────────────────────────────────────────────────────────
@app.route("/api/jobs")
def get_jobs():
    try:
        jobs = list(jobs_collection.find({}, {"_id": 0}))
        return jsonify({
            "success": True,
            "count": len(jobs),
            "data": jobs
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ────────────────────────────────────────────────────────────
# ROUTE 3: Get Top Skills
# ────────────────────────────────────────────────────────────
# Purpose : Return top 10 most in-demand skills
# Method  : GET
# Params  : None
# Returns : JSON array sorted by count descending
#           { success, count, data: [{ skill, count, category }] }
# Note    : .sort("count", -1) = descending order in MongoDB
#           .limit(10) = only top 10 results
# ────────────────────────────────────────────────────────────
@app.route("/api/skills")
def get_skills():
    try:
        skills = list(skills_collection.find(
            {},
            {"_id": 0}
        ).sort("count", -1).limit(10))
        return jsonify({
            "success": True,
            "count": len(skills),
            "data": skills
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ────────────────────────────────────────────────────────────
# ROUTE 4: Filter Jobs
# ────────────────────────────────────────────────────────────
# Purpose : Return jobs filtered by category and/or location
# Method  : GET
# Params  : ?category=Machine Learning  (optional query param)
#           ?location=Bangalore         (optional query param)
# Returns : Filtered list of jobs matching the criteria
# Example : GET /api/jobs/filter?category=Data Science
# ────────────────────────────────────────────────────────────
@app.route("/api/jobs/filter")
def filter_jobs():
    try:
        category = request.args.get("category", "")
        location = request.args.get("location", "")

        # Build query dynamically — only add filters that were provided
        query = {}
        if category:
            query["category"] = category
        if location:
            query["location"] = location

        jobs = list(jobs_collection.find(query, {"_id": 0}))
        return jsonify({
            "success": True,
            "count": len(jobs),
            "filters": {"category": category, "location": location},
            "data": jobs
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ────────────────────────────────────────────────────────────
# ROUTE 5: Get Job Categories Summary
# ────────────────────────────────────────────────────────────
# Purpose : Count jobs per category + compute average salary
# Method  : GET
# Params  : None
# Returns : [ { category, count, avg_salary_min } ]
#
# MongoDB Aggregation Pipeline explained:
#   Stage 1 ($group)   — like SQL GROUP BY category, COUNT(*)
#   Stage 2 ($sort)    — order by count descending
#   Stage 3 ($project) — rename fields, round numbers
# ────────────────────────────────────────────────────────────
@app.route("/api/jobs/categories")
def get_categories():
    try:
        pipeline = [
            {"$group": {
                "_id": "$category",
                "count": {"$sum": 1},
                "avg_salary_min": {"$avg": "$salary_min"}
            }},
            {"$sort": {"count": -1}},
            {"$project": {
                "_id": 0,
                "category": "$_id",
                "count": 1,
                "avg_salary_min": {"$round": ["$avg_salary_min", 0]}
            }}
        ]
        categories = list(jobs_collection.aggregate(pipeline))
        return jsonify({"success": True, "data": categories})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ────────────────────────────────────────────────────────────
# ROUTE 6: Salary Distribution by Category
# ────────────────────────────────────────────────────────────
# Purpose : Show average min and max salary per job category
# Method  : GET
# Params  : None
# Returns : [ { category, avg_min_lpa, avg_max_lpa, job_count } ]
#
# LPA = Lakhs Per Annum (Indian salary unit)
# Conversion: divide by 100,000 (1 lakh = 100,000 rupees)
# ────────────────────────────────────────────────────────────
@app.route("/api/analytics/salary")
def salary_distribution():
    try:
        pipeline = [
            {"$group": {
                "_id": "$category",
                "avg_min": {"$avg": "$salary_min"},
                "avg_max": {"$avg": "$salary_max"},
                "job_count": {"$sum": 1}
            }},
            {"$sort": {"avg_min": -1}},
            {"$project": {
                "_id": 0,
                "category": "$_id",
                "avg_min_lpa": {"$round": [{"$divide": ["$avg_min", 100000]}, 1]},
                "avg_max_lpa": {"$round": [{"$divide": ["$avg_max", 100000]}, 1]},
                "job_count": 1
            }}
        ]
        data = list(jobs_collection.aggregate(pipeline))
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ────────────────────────────────────────────────────────────
# ROUTE 7: Location Distribution
# ────────────────────────────────────────────────────────────
# Purpose : Count jobs per city + average salary per city
# Method  : GET
# Params  : None
# Returns : [ { location, count, avg_salary_lpa } ]
# Used by : LocationChart (pie chart) on Dashboard
# ────────────────────────────────────────────────────────────
@app.route("/api/analytics/locations")
def location_distribution():
    try:
        pipeline = [
            {"$group": {
                "_id": "$location",
                "count": {"$sum": 1},
                "avg_salary": {"$avg": "$salary_min"}
            }},
            {"$sort": {"count": -1}},
            {"$project": {
                "_id": 0,
                "location": "$_id",
                "count": 1,
                "avg_salary_lpa": {
                    "$round": [{"$divide": ["$avg_salary", 100000]}, 1]
                }
            }}
        ]
        data = list(jobs_collection.aggregate(pipeline))
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ────────────────────────────────────────────────────────────
# ROUTE 8: Skills by Job Category
# ────────────────────────────────────────────────────────────
# Purpose : Show top 5 skills required per job category
# Method  : GET
# Params  : None
# Returns : [ { category, top_skills: [{skill, count}] } ]
#
# $unwind explained:
#   skills field is an array: ["Python", "SQL", "Excel"]
#   $unwind splits this into 3 separate documents
#   So we can GROUP BY individual skill
# ────────────────────────────────────────────────────────────
@app.route("/api/analytics/skills-by-category")
def skills_by_category():
    try:
        pipeline = [
            {"$unwind": "$skills"},
            {"$group": {
                "_id": {
                    "category": "$category",
                    "skill": "$skills"
                },
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}},
            {"$group": {
                "_id": "$_id.category",
                "top_skills": {
                    "$push": {
                        "skill": "$_id.skill",
                        "count": "$count"
                    }
                }
            }},
            {"$project": {
                "_id": 0,
                "category": "$_id",
                "top_skills": {"$slice": ["$top_skills", 5]}
            }}
        ]
        data = list(jobs_collection.aggregate(pipeline))
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ────────────────────────────────────────────────────────────
# ROUTE 9: Experience Level Distribution
# ────────────────────────────────────────────────────────────
# Purpose : Show job count and avg salary per experience level
# Method  : GET
# Params  : None
# Returns : [ { experience, count, avg_salary_lpa } ]
# Used by : ExperienceChart on Dashboard
# ────────────────────────────────────────────────────────────
@app.route("/api/analytics/experience")
def experience_distribution():
    try:
        pipeline = [
            {"$group": {
                "_id": "$experience",
                "count": {"$sum": 1},
                "avg_salary_lpa": {
                    "$avg": {"$divide": ["$salary_min", 100000]}
                }
            }},
            {"$sort": {"count": -1}},
            {"$project": {
                "_id": 0,
                "experience": "$_id",
                "count": 1,
                "avg_salary_lpa": {"$round": ["$avg_salary_lpa", 1]}
            }}
        ]
        data = list(jobs_collection.aggregate(pipeline))
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ────────────────────────────────────────────────────────────
# ROUTE 10: Skill Gap Analyzer
# ────────────────────────────────────────────────────────────
# Purpose : Compare user's skills against job market requirements
# Method  : POST
# Params  : Request body JSON:
#           { "skills": ["Python", "SQL"], "target_role": "Machine Learning" }
# Returns : {
#             match_score: 65,           ← % of required skills user has
#             skills_you_have: [...],    ← matched skills with frequency
#             skills_to_learn: [...],    ← missing skills with frequency
#             summary: { have, missing, total }
#           }
#
# Algorithm:
#   1. Find all jobs for the target role
#   2. Count frequency of each skill across those jobs
#   3. Compare against user's skills → split into have/missing
#   4. Compute match score = have / total * 100
# ────────────────────────────────────────────────────────────
@app.route("/api/skill-gap", methods=["POST"])
def skill_gap():
    try:
        body = request.get_json()
        user_skills = body.get("skills", [])
        target_role = body.get("target_role", "")

        # Normalize to lowercase for case-insensitive comparison
        user_skills_lower = [s.lower().strip() for s in user_skills]

        # Query MongoDB for jobs matching target role
        if target_role:
            matching_jobs = list(jobs_collection.find(
                {"category": target_role},
                {"_id": 0, "skills": 1}
            ))
        else:
            matching_jobs = list(jobs_collection.find(
                {},
                {"_id": 0, "skills": 1}
            ))

        if not matching_jobs:
            return jsonify({
                "success": False,
                "error": f"No jobs found for role: {target_role}"
            }), 404

        # Count how often each skill appears across matching jobs
        skill_freq = {}
        for job in matching_jobs:
            for skill in job.get("skills", []):
                skill_lower = skill.lower()
                if skill_lower not in skill_freq:
                    skill_freq[skill_lower] = {"skill": skill, "count": 0}
                skill_freq[skill_lower]["count"] += 1

        total_jobs = len(matching_jobs)

        # Split skills into "have" and "missing" buckets
        have = []
        missing = []

        for skill_lower, info in skill_freq.items():
            percentage = round((info["count"] / total_jobs) * 100)
            skill_data = {
                "skill": info["skill"],
                "count": info["count"],
                "total_jobs": total_jobs,
                "percentage": percentage
            }
            if skill_lower in user_skills_lower:
                have.append(skill_data)
            else:
                missing.append(skill_data)

        # Sort both lists by percentage (most important first)
        have.sort(key=lambda x: x["percentage"], reverse=True)
        missing.sort(key=lambda x: x["percentage"], reverse=True)

        # Match score = skills user has / total skills needed
        total_skills = len(have) + len(missing)
        match_score = round((len(have) / total_skills * 100)) if total_skills > 0 else 0

        return jsonify({
            "success": True,
            "target_role": target_role,
            "total_jobs_analyzed": total_jobs,
            "match_score": match_score,
            "skills_you_have": have,
            "skills_to_learn": missing,
            "summary": {
                "have_count": len(have),
                "missing_count": len(missing),
                "total_count": total_skills
            }
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
# ────────────────────────────────────────────────────────────
# ROUTE 11: Pandas Salary Statistics
# ────────────────────────────────────────────────────────────
# Purpose : Returns detailed salary stats computed by pandas
# Method  : GET
# Params  : None
# Returns : [ { category, avg_lpa, median_lpa, min_lpa,
#               max_lpa, count } ]
# Note    : Uses pandas groupby + agg — more powerful than
#           MongoDB aggregation for complex statistics
# ────────────────────────────────────────────────────────────
@app.route("/api/analytics/salary-stats")
def salary_stats():
    try:
        data = get_salary_stats()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ────────────────────────────────────────────────────────────
# ROUTE 12: Skill Trends Over Time
# ────────────────────────────────────────────────────────────
# Purpose : Returns top 5 skill frequencies per year
# Method  : GET
# Params  : None
# Returns : { data: [{year, Python, SQL, ...}], skills: [...] }
# Note    : Uses pandas explode() to expand skill arrays
#           then pivot_table() to reshape for charting
# ────────────────────────────────────────────────────────────
@app.route("/api/analytics/skill-trends")
def skill_trends():
    try:
        data = get_skill_trends()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ────────────────────────────────────────────────────────────
# ROUTE 13: Auto-Generated Insights
# ────────────────────────────────────────────────────────────
# Purpose : Returns statistical insights about the job market
# Method  : GET
# Params  : None
# Returns : [ { icon, title, text, type } ]
# Note    : Uses scipy t-test and Pearson correlation
#           p < 0.05 = statistically significant difference
# ────────────────────────────────────────────────────────────
@app.route("/api/analytics/insights")
def auto_insights():
    try:
        data = get_auto_insights()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ────────────────────────────────────────────────────────────
# ROUTE 14: Category Distribution
# ────────────────────────────────────────────────────────────
# Purpose : Returns job count + percentage per category
# Method  : GET
# Params  : None
# Returns : [ { category, count, percentage } ]
# ────────────────────────────────────────────────────────────
@app.route("/api/analytics/categories")
def category_distribution():
    try:
        data = get_category_distribution()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ────────────────────────────────────────────────────────────
# ROUTE 15: Experience Summary
# ────────────────────────────────────────────────────────────
# Purpose : Returns job count + avg salary per experience level
# Method  : GET
# Params  : None
# Returns : [ { experience, count, avg_salary_lpa } ]
# ────────────────────────────────────────────────────────────
@app.route("/api/analytics/experience-summary")
def experience_summary():
    try:
        data = get_experience_summary()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ────────────────────────────────────────────────────────────
# Run the development server
# ────────────────────────────────────────────────────────────
# debug=True  → auto-restarts when you save changes
# port=5000   → React expects the API on this port
# Never use debug=True in production!
# ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)