# ============================================================
# services/analytics.py — Data Analytics Service Layer
# ============================================================
# Purpose : All pandas/numpy data analysis lives here
#           This separates business logic from API routes
#
# Why a service layer?
#   app.py handles HTTP (requests/responses)
#   analytics.py handles DATA (computation/analysis)
#   This is called "Separation of Concerns" — a key principle
#
# How it works:
#   1. Query MongoDB → get raw documents
#   2. Convert to pandas DataFrame
#   3. Run analysis (groupby, stats, trends)
#   4. Return clean Python dicts for Flask to JSONify
# ============================================================

import pandas as pd
import numpy as np
from scipy import stats
import sys
import os

# Import db collections
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db import jobs_collection, skills_collection


# ────────────────────────────────────────────────────────────
# HELPER: MongoDB → pandas DataFrame
# ────────────────────────────────────────────────────────────
# Purpose : Converts MongoDB cursor to pandas DataFrame
# This is the bridge between your database and data science
# One line: pd.DataFrame(list(collection.find()))
# ────────────────────────────────────────────────────────────
def get_jobs_dataframe():
    """
    Fetches all jobs from MongoDB and returns as pandas DataFrame.
    Excludes MongoDB's internal _id field.
    """
    jobs = list(jobs_collection.find({}, {"_id": 0}))
    if not jobs:
        return pd.DataFrame()
    df = pd.DataFrame(jobs)
    return df


# ────────────────────────────────────────────────────────────
# ANALYSIS 1: Salary Statistics
# ────────────────────────────────────────────────────────────
# Purpose : Compute detailed salary stats per job category
# Uses    : pandas groupby + agg (aggregate multiple stats)
# Returns : list of dicts with category + salary stats
#
# pandas concepts used:
#   groupby()  — split data into groups (like SQL GROUP BY)
#   agg()      — apply multiple functions at once
#   reset_index() — converts grouped index back to column
# ────────────────────────────────────────────────────────────
def get_salary_stats():
    """
    Returns salary statistics grouped by job category.
    Includes mean, median, min, max, and job count.
    """
    df = get_jobs_dataframe()
    if df.empty:
        return []

    # Group by category, compute multiple stats at once
    salary_stats = df.groupby('category')['salary_min'].agg(
        mean='mean',
        median='median',
        min_val='min',
        max_val='max',
        count='count'
    ).reset_index()

    # Convert rupees to LPA (divide by 100,000)
    for col in ['mean', 'median', 'min_val', 'max_val']:
        salary_stats[col] = (salary_stats[col] / 100000).round(1)

    # Sort by mean salary descending
    salary_stats = salary_stats.sort_values('mean', ascending=False)

    # Convert to list of dicts for JSON response
    return salary_stats.rename(columns={
        'mean': 'avg_lpa',
        'median': 'median_lpa',
        'min_val': 'min_lpa',
        'max_val': 'max_lpa'
    }).to_dict('records')


# ────────────────────────────────────────────────────────────
# ANALYSIS 2: Skill Trend Over Time
# ────────────────────────────────────────────────────────────
# Purpose : Count how many jobs require each skill per year
#           This powers the trend charts + ML predictions
# Uses    : pandas explode() + groupby + pivot_table
# Returns : dict with years as keys, skill counts as values
#
# pandas concepts used:
#   explode()     — splits list column into individual rows
#                   ["Python","SQL"] → two separate rows
#   pivot_table() — reshapes data (rows → columns)
#                   like Excel pivot tables
# ────────────────────────────────────────────────────────────
def get_skill_trends():
    """
    Returns skill frequency per year for trend analysis.
    Used by the LineChart on the Skills page.
    """
    df = get_jobs_dataframe()
    if df.empty or 'work_year' not in df.columns:
        return []

    # explode() turns ["Python","SQL"] into two rows
    # This lets us count each skill individually
    df_exploded = df.explode('skills')
    df_exploded = df_exploded.dropna(subset=['skills'])

    # Count jobs per skill per year
    trend_data = df_exploded.groupby(
        ['work_year', 'skills']
    ).size().reset_index(name='count')

    # Get top 5 skills to avoid cluttering the chart
    top_skills = df_exploded['skills'].value_counts().head(5).index.tolist()
    trend_data = trend_data[trend_data['skills'].isin(top_skills)]

    # Pivot: rows=year, columns=skills, values=count
    # Result: one row per year with skill counts as columns
    pivot = trend_data.pivot_table(
        index='work_year',
        columns='skills',
        values='count',
        fill_value=0
    ).reset_index()

    # Convert to list of dicts for Chart.js/Recharts
    result = []
    for _, row in pivot.iterrows():
        entry = {'year': int(row['work_year'])}
        for skill in top_skills:
            if skill in pivot.columns:
                entry[skill] = int(row.get(skill, 0))
        result.append(entry)

    return {
        'data': result,
        'skills': top_skills
    }


# ────────────────────────────────────────────────────────────
# ANALYSIS 3: Statistical Insight Generator
# ────────────────────────────────────────────────────────────
# Purpose : Auto-generate text insights from the data
#           "Python demand increased 23% this year"
# Uses    : scipy t-test + pandas statistics
# Returns : list of insight strings
#
# scipy concepts used:
#   ttest_ind()  — independent samples t-test
#                  Tests if two groups are significantly different
#                  p < 0.05 means difference is statistically real
#   pearsonr()   — Pearson correlation coefficient
#                  Measures relationship between two variables
#                  +1 = perfect positive, -1 = perfect negative
# ────────────────────────────────────────────────────────────
def get_auto_insights():
    """
    Automatically generates data-driven insights using
    statistical tests. Returns human-readable strings.
    """
    df = get_jobs_dataframe()
    if df.empty:
        return []

    insights = []

    try:
        # ── Insight 1: Most in-demand skill ──────────────
        df_exploded = df.explode('skills').dropna(subset=['skills'])
        top_skill = df_exploded['skills'].value_counts().index[0]
        top_skill_count = df_exploded['skills'].value_counts().iloc[0]
        total_jobs = len(df)
        top_skill_pct = round(top_skill_count / total_jobs * 100)
        insights.append({
            "icon": "🔥",
            "title": "Most Demanded Skill",
            "text": f"{top_skill} appears in {top_skill_pct}% of all job postings",
            "type": "info"
        })

        # ── Insight 2: Highest paying category ───────────
        avg_by_cat = df.groupby('category')['salary_min'].mean()
        top_cat = avg_by_cat.idxmax()
        top_cat_lpa = round(avg_by_cat.max() / 100000, 1)
        insights.append({
            "icon": "💰",
            "title": "Highest Paying Role",
            "text": f"{top_cat} roles offer the highest average salary at {top_cat_lpa} LPA",
            "type": "success"
        })

        # ── Insight 3: Statistical test — experience vs salary ──
        # T-test: do senior roles pay significantly more than junior?
        if 'experience' in df.columns:
            junior = df[df['experience'] == '0-2 years']['salary_min'].dropna()
            senior = df[df['experience'] == '4-7 years']['salary_min'].dropna()

            if len(junior) > 1 and len(senior) > 1:
                t_stat, p_value = stats.ttest_ind(junior, senior)
                senior_avg = round(senior.mean() / 100000, 1)
                junior_avg = round(junior.mean() / 100000, 1)
                pct_diff = round((senior_avg - junior_avg) / junior_avg * 100)

                if p_value < 0.05:
                    insights.append({
                        "icon": "📈",
                        "title": "Experience Premium (Statistically Significant)",
                        "text": f"Senior roles pay {pct_diff}% more than entry level (p={round(p_value, 3)}, t-test confirmed)",
                        "type": "success"
                    })
                else:
                    insights.append({
                        "icon": "📊",
                        "title": "Experience vs Salary",
                        "text": f"Senior avg: {senior_avg} LPA vs Junior avg: {junior_avg} LPA",
                        "type": "info"
                    })

        # ── Insight 4: Skill count vs salary correlation ──
        # Pearson r: does having more skills = higher salary?
        df['skill_count'] = df['skills'].apply(
            lambda x: len(x) if isinstance(x, list) else 0
        )
        correlation, p_val = stats.pearsonr(
            df['skill_count'],
            df['salary_min']
        )
        correlation = round(correlation, 2)
        direction = "positive" if correlation > 0 else "negative"
        insights.append({
            "icon": "🔗",
            "title": "Skills vs Salary Correlation",
            "text": f"Number of required skills has a {direction} correlation (r={correlation}) with salary",
            "type": "info"
        })

        # ── Insight 5: Top hiring location ───────────────
        top_location = df['location'].value_counts().index[0]
        top_location_count = df['location'].value_counts().iloc[0]
        location_pct = round(top_location_count / total_jobs * 100)
        insights.append({
            "icon": "📍",
            "title": "Top Hiring Location",
            "text": f"{top_location} has {location_pct}% of all job postings",
            "type": "info"
        })

    except Exception as e:
        insights.append({
            "icon": "⚠️",
            "title": "Analysis Error",
            "text": str(e),
            "type": "error"
        })

    return insights


# ────────────────────────────────────────────────────────────
# ANALYSIS 4: Category Distribution
# ────────────────────────────────────────────────────────────
# Purpose : Count jobs per category with percentages
# Uses    : pandas value_counts() + apply()
# Returns : list of { category, count, percentage }
# ────────────────────────────────────────────────────────────
def get_category_distribution():
    """
    Returns job count and percentage for each category.
    Used by the pie chart on the Dashboard.
    """
    df = get_jobs_dataframe()
    if df.empty:
        return []

    total = len(df)
    cat_counts = df['category'].value_counts().reset_index()
    cat_counts.columns = ['category', 'count']
    cat_counts['percentage'] = (
        cat_counts['count'] / total * 100
    ).round(1)

    return cat_counts.to_dict('records')


# ────────────────────────────────────────────────────────────
# ANALYSIS 5: Experience Level Summary
# ────────────────────────────────────────────────────────────
# Purpose : Jobs and salary stats per experience level
# Returns : list sorted by avg salary descending
# ────────────────────────────────────────────────────────────
def get_experience_summary():
    """
    Returns job count and average salary per experience level.
    """
    df = get_jobs_dataframe()
    if df.empty or 'experience' not in df.columns:
        return []

    summary = df.groupby('experience').agg(
        count=('salary_min', 'count'),
        avg_salary=('salary_min', 'mean')
    ).reset_index()

    summary['avg_salary_lpa'] = (summary['avg_salary'] / 100000).round(1)
    summary = summary.sort_values('avg_salary', ascending=False)

    return summary[['experience', 'count', 'avg_salary_lpa']].to_dict('records')