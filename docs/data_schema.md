# Data Schema Mapping

## Kaggle Dataset
- Total rows: ~9000+ rows
- Total columns: 10+

## Column Mapping
| Our Field | Kaggle Column | Notes |
|-----------|---------------|-------|
| title | job_title | 125 unique job titles |
| category | job_category | 10 categories available |
| salary_min | salary_in_usd | Convert USD to INR (×83) |
| experience | experience_level | L/M/S → Junior/Mid/Senior |
| location | employee_residence | Country code |
| job_type | company_size | Map to Full-time |
| work_year | work_year | 2020-2023 trend data |

## Data Quality Notes
- salary_in_usd has 1786 unique values — good for distribution analysis
- experience_level encoded as L/M/S — needs decoding
- No skills column — we'll generate skills per category
- salary_currency has 11 currencies — we'll use salary_in_usd only
- work_year 2020-2023 — perfect for trend/prediction analysis

## Key Insights
- 10 job categories — richer than our current 5
- Multi-year data — enables time series ML predictions
- Global dataset — filter for relevant roles