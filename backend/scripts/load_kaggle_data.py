# ============================================================
# load_kaggle_data.py — loads Kaggle CSV into MongoDB
# ============================================================
# Purpose : Read the Kaggle dataset, clean it, and insert
#           into MongoDB so our API serves real data
#
# Run once: python scripts/load_kaggle_data.py
# ============================================================

import pandas as pd
import sys
import os

# Add parent directory to path so we can import db.py
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db import jobs_collection, skills_collection

# ── Step 1: Load the CSV ──────────────────────────────────
# Change this filename to match your downloaded file
CSV_PATH = os.path.join(
   os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    'data',
    'jobs_in_data.csv'
)
print(f"Loading: {CSV_PATH}") 
df = pd.read_csv(CSV_PATH)
print(f"✅ Loaded {len(df)} rows, {len(df.columns)} columns")
print(f"Columns: {df.columns.tolist()}")

# ── Step 2: Map experience level codes ───────────────────
# Kaggle uses codes — we decode to human-readable strings
experience_map = {
    'EN': '0-2 years',   # Entry level
    'MI': '2-4 years',   # Mid level
    'SE': '4-7 years',   # Senior
    'EX': '7+ years',    # Executive
    'L':  '0-2 years',
    'M':  '2-4 years',
    'S':  '4-7 years'
}

# ── Step 3: Map job categories to our schema ─────────────
category_map = {
    'Data Engineering': 'Data Engineering',
    'Data Science and Research': 'Data Science',
    'Machine Learning and AI': 'Machine Learning',
    'Data Analysis': 'Data Analysis',
    'BI and Visualization': 'Business Intelligence',
    'Leadership and Management': 'Data Science',
    'Data Architecture and Modeling': 'Data Engineering',
    'Data Management and Strategy': 'Data Engineering',
    'Data Quality and Operations': 'Data Analysis',
    'Cloud and Database': 'Data Engineering'
}

# ── Step 4: Map skills per category ──────────────────────
# Kaggle dataset doesn't have a skills column
# So we assign realistic skills based on job category
skills_map = {
    'Data Engineering': ['Python', 'Spark', 'SQL', 'AWS', 'Kafka', 'Hadoop', 'Docker'],
    'Data Science': ['Python', 'R', 'Machine Learning', 'Statistics', 'SQL', 'TensorFlow'],
    'Machine Learning': ['Python', 'TensorFlow', 'PyTorch', 'scikit-learn', 'Deep Learning', 'NLP'],
    'Data Analysis': ['SQL', 'Python', 'Excel', 'Power BI', 'Tableau', 'Statistics'],
    'Business Intelligence': ['SQL', 'Tableau', 'Power BI', 'Excel', 'Python']
}

# ── Step 5: Clean and transform the data ─────────────────
def clean_dataframe(df):
    # Drop rows with missing critical fields
    df = df.dropna(subset=['job_title', 'salary_in_usd'])

    # Keep only recent years (2022-2023 is most relevant)
    if 'work_year' in df.columns:
        df = df[df['work_year'] >= 2022]

    print(f"✅ After cleaning: {len(df)} rows")
    return df

df = clean_dataframe(df)

# ── Step 6: Convert to MongoDB documents ─────────────────
def row_to_document(row):
    # Get category
    raw_category = row.get('job_category', 'Data Science')
    category = category_map.get(str(raw_category), 'Data Science')

    # Get experience
    raw_exp = str(row.get('experience_level', 'MI'))
    experience = experience_map.get(raw_exp, '2-4 years')

    # Convert USD salary to INR (approximate)
    # 1 USD ≈ 83 INR
    salary_usd = float(row.get('salary_in_usd', 50000))
    salary_inr = salary_usd * 83
    salary_min = int(salary_inr * 0.85)   # min = 85% of stated
    salary_max = int(salary_inr * 1.15)   # max = 115% of stated
    salary_lpa_min = round(salary_min / 100000, 1)
    salary_lpa_max = round(salary_max / 100000, 1)

    # Get skills for this category
    skills = skills_map.get(category, ['Python', 'SQL'])

    # Location — use employee_residence country code
    location_map_cities = {
        'IN': 'Bangalore', 'US': 'Remote (US)', 'GB': 'London',
        'DE': 'Berlin', 'CA': 'Toronto', 'FR': 'Paris',
        'AU': 'Sydney', 'SG': 'Singapore', 'NL': 'Amsterdam'
    }
    raw_location = str(row.get('employee_residence', 'IN'))
    location = location_map_cities.get(raw_location, raw_location)

    return {
        "title": str(row.get('job_title', 'Data Scientist')),
        "company": f"Company ({raw_location})",
        "location": location,
        "skills": skills,
        "salary_min": salary_min,
        "salary_max": salary_max,
        "salary_display": f"{salary_lpa_min}-{salary_lpa_max} LPA",
        "job_type": "Full-time",
        "experience": experience,
        "category": category,
        "work_year": int(row.get('work_year', 2023)),
        "salary_usd": salary_usd,
        "source": "kaggle"
    }

# ── Step 7: Insert into MongoDB ───────────────────────────
print("\nClearing existing Kaggle data...")
jobs_collection.delete_many({"source": "kaggle"})

print("Converting and inserting...")
documents = []
for _, row in df.iterrows():
    try:
        doc = row_to_document(row)
        documents.append(doc)
    except Exception as e:
        pass  # Skip problematic rows

# Insert in batches of 100
batch_size = 100
inserted = 0
for i in range(0, len(documents), batch_size):
    batch = documents[i:i+batch_size]
    jobs_collection.insert_many(batch)
    inserted += len(batch)
    print(f"  Inserted {inserted}/{len(documents)} jobs...")

print(f"\n✅ Successfully inserted {inserted} jobs into MongoDB!")

# ── Step 8: Recompute skill frequencies ──────────────────
print("\nRecomputing skill frequencies...")
skills_collection.delete_many({})

skill_counts = {}
all_jobs = list(jobs_collection.find({}, {"_id": 0, "skills": 1}))
for job in all_jobs:
    for skill in job.get("skills", []):
        skill_counts[skill] = skill_counts.get(skill, 0) + 1

category_lookup = {
    "Python": "Programming", "R": "Programming",
    "SQL": "Database", "Excel": "Tools",
    "Tableau": "Visualization", "Power BI": "Visualization",
    "Machine Learning": "AI/ML", "TensorFlow": "AI/ML",
    "PyTorch": "AI/ML", "scikit-learn": "AI/ML",
    "Deep Learning": "AI/ML", "NLP": "AI/ML",
    "Statistics": "Mathematics", "AWS": "Cloud",
    "Docker": "DevOps", "Kubernetes": "DevOps",
    "Spark": "Big Data", "Hadoop": "Big Data",
    "Kafka": "Big Data"
}

skill_docs = [
    {
        "skill": skill,
        "count": count,
        "category": category_lookup.get(skill, "Other")
    }
    for skill, count in sorted(
        skill_counts.items(), key=lambda x: x[1], reverse=True
    )
]

skills_collection.insert_many(skill_docs)
print(f"✅ Inserted {len(skill_docs)} skill frequencies")

print("\n🎉 Kaggle data loaded successfully!")
print(f"   Total jobs in DB: {jobs_collection.count_documents({})}")
print(f"   Total skills tracked: {skills_collection.count_documents({})}")