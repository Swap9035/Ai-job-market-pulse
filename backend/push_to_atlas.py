# push_to_atlas.py — copies local MongoDB data to Atlas
# Run this ONCE while connected to mobile hotspot
# After this, Render can connect to Atlas from the cloud

from pymongo import MongoClient
import os

# ── Your local MongoDB ────────────────────────────────────
LOCAL_URI = "mongodb://localhost:27017/job_market_db"
local_client = MongoClient(LOCAL_URI)
local_db = local_client["job_market_db"]

# ── Your Atlas MongoDB ────────────────────────────────────
# Replace with your actual Atlas connection string
ATLAS_URI = ATLAS_URI = ATLAS_URI = "mongodb+srv://jobmarketadmin:job123@job-market-cluster.tf0f1td.mongodb.net/job_market_db?retryWrites=true&w=majority"
atlas_client = MongoClient(ATLAS_URI, serverSelectionTimeoutMS=10000)
atlas_db = atlas_client["job_market_db"]

try:
    print("Connecting to Atlas...")
    atlas_client.admin.command('ping')
    print("✅ Connected to Atlas!")

except Exception as e:
    print("❌ FULL ERROR:")
    print(e)

# ── Copy jobs collection ──────────────────────────────────
print("\nCopying jobs...")
local_jobs = list(local_db.jobs.find({}, {"_id": 0}))
print(f"Found {len(local_jobs)} local jobs")

atlas_db.jobs.delete_many({})
if local_jobs:
    atlas_db.jobs.insert_many(local_jobs)
    print(f"✅ Pushed {len(local_jobs)} jobs to Atlas")

# ── Copy skills collection ────────────────────────────────
print("\nCopying skills...")
local_skills = list(local_db.skills.find({}, {"_id": 0}))
print(f"Found {len(local_skills)} local skills")

atlas_db.skills.delete_many({})
if local_skills:
    atlas_db.skills.insert_many(local_skills)
    print(f"✅ Pushed {len(local_skills)} skills to Atlas")

print("\n🎉 Data successfully pushed to MongoDB Atlas!")
print(f"Jobs in Atlas: {atlas_db.jobs.count_documents({})}")
print(f"Skills in Atlas: {atlas_db.skills.count_documents({})}")