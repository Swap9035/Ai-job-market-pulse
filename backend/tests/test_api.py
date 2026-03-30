# ============================================================
# tests/test_api.py — API endpoint tests using pytest
# ============================================================
# Purpose : Verify all Flask endpoints return correct
#           status codes and response structure
#
# Why testing matters for interviews:
#   "I wrote pytest tests for every endpoint — this ensures
#    the API contract doesn't break when code changes"
#
# Run: pytest tests/ -v
# ============================================================

import pytest
import sys
import os

# Add parent directory so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app


# ── Test Setup ───────────────────────────────────────────────
@pytest.fixture
def client():
    """
    Creates a test client for Flask app.
    test_client() lets us make HTTP requests without
    actually running the server.
    """
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


# ── Route Tests ──────────────────────────────────────────────

def test_health_check(client):
    """
    Test: GET / returns 200 and running status
    """
    response = client.get('/')
    data = response.get_json()

    assert response.status_code == 200
    assert data['status'] == 'running'
    assert 'message' in data
    print("✅ Health check passed")


def test_get_jobs(client):
    """
    Test: GET /api/jobs returns list of jobs
    """
    response = client.get('/api/jobs')
    data = response.get_json()

    assert response.status_code == 200
    assert data['success'] == True
    assert 'data' in data
    assert isinstance(data['data'], list)
    assert data['count'] >= 0
    print(f"✅ Jobs endpoint returned {data['count']} jobs")


def test_get_skills(client):
    """
    Test: GET /api/skills returns skill list
    """
    response = client.get('/api/skills')
    data = response.get_json()

    assert response.status_code == 200
    assert data['success'] == True
    assert 'data' in data
    assert isinstance(data['data'], list)
    print(f"✅ Skills endpoint returned {data['count']} skills")


def test_get_categories(client):
    """
    Test: GET /api/jobs/categories returns categories
    """
    response = client.get('/api/jobs/categories')
    data = response.get_json()

    assert response.status_code == 200
    assert data['success'] == True
    assert 'data' in data
    print("✅ Categories endpoint passed")


def test_filter_jobs(client):
    """
    Test: GET /api/jobs/filter with category parameter
    """
    response = client.get('/api/jobs/filter?category=Data Science')
    data = response.get_json()

    assert response.status_code == 200
    assert data['success'] == True
    print("✅ Filter jobs endpoint passed")


def test_salary_analytics(client):
    """
    Test: GET /api/analytics/salary returns salary data
    """
    response = client.get('/api/analytics/salary')
    data = response.get_json()

    assert response.status_code == 200
    assert data['success'] == True
    print("✅ Salary analytics passed")


def test_location_analytics(client):
    """
    Test: GET /api/analytics/locations returns location data
    """
    response = client.get('/api/analytics/locations')
    data = response.get_json()

    assert response.status_code == 200
    assert data['success'] == True
    print("✅ Location analytics passed")


def test_skill_gap_valid(client):
    """
    Test: POST /api/skill-gap with valid data
    """
    response = client.post(
        '/api/skill-gap',
        json={
            "skills": ["Python", "SQL"],
            "target_role": "Data Science"
        }
    )
    data = response.get_json()

    assert response.status_code == 200
    assert data['success'] == True
    assert 'match_score' in data
    assert 'skills_you_have' in data
    assert 'skills_to_learn' in data
    assert isinstance(data['match_score'], int)
    assert 0 <= data['match_score'] <= 100
    print(f"✅ Skill gap passed — match score: {data['match_score']}%")


def test_skill_gap_empty_skills(client):
    """
    Test: POST /api/skill-gap with no skills (0% match)
    """
    response = client.post(
        '/api/skill-gap',
        json={
            "skills": [],
            "target_role": "Machine Learning"
        }
    )
    data = response.get_json()

    assert response.status_code == 200
    assert data['match_score'] == 0
    print("✅ Skill gap empty skills passed")


def test_predictions_endpoint(client):
    """
    Test: GET /api/predictions/skills returns predictions
    """
    response = client.get('/api/predictions/skills')
    data = response.get_json()

    assert response.status_code == 200
    assert data['success'] == True
    assert 'data' in data
    print("✅ Predictions endpoint passed")


def test_404_error(client):
    """
    Test: Non-existent route returns 404 JSON
    """
    response = client.get('/api/nonexistent')
    data = response.get_json()

    assert response.status_code == 404
    assert data['success'] == False
    print("✅ 404 handler passed")


def test_405_error(client):
    """
    Test: Wrong HTTP method returns 405 JSON
    """
    # skill-gap is POST only — GET should fail
    response = client.get('/api/skill-gap')
    assert response.status_code == 405
    print("✅ 405 handler passed")
