# db.py — MongoDB connection handler

from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB Atlas
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)

# Select database
db = client["job_market_db"]

# Collections (like tables in SQL)
jobs_collection = db["jobs"]
skills_collection = db["skills"]

# Test function — run this file directly to check connection
def test_connection():
    try:
        # ping the database
        client.admin.command('ping')
        print("✅ Connected to MongoDB Atlas successfully!")
        print(f"   Database: {db.name}")
        print(f"   Collections: {db.list_collection_names()}")
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    test_connection()
