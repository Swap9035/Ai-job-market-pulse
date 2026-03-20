from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["job_market_db"]

jobs_collection = db["jobs"]
skills_collection = db["skills"]

def test_connection():
    try:
        client.admin.command('ping')
        print("✅ Connected to MongoDB successfully!")
        print(f"   Database: {db.name}")
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    test_connection()
