# ============================================================
# services/ai_advisor.py — AI Career Advisor (Groq - FREE)
# ============================================================
# Using Groq's free API with Llama3 model
# Free tier: 14,400 requests/day — more than enough!
# ============================================================

from groq import Groq
from dotenv import load_dotenv
import os
import json

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"  # free, fast, smart


def get_career_advice(skill_gap_data):
    target_role = skill_gap_data.get('target_role', 'Data Scientist')
    match_score = skill_gap_data.get('match_score', 0)
    skills_have = [s['skill'] for s in skill_gap_data.get('skills_you_have', [])]
    skills_missing = [
        f"{s['skill']} ({s['percentage']}% of jobs require it)"
        for s in skill_gap_data.get('skills_to_learn', [])[:5]
    ]

    user_prompt = f"""
    A student in India wants to become a {target_role}.
    Their current skill match score: {match_score}%
    Skills they already have: {', '.join(skills_have) if skills_have else 'None yet'}
    Top missing skills: {chr(10).join(f'- {s}' for s in skills_missing)}

    Provide a response in this EXACT JSON format (no extra text):
    {{
        "assessment": "2-3 sentence assessment of their position",
        "roadmap": [
            {{"month": 1, "skill": "skill name", "reason": "why learn first", "time_needed": "X hrs/week"}},
            {{"month": 2, "skill": "skill name", "reason": "why learn second", "time_needed": "X hrs/week"}},
            {{"month": 3, "skill": "skill name", "reason": "why learn third", "time_needed": "X hrs/week"}}
        ],
        "resources": [
            {{"skill": "skill name", "resources": [{{"name": "resource name", "url": "https://...", "type": "free"}}]}}
        ],
        "market_insight": "one insight about Indian job market for this role"
    }}
    """

    system_prompt = """You are an expert career advisor for data science roles in India.
    Give practical advice for students at Indian companies like TCS, Infosys, Wipro.
    Always return valid JSON only, no extra text before or after."""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=800,
            temperature=0.7
        )

        content = response.choices[0].message.content.strip()

        # Clean markdown if present
        if '```' in content:
            content = content.split('```')[1]
            if content.startswith('json'):
                content = content[4:]
        content = content.strip()

        advice = json.loads(content)
        advice['target_role'] = target_role
        advice['match_score'] = match_score

        return {"success": True, "data": advice}

    except json.JSONDecodeError:
        return {
            "success": True,
            "data": {
                "assessment": content,
                "roadmap": [],
                "resources": [],
                "market_insight": "",
                "target_role": target_role,
                "match_score": match_score,
                "raw": True
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def explain_skill(skill_name, target_role):
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a concise career advisor for Indian data science students."
                },
                {
                    "role": "user",
                    "content": f"In 2-3 sentences, explain why {skill_name} is important for a {target_role} role in India. Include one specific use case and mention which companies require it."
                }
            ],
            max_tokens=150,
            temperature=0.5
        )
        return {
            "success": True,
            "skill": skill_name,
            "explanation": response.choices[0].message.content.strip()
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def generate_resume_bullets(skills, target_role):
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You write strong resume bullet points. Return ONLY a JSON array, no extra text."
                },
                {
                    "role": "user",
                    "content": f"""Generate 4 resume bullet points for a {target_role} with skills: {', '.join(skills)}.
                    Return ONLY this JSON array:
                    [{{"bullet": "text here", "skill_highlighted": "skill name"}}]"""
                }
            ],
            max_tokens=300,
            temperature=0.7
        )

        content = response.choices[0].message.content.strip()
        if '```' in content:
            content = content.split('```')[1]
            if content.startswith('json'):
                content = content[4:]

        bullets = json.loads(content.strip())
        return {"success": True, "data": bullets}

    except Exception as e:
        return {"success": False, "error": str(e)}
