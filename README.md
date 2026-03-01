# TRINETRA

## Overview
TRINETRA is a rapid alert platform designed to help locate missing children faster through verified police authentication and structured citizen participation.

The system enables authorized police personnel to create and manage alerts, while citizens can view active cases and report sightings with photo evidence.

---

## Problem Statement
Many missing child cases face delays in spreading alerts to nearby communities.  
Existing systems often lack structured public involvement and real time evidence collection.

A secure and role based alert system is needed to improve response time and reduce false reporting.

---

## Solution
TRINETRA provides a role based authentication system where:

- Police authorities register using official identification details.
- Verified police users can create and manage missing child alerts.
- Citizens can view active alerts and submit sighting reports with photo evidence.
- Alerts can be marked as resolved once the child is found.

---

## Core Features

### Police Verification
Police registration requires official details and police ID verification before account creation.

### Role Based Dashboards
Separate dashboards for police and citizens with controlled access.

### Alert Creation and Management
Police can create alerts with child details, last known location, and photo upload.
Active alerts can be marked as resolved.

### Citizen Alert Access
Citizens can view currently active alerts.

### Report Sighting with Camera Access
Citizens must upload photo evidence while reporting a sighting to improve credibility and reduce false reports.

---

## System Workflow

1. Police registers and gets verified.
2. Police logs in and creates an alert.
3. Alert becomes visible to citizens.
4. Citizens report sightings with photo evidence.
5. Police reviews reports.
6. Police marks alert as resolved.

---

## Tech Stack

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS
- PostCSS

Backend and Services:
- Supabase

Development Tools:
- PNPM
- Node.js

---

## Project Structure

src – Application source code  
public – Static assets  
supabase – Backend configuration  
index.html – Root HTML file  
vite.config.ts – Vite configuration  

---

## Future Enhancements

- AI based risk zone prediction
- Live map integration
- Real time notification system
- Mobile application version

---

## Author
Jishvitha
