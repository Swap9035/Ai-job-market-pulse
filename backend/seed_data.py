# seed_data.py — populates MongoDB with sample job data
# Run this ONCE to fill your database
# After that, your API will return real data

from db import jobs_collection, skills_collection
from datetime import datetime

def get_category(skill):
    categories = {
        "Python": "Programming", "R": "Programming", "SQL": "Database",
        "Excel": "Tools", "Tableau": "Visualization", "Power BI": "Visualization",
        "Machine Learning": "AI/ML", "TensorFlow": "AI/ML", "PyTorch": "AI/ML",
        "scikit-learn": "AI/ML", "Deep Learning": "AI/ML", "NLP": "AI/ML",
        "BERT": "AI/ML", "Statistics": "Mathematics", "Mathematics": "Mathematics",
        "AWS": "Cloud", "Docker": "DevOps", "Kubernetes": "DevOps",
        "Spark": "Big Data", "Hadoop": "Big Data", "Kafka": "Big Data",
        "MLflow": "DevOps", "CI/CD": "DevOps"
    }
    return categories.get(skill, "Other")

# Clear existing data first (so we don't duplicate)
jobs_collection.delete_many({})
skills_collection.delete_many({})

print("Cleared existing data...")

# Sample job documents
# Each document is a Python dict — MongoDB stores these as BSON
sample_jobs = [
    {
        "title": "Data Analyst",
        "company": "Infosys",
        "location": "Bangalore",
        "skills": ["Python", "SQL", "Excel", "Power BI", "Statistics"],
        "salary_min": 400000,
        "salary_max": 800000,
        "salary_display": "4-8 LPA",
        "job_type": "Full-time",
        "experience": "1-3 years",
        "date_posted": datetime(2024, 1, 15),
        "category": "Data Analysis"
    },
    {
        "title": "Machine Learning Engineer",
        "company": "TCS",
        "location": "Hyderabad",
        "skills": ["Python", "TensorFlow", "scikit-learn", "Docker", "AWS"],
        "salary_min": 800000,
        "salary_max": 1500000,
        "salary_display": "8-15 LPA",
        "job_type": "Full-time",
        "experience": "2-5 years",
        "date_posted": datetime(2024, 1, 14),
        "category": "Machine Learning"
    },
    {
        "title": "Data Scientist",
        "company": "Wipro",
        "location": "Pune",
        "skills": ["Python", "R", "Machine Learning", "Statistics", "SQL", "Tableau"],
        "salary_min": 600000,
        "salary_max": 1200000,
        "salary_display": "6-12 LPA",
        "job_type": "Full-time",
        "experience": "2-4 years",
        "date_posted": datetime(2024, 1, 13),
        "category": "Data Science"
    },
    {
        "title": "Data Engineer",
        "company": "HCL Technologies",
        "location": "Chennai",
        "skills": ["Python", "Spark", "Hadoop", "SQL", "AWS", "Kafka"],
        "salary_min": 700000,
        "salary_max": 1400000,
        "salary_display": "7-14 LPA",
        "job_type": "Full-time",
        "experience": "2-5 years",
        "date_posted": datetime(2024, 1, 12),
        "category": "Data Engineering"
    },
    {
        "title": "Business Intelligence Analyst",
        "company": "Accenture",
        "location": "Mumbai",
        "skills": ["SQL", "Tableau", "Power BI", "Excel", "Python"],
        "salary_min": 500000,
        "salary_max": 1000000,
        "salary_display": "5-10 LPA",
        "job_type": "Full-time",
        "experience": "1-3 years",
        "date_posted": datetime(2024, 1, 11),
        "category": "Business Intelligence"
    },
    {
        "title": "AI Research Scientist",
        "company": "Google India",
        "location": "Bangalore",
        "skills": ["Python", "PyTorch", "Deep Learning", "NLP", "Mathematics"],
        "salary_min": 2000000,
        "salary_max": 4000000,
        "salary_display": "20-40 LPA",
        "job_type": "Full-time",
        "experience": "3-6 years",
        "date_posted": datetime(2024, 1, 10),
        "category": "Machine Learning"
    },
    {
        "title": "Data Analyst",
        "company": "Flipkart",
        "location": "Bangalore",
        "skills": ["SQL", "Python", "Excel", "Statistics", "Power BI"],
        "salary_min": 600000,
        "salary_max": 1000000,
        "salary_display": "6-10 LPA",
        "job_type": "Full-time",
        "experience": "1-2 years",
        "date_posted": datetime(2024, 1, 9),
        "category": "Data Analysis"
    },
    {
        "title": "MLOps Engineer",
        "company": "Amazon India",
        "location": "Hyderabad",
        "skills": ["Python", "Docker", "Kubernetes", "AWS", "MLflow", "CI/CD"],
        "salary_min": 1500000,
        "salary_max": 2500000,
        "salary_display": "15-25 LPA",
        "job_type": "Full-time",
        "experience": "3-5 years",
        "date_posted": datetime(2024, 1, 8),
        "category": "Data Engineering"
    },
    {
        "title": "NLP Engineer",
        "company": "Microsoft India",
        "location": "Hyderabad",
        "skills": ["Python", "NLP", "BERT", "TensorFlow", "SQL"],
        "salary_min": 1800000,
        "salary_max": 3000000,
        "salary_display": "18-30 LPA",
        "job_type": "Full-time",
        "experience": "3-5 years",
        "date_posted": datetime(2024, 1, 7),
        "category": "Machine Learning"
    },
    {
        "title": "Junior Data Analyst",
        "company": "Cognizant",
        "location": "Chennai",
        "skills": ["Excel", "SQL", "Power BI", "Python"],
        "salary_min": 300000,
        "salary_max": 500000,
        "salary_display": "3-5 LPA",
        "job_type": "Full-time",
        "experience": "0-1 years",
        "date_posted": datetime(2024, 1, 6),
        "category": "Data Analysis"
    }
]

# Insert all jobs at once
result = jobs_collection.insert_many(sample_jobs)
print(f"✅ Inserted {len(result.inserted_ids)} jobs into MongoDB")

# Now compute skill frequencies from the jobs
# This is our first real data processing step
skill_counts = {}
for job in sample_jobs:
    for skill in job["skills"]:
        skill_counts[skill] = skill_counts.get(skill, 0) + 1

# Convert to list of documents for MongoDB
skill_documents = [
    {"skill": skill, "count": count, "category": get_category(skill)}
    for skill, count in sorted(skill_counts.items(),
                               key=lambda x: x[1], reverse=True)
]



# Recompute with category function defined
skill_documents = [
    {"skill": skill, "count": count, "category": get_category(skill)}
    for skill, count in sorted(skill_counts.items(),
                               key=lambda x: x[1], reverse=True)
]

skills_collection.insert_many(skill_documents)
print(f"✅ Inserted {len(skill_documents)} skills into MongoDB")
print("\n📊 Skill frequencies:")
for doc in skill_documents[:5]:
    print(f"   {doc['skill']}: {doc['count']} jobs")

print("\n🎉 Database seeded successfully!")
