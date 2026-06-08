# -*- coding: utf-8 -*-
"""
Generates realistic job market dataset for AI Job Market Pulse.
Run once to create the CSV used by the Flask API.
"""
import pandas as pd
import numpy as np
import random
import os

random.seed(42)
np.random.seed(42)

JOB_TITLES = [
    "Data Scientist", "Machine Learning Engineer", "Data Analyst",
    "Data Engineer", "AI Engineer", "Business Intelligence Analyst",
    "NLP Engineer", "Computer Vision Engineer", "MLOps Engineer",
    "Research Scientist", "Deep Learning Engineer", "Analytics Engineer",
    "Quantitative Analyst", "Data Science Manager", "Applied Scientist",
]

SKILLS_MAP = {
    "Data Scientist": ["Python", "Machine Learning", "Statistics", "SQL", "TensorFlow"],
    "Machine Learning Engineer": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch"],
    "Data Analyst": ["SQL", "Python", "Excel", "Tableau", "Power BI"],
    "Data Engineer": ["Python", "SQL", "Spark", "Airflow", "AWS"],
    "AI Engineer": ["Python", "Machine Learning", "Deep Learning", "NLP", "Cloud"],
    "Business Intelligence Analyst": ["SQL", "Tableau", "Power BI", "Excel", "Python"],
    "NLP Engineer": ["Python", "NLP", "Transformers", "BERT", "SpaCy"],
    "Computer Vision Engineer": ["Python", "OpenCV", "Deep Learning", "PyTorch", "YOLO"],
    "MLOps Engineer": ["Python", "Docker", "Kubernetes", "MLflow", "CI/CD"],
    "Research Scientist": ["Python", "Research", "Deep Learning", "PyTorch", "Statistics"],
    "Deep Learning Engineer": ["Python", "Deep Learning", "TensorFlow", "PyTorch", "CUDA"],
    "Analytics Engineer": ["SQL", "dbt", "Python", "Snowflake", "Airflow"],
    "Quantitative Analyst": ["Python", "R", "Statistics", "Finance", "Optimization"],
    "Data Science Manager": ["Python", "Leadership", "Machine Learning", "Strategy", "SQL"],
    "Applied Scientist": ["Python", "Machine Learning", "Research", "Statistics", "AWS"],
}

COMPANIES = [
    "Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix", "Uber",
    "Airbnb", "Spotify", "Twitter", "LinkedIn", "Salesforce", "Oracle",
    "IBM", "Intel", "NVIDIA", "Tesla", "OpenAI", "Anthropic", "DeepMind",
    "Flipkart", "Swiggy", "Zomato", "Paytm", "PhonePe", "CRED", "Meesho",
    "Infosys", "TCS", "Wipro", "HCL", "Accenture", "Cognizant", "Capgemini",
]

LOCATIONS = [
    "Bangalore", "Hyderabad", "Mumbai", "Delhi", "Pune", "Chennai",
    "San Francisco", "New York", "Seattle", "Austin", "Chicago",
    "London", "Berlin", "Singapore", "Toronto", "Sydney",
]

EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior Level", "Lead", "Director"]
COMPANY_SIZES = ["Startup (1-50)", "Small (51-200)", "Medium (201-1000)", "Large (1001-5000)", "Enterprise (5000+)"]
REMOTE_TYPES = ["Remote", "Hybrid", "On-site"]

SALARY_BASE = {
    "Entry Level": 600000,
    "Mid Level": 1200000,
    "Senior Level": 2200000,
    "Lead": 3200000,
    "Director": 4500000,
}

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def generate_jobs(n=5000):
    records = []
    for i in range(n):
        title = random.choice(JOB_TITLES)
        exp = random.choice(EXPERIENCE_LEVELS)
        size = random.choice(COMPANY_SIZES)
        loc = random.choice(LOCATIONS)
        skills = SKILLS_MAP[title]

        # Salary with randomness
        base = SALARY_BASE[exp]
        noise = np.random.normal(0, base * 0.15)
        salary_inr = max(300000, int(base + noise))

        # Posting month (weighted toward recent months for realism)
        month_weights = [1, 1, 1, 2, 2, 3, 3, 4, 5, 5, 4, 3]
        month = random.choices(MONTHS, weights=month_weights)[0]
        year = random.choice([2023, 2024, 2025])

        records.append({
            "job_id": f"JOB{i+1:05d}",
            "job_title": title,
            "company": random.choice(COMPANIES),
            "location": loc,
            "experience_level": exp,
            "company_size": size,
            "remote_type": random.choice(REMOTE_TYPES),
            "salary_inr": salary_inr,
            "salary_usd": int(salary_inr / 83),
            "primary_skill": skills[0],
            "skills": ", ".join(random.sample(skills, min(len(skills), 3))),
            "month": month,
            "year": year,
            "demand_score": round(random.uniform(50, 99), 1),
        })
    return pd.DataFrame(records)


def generate_skill_trends():
    """Monthly skill demand index (0-100) over 12 months"""
    skills = ["Python", "Machine Learning", "SQL", "Deep Learning",
              "Cloud (AWS/GCP)", "NLP", "Data Engineering", "MLOps"]
    trends = {"month": MONTHS}
    bases = {
        "Python": 88, "Machine Learning": 82, "SQL": 75,
        "Deep Learning": 70, "Cloud (AWS/GCP)": 65,
        "NLP": 60, "Data Engineering": 68, "MLOps": 55,
    }
    for skill in skills:
        base = bases[skill]
        values = []
        for i in range(12):
            val = base + i * random.uniform(0.3, 1.2) + np.random.normal(0, 2)
            values.append(round(min(100, max(30, val)), 1))
        trends[skill] = values
    return pd.DataFrame(trends)


if __name__ == "__main__":
    print("[*] Generating job market dataset...")
    jobs_df = generate_jobs(5000)
    jobs_df.to_csv(os.path.join(os.path.dirname(__file__), "jobs.csv"), index=False)
    print(f"[OK] Generated {len(jobs_df)} job records -> data/jobs.csv")

    trends_df = generate_skill_trends()
    trends_df.to_csv(os.path.join(os.path.dirname(__file__), "skill_trends.csv"), index=False)
    print(f"[OK] Generated skill trends -> data/skill_trends.csv")
    print("\nSample job records:")
    print(jobs_df.head(3).to_string())
