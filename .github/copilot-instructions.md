# Copilot Instructions

## Project Overview

This repository contains a full-stack workout tracking application.

The app is designed primarily for **mobile usage** and focuses on simple strength training tracking with progression features.

Users can:

- create workout plans
- log exercises
- track progress
- view strength score
- track weekly streaks

---

# Architecture

The application follows a simple full-stack structure:

Frontend:
React + TypeScript + Tailwind

Backend:
.NET Web API + Entity Framework Core

Database:
PostgreSQL (hosted on Render)

Auth:
Auth0 with JWT access tokens

Flow:

React frontend
↓
.NET API
↓
PostgreSQL database

---

# Frontend Structure

Main frontend folders:

src/
pages/
components/
data/
storage/
types.ts

Important:

Pages should not interact with localStorage directly.

All storage logic must go through:

storage/

- planStorage
- logStorage
- statsStorage

This abstraction allows replacing localStorage with API calls later.

---

# Backend Structure

Backend is located in:

apps/api

The API uses:

- ASP.NET Core
- Entity Framework Core
- PostgreSQL

Authentication is handled via Auth0 JWT tokens.

The user id is extracted from the token and used as `UserId` in database models.

---

# Backend Domain Models

Main entities:

Plan
PlanDay
PlanDayExercise
WorkoutLog
UserProgress

These represent:

User plan
Workout structure
Exercise configuration
Workout history
User training progress

Derived statistics such as:

- strength score
- PRs
- weekly stats
- trends

should NOT be stored in the database.  
They should be calculated from workout logs.

---

# Coding Guidelines

When generating code:

- prefer simple and readable implementations
- avoid unnecessary abstractions
- avoid introducing new dependencies unless necessary
- follow existing project structure
- keep models simple
- prefer explicit types

Frontend:

- mobile-first UI
- minimal UI complexity
- Tailwind-based styling
- keep components simple

Backend:

- simple REST endpoints
- minimal logic in controllers
- use EF Core entities
- keep services clean and focused

---

# Important Rules

Copilot should:

- respect existing architecture
- not refactor unrelated code
- not introduce heavy frameworks
- not move files unnecessarily

Focus on incremental improvements and clear structure.
