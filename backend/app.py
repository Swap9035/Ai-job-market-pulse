# app.py — Flask REST API connected to real MongoDB data

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from db import jobs_collection, skills_collection
import os

load_dotenv()

app = Flask(__name__)
CORS(app)


# ─────────────────────────────────────────
# ROUTE 1: Health Check
# ─────────────────────────────────────────
@app.route("/")
def health_check():
    return jsonify({
        "status": "running",
        "message": "AI Job Market Pulse API is live",
        "version": "1.0.0"
    })


# ─────────────────────────────────────────
# ROUTE 2: Get All Jobs (REAL MongoDB data)
# ─────────────────────────────────────────
@app.route("/api/jobs")
def get_jobs():
    try:
        # Query MongoDB — find() returns all documents
        # We exclude the MongoDB _id field (it's not JSON serializable)
        jobs = list(jobs_collection.find({}, {"_id": 0}))

        return jsonify({
            "success": True,
            "count": len(jobs),
            "data": jobs
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ─────────────────────────────────────────
# ROUTE 3: Get Skills (REAL MongoDB data)
# ─────────────────────────────────────────
@app.route("/api/skills")
def get_skills():
    try:
        # Sort by count descending — most demanded first
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
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ─────────────────────────────────────────
# ROUTE 4: Filter Jobs by Category
# ─────────────────────────────────────────
# GET /api/jobs?category=Machine Learning
# The ?category= part is a query parameter
@app.route("/api/jobs/filter")
def filter_jobs():
    try:
        category = request.args.get("category", "")
        location = request.args.get("location", "")

        # Build query dynamically based on what was provided
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


# ─────────────────────────────────────────
# ROUTE 5: Get Job Categories Summary
# ─────────────────────────────────────────
# Uses MongoDB aggregation pipeline
# Think of it as: GROUP BY category, COUNT(*)
@app.route("/api/jobs/categories")
def get_categories():
    try:
        pipeline = [
            # Stage 1: Group by category and count
            {"$group": {
                "_id": "$category",
                "count": {"$sum": 1},
                "avg_salary_min": {"$avg": "$salary_min"}
            }},
            # Stage 2: Sort by count descending
            {"$sort": {"count": -1}},
            # Stage 3: Rename _id to category
            {"$project": {
                "_id": 0,
                "category": "$_id",
                "count": 1,
                "avg_salary_min": {"$round": ["$avg_salary_min", 0]}
            }}
        ]

        categories = list(jobs_collection.aggregate(pipeline))

        return jsonify({
            "success": True,
            "data": categories
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
# ─────────────────────────────────────────
# ROUTE 10: Skill Gap Analyzer
# ─────────────────────────────────────────
# POST /api/skill-gap
# User sends: their skills + target role
# We return: what skills they have, what they're missing,
#            how common each missing skill is
@app.route("/api/skill-gap", methods=["POST"])
def skill_gap():
    try:
        # Get data from request body
        body = request.get_json()
        user_skills = body.get("skills", [])
        target_role = body.get("target_role", "")

        # Convert user skills to lowercase for comparison
        user_skills_lower = [s.lower().strip() for s in user_skills]

        # Find all jobs matching the target role category
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

        # Count skill frequency across matching jobs
        skill_freq = {}
        for job in matching_jobs:
            for skill in job.get("skills", []):
                skill_lower = skill.lower()
                if skill_lower not in skill_freq:
                    skill_freq[skill_lower] = {
                        "skill": skill,
                        "count": 0
                    }
                skill_freq[skill_lower]["count"] += 1

        total_jobs = len(matching_jobs)

        # Build the gap analysis
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

        # Sort by percentage (most common first)
        have.sort(key=lambda x: x["percentage"], reverse=True)
        missing.sort(key=lambda x: x["percentage"], reverse=True)

        # Calculate match score
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


if __name__ == "__main__":
    app.run(debug=True, port=5000)

# ─────────────────────────────────────────
# ROUTE 6: Salary Distribution
# ─────────────────────────────────────────
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


# ─────────────────────────────────────────
# ROUTE 7: Location Distribution
# ─────────────────────────────────────────
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
                "avg_salary_lpa": {"$round": [{"$divide": ["$avg_salary", 100000]}, 1]}
            }}
        ]
        data = list(jobs_collection.aggregate(pipeline))
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────
# ROUTE 8: Skills by Category
# ─────────────────────────────────────────
@app.route("/api/analytics/skills-by-category")
def skills_by_category():
    try:
        pipeline = [
            # Unwind = split array into individual documents
            # Each skill in the array becomes its own document
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


# ─────────────────────────────────────────
# ROUTE 9: Experience Level Distribution
# ─────────────────────────────────────────
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