# PRD - Product Requirements Document
# Intelligent Employment System (IES)

---

## 1. Product Overview

### 1.1 Product Name
**Intelligent Employment System (IES)**

### 1.2 Project Type
Graduation Project - AI-Powered Recruitment Platform

### 1.3 Executive Summary
The Intelligent Employment System is a comprehensive web platform that connects job-seeking candidates with recruiters and companies. The system is differentiated by AI-powered resume scoring, skill extraction, assessment generation, and intelligent text-based interviews, providing a more efficient and accurate hiring process.

### 1.4 Vision
Simplify and automate the recruitment process through artificial intelligence, while providing a seamless experience for both candidates and recruiters.

### 1.5 Timeline
- **Project Started**: March 2026
- **MVP Target**: March 2026 (Phases 1-11 complete)
- **Future Phases**: 12-14 planned for email, real-time notifications, and full AI integration

---

## 2. Goals and Metrics

### 2.1 Product Goals
| # | Goal | Success Metric |
|---|------|-----------------|
| 1 | Automate candidate-to-job matching using AI | AI matching accuracy ≥ 75% |
| 2 | Provide complete hiring pipeline | Support all stages: apply → assess → interview → accept/reject |
| 3 | Support 200 concurrent users | API response time < 2 seconds per request |
| 4 | Deliver production-ready MVP | All 63+ API endpoints fully functional |

### 2.2 Success Metrics (KPIs)
- **Performance**: API response time < 2 seconds per request
- **Availability**: System uptime 99% during demo period
- **Security**: Zero critical OWASP Top 10 vulnerabilities
- **Coverage**: 63+ API endpoints fully operational
- **Code Quality**: Clean Architecture with clear separation of concerns

---

## 3. Target Users

### 3.1 User Segments

#### Candidate (Job Seeker)
- **Description**: Individual searching for employment opportunities
- **Needs**: Create profile, upload resume, search jobs, apply, track applications
- **Pain Points**: Finding suitable jobs, lack of application status visibility, insufficient feedback
- **Key Features Used**: Profile management, resume upload, job search, application tracking

#### Recruiter (Hiring Manager)
- **Description**: Employee at a company responsible for managing hiring
- **Needs**: Post jobs, screen applicants, schedule interviews, manage hiring pipeline
- **Pain Points**: Volume of applications, manual screening difficulty, time-consuming filtering
- **Key Features Used**: Job posting, applicant filtering, interview scheduling, pipeline management

#### Admin Recruiter (Hiring Manager Lead)
- **Description**: Senior recruiter responsible for entire recruitment process at a company
- **Needs**: Manage company, invite new recruiters, transfer admin rights, access analytics
- **Pain Points**: Team management complexity, permission distribution
- **Key Features Used**: Company management, recruiter invitations, administrative controls

---

## 4. Functional Requirements

### 4.1 Authentication & Registration Module

| Requirement | Description | Priority | Frontend Notes |
|-------------|-------------|----------|-----------------|
| REQ-AUTH-01 | Register new candidate (name, email, password, gender, DOB) | High | Form with email validation, password strength indicator |
| REQ-AUTH-02 | Register company + admin recruiter in one step | High | Two-step form (company info + recruiter info) |
| REQ-AUTH-03 | Register recruiter via 6-character invite code | High | Form with code input field, validation before submission |
| REQ-AUTH-04 | Login with email and password (JWT - 24-hour validity) | High | Standard login form, store JWT in localStorage |
| REQ-AUTH-05 | Logout with token revocation (JTI Blacklisting) | High | Clear stored JWT and redirect to login |
| REQ-AUTH-06 | Request password reset | Medium | Email input form, show confirmation message |
| REQ-AUTH-07 | Change password | Medium | Current password + new password form with validation |

**Password Policy**: Minimum 8 characters, requires uppercase + lowercase + digit + special character

**Display Error Messages**:
- "Invalid email format"
- "Password must be at least 8 characters with uppercase, lowercase, digit, and special character"
- "Email already registered"
- "Invalid login credentials"
- "Invalid or expired invite code"
- "Passwords do not match"

**Three Registration Paths**:
```
1. Candidate ← POST /api/auth/register
2. Company + Admin ← POST /api/auth/register/company (atomic transaction)
3. Recruiter ← POST /api/auth/register/recruiter (validates invite code)
```

**JWT Token Information**:
- Issued in response to login/registration
- Valid for 24 hours
- Contains: NameIdentifier (userId), Email, Role, UserType (Candidate/Recruiter), JTI (for logout)
- Store in `localStorage` with key `auth_token`
- Send in Authorization header: `Authorization: Bearer <token>`

**Frontend Implementation Example**:
```typescript
// Store JWT after login/registration
localStorage.setItem('auth_token', response.data.token);

// Remove JWT on logout
localStorage.removeItem('auth_token');

// Include in HTTP requests
headers.Authorization = 'Bearer ' + localStorage.getItem('auth_token');
```

### 4.2 Candidate Profile Module

| Requirement | Description | Priority | Frontend Notes |
|-------------|-------------|----------|-----------------|
| REQ-CAND-01 | View complete profile | High | Read-only view showing all profile information |
| REQ-CAND-02 | Edit profile (job title, summary, years of experience, career level, address) | High | Form with auto-save or explicit save button |
| REQ-CAND-03 | Upload resume (PDF/DOCX - max 10MB) | High | Drag-and-drop or file input, progress indicator, validation |
| REQ-CAND-04 | Delete resume | Medium | Confirm before deletion, show success message |
| REQ-CAND-05 | Generate AI-enhanced CV | Medium | Show loading indicator while AI processes, download generated CV |
| REQ-CAND-06 | Upload profile picture | Medium | Image preview, crop tool, square format recommended |
| REQ-CAND-07 | Manage skills (add/edit/delete with proficiency level) | High | Select from dropdown or create new skill, choose level (Beginner/Intermediate/Expert) |
| REQ-CAND-08 | Manage education (academic qualifications) | High | Form for degree, field, institution, graduation year |
| REQ-CAND-09 | Manage work experience | High | Form for job title, company, description, start/end dates |
| REQ-CAND-10 | View submitted applications (paginated) | High | Table with job title, company, status, application date, sort/filter options |
| REQ-CAND-11 | Save/unsave favorite jobs | Medium | Toggle bookmark icon on job cards |

**Career Level Options**: Entry / Junior / MidLevel / Senior / Lead / Manager / Director / Executive

**TypeScript Interfaces for Frontend**:
```typescript
interface CandidateProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string; // ISO date format YYYY-MM-DD
  jobTitle: string;
  summary: string;
  yearsOfExperience: number;
  careerLevel: CareerLevel;
  linkedInUrl: string;
  portfolioUrl: string;
  address: string;
  city: string;
  country: string;
  profilePicturePath: string;
  isActive: boolean;
  createdAt: string; // ISO timestamp
}

interface Resume {
  resumeId: string;
  candidateId: string;
  filePath: string;
  uploadedAt: string;
  isDefault: boolean;
}

interface Skill {
  skillId: string;
  name: string;
  category: 'Technical' | 'Language' | 'Soft' | 'Tool' | 'Other';
}

interface CandidateSkill {
  candidateSkillId: string;
  skillId: string;
  skillName: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Expert';
  category: string;
}

interface Education {
  educationId: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: number;
}

interface Experience {
  experienceId: string;
  jobTitle: string;
  company: string;
  description: string;
  startDate: string; // ISO date
  endDate: string; // ISO date or null for current
}
```

**File Upload Notes**:
- Backend accepts FormData with file key
- Supported types: PDF, DOCX
- Max size: 10MB
- Return path to access uploaded file: `/Uploads/[filename]`

### 4.3 Company Management Module

| Requirement | Description | Priority | Frontend Notes |
|-------------|-------------|----------|---|
| REQ-COMP-01 | View company profile | High | Display company info: name, industry, website, description, logo |
| REQ-COMP-02 | Edit company information (Admin only) | High | Form with fields for name, industry, website, tax number, description |
| REQ-COMP-03 | Transfer admin rights to another recruiter | Medium | Dropdown to select target recruiter, confirmation dialog |
| REQ-COMP-04 | View count of active invitations | Low | Badge or counter showing active invite codes |

**TypeScript Interface**:
```typescript
interface Company {
  companyId: string;
  name: string;
  industry: string;
  website: string;
  taxNumber: string;
  description: string;
  logoPicturePath: string;
  isActive: boolean;
  createdAt: string;
}

interface CompanyInviteCode {
  inviteCodeId: string;
  companyId: string;
  code: string; // 6 alphanumeric characters
  maxUses: number; // usually 5
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
}
```

### 4.4 Job Posting Module

| Requirement | Description | Priority | Frontend Notes |
|-------------|-------------|----------|---|
| REQ-JOB-01 | View all active jobs (paginated) | High | Job cards with basic info, pagination controls, loading state |
| REQ-JOB-02 | View specific job details | High | Full job description, required skills, salary range, application button |
| REQ-JOB-03 | View jobs from specific company | High | Filter or navigate to company jobs |
| REQ-JOB-04 | Create new job posting | High | Form with title, description, location, job type, work location, salary min/max, required skills |
| REQ-JOB-05 | Edit job posting | High | Form to modify existing job details |
| REQ-JOB-06 | Delete job posting (Soft Delete) | High | Confirm before deletion, jobs become invisible to candidates |
| REQ-JOB-07 | Search jobs by keyword | High | Search input field, searches in title and description |
| REQ-JOB-08 | Filter jobs by skill | Medium | Skill dropdown or multi-select |
| REQ-JOB-09 | Filter jobs by employment type | Medium | Checkbox or dropdown with FullTime/PartTime/Contract/Internship |

**Display Recommendations**:
- Use cards for job listings
- Show: job title, company name, location, job type, work location, salary range
- Add "Apply" button for candidates
- Add bookmark icon for saving jobs
- Use badges for job type and work location
- Show AI match score if calculated

**TypeScript Interfaces**:
```typescript
interface JobPost {
  jobPostId: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  aiProcessedDescription: string; // AI-enhanced version
  location: string;
  jobType: 'FullTime' | 'PartTime' | 'Contract' | 'Internship';
  workLocation: 'OnSite' | 'Remote' | 'Hybrid';
  careerLevel: CareerLevel;
  salaryMin: number;
  salaryMax: number;
  expiryDate: string;
  isPublished: boolean;
  requiredSkills: JobPostSkill[];
  createdAt: string;
  deletedAt: string | null; // null if not deleted
}

interface JobPostSkill {
  jobPostSkillId: string;
  jobPostId: string;
  skillId: string;
  skillName: string;
  isRequired: boolean;
  requiredLevel: 'Beginner' | 'Intermediate' | 'Expert';
}

interface JobListResponse {
  items: JobPost[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

### 4.5 Job Application Module

| Requirement | Description | Priority | Frontend Notes |
|-------------|-------------|----------|---|
| REQ-APP-01 | Apply for a job | High | Single-click apply (uses default resume) or select resume before applying |
| REQ-APP-02 | View application details | High | Show job title, company, status in pipeline, match score, recruiter notes |
| REQ-APP-03 | View candidate's applications | High | Paginated list with status badges, date applied, company name |
| REQ-APP-04 | View applicants for a job (Recruiter) | High | Table with candidate name, match score, status, actions (move to next stage/reject) |
| REQ-APP-05 | Filter applicants by status | High | Dropdown or tabs: Pending, UnderReview, Assessment, Interview, Accepted, Rejected, Withdrawn |
| REQ-APP-06 | Check if already applied | Medium | API call before showing apply button, prevent duplicate applications |
| REQ-APP-07 | Update application status (pipeline) | High | Status dropdown for recruiters, with confirmation |
| REQ-APP-08 | Withdraw application (Pending status only) | Medium | Confirmation dialog, only available from Pending status |

**Hiring Pipeline State Machine**:
```
                    ╔═══════╗
                    ║ Start ║
                    ╚═══╤═══╝
                        │
                        ▼
                    ┌────────┐
  Withdraw ────→│ Pending │
  (Candidate)    └────┬───┘
                       │ Move Forward
         Reject ───    │
  (Recruiter)  │       ▼
               │   ┌──────────┐
               │   │UnderReview│
               │   └────┬──────┘
               │        │ Approve
               └───     │
                   │    ▼
                   └─┌──────────┐
                     │Assessment│
                     └────┬─────┘
                          │ Pass
                          │
                          ▼
                     ┌──────────┐
                     │ Interview│
                     └────┬─────┘
                          │ Pass
                          │
                          ▼
                     ┌────────┐
                     │Accepted│ ✓ TERMINAL
                     └────────┘
```

**Terminal States**: Accepted, Rejected, Withdrawn (no transitions possible)

**Frontend Display**:
- Use progress bar or timeline to show current pipeline stage
- Show badges with status colors:
  - Pending: Yellow (#FFC107)
  - UnderReview: Blue (#2196F3)
  - Assessment: Purple (#9C27B0)
  - Interview: Orange (#FF9800)
  - Accepted: Green (#4CAF50)
  - Rejected: Red (#F44336)
  - Withdrawn: Gray (#9E9E9E)
- Show AI match score (0-100) as percentage
- Display match report in expandable section

**TypeScript Interfaces**:
```typescript
interface JobApplication {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  jobPostId: string;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  matchScore: number; // 0-100
  matchReport: string;
  recruiterRating: number | null; // 1-5 or null
  recruiterNotes: string;
  appliedAt: string;
  withdrawnAt: string | null;
}

type ApplicationStatus =
  | 'Pending'
  | 'UnderReview'
  | 'Assessment'
  | 'Interview'
  | 'Accepted'
  | 'Rejected'
  | 'Withdrawn';

interface ApplicationResponse {
  items: JobApplication[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

### 4.6 Interview Module

| Requirement | Description | Priority | Frontend Notes |
|-------------|-------------|----------|---|
| REQ-INT-01 | Schedule interview (AI text or Live) | High | Form with interview type, date/time, meeting link for Live interviews |
| REQ-INT-02 | View interview details | High | Show type, scheduled time, score, feedback, meeting link |
| REQ-INT-03 | View interviews for an application | High | Display all interviews linked to an application |
| REQ-INT-04 | View candidate's interviews | High | Paginated list with job title, company, interview type, status, date |
| REQ-INT-05 | View recruiter's interviews | High | Assigned interviews for the recruiter with candidates |
| REQ-INT-06 | Filter by status | Medium | Scheduled, InProgress, Completed, Cancelled |
| REQ-INT-07 | Update interview details | Medium | Reschedule, update meeting link, add notes |
| REQ-INT-08 | Cancel interview | Medium | Confirmation dialog, free up slot |

**Interview Types**:
- **AI Interview**: Text-based conversation with AI, automated scoring
- **Live Interview**: Real-time video call with recruiter via WebRTC (meeting link required)

**Display Recommendations**:
- Show countdown timer for scheduled interviews
- AI interviews: Show question, text input, submit button
- Live interviews: Show meeting link (clickable), preparation notes
- Show interview status with visual indicators
- Display score after completion (for AI interviews)

**TypeScript Interfaces**:
```typescript
interface Interview {
  interviewId: string;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  type: 'AI' | 'Live';
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
  scheduledAt: string;
  completedAt: string | null;
  score: number | null; // 0-100, only for AI interviews
  feedback: string;
  meetingLink: string; // for Live interviews
  createdAt: string;
}

interface AIQuestion {
  questionId: string;
  question: string;
  expectedAnswer?: string;
  points: number;
}

interface AIInterviewSession {
  interviewId: string;
  questions: AIQuestion[];
  currentQuestionIndex: number;
  userAnswer: string;
  totalScore: number;
  status: 'InProgress' | 'Completed';
}
```

### 4.7 Skills Module

| Requirement | Description | Priority | Frontend Notes |
|-------------|-------------|----------|---|
| REQ-SKL-01 | View all candidate skills | High | List with skill name, category, proficiency level |
| REQ-SKL-02 | Add skill with proficiency level | High | Select skill from dropdown or create new, choose level |
| REQ-SKL-03 | Update skill proficiency level | Medium | Edit dialog to change level |
| REQ-SKL-04 | Delete skill | Medium | Confirmation dialog |
| REQ-SKL-05 | Filter skills by proficiency level | Low | Filter tabs or dropdown |

**Skill Proficiency Levels**: Beginner / Intermediate / Expert

**Skill Categories**: Technical / Language / Soft / Tool / Other

**Recommended UI**: Skill tags/cards with category color coding

### 4.8 Education & Experience Modules

| Requirement | Description | Priority | Frontend Notes |
|-------------|-------------|----------|---|
| REQ-EDU-01 | Full CRUD for academic qualifications | High | Form with degree, field, institution, graduation year |
| REQ-EXP-01 | Full CRUD for work experience | High | Form with job title, company, description, start/end dates |

---

## 5. AI Modules

### 5.1 Planned AI Capabilities

| # | Capability | Description | Current Status |
|---|------------|-------------|-----------------|
| AI-01 | Resume Scoring | Match resume to job description (0-100) + detailed report | Stub |
| AI-02 | Skill Extraction | Extract structured skills from text documents | Stub |
| AI-03 | Assessment Generation | Generate test questions from job description | Stub |
| AI-04 | CV Enhancement | Improve resume using AI suggestions | Stub |
| AI-05 | Interview Question Generation | Create custom interview questions based on job + skills | Stub |
| AI-06 | Interview Answer Scoring | Evaluate candidate responses to interview questions | Stub |

> **Note**: All AI capabilities currently return stub/default values. Real implementation via Python Microservice at `http://localhost:8000` in Phase 14.

**Frontend Considerations**:
- Show loading spinners during AI-powered operations (match scoring, CV generation)
- Display AI-generated content separately (e.g., "AI-Enhanced Resume" tab)
- Implement caching to avoid redundant API calls
- Handle AI service unavailability gracefully

---

## 6. Non-Functional Requirements

### 6.1 Performance
| Requirement | Target Value |
|-------------|---------------|
| API Response Time | < 2 seconds |
| Concurrent Users | 200 users |
| Max File Size | 10 MB |
| Supported File Types | PDF, DOCX |
| Database Query Time | < 500ms (with proper indexing) |
| Frontend Page Load | < 3 seconds |

### 6.2 Security
| Requirement | Details |
|-------------|---------|
| Authentication | JWT Bearer Token (24-hour validity) |
| Encryption | HTTPS/TLS required |
| Password Storage | ASP.NET Identity with hashing (PBKDF2) |
| CSRF Protection | CORS restricted to `http://localhost:4200` |
| Error Handling | No sensitive information in error responses |
| TOCTOU Prevention | Concurrent request handling in auth module |
| Token Revocation | JTI-based blacklisting in memory cache |
| Input Validation | Server-side validation for all inputs |
| File Upload Security | Content-type validation, virus scanning recommended |

**Frontend Security Best Practices**:
- Never store sensitive data in localStorage (except JWT)
- Always validate input before submission
- Use HTTPS-only communication
- Implement CSRF tokens in forms (if POST without JSON body)
- Sanitize user-generated content before display
- Use CSP (Content Security Policy) headers
- Implement rate limiting on client-side to prevent abuse
- Never log sensitive data to console in production

### 6.3 Scalability & Architecture
| Aspect | Details |
|--------|---------|
| Architecture Pattern | Clean Architecture (Onion Pattern) |
| Database | SQL Server LocalDB (development) |
| ORM | Entity Framework Core 10 with async/await |
| API Style | RESTful with JSON payload |
| Pagination | Implement for all list endpoints (pageNumber, pageSize) |
| Caching | IMemoryCache for token blacklist and frequently accessed data |
| Soft Deletes | All destructive operations use soft delete |
| Scalability Notes | Use pagination everywhere, async operations, connection pooling |

### 6.4 Compatibility
| Component | Technology |
|-----------|------------|
| Frontend Framework | Angular 17+ (separate team) |
| Frontend URL | `http://localhost:4200` |
| Backend Service | ASP.NET Core 10 on `http://localhost:5000` or `https://localhost:5001` for HTTPS |
| Frontend Communication | HTTP/HTTPS with JSON payloads |
| Data Format | ISO 8601 for dates, 24-hour UTC timestamps |

---

## 7. Data Model

### 7.1 Entity Relationships Diagram

```
┌─────────────────────────────────────────────────┐
│          ApplicationUser (IdentityUser)          │
│  FirstName, LastName, Gender, DateOfBirth,      │
│  ProfilePicturePath, IsActive, CreatedAt        │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────┐         ┌──────────────┐
│CandidateUser │         │  Recruiter   │
│ JobTitle     │         │ CompanyId    │
│ Summary      │         │RecruiterRole │
│YearsOfExp    │         └──────┬───────┘
│CareerLevel   │                │
│LinkedIn/Port │                ▼
│Address/City  │          ┌──────────┐
└──────┬───────┘          │ Company  │
       │                  └──────────┘
       │
       ├─→ CandidateEducation
       ├─→ CandidateExperience
       ├─→ CandidateSkill ──→ Skill
       ├─→ Resume ──→ ResumeSkill ──→ Skill
       ├─→ JobApplication ──→ JobPost ──→ JobPostSkill ──→ Skill
       ├─→ SavedJob ──→ JobPost
       ├─→ CandidateAssessment ──→ Assessment ──→ Question
       ├─→ Interview
       └─→ Notification
```

### 7.2 Entity Count & Junction Tables
- **Total Entities**: 20
- **User Types**: 2 (CandidateUser, Recruiter via TPH inheritance)
- **Junction Entities**: 5 (CandidateSkill, JobPostSkill, ResumeSkill, CandidateAssessment, SavedJob)
- **Enums**: 12 different enumeration types

### 7.3 Date & Time Handling

All dates should be handled as ISO 8601 format strings:
- **Full Timestamp**: `2026-03-14T10:30:00Z` (UTC with Z suffix)
- **Date Only**: `2026-03-14` (no time component)
- **Frontend**: Convert to local timezone for display, send to backend in UTC

**Example in Angular**:
```typescript
// Backend sends: "2026-03-14T10:30:00Z"
// Frontend displays: new Date("2026-03-14T10:30:00Z").toLocaleDateString()

// When sending back to backend: Convert to UTC
const date = new Date(localDatePickerValue);
const isoString = date.toISOString(); // Ensures UTC with Z suffix
```

---

## 8. API Endpoints

### 8.1 Complete Endpoint Summary

| Module | Base Path | Endpoint Count | Status |
|--------|-----------|-----------------|--------|
| Authentication | `/api/auth` | 7 | ✅ Ready |
| Company | `/api/company` | 4 | ✅ Ready |
| Candidates | `/api/candidates` | 11 | ✅ Ready |
| Job Posting | `/api/jobposting` | 9 | ✅ Ready |
| Job Application | `/api/jobapplication` | 8 | ✅ Ready |
| Interviews | `/api/interview` | 8 | ✅ Ready |
| Education | `/api/education` | 5 | ✅ Ready |
| Experience | `/api/experience` | 5 | ✅ Ready |
| Skills | `/api/skill` | 6 | ✅ Ready |
| **TOTAL** | | **63 endpoints** | |

### 8.2 Authentication Levels

**Public (No Auth Required)**:
- All `/api/auth` endpoints except logout

**JWT Required**:
- All other endpoints require valid JWT token
- Header: `Authorization: Bearer <token>`

**Role-Based Access**:
- Admin Recruiter: Company management, recruiter invitations
- Recruiter: Job posting, applicant management
- Candidate: Profile, applications, job search

### 8.3 API Response Format

**Success Response (2xx)**:
```json
{
  "data": { /* response data */ },
  "message": "Operation successful",
  "isSuccess": true
}
```

**Paginated Response**:
```json
{
  "data": {
    "items": [ /* array of items */ ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 100,
    "totalPages": 10
  },
  "message": "Retrieved successfully",
  "isSuccess": true
}
```

**Error Response (4xx, 5xx)**:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly error message",
    "details": "Additional technical details (development only)"
  },
  "isSuccess": false
}
```

**Common HTTP Status Codes**:
- `200 OK`: Successful GET/PUT/DELETE
- `201 Created`: Successful POST with resource creation
- `400 Bad Request`: Invalid input validation
- `401 Unauthorized`: Missing or invalid JWT
- `403 Forbidden`: Insufficient permissions for resource
- `404 Not Found`: Resource does not exist
- `409 Conflict`: Business logic violation (e.g., duplicate email)
- `422 Unprocessable Entity`: Validation errors details
- `500 Internal Server Error`: Server error (rare in production)

### 8.4 Detailed Endpoint Reference

**See API contracts in `/specs/001-ies-backend-implementation/contracts/` for complete endpoint documentation including:**
- `auth-contract.md`
- `candidates-contract.md`
- `companies-contract.md`
- `jobs-contract.md`
- `jobapplications-contract.md`
- `interviews-contract.md`
- `assessments-contract.md`
- `ai-contract.md`

---

## 9. Frontend Integration Guide

### 9.1 Setup & Configuration

**Environment Variables** (`.env` or `environment.ts`):
```typescript
// Angular environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000', // or https://localhost:5001 for HTTPS
  apiTimeout: 30000, // milliseconds
  imageUploadMaxSize: 10 * 1024 * 1024, // 10MB
  resumeUploadMaxSize: 10 * 1024 * 1024, // 10MB
};
```

**CORS Policy**:
- Backend allows: `http://localhost:4200`
- Methods: `GET, POST, PUT, DELETE`
- Headers: `Content-Type, Authorization`

### 9.2 HTTP Client Setup (Required)

**AuthInterceptor** (Add JWT token to all requests):
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('auth_token');
    if (token && !req.url.includes('/api/auth/register') && !req.url.includes('/api/auth/login')) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req);
  }
}

// Add to AppModule
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }
]
```

**ErrorInterceptor** (Handle error responses):
```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('auth_token');
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          // Show permission denied
          console.error('Permission denied:', error);
        } else if (error.status === 404) {
          // Show not found
          console.error('Resource not found:', error);
        } else if (error.status === 409) {
          // Handle conflict (e.g., duplicate email)
          console.error('Conflict:', error.error?.error?.message);
        }
        return throwError(() => error);
      })
    );
  }
}
```

### 9.3 Module Organization Recommendation

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── candidate.service.ts
│   │   │   ├── company.service.ts
│   │   │   ├── job.service.ts
│   │   │   ├── application.service.ts
│   │   │   ├── interview.service.ts
│   │   │   ├── skill.service.ts
│   │   │   ├── education.service.ts
│   │   │   └── experience.service.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── role.guard.ts
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts
│   │   │   └── error.interceptor.ts
│   │   └── models/ (TypeScript interfaces)
│   │       ├── auth.model.ts
│   │       ├── candidate.model.ts
│   │       ├── job.model.ts
│   │       ├── application.model.ts
│   │       ├── interview.model.ts
│   │       └── common.model.ts
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── auth-layout/
│   │   ├── dashboard/
│   │   ├── candidates/
│   │   │   ├── profile/
│   │   │   ├── resume/
│   │   │   ├── skills/
│   │   │   └── applications/
│   │   ├── recruiter/
│   │   │   ├── job-posting/
│   │   │   ├── applicants/
│   │   │   └── interviews/
│   │   ├── jobs/
│   │   │   ├── job-list/
│   │   │   ├── job-details/
│   │   │   └── job-search/
│   │   ├── applications/
│   │   │   └── application-tracking/
│   │   ├── interviews/
│   │   │   ├── ai-interview/
│   │   │   └── interview-list/
│   │   ├── company/
│   │   └── shared/
│   └── shared/
│       ├── components/ (reusable UI components)
│       │   ├── navbar/
│       │   ├── sidebar/
│       │   ├── pagination/
│       │   ├── loading/
│       │   └── error-message/
│       ├── directives/
│       ├── pipes/
│       └── utils/
└── assets/
```

### 9.4 Key Services Template

**AuthService**:
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  registerCandidate(data: CandidateRegistration): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/register`, data);
  }

  registerCompany(data: CompanyRegistration): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/register/company`, data);
  }

  registerRecruiter(data: RecruiterRegistration, inviteCode: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/api/auth/register/recruiter?code=${inviteCode}`,
      data
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/login`, { email, password });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/logout`, {});
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getCurrentUserRole(): string | null {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    const decoded = jwt_decode(token);
    return decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  }
}
```

**CandidateService**:
```typescript
@Injectable({ providedIn: 'root' })
export class CandidateService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<{ data: CandidateProfile }> {
    return this.http.get<{ data: CandidateProfile }>(`${this.apiUrl}/api/candidates/profile`);
  }

  updateProfile(profile: Partial<CandidateProfile>): Observable<{ data: CandidateProfile }> {
    return this.http.put<{ data: CandidateProfile }>(`${this.apiUrl}/api/candidates/profile`, profile);
  }

  uploadResume(file: File): Observable<{ data: Resume }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ data: Resume }>(`${this.apiUrl}/api/candidates/resume`, formData);
  }

  deleteResume(resumeId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/candidates/resume/${resumeId}`);
  }

  generateCV(): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/api/candidates/resume/generate-cv`, {},
      { responseType: 'blob' });
  }

  getApplications(pageNumber: number, pageSize: number): Observable<{ data: ApplicationResponse }> {
    return this.http.get<{ data: ApplicationResponse }>(
      `${this.apiUrl}/api/candidates/applications?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  }

  getSavedJobs(pageNumber: number, pageSize: number): Observable<{ data: JobListResponse }> {
    return this.http.get<{ data: JobListResponse }>(
      `${this.apiUrl}/api/candidates/saved-jobs?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  }

  toggleSaveJob(jobId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/candidates/saved-jobs/${jobId}`, {});
  }
}
```

**JobService**:
```typescript
@Injectable({ providedIn: 'root' })
export class JobService {
  constructor(private http: HttpClient) {}

  getJobs(pageNumber: number, pageSize: number): Observable<{ data: JobListResponse }> {
    return this.http.get<{ data: JobListResponse }>(
      `${this.apiUrl}/api/jobposting?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  }

  getJobDetails(id: string): Observable<{ data: JobPost }> {
    return this.http.get<{ data: JobPost }>(`${this.apiUrl}/api/jobposting/${id}`);
  }

  searchJobs(term: string): Observable<{ data: JobListResponse }> {
    return this.http.get<{ data: JobListResponse }>(
      `${this.apiUrl}/api/jobposting/search/${encodeURIComponent(term)}`
    );
  }

  filterBySkill(skillId: string): Observable<{ data: JobListResponse }> {
    return this.http.get<{ data: JobListResponse }>(
      `${this.apiUrl}/api/jobposting/skill/${skillId}`
    );
  }

  filterByType(jobType: string): Observable<{ data: JobListResponse }> {
    return this.http.get<{ data: JobListResponse }>(
      `${this.apiUrl}/api/jobposting/type/${jobType}`
    );
  }

  createJob(job: Partial<JobPost>): Observable<{ data: JobPost }> {
    return this.http.post<{ data: JobPost }>(`${this.apiUrl}/api/jobposting`, job);
  }

  updateJob(id: string, job: Partial<JobPost>): Observable<{ data: JobPost }> {
    return this.http.put<{ data: JobPost }>(`${this.apiUrl}/api/jobposting/${id}`, job);
  }

  deleteJob(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/jobposting/${id}`);
  }
}
```

### 9.5 Guard Implementation (Auth Protection)

**AuthGuard** (Protect routes that require authentication):
```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}

// Usage in routing
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];
```

**RoleGuard** (Protect routes by role):
```typescript
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'];
    const userRole = this.authService.getCurrentUserRole();

    if (userRole === requiredRole) {
      return true;
    }
    this.router.navigate(['/forbidden']);
    return false;
  }
}

// Usage
const recruiterRoutes: Routes = [
  { path: 'jobs', component: JobManagementComponent, canActivate: [RoleGuard], data: { role: 'Recruiter' } }
];
```

### 9.6 Pagination Component

**Pagination Handling** (Recommended pattern):
```typescript
@Component({
  selector: 'app-paginated-list',
  template: `
    <div class="list-container">
      <div class="items">
        <div *ngFor="let item of items" class="item">
          <!-- Item content -->
        </div>
      </div>

      <div *ngIf="totalPages > 1" class="pagination">
        <button (click)="previousPage()" [disabled]="pageNumber === 1">← Previous</button>

        <span class="page-info">
          Page {{ pageNumber }} of {{ totalPages }}
        </span>

        <button (click)="nextPage()" [disabled]="pageNumber === totalPages">Next →</button>
      </div>
    </div>
  `
})
export class PaginatedListComponent implements OnInit {
  @Input() items: any[] = [];
  @Input() pageNumber = 1;
  @Input() pageSize = 10;
  @Input() totalCount = 0;
  @Input() totalPages = 0;

  @Output() pageChange = new EventEmitter<number>();

  previousPage() {
    if (this.pageNumber > 1) {
      this.pageChange.emit(this.pageNumber - 1);
    }
  }

  nextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageChange.emit(this.pageNumber + 1);
    }
  }
}
```

**Parent Component Usage**:
```typescript
@Component({
  selector: 'app-jobs-list',
  template: `
    <app-paginated-list
      [items]="jobs"
      [pageNumber]="pageNumber"
      [pageSize]="pageSize"
      [totalCount]="totalCount"
      [totalPages]="totalPages"
      (pageChange)="onPageChange($event)">
    </app-paginated-list>
  `
})
export class JobsListComponent implements OnInit {
  jobs: JobPost[] = [];
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  constructor(private jobService: JobService) {}

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.jobService.getJobs(this.pageNumber, this.pageSize).subscribe(response => {
      this.jobs = response.data.items;
      this.totalCount = response.data.totalCount;
      this.totalPages = response.data.totalPages;
    });
  }

  onPageChange(pageNumber: number) {
    this.pageNumber = pageNumber;
    this.loadJobs();
  }
}
```

### 9.7 Application & Interview Pipeline Display

**Status Badge Component**:
```typescript
@Component({
  selector: 'app-status-badge',
  template: `
    <span [ngClass]="'status-' + (status | lowercase)">{{ status }}</span>
  `,
  styles: [`
    .status-pending { background: #FFC107; color: black; }
    .status-underreview { background: #2196F3; color: white; }
    .status-assessment { background: #9C27B0; color: white; }
    .status-interview { background: #FF9800; color: white; }
    .status-accepted { background: #4CAF50; color: white; }
    .status-rejected { background: #F44336; color: white; }
    .status-withdrawn { background: #9E9E9E; color: white; }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string;
}
```

**Pipeline Progress Component**:
```typescript
@Component({
  selector: 'app-pipeline-progress',
  template: `
    <div class="pipeline">
      <div *ngFor="let stage of stages" [ngClass]="'stage ' + (stage === currentStage ? 'active' : 'inactive')">
        {{ stage }}
      </div>
    </div>
  `,
  styles: [`
    .pipeline { display: flex; gap: 10px; }
    .stage { padding: 10px 20px; border: 1px solid #ccc; }
    .stage.active { background: #4CAF50; color: white; }
  `]
})
export class PipelineProgressComponent {
  @Input() currentStage: ApplicationStatus;
  stages: ApplicationStatus[] = ['Pending', 'UnderReview', 'Assessment', 'Interview', 'Accepted'];
}
```

### 9.8 File Upload Handling

**Resume Upload Component**:
```typescript
@Component({
  selector: 'app-resume-upload',
  template: `
    <div class="upload-container">
      <input type="file" #fileInput (change)="onFileSelected($event)"
             accept=".pdf,.docx" hidden>

      <button (click)="fileInput.click()">Choose Resume</button>

      <div *ngIf="selectedFile" class="file-info">
        {{ selectedFile.name }} ({{ (selectedFile.size / 1024 / 1024).toFixed(2) }}MB)
        <button (click)="uploadResume()">Upload</button>
      </div>

      <div *ngIf="uploadProgress > 0 && uploadProgress < 100" class="progress">
        <div class="progress-bar" [style.width.%]="uploadProgress"></div>
      </div>

      <div *ngIf="uploadError" class="error">{{ uploadError }}</div>
      <div *ngIf="uploadSuccess" class="success">Resume uploaded successfully!</div>
    </div>
  `
})
export class ResumeUploadComponent {
  selectedFile: File | null = null;
  uploadProgress = 0;
  uploadError = '';
  uploadSuccess = false;

  constructor(private candidateService: CandidateService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      const file = files[0];

      // Validate
      if (file.size > 10 * 1024 * 1024) {
        this.uploadError = 'File too large (max 10MB)';
        return;
      }

      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        this.uploadError = 'Only PDF and DOCX files are allowed';
        return;
      }

      this.selectedFile = file;
      this.uploadError = '';
    }
  }

  uploadResume() {
    if (!this.selectedFile) return;

    this.candidateService.uploadResume(this.selectedFile).subscribe({
      next: (response) => {
        this.uploadSuccess = true;
        this.selectedFile = null;
      },
      error: (error) => {
        this.uploadError = error.error?.error?.message || 'Upload failed';
      }
    });
  }
}
```

### 9.9 Form Validation Examples

**Reactive Forms with Custom Validators**:
```typescript
@Component({
  selector: 'app-login-form',
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label>Email</label>
        <input type="email" formControlName="email" />
        <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="error">
          Invalid email format
        </div>
      </div>

      <div class="form-group">
        <label>Password</label>
        <input type="password" formControlName="password" />
        <div *ngIf="loginForm.get('password')?.errors?.['minlength']" class="error">
          Password must be at least 8 characters
        </div>
        <div *ngIf="loginForm.get('password')?.errors?.['pattern']" class="error">
          Password must contain uppercase, lowercase, digit, and special character
        </div>
      </div>

      <button [disabled]="loginForm.invalid || isLoading">
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
  `
})
export class LoginFormComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.authService.login(
      this.loginForm.value.email,
      this.loginForm.value.password
    ).subscribe({
      next: (response) => {
        localStorage.setItem('auth_token', response.data.token);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        alert(error.error?.error?.message || 'Login failed');
      }
    });
  }
}
```

### 9.10 Error Handling & User Feedback

**Global Error Handler Service**:
```typescript
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private errorSubject = new Subject<string>();
  public error$ = this.errorSubject.asObservable();

  handleError(error: HttpErrorResponse): void {
    let message = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      message = error.error.message;
    } else {
      // Backend error
      message = error.error?.error?.message || error.statusText || message;
    }

    this.errorSubject.next(message);
  }
}

// Usage in component
export class MyComponent implements OnInit {
  constructor(private errorHandler: ErrorHandlerService) {
    this.errorHandler.error$.subscribe(error => {
      // Show toast/snackbar with error message
      console.log('Error:', error);
    });
  }
}
```

### 9.11 Performance Optimization Tips

1. **Lazy Loading**: Load modules only when needed
```typescript
const routes: Routes = [
  { path: 'recruiter', loadChildren: () => import('./recruiter/recruiter.module').then(m => m.RecruiterModule) },
  { path: 'candidate', loadChildren: () => import('./candidate/candidate.module').then(m => m.CandidateModule) }
];
```

2. **OnPush Change Detection**:
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobCardComponent {
  @Input() job: JobPost;
}
```

3. **Unsubscribe Pattern**:
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => this.data = data);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

4. **Use async Pipe**:
```typescript
@Component({
  template: `<div>{{ (jobs$ | async)?.items.length }} jobs available</div>`
})
export class JobsComponent {
  jobs$ = this.jobService.getJobs(1, 10);
}
```

### 9.12 Testing Strategy

**Unit Tests Sample**:
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should call login endpoint', () => {
    service.login('test@test.com', 'password123!').subscribe();

    const req = httpMock.expectOne('http://localhost:5000/api/auth/login');
    expect(req.request.method).toBe('POST');
    httpMock.verify();
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

---

## 10. Tech Stack

### 10.1 Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| .NET | 10.0 | Main framework |
| ASP.NET Core | 10.0 | Web API |
| Entity Framework Core | 10.0.3 | ORM |
| ASP.NET Identity | - | User management & auth |
| JWT Bearer | - | Token-based auth |
| AutoMapper | - | Object mapping |
| Swagger/Swashbuckle | 10.1.4 | API documentation |
| SignalR | - | Real-time notifications (planned) |
| SQL Server LocalDB | - | Development database |

### 10.2 Frontend (Recommended)
| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 17+ | Frontend framework |
| TypeScript | 5+ | Language |
| RxJS | 7+ | Reactive programming |
| Angular Forms | - | Form handling |
| Angular Router | - | Navigation |
| HttpClientModule | - | HTTP requests |
| NgRx/Akita | - | State management (recommended) |
| Bootstrap/Material | - | UI components |
| Cypress/Jasmine | - | Testing |

### 10.3 External Services
| Service | Technology | Status |
|---------|-----------|--------|
| AI Microservice | Python FastAPI | Stub (Phase 14) |
| Email Service | SMTP (Gmail) | Planned (Phase 12) |
| Notifications | SignalR | Planned (Phase 13) |
| Storage | Local filesystem | Active |

---

## 11. Common Frontend Scenarios

### Scenario 1: Candidate Registration & Login
1. Show registration form with fields
2. Display password strength indicator
3. Validate password policy client-side
4. On submit: `POST /api/auth/register`
5. Store JWT in localStorage
6. Redirect to profile completion
7. Show error message if email exists (409 Conflict)

### Scenario 2: Job Application with AI Scoring
1. Display job details
2. Show "Apply" button
3. On click: `POST /api/jobapplication/apply`
4. Show status loader while AI scores resume
5. Display match score and report to candidate
6. Show success message
7. Update candidate's applications list

### Scenario 3: Recruiter Screening Applicants
1. Display all applicants in table
2. Show filter by status
3. Click on applicant "View Details"
4. Show profile, match score, match report
5. Provide action buttons:
   - "Move to Assessment" → `PUT /api/jobapplication/{id}/status`
   - "Reject" → Same endpoint with "Rejected" status
6. Show confirmation dialog before status change
7. Update table after successful transition

---

## 12. Project Structure

```
Intelligent_Employment_System/
│
├── Core/
│   ├── Domain/                    # Entities, Enums, Repository Interfaces
│   ├── Services/                  # Business logic implementations
│   └── Services.Abstractions/     # Service interfaces + DTOs
│
├── Infrastructure/
│   ├── Persistence/              # EF Core DbContext, Configurations, Repositories
│   └── Presentation/             # Controllers (Auth, Candidates, Company)
│
├── Shared/                       # Cross-cutting concerns (Pagination, Configuration)
│
├── IES.api/                      # Composition root: Program.cs, DI, middleware
│
├── specs/                        # Design specifications, API contracts
└── testsprite_tests/             # Test execution reports
```

---

## 13. Phases & Roadmap

### 13.1 Completed Phases (1-11) ✅

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1 | Project setup & architecture | ✅ Complete |
| Phase 2 | Data model & entities | ✅ Complete |
| Phase 3 | Authentication & registration | ✅ Complete |
| Phase 4 | Candidate profile & resume | ✅ Complete |
| Phase 5 | Design review & refinements | ✅ Complete |
| Phase 6 | Company management | ✅ Complete |
| Phase 7 | Job postings | ✅ Complete |
| Phase 8 | Job applications & pipeline | ✅ Complete |
| Phase 9 | Interviews | ✅ Complete |
| Phase 10 | Education, experience, skills | ✅ Complete |
| Phase 11 | Auth fixes & testing | ✅ Complete |

### 13.2 Planned Future Phases (12-14) 📋

| Phase | Focus | Timeline |
|-------|-------|----------|
| Phase 12 | Email notifications | Q2 2026 |
| Phase 13 | SignalR real-time updates | Q2 2026 |
| Phase 14 | Full AI service integration | Q3 2026 |

---

## 14. Key Documentation Files

- `Frontend_Integration_Guide.md` - Complete integration guide (300+ lines)
- `API_ANALYSIS_AND_TEST_RESULTS.md` - Comprehensive API documentation
- `API_TEST_COLLECTION.http` - 70+ runnable tests
- `COMPREHENSIVE_TEST_PLAN.md` - Full test strategy
- `PROJECT_STATUS_SUMMARY.md` - High-level status overview
- `/specs/001-ies-backend-implementation/contracts/` - API contracts for each module

---

## 15. Important Notes for Frontend Team

### 15.1 Critical Implementation Details

**Token Management**:
- JWT valid for 24 hours only
- No refresh tokens - re-login required after expiry
- Store in localStorage, clear on logout
- Include in Authorization header for all requests

**Date/Time Handling**:
- Backend sends ISO 8601 UTC format (e.g., `2026-03-14T10:30:00Z`)
- Frontend should display in local timezone
- When sending back, convert to UTC ISO format

**Error Handling**:
- Always handle 401 errors by redirecting to login
- Show user-friendly messages from `error.error?.error?.message`
- Never expose technical error details to users

**File Uploads**:
- Use FormData, not JSON
- Validate file size and type on client
- Show progress indicator during upload
- Handle network timeouts gracefully

**Pagination**:
- Always implement pagination for list endpoints
- Start from pageNumber=1 (not 0)
- Respect pageSize parameter from backend
- Show total count and current page info

### 15.2 Common API Response Patterns

**Single Item Response**:
```json
{
  "data": { "id": "123", "name": "John Doe" },
  "message": "Success",
  "isSuccess": true
}
```

**List Response**:
```json
{
  "data": {
    "items": [ { "id": "1" }, { "id": "2" } ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 100,
    "totalPages": 10
  },
  "message": "Success",
  "isSuccess": true
}
```

**Error Response**:
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Email already registered",
    "details": null
  },
  "isSuccess": false
}
```

### 15.3 Swagger Documentation

- Access at: `http://localhost:5000/swagger` (during development)
- Try-it-out feature available for all endpoints
- Request/response examples provided
- Authorization flow documented

### 15.4 Testing the Backend

**Using VS Code REST Client**:
1. Install "REST Client" extension
2. Use `API_TEST_COLLECTION.http` file
3. Click "Send Request" on each API call
4. Review response in output panel

**Using Postman**:
1. Create new Collection
2. Add requests for each endpoint
3. Use environment variables for {{apiUrl}} and {{token}}
4. Test each operation flow

---

## 16. Frontend Routing Example

**Suggested Route Structure**:
```typescript
const routes: Routes = [
  // Auth routes (no guard)
  { path: 'auth', children: [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'register-company', component: RegisterCompanyComponent },
    { path: 'register-recruiter/:code', component: RegisterRecruiterComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password/:token', component: ResetPasswordComponent }
  ]},

  // Candidate routes
  { path: 'candidate', canActivate: [AuthGuard], canActivateChild: [RoleGuard],
    data: { role: 'Candidate' }, children: [
    { path: 'dashboard', component: CandidateDashboardComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'resumes', component: ResumesComponent },
    { path: 'jobs', component: JobsSearchComponent },
    { path: 'applications', component: ApplicationsComponent },
    { path: 'interviews', component: InterviewsComponent }
  ]},

  // Recruiter routes
  { path: 'recruiter', canActivate: [AuthGuard], canActivateChild: [RoleGuard],
    data: { role: 'Recruiter' }, children: [
    { path: 'dashboard', component: RecruiterDashboardComponent },
    { path: 'jobs', component: JobManagementComponent },
    { path: 'applicants', component: ApplicantsComponent },
    { path: 'interviews', component: InterviewManagementComponent },
    { path: 'company', component: CompanyManagementComponent }
  ]},

  // Default
  { path: '', redirectTo: '/candidate/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' }
];
```

---

## 17. Accessibility Guidelines

- Use semantic HTML (`<header>`, `<main>`, `<nav>`)
- Implement ARIA labels for form inputs
- Ensure keyboard navigation works for all interactive elements
- Use sufficient color contrast (WCAG AA standard)
- Provide alt text for all images
- Use focus indicators
- Test with screen readers (NVDA, JAWS)

---

## 18. Version & Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-14 | Initial PRD with all 63+ endpoints, complete frontend integration guide |

---

## 19. Sign-off & Approval

**Document Version**: 1.0
**Created**: 2026-03-14
**Last Updated**: 2026-03-14
**Owner**: Backend Team
**Frontend Owner**: [Frontend Team Name]

---

> **This PRD is a comprehensive guide for full system implementation. Please refer to specific contract files in `/specs/` for detailed API specifications.**
>
> **For questions or clarifications contact the Backend Team or Frontend Integration Lead.**
