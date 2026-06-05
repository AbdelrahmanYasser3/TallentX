# Intelligent Employment System (IES) - Product Requirements Document

## 1. Project Overview
The Intelligent Employment System (IES) is a modern, AI-driven recruitment platform designed to seamlessly connect job seekers (Candidates) with employers (Recruiters/Companies). The system utilizes an Angular-based monolithic frontend heavily styled using the Stitch Design System, supported by a .NET Core Backend REST API.

## 2. Platform Roles
- **Candidate:** Individuals searching for jobs. Can register, build a profile, browse jobs, and obtain AI-driven match scores.
- **Employer/Company Admin:** The primary creator of a company's profile. Can post jobs, view applicant tracking systems, and invite other recruiters.
- **Recruiter:** HR staff linked to a specific company to manage interviews and applications.

## 3. Core Features & Testing Scope
### 3.1 Authentication & Registration Flow
- **Candidate Registration (`/register/candidate`):** Gathers personal details including First Name, Last Name, Email, Password, Date of Birth, and Gender. Communicates with `/api/Auth/register`.
- **Company Registration (`/register/employer`):** Gathers both Recruiter personal details and Company entity details (Tax number, Industry, Website). Communicates with `/api/Auth/register/company`.
- **Login:** Receives JWT token from backend mapped to specific user roles and company IDs.

### 3.2 Main Dashboards (Bento Grid UI)
- **Candidate Dashboard:** Displays "Active Applications", "Upcoming Interviews", "Saved Jobs", and an "AI Match Score" widget.
- **Recruiter Dashboard:** Displays organization-wide metrics including "Hire Rate", "Total Applicants", "Active Job Posts", and an AI "Market Demand Forecast".

## 4. Technical Architecture
- **Frontend Domain:** http://localhost:4200 (Angular 17)
- **Backend Domain:** http://localhost:5065 (ASP.NET Core REST API)
- Backend Database: SQL Server utilizing Entity Framework Core.
- System utilizes stateless JWT authentication and handles cross-origin resource sharing (CORS) seamlessly.
