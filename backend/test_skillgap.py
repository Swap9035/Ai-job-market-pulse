from db import jobs_collection

print("Testing skill gap query...")

# This is exactly what the skill-gap route does
matching_jobs = list(jobs_collection.find(
    {"category": "Machine Learning"},
    {"_id": 0, "skills": 1}
))

print(f"Found {len(matching_jobs)} jobs")
print("First job:", matching_jobs[0] if matching_jobs else "NONE")