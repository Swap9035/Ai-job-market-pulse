# 🏆 AI Job Market Pulse

> **Real-time AI-powered job market analytics platform** — built as a full-stack data science portfolio project.

[![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1-green?logo=flask)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.9-orange?logo=scikit-learn)](https://scikit-learn.org)

---

## 🎯 What It Does

Analyzes **5,000+ data science job records** to reveal:
- 📊 **Skill demand trends** — which skills are rising, which are declining
- 💰 **Salary intelligence** — compensation by role, location, and experience
- 🤖 **ML Salary Predictor** — Random Forest model predicts your market value
- 🎯 **Skills Gap Analyzer** — Compare your skills vs what employers want
- ✨ **AI Insights** — GPT-powered career advice per skill

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + Vite | Interactive SaaS UI |
| Charts | Recharts + Framer Motion | Animated data visualizations |
| Backend | Flask (Python) | REST API server |
| Data Analysis | Pandas + NumPy | Job data processing |
| Machine Learning | scikit-learn (Random Forest) | Salary prediction |
| AI | OpenAI GPT-3.5 | Skill insights |
| Styling | Vanilla CSS (Dark SaaS theme) | Premium UI design |

---

## ✨ Key Features

### 📊 Dashboard
- Real-time stats: total jobs, avg salary, top location, remote %
- Skill demand area chart (12-month trends)
- Monthly hiring bar chart
- Work model distribution (Remote/Hybrid/On-site)

### 🧠 Skills Analytics
- Top 12 skills ranked by market demand
- Radar chart filtered by experience level (Entry → Director)
- Full skills leaderboard with salary data

### 💰 Salary Intelligence
- Average salary by job role (horizontal bar)
- Salary by location with geo breakdown
- Salary distribution histogram

### 🤖 ML Salary Predictor
- **Algorithm**: Random Forest Regressor
- **Features**: Job title, experience level, company size, work model, location
- **Accuracy**: ~85% R² score on held-out test data
- Real-time prediction with confidence range

### 🎯 Skills Gap Analyzer
- Select your current skills from 25+ options
- Choose your target role
- Get animated score ring showing readiness %
- See exactly which skills to learn next

### ✨ AI Insights
- GPT-3.5 powered analysis (with offline fallback)
- Market summary, top industries, salary outlook per skill
- Analysis history sidebar

---

## 🚀 Running Locally

### Backend (Flask)
```bash
cd backend
venv\Scripts\activate         # Windows
pip install -r requirements.txt
python data/generate_data.py  # Generate dataset once
python app.py                 # Starts at http://localhost:5000
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev                   # Starts at http://localhost:5173
```

---

## 📂 Project Structure

```
ai-job-market-pulse/
├── backend/
│   ├── app.py                 ← Flask REST API (12 endpoints)
│   ├── services/
│   │   ├── analysis.py        ← Pandas data analysis
│   │   └── ml_predictions.py  ← scikit-learn ML model
│   ├── data/
│   │   └── generate_data.py   ← Synthetic dataset generator
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── pages/             ← 6 full pages
        ├── components/        ← Reusable UI components
        ├── api/               ← API connector
        └── index.css          ← Dark SaaS design system
```

---

## 🎓 Interview Talking Points

1. **Architecture**: "FARM Stack — Flask + React with REST API bridge"
2. **ML**: "Random Forest trained on 4K records, ~85% R² accuracy"
3. **Data Pipeline**: "NumPy → Pandas cleaning → sklearn encoding → model prediction"
4. **Frontend**: "Component-based React with Recharts for D3-level visualizations"
5. **AI**: "Prompt-engineered GPT responses with real data as context"

---

*Built as a portfolio capstone project — 3rd year Data Science student*
