# SnapCheck 2.0

> A modern assessment management platform that automates grading of paper-based multiple-choice examinations using Optical Mark Recognition (OMR).

![Status](https://img.shields.io/badge/status-active-success)
![Frontend](https://img.shields.io/badge/frontend-React-61DAFB)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Database](https://img.shields.io/badge/database-SQLite-blue)
![License](https://img.shields.io/badge/license-Educational-lightgrey)

---

# Overview

SnapCheck 2.0 is a web-based assessment management platform developed for professors and instructors.

The application simplifies the process of administering paper-based examinations by allowing educators to create assessments, generate answer sheets, scan completed papers using Optical Mark Recognition (OMR), automatically grade submissions, and analyze student performance.

Instead of replacing paper examinations, SnapCheck modernizes the grading workflow, enabling educators to save hours of manual work while improving grading consistency and accuracy.

---

# Why SnapCheck?

Many educational institutions still rely on printed examinations because they are practical and easy to administer.

However, grading paper exams manually presents several challenges:

- Time-consuming grading process
- Manual score computation
- Human error
- Difficult record management
- Limited assessment analytics

SnapCheck addresses these challenges through intelligent grading automation.

---

# Key Features

## Classroom Management

- Create and manage multiple classrooms
- Organize assessments by class
- Maintain student rosters
- Semester-wide gradebook

---

## Assessment Builder

- Create quizzes and examinations
- Configure number of items and choices
- Build answer keys
- Generate printable answer sheets

---

## OMR Scanner

The scanner is the flagship feature of SnapCheck.

Capabilities include:

- Upload scanned papers
- Perspective correction
- Bubble detection
- Student ID recognition
- Automatic grading
- Manual review for ambiguous papers
- Batch scanning

---

## Gradebook

Assessment-specific gradebook featuring:

- Student scores
- Missing submissions
- Manual score overrides
- Scan deletion
- Student reassignment

---

## Item Analysis

Automatically generates statistics for every question:

- Correct answer
- Correct response count
- Percentage correct
- Difficulty identification

---

## Semester Gradebook

Provides an overview of student performance across multiple assessments within a classroom.

---

# Technology Stack

## Frontend

- React
- Vite
- JavaScript
- Zustand
- Custom CSS

---

## Backend

- FastAPI
- SQLAlchemy
- SQLite

---

## Image Processing

- OpenCV
- Custom Vision Engine

---

# Project Structure

```
SnapCheck-v2/

backend/
frontend/
docs/

README.md
```

For detailed documentation, see the `docs/` directory.

---

# Documentation

The project includes comprehensive documentation.

| Document             | Description               |
| -------------------- | ------------------------- |
| PROJECT_CONTEXT.md   | Complete project overview |
| ARCHITECTURE.md      | System architecture       |
| DEVELOPMENT_GUIDE.md | Development standards     |
| ROADMAP.md           | Development roadmap       |
| API_CONVENTIONS.md   | API standards             |
| DATABASE_SCHEMA.md   | Database design           |
| DECISIONS.md         | Architecture decisions    |

---

# Installation

## Clone the repository

```bash
git clone <repository-url>
cd SnapCheck-v2
```

---

## Backend

```bash
cd backend

python -m venv .venv
```

Activate the virtual environment.

Windows PowerShell

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies.

```bash
pip install -r requirements.txt
```

Run the backend.

```bash
uvicorn app.main:app --reload
```

Backend:

```
http://localhost:8000
```

---

## Frontend

Open a new terminal.

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```
http://localhost:5173
```

---

# Future Roadmap

Upcoming improvements include:

- PostgreSQL migration
- User authentication
- JWT authorization
- Cloud deployment
- Production readiness
- Automated testing

See `ROADMAP.md` for details.

---

# Design Philosophy

SnapCheck is designed as a professional productivity tool rather than a traditional educational platform.

The interface draws inspiration from modern SaaS applications such as:

- Linear
- GitHub
- Stripe Dashboard
- Notion
- Vercel

The goal is to create software that educators can use efficiently every day.

---

# Development Principles

This project follows several engineering principles:

- Feature-based frontend architecture
- Service-oriented backend
- RESTful API design
- Reusable component system
- Separation of concerns
- Incremental refactoring

---

# Current Status

Current Version:

```
SnapCheck 2.0
```

Project Status:

- Core Features ✅
- OMR Scanner ✅
- Gradebook ✅
- Assessment Analytics ✅
- UI/UX Improvements 🔄
- Authentication ⏳
- PostgreSQL Migration ⏳

---

# Contributors

Developed as a Computer Science capstone project.

Contributors:

- Your Name
- Team Member 1
- Team Member 2

---

# License

This project was developed for educational purposes.

All rights reserved by the project authors.
