"""
Core data analysis service using pandas and numpy.
All analytical functions that power the API endpoints.
"""
import pandas as pd
import numpy as np
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')


def load_jobs():
    """Load jobs CSV into a pandas DataFrame"""
    path = os.path.join(DATA_DIR, 'jobs.csv')
    df = pd.read_csv(path)
    return df


def load_trends():
    """Load skill trends CSV"""
    path = os.path.join(DATA_DIR, 'skill_trends.csv')
    df = pd.read_csv(path)
    return df


# ─────────────────────────────────────────────
# DASHBOARD STATS
# ─────────────────────────────────────────────
def get_summary_stats():
    df = load_jobs()
    return {
        "total_jobs": len(df),
        "total_skills": df['primary_skill'].nunique(),
        "avg_salary_inr": int(df['salary_inr'].mean()),
        "avg_salary_usd": int(df['salary_usd'].mean()),
        "top_location": df['location'].value_counts().index[0],
        "total_companies": df['company'].nunique(),
        "remote_pct": round(
            len(df[df['remote_type'] == 'Remote']) / len(df) * 100, 1
        ),
    }


# ─────────────────────────────────────────────
# SKILL ANALYSIS
# ─────────────────────────────────────────────
def get_top_skills(limit=10):
    df = load_jobs()
    skill_counts = df['primary_skill'].value_counts().head(limit)
    avg_salary = df.groupby('primary_skill')['salary_inr'].mean()

    result = []
    for skill, count in skill_counts.items():
        result.append({
            "skill": skill,
            "job_count": int(count),
            "demand_pct": round(count / len(df) * 100, 1),
            "avg_salary_inr": int(avg_salary.get(skill, 0)),
        })
    return result


def get_skill_trends():
    """Returns monthly demand index for each skill"""
    df = load_trends()
    months = df['month'].tolist()
    skills = [c for c in df.columns if c != 'month']
    result = []
    for _, row in df.iterrows():
        entry = {"month": row['month']}
        for skill in skills:
            entry[skill] = row[skill]
        result.append(entry)
    return result


def get_skills_by_experience():
    df = load_jobs()
    pivot = df.groupby(['experience_level', 'primary_skill']).size().reset_index(name='count')
    result = {}
    for exp in df['experience_level'].unique():
        subset = pivot[pivot['experience_level'] == exp].nlargest(5, 'count')
        result[exp] = subset[['primary_skill', 'count']].to_dict('records')
    return result


# ─────────────────────────────────────────────
# SALARY ANALYSIS
# ─────────────────────────────────────────────
def get_salary_by_role(limit=10):
    df = load_jobs()
    result = df.groupby('job_title')['salary_inr'].agg(['mean', 'min', 'max', 'count']).reset_index()
    result.columns = ['job_title', 'avg', 'min_sal', 'max_sal', 'count']
    result = result.nlargest(limit, 'avg')
    result['avg'] = result['avg'].round(0).astype(int)
    result['min_sal'] = result['min_sal'].round(0).astype(int)
    result['max_sal'] = result['max_sal'].round(0).astype(int)
    return result.to_dict('records')


def get_salary_by_location(limit=8):
    df = load_jobs()
    result = df.groupby('location')['salary_inr'].mean().reset_index()
    result.columns = ['location', 'avg_salary']
    result = result.nlargest(limit, 'avg_salary')
    result['avg_salary'] = result['avg_salary'].round(0).astype(int)
    return result.to_dict('records')


def get_salary_distribution():
    df = load_jobs()
    bins = [0, 500000, 1000000, 1500000, 2000000, 2500000, 3000000, 5000000]
    labels = ["<5L", "5-10L", "10-15L", "15-20L", "20-25L", "25-30L", "30L+"]
    df['salary_range'] = pd.cut(df['salary_inr'], bins=bins, labels=labels)
    dist = df['salary_range'].value_counts().sort_index()
    return [{"range": str(k), "count": int(v)} for k, v in dist.items()]


# ─────────────────────────────────────────────
# TRENDS ANALYSIS
# ─────────────────────────────────────────────
def get_hiring_by_month():
    df = load_jobs()
    month_order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly = df['month'].value_counts()
    result = [{"month": m, "jobs": int(monthly.get(m, 0))} for m in month_order]
    return result


def get_remote_distribution():
    df = load_jobs()
    dist = df['remote_type'].value_counts()
    return [{"type": k, "count": int(v), "pct": round(v / len(df) * 100, 1)}
            for k, v in dist.items()]


def get_company_size_demand():
    df = load_jobs()
    size_order = ["Startup (1-50)", "Small (51-200)", "Medium (201-1000)",
                  "Large (1001-5000)", "Enterprise (5000+)"]
    result = df.groupby('company_size')['salary_inr'].agg(['mean', 'count']).reset_index()
    result.columns = ['company_size', 'avg_salary', 'job_count']
    result['avg_salary'] = result['avg_salary'].round(0).astype(int)
    result['order'] = result['company_size'].map({v: i for i, v in enumerate(size_order)})
    result = result.sort_values('order').drop('order', axis=1)
    return result.to_dict('records')


# ─────────────────────────────────────────────
# SKILLS GAP ANALYZER
# ─────────────────────────────────────────────
ROLE_REQUIREMENTS = {
    "Data Scientist": ["Python", "Machine Learning", "Statistics", "SQL", "TensorFlow", "Pandas"],
    "Machine Learning Engineer": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "MLOps"],
    "Data Analyst": ["SQL", "Python", "Excel", "Tableau", "Power BI", "Statistics"],
    "Data Engineer": ["Python", "SQL", "Spark", "Airflow", "AWS", "dbt"],
    "AI Engineer": ["Python", "Machine Learning", "Deep Learning", "NLP", "Cloud", "APIs"],
    "MLOps Engineer": ["Python", "Docker", "Kubernetes", "MLflow", "CI/CD", "Cloud"],
    "NLP Engineer": ["Python", "NLP", "Transformers", "BERT", "SpaCy", "Deep Learning"],
}


def analyze_skill_gap(user_skills: list, target_role: str):
    required = set(s.lower() for s in ROLE_REQUIREMENTS.get(target_role, []))
    user_set = set(s.lower() for s in user_skills)

    if not required:
        return {"error": f"Role '{target_role}' not found"}

    missing = required - user_set
    matched = required & user_set
    extra = user_set - required
    match_score = round(len(matched) / len(required) * 100, 1)

    # Priority skills (in original casing from requirements list)
    req_list = ROLE_REQUIREMENTS[target_role]
    missing_display = [s for s in req_list if s.lower() in missing]

    df = load_jobs()
    role_df = df[df['job_title'] == target_role]
    avg_salary = int(role_df['salary_inr'].mean()) if len(role_df) else 0
    job_count = len(role_df)

    return {
        "target_role": target_role,
        "match_score": match_score,
        "matched_skills": list(matched),
        "missing_skills": missing_display,
        "extra_skills": list(extra),
        "required_skills": req_list,
        "available_jobs": job_count,
        "avg_salary_inr": avg_salary,
        "readiness": (
            "🔥 Ready to apply!" if match_score >= 80
            else "✅ Almost there" if match_score >= 60
            else "📚 Keep learning" if match_score >= 40
            else "🌱 Just starting"
        ),
    }
