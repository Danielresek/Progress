# Progress Workout App – Copilot Instructions

This repository contains a mobile-first workout tracking web application.

## Tech Stack

- React
- TypeScript
- TailwindCSS
- Vite
- Auth0 for authentication
- LocalStorage for temporary persistence

A backend API will be added later, so avoid tightly coupling logic to localStorage.

## Project Structure

apps/web/src

pages/

- TodayPage.tsx
- TodayRunPage.tsx
- PlanPage.tsx
- PlanDayPage.tsx
- ProgressPage.tsx

components/

- AppShell.tsx
- BottomNav.tsx
- ProtectedRoute.tsx

data/

- exercises.ts

## Data Storage

Currently stored in localStorage:

- workouttracker.logs.v1
- workouttracker.plan.v1
- workouttracker.weekIndex.v1

These will later be migrated to a backend.

## Coding Guidelines

When modifying code:

- Keep solutions simple.
- Avoid unnecessary refactoring.
- Do not modify unrelated files.
- Do not introduce new dependencies unless explicitly asked.
- Prefer small changes inside existing files.
- Preserve existing UI layout and Tailwind styling.
- Follow existing TypeScript patterns used in the project.

## Feature Development

When implementing new features:

1. Reuse existing data structures.
2. Prefer adding logic over restructuring architecture.
3. Keep changes minimal and readable.
4. Maintain compatibility with localStorage data.

## Goal of the Project

The goal is to build a clean, simple workout tracking app focused on:

- logging workouts quickly
- tracking PRs
- weekly progress
- strength score
- progression suggestions
