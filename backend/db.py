# db.py — handles the MongoDB connection
# We keep this in a separate file so app.py stays clean
# Any file that needs the database just imports 'db' from here

from pymongo import MongoClient
from dotenv import load_dotenv
import os

# load_dotenv() reads your .env file and makes those
# variables available via os.getenv()
load_dotenv()

# Get the connection string from .env
# Never hardcode passwords/URLs directly in code
MONGO_URI = os.getenv("MONGO_URI")

# Create the MongoDB client (the connection)
client = MongoClient(MONGO_URI)

# Select our database
db = client["job_market_db"]

# These are our collections (like tables in SQL)
jobs_collection = db["jobs"]
skills_collection = db["skills"]