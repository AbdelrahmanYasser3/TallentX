import { JobLevel } from '../models/candidate.models';
import { PublicJobDto } from '../utils/job.mapper';
import { JobCategory } from './job-categories';

interface JobTemplate {
  title: string;
  description: string;
  requirements: string;
  skills: string[];
  careerLevel: JobLevel;
  jobType: PublicJobDto['jobType'];
  workLocation: PublicJobDto['workLocation'];
  salaryMin: number;
  salaryMax: number;
  currency?: string;
}

const COMPANIES = [
  { id: 101, name: 'Stripe' },
  { id: 102, name: 'Shopify' },
  { id: 103, name: 'Datadog' },
  { id: 104, name: 'Cloudflare' },
  { id: 105, name: 'Notion' },
  { id: 106, name: 'Figma' },
  { id: 107, name: 'Revolut' },
  { id: 108, name: 'Spotify' },
  { id: 109, name: 'Delivery Hero' },
  { id: 110, name: 'Siemens Digital' },
  { id: 111, name: 'Careem' },
  { id: 112, name: 'Swvl' },
  { id: 113, name: 'Vodafone Egypt' },
  { id: 114, name: 'Instabug' },
  { id: 115, name: 'Wuzzuf Labs' },
  { id: 116, name: 'Raya Digital' },
  { id: 117, name: 'Valu FinTech' },
  { id: 118, name: 'Breadfast Tech' },
  { id: 119, name: 'Odoo MENA' },
  { id: 120, name: 'Microsoft MEA' },
  { id: 121, name: 'Amazon Web Services' },
  { id: 122, name: 'Google Cloud' },
  { id: 123, name: 'IBM Cairo Lab' },
  { id: 124, name: 'Orange Business' },
];

const LOCATIONS = [
  'Cairo, Egypt',
  'Giza, Egypt',
  'Alexandria, Egypt',
  'Dubai, UAE',
  'Riyadh, Saudi Arabia',
  'Amman, Jordan',
  'Remote — MENA',
  'Remote — Global',
  'London, UK',
  'Berlin, Germany',
  'Hybrid — Cairo',
  'Hybrid — Dubai',
];

const CATEGORY_TEMPLATES: Record<JobCategory, JobTemplate[]> = {
  frontend: [
    {
      title: 'Senior Frontend Engineer (React)',
      description:
        'Own customer-facing web experiences for a high-traffic hiring platform. You will lead component architecture, performance budgets, and accessibility improvements across the product suite.',
      requirements:
        '5+ years with React and TypeScript; strong CSS/Tailwind skills; experience with state management and design systems; familiarity with Vitest or Jest.',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'RxJS', 'Accessibility'],
      careerLevel: 'Senior',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 42000,
      salaryMax: 62000,
    },
    {
      title: 'Angular Developer',
      description:
        'Build enterprise dashboards and recruiter workflows using Angular standalone APIs, reactive forms, and lazy-loaded feature modules.',
      requirements:
        '3+ years Angular; HTTP interceptors; route guards; experience integrating REST APIs and handling complex form validation.',
      skills: ['Angular', 'TypeScript', 'NgRx', 'SCSS', 'REST APIs'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'OnSite',
      salaryMin: 28000,
      salaryMax: 42000,
    },
    {
      title: 'Frontend Engineer — Design Systems',
      description:
        'Evolve our stitch-aligned component library, document patterns, and partner with UX on tokens, spacing, and responsive layouts.',
      requirements:
        'Experience building reusable UI kits; Storybook; Figma handoff; strong eye for visual polish.',
      skills: ['Storybook', 'Figma', 'CSS', 'React', 'Design Tokens'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 38000,
      salaryMax: 55000,
    },
    {
      title: 'Junior Frontend Developer',
      description:
        'Join a mentorship-heavy squad shipping landing pages, job search, and candidate onboarding flows.',
      requirements:
        '1–2 years web development; HTML/CSS/JS fundamentals; eagerness to learn React or Angular.',
      skills: ['JavaScript', 'HTML', 'CSS', 'Git', 'Responsive UI'],
      careerLevel: 'Junior',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 18000,
      salaryMax: 26000,
    },
    {
      title: 'Frontend Performance Engineer',
      description:
        'Profile Core Web Vitals, optimize bundles, and implement caching strategies for global job listings.',
      requirements:
        'Lighthouse, Webpack/Vite, CDN knowledge; experience diagnosing render bottlenecks.',
      skills: ['Performance', 'Vite', 'Webpack', 'LCP', 'CDN'],
      careerLevel: 'Senior',
      jobType: 'Contract',
      workLocation: 'Remote',
      salaryMin: 50000,
      salaryMax: 72000,
    },
    {
      title: 'Vue.js Engineer',
      description:
        'Maintain legacy Vue modules while incrementally migrating features to our modern Angular stack.',
      requirements:
        'Vue 3 composition API; Pinia; unit tests; comfort with cross-framework collaboration.',
      skills: ['Vue.js', 'Pinia', 'TypeScript', 'Vitest', 'Migration'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 32000,
      salaryMax: 48000,
    },
  ],
  backend: [
    {
      title: 'Senior .NET Backend Engineer',
      description:
        'Design RESTful APIs, EF Core data models, and background jobs powering authentication, job postings, and applications.',
      requirements:
        'ASP.NET Core 8+, C#, SQL Server, JWT auth, clean architecture; experience with OpenAPI/Swagger.',
      skills: ['.NET', 'C#', 'EF Core', 'SQL Server', 'REST'],
      careerLevel: 'Senior',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 45000,
      salaryMax: 68000,
    },
    {
      title: 'Node.js Backend Developer',
      description:
        'Build microservices for notifications, search indexing, and webhook integrations with ATS partners.',
      requirements:
        'Node 20+, Express/Fastify, PostgreSQL, Redis, message queues.',
      skills: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Kafka'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 35000,
      salaryMax: 52000,
    },
    {
      title: 'Java Backend Engineer',
      description:
        'Implement scalable hiring pipeline services with Spring Boot and event-driven architecture.',
      requirements:
        'Spring Boot, JPA, Kafka, unit/integration tests, CI/CD familiarity.',
      skills: ['Java', 'Spring Boot', 'Kafka', 'JUnit', 'Maven'],
      careerLevel: 'Senior',
      jobType: 'FullTime',
      workLocation: 'OnSite',
      salaryMin: 48000,
      salaryMax: 70000,
    },
    {
      title: 'API Platform Engineer',
      description:
        'Own API versioning, rate limiting, and developer documentation for public job listing endpoints.',
      requirements:
        'API gateway experience; OAuth2; observability; strong communication skills.',
      skills: ['API Design', 'OAuth2', 'OpenAPI', 'Rate Limiting', 'Monitoring'],
      careerLevel: 'Lead',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 62000,
      salaryMax: 90000,
    },
    {
      title: 'Backend Engineer — Payments',
      description:
        'Integrate billing, subscriptions, and invoicing for employer plans on the TallentX marketplace.',
      requirements:
        'PCI-aware development; idempotent APIs; third-party payment SDKs.',
      skills: ['Payments', '.NET', 'Webhooks', 'Security', 'SQL'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 40000,
      salaryMax: 58000,
    },
    {
      title: 'Junior Backend Developer',
      description:
        'Support feature teams with CRUD endpoints, migrations, and automated tests under senior mentorship.',
      requirements:
        'OOP fundamentals; any backend framework; basic SQL; Git workflow.',
      skills: ['C#', 'SQL', 'Git', 'Unit Tests', 'REST'],
      careerLevel: 'Junior',
      jobType: 'FullTime',
      workLocation: 'OnSite',
      salaryMin: 16000,
      salaryMax: 24000,
    },
  ],
  fullstack: [
    {
      title: 'Full Stack Engineer (Angular + .NET)',
      description:
        'End-to-end ownership of recruiter dashboards—from Angular UI to ASP.NET Core services and deployment pipelines.',
      requirements:
        '4+ years full stack; Angular; .NET; Azure or AWS basics; Agile delivery.',
      skills: ['Angular', '.NET', 'SQL', 'Azure', 'CI/CD'],
      careerLevel: 'Senior',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 48000,
      salaryMax: 72000,
    },
    {
      title: 'Full Stack Developer — MERN',
      description:
        'Ship candidate matching features using MongoDB, Express, React, and Node with real-time updates.',
      requirements:
        'MERN stack; WebSockets or SignalR; testing culture.',
      skills: ['MongoDB', 'Express', 'React', 'Node.js', 'SignalR'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 36000,
      salaryMax: 54000,
    },
    {
      title: 'Staff Full Stack Engineer',
      description:
        'Set technical direction for hiring marketplace modules, mentor engineers, and drive cross-team RFCs.',
      requirements:
        '8+ years; system design; stakeholder management; proven delivery at scale.',
      skills: ['Architecture', 'Mentoring', 'System Design', 'Angular', '.NET'],
      careerLevel: 'Lead',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 85000,
      salaryMax: 120000,
    },
    {
      title: 'Full Stack Engineer — Internal Tools',
      description:
        'Build admin consoles for support teams: user impersonation, job moderation, and audit trails.',
      requirements:
        'RBAC patterns; audit logging; fast iteration with product ops.',
      skills: ['React', 'Node.js', 'RBAC', 'PostgreSQL', 'Admin UI'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 38000,
      salaryMax: 56000,
    },
    {
      title: 'Full Stack Contractor',
      description:
        '6-month contract to deliver public job catalog, search filters, and landing page API integration.',
      requirements:
        'Available 30+ hrs/week; prior marketplace or job board experience preferred.',
      skills: ['Angular', 'API Integration', 'Tailwind', 'Search', 'Pagination'],
      careerLevel: 'Senior',
      jobType: 'Contract',
      workLocation: 'Remote',
      salaryMin: 55000,
      salaryMax: 75000,
    },
    {
      title: 'Associate Full Stack Engineer',
      description:
        'Rotate across squads learning deployment, code review, and production support for hiring workflows.',
      requirements:
        'Bootcamp or CS degree; portfolio with full stack project; growth mindset.',
      skills: ['JavaScript', 'TypeScript', 'SQL', 'Git', 'Docker'],
      careerLevel: 'Entry',
      jobType: 'FullTime',
      workLocation: 'OnSite',
      salaryMin: 14000,
      salaryMax: 22000,
    },
  ],
  uiux: [
    {
      title: 'Senior Product Designer',
      description:
        'Lead end-to-end design for job discovery, application flows, and recruiter analytics with usability testing.',
      requirements:
        '5+ years product design; Figma; design systems; B2B SaaS experience.',
      skills: ['Figma', 'UX Research', 'Prototyping', 'Design Systems', 'Usability'],
      careerLevel: 'Senior',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 44000,
      salaryMax: 65000,
    },
    {
      title: 'UI/UX Designer',
      description:
        'Craft polished interfaces aligned with Material-inspired tokens, dark mode, and accessible color contrast.',
      requirements:
        'Portfolio with web apps; interaction design; collaboration with frontend engineers.',
      skills: ['UI Design', 'Figma', 'Accessibility', 'Motion', 'Wireframes'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 30000,
      salaryMax: 46000,
    },
    {
      title: 'UX Researcher',
      description:
        'Plan studies with candidates and recruiters to validate match score features and application funnels.',
      requirements:
        'Qualitative and quantitative research; interview facilitation; synthesis workshops.',
      skills: ['User Research', 'Interviews', 'Surveys', 'Journey Maps', 'Insights'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 34000,
      salaryMax: 50000,
    },
    {
      title: 'Visual Designer — Marketing',
      description:
        'Design landing pages, email campaigns, and social assets for employer brand launches.',
      requirements:
        'Brand guidelines; illustration or iconography skills; fast turnaround.',
      skills: ['Visual Design', 'Branding', 'Illustrator', 'Marketing', 'Landing Pages'],
      careerLevel: 'Junior',
      jobType: 'FullTime',
      workLocation: 'OnSite',
      salaryMin: 20000,
      salaryMax: 30000,
    },
    {
      title: 'Design Lead — Mobile',
      description:
        'Define iOS/Android patterns for job alerts, saved searches, and interview scheduling.',
      requirements:
        'Mobile HIG/Material; prototyping; cross-functional leadership.',
      skills: ['Mobile UX', 'Figma', 'iOS', 'Android', 'Leadership'],
      careerLevel: 'Lead',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 58000,
      salaryMax: 82000,
    },
    {
      title: 'UX Writer',
      description:
        'Own microcopy for onboarding, empty states, and error messages across the IES platform.',
      requirements:
        'Content design; plain language; localization awareness; A/B test collaboration.',
      skills: ['UX Writing', 'Content Design', 'Localization', 'Tone of Voice', 'A/B Tests'],
      careerLevel: 'MidLevel',
      jobType: 'PartTime',
      workLocation: 'Remote',
      salaryMin: 24000,
      salaryMax: 36000,
    },
  ],
  devops: [
    {
      title: 'DevOps Engineer',
      description:
        'Maintain Kubernetes clusters, Terraform modules, and zero-downtime deployments for API and SignalR hubs.',
      requirements:
        'K8s, Terraform, CI/CD (GitHub Actions), monitoring with Grafana/Prometheus.',
      skills: ['Kubernetes', 'Terraform', 'CI/CD', 'Docker', 'Monitoring'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 42000,
      salaryMax: 62000,
    },
    {
      title: 'Senior Site Reliability Engineer',
      description:
        'Define SLOs for job search latency, incident response playbooks, and capacity planning.',
      requirements:
        'SRE practices; on-call experience; blameless postmortems.',
      skills: ['SRE', 'SLOs', 'Incident Response', 'Linux', 'Cloud'],
      careerLevel: 'Senior',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 70000,
      salaryMax: 105000,
    },
    {
      title: 'Cloud Engineer — Azure',
      description:
        'Operate App Services, SQL elastic pools, and Key Vault secrets for production hiring workloads.',
      requirements:
        'Azure certifications a plus; IaC; networking fundamentals.',
      skills: ['Azure', 'ARM/Bicep', 'App Service', 'SQL', 'Security'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 45000,
      salaryMax: 68000,
    },
    {
      title: 'Platform Engineer',
      description:
        'Build internal developer portals, service templates, and golden-path deployment pipelines.',
      requirements:
        'Developer experience focus; scripting; documentation culture.',
      skills: ['Platform', 'Backstage', 'Python', 'Docker', 'Docs'],
      careerLevel: 'Senior',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 55000,
      salaryMax: 80000,
    },
    {
      title: 'DevSecOps Specialist',
      description:
        'Embed security scanning, dependency policies, and secrets rotation in CI pipelines.',
      requirements:
        'SAST/DAST tools; OWASP; container hardening.',
      skills: ['DevSecOps', 'SAST', 'Containers', 'OWASP', 'CI/CD'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'OnSite',
      salaryMin: 46000,
      salaryMax: 64000,
    },
    {
      title: 'Junior DevOps Associate',
      description:
        'Assist with pipeline maintenance, log aggregation, and staging environment refreshes.',
      requirements:
        'Linux basics; Docker; curiosity about cloud; scripting in Bash or Python.',
      skills: ['Linux', 'Docker', 'Bash', 'Git', 'AWS'],
      careerLevel: 'Junior',
      jobType: 'FullTime',
      workLocation: 'OnSite',
      salaryMin: 18000,
      salaryMax: 28000,
    },
  ],
  qa: [
    {
      title: 'QA Automation Engineer',
      description:
        'Build Playwright suites for registration, job search, and apply flows with CI gating on pull requests.',
      requirements:
        'Playwright or Cypress; API testing; test strategy documentation.',
      skills: ['Playwright', 'TypeScript', 'API Testing', 'CI', 'Test Plans'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 32000,
      salaryMax: 48000,
    },
    {
      title: 'Senior QA Engineer',
      description:
        'Lead quality across recruiter and candidate domains; champion shift-left practices.',
      requirements:
        '5+ years QA; risk-based testing; mentoring manual testers transitioning to automation.',
      skills: ['QA Leadership', 'Automation', 'Risk Analysis', 'Agile', 'Postman'],
      careerLevel: 'Senior',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 44000,
      salaryMax: 62000,
    },
    {
      title: 'Manual QA Tester — Arabic/English',
      description:
        'Execute test cases for bilingual UI, RTL layouts, and localized salary formats.',
      requirements:
        'Attention to detail; bug reporting; familiarity with web apps.',
      skills: ['Manual Testing', 'RTL', 'Bug Tracking', 'Jira', 'Regression'],
      careerLevel: 'Junior',
      jobType: 'FullTime',
      workLocation: 'OnSite',
      salaryMin: 14000,
      salaryMax: 22000,
    },
    {
      title: 'Performance Test Engineer',
      description:
        'Load-test public job listing endpoints and search under peak traffic scenarios.',
      requirements:
        'k6 or JMeter; APM tools; collaboration with backend on tuning.',
      skills: ['k6', 'JMeter', 'Load Testing', 'APM', 'SQL'],
      careerLevel: 'MidLevel',
      jobType: 'Contract',
      workLocation: 'Remote',
      salaryMin: 40000,
      salaryMax: 58000,
    },
    {
      title: 'SDET — .NET',
      description:
        'Develop integration tests for Auth and JobPosting APIs using xUnit and Testcontainers.',
      requirements:
        'C# test frameworks; containers; contract testing basics.',
      skills: ['xUnit', 'C#', 'Testcontainers', 'API Tests', '.NET'],
      careerLevel: 'Senior',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 48000,
      salaryMax: 70000,
    },
    {
      title: 'QA Intern',
      description:
        'Support sprint testing for mobile-responsive job cards and landing page featured jobs.',
      requirements:
        'Currently enrolled in CS or related field; analytical mindset.',
      skills: ['Testing', 'Documentation', 'Web', 'Mobile', 'Communication'],
      careerLevel: 'Entry',
      jobType: 'Internship',
      workLocation: 'Hybrid',
      salaryMin: 8000,
      salaryMax: 12000,
    },
  ],
  product: [
    {
      title: 'Senior Product Manager — Marketplace',
      description:
        'Define roadmap for public job catalog, SEO landing experiences, and conversion to candidate signup.',
      requirements:
        'B2B or marketplace PM experience; data-informed decisions; stakeholder alignment.',
      skills: ['Product Strategy', 'Roadmapping', 'Analytics', 'Agile', 'Hiring Tech'],
      careerLevel: 'Senior',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 52000,
      salaryMax: 78000,
    },
    {
      title: 'Product Manager — Recruiter Tools',
      description:
        'Own applicant tracking enhancements, pipeline statuses, and interview scheduling integrations.',
      requirements:
        'ATS domain knowledge; user interviews; PRD writing.',
      skills: ['PRDs', 'User Stories', 'ATS', 'Interviews', 'Metrics'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 40000,
      salaryMax: 60000,
    },
    {
      title: 'Associate Product Manager',
      description:
        'Partner with engineering on match score experiments and application funnel optimizations.',
      requirements:
        '1–3 years PM or analyst background; SQL basics; strong communication.',
      skills: ['Analytics', 'Experiments', 'SQL', 'Figma', 'Roadmaps'],
      careerLevel: 'Junior',
      jobType: 'FullTime',
      workLocation: 'OnSite',
      salaryMin: 24000,
      salaryMax: 36000,
    },
    {
      title: 'Technical Product Manager',
      description:
        'Bridge API consumers and internal teams on public job endpoints, pagination, and rate limits.',
      requirements:
        'Technical background; API product experience; developer empathy.',
      skills: ['APIs', 'Developer Experience', 'Documentation', 'Prioritization', 'SDKs'],
      careerLevel: 'Senior',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 58000,
      salaryMax: 85000,
    },
    {
      title: 'Product Owner — Growth',
      description:
        'Run experiments on featured jobs placement, search filters, and email job alerts.',
      requirements:
        'Growth experimentation; funnel analysis; cross-functional leadership.',
      skills: ['Growth', 'A/B Testing', 'SEO', 'Email', 'Conversion'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 42000,
      salaryMax: 62000,
    },
    {
      title: 'Director of Product',
      description:
        'Lead product org across candidate, recruiter, and company verticals for the IES platform.',
      requirements:
        '10+ years product leadership; P&L awareness; executive communication.',
      skills: ['Leadership', 'Strategy', 'Hiring', 'Vision', 'OKRs'],
      careerLevel: 'Director',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 95000,
      salaryMax: 140000,
    },
  ],
  data: [
    {
      title: 'Data Engineer',
      description:
        'Build ETL pipelines for job ingest, clickstream analytics, and recruiter dashboard metrics.',
      requirements:
        'Python, Spark or dbt, warehouse modeling (Snowflake/BigQuery), orchestration.',
      skills: ['Python', 'dbt', 'SQL', 'Airflow', 'ETL'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 44000,
      salaryMax: 66000,
    },
    {
      title: 'Senior Data Analyst',
      description:
        'Deliver insights on application rates, time-to-hire, and featured job click-through.',
      requirements:
        'SQL mastery; Looker/Metabase; storytelling with executives.',
      skills: ['SQL', 'Looker', 'Statistics', 'Dashboards', 'Insights'],
      careerLevel: 'Senior',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 40000,
      salaryMax: 58000,
    },
    {
      title: 'Analytics Engineer',
      description:
        'Define semantic layers and trusted metrics for company and candidate dashboards.',
      requirements:
        'dbt, data modeling, Git-based analytics workflows.',
      skills: ['dbt', 'Data Modeling', 'Git', 'SQL', 'Metrics'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 46000,
      salaryMax: 68000,
    },
    {
      title: 'Machine Learning Data Scientist',
      description:
        'Improve match score models using candidate skills, job requirements, and outcome labels.',
      requirements:
        'Python, scikit-learn, feature engineering; ML deployment basics.',
      skills: ['Python', 'ML', 'Feature Engineering', 'scikit-learn', 'Matching'],
      careerLevel: 'Senior',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 62000,
      salaryMax: 95000,
    },
    {
      title: 'Business Intelligence Developer',
      description:
        'Create recruiter-facing Power BI reports for pipeline health and sourcing channels.',
      requirements:
        'Power BI, DAX, SQL Server reporting services experience.',
      skills: ['Power BI', 'DAX', 'SQL', 'Reporting', 'Visualization'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'OnSite',
      salaryMin: 34000,
      salaryMax: 50000,
    },
    {
      title: 'Junior Data Analyst',
      description:
        'Support product and marketing with weekly dashboards on job listing performance.',
      requirements:
        'Excel/Sheets advanced; SQL fundamentals; curiosity about hiring data.',
      skills: ['SQL', 'Excel', 'Dashboards', 'Analysis', 'Communication'],
      careerLevel: 'Junior',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 18000,
      salaryMax: 28000,
    },
  ],
  mobile: [
    {
      title: 'Senior iOS Engineer',
      description:
        'Build SwiftUI screens for job alerts, saved searches, and one-tap apply with resume vault.',
      requirements:
        'Swift, SwiftUI, REST integration, App Store release experience.',
      skills: ['Swift', 'SwiftUI', 'UIKit', 'REST', 'App Store'],
      careerLevel: 'Senior',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 50000,
      salaryMax: 75000,
    },
    {
      title: 'Android Developer (Kotlin)',
      description:
        'Implement Material 3 job cards, filters, and push notifications for new matching roles.',
      requirements:
        'Kotlin, Jetpack Compose, Coroutines, Play Store deployments.',
      skills: ['Kotlin', 'Compose', 'Coroutines', 'Firebase', 'Material 3'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 36000,
      salaryMax: 54000,
    },
    {
      title: 'Flutter Mobile Engineer',
      description:
        'Deliver cross-platform candidate app sharing business logic with web authentication.',
      requirements:
        'Flutter 3+, state management, platform channels, CI for mobile.',
      skills: ['Flutter', 'Dart', 'Bloc', 'CI/CD', 'REST'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 38000,
      salaryMax: 56000,
    },
    {
      title: 'React Native Developer',
      description:
        'Maintain legacy React Native modules and migrate critical flows to unified design tokens.',
      requirements:
        'React Native, TypeScript, native debugging, OTA updates.',
      skills: ['React Native', 'TypeScript', 'Redux', 'Jest', 'Mobile UX'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 34000,
      salaryMax: 52000,
    },
    {
      title: 'Mobile Engineering Lead',
      description:
        'Set mobile architecture, code review standards, and release train for iOS/Android squads.',
      requirements:
        'Leadership; both platforms; security best practices for tokens.',
      skills: ['Leadership', 'iOS', 'Android', 'Architecture', 'Security'],
      careerLevel: 'Lead',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 72000,
      salaryMax: 100000,
    },
    {
      title: 'Junior Mobile Developer',
      description:
        'Fix UI bugs, implement designs, and write unit tests for job listing screens.',
      requirements:
        'One mobile platform; portfolio app; Git collaboration.',
      skills: ['Mobile', 'Git', 'UI', 'Testing', 'APIs'],
      careerLevel: 'Junior',
      jobType: 'FullTime',
      workLocation: 'OnSite',
      salaryMin: 16000,
      salaryMax: 26000,
    },
  ],
  aiml: [
    {
      title: 'Machine Learning Engineer',
      description:
        'Productionize resume parsing, skill extraction, and ranking models for job recommendations.',
      requirements:
        'Python, PyTorch or TensorFlow, MLOps, model monitoring.',
      skills: ['Python', 'PyTorch', 'MLOps', 'NLP', 'Docker'],
      careerLevel: 'Senior',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 65000,
      salaryMax: 98000,
    },
    {
      title: 'AI Engineer — LLM Applications',
      description:
        'Build copilots for cover letter drafting, interview prep, and recruiter screening assistance.',
      requirements:
        'LLM APIs, prompt engineering, guardrails, evaluation harnesses.',
      skills: ['LLMs', 'Prompt Engineering', 'RAG', 'Python', 'Safety'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 52000,
      salaryMax: 82000,
    },
    {
      title: 'Computer Vision Engineer',
      description:
        'Improve video interview analytics and proctoring signal quality with privacy-first design.',
      requirements:
        'CV models, edge deployment, ethics review collaboration.',
      skills: ['Computer Vision', 'Python', 'OpenCV', 'Privacy', 'Video'],
      careerLevel: 'Senior',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 58000,
      salaryMax: 88000,
    },
    {
      title: 'NLP Research Scientist',
      description:
        'Research semantic matching between job descriptions and candidate profiles beyond keywords.',
      requirements:
        'PhD or equivalent experience; publications; experimentation rigor.',
      skills: ['NLP', 'Research', 'Transformers', 'Python', 'Papers'],
      careerLevel: 'Lead',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 80000,
      salaryMax: 120000,
    },
    {
      title: 'MLOps Engineer',
      description:
        'Operate feature stores, model registries, and automated retraining for match score services.',
      requirements:
        'Kubeflow or MLflow; CI for models; observability.',
      skills: ['MLOps', 'MLflow', 'Kubernetes', 'Python', 'Monitoring'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 48000,
      salaryMax: 72000,
    },
    {
      title: 'AI Product Analyst',
      description:
        'Measure AI feature adoption, quality scores, and user trust in automated recommendations.',
      requirements:
        'Analytics; AI product familiarity; experiment design.',
      skills: ['Analytics', 'AI Products', 'SQL', 'Experiments', 'Metrics'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 38000,
      salaryMax: 56000,
    },
  ],
  support: [
    {
      title: 'IT Support Specialist — L2',
      description:
        'Support employees and customers with SSO issues, browser troubleshooting, and access requests.',
      requirements:
        '2+ years IT support; ticketing systems; customer empathy.',
      skills: ['IT Support', 'SSO', 'Windows', 'macOS', 'Ticketing'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'OnSite',
      salaryMin: 22000,
      salaryMax: 34000,
    },
    {
      title: 'Technical Support Engineer',
      description:
        'Help recruiters configure job posts, invite codes, and integration webhooks.',
      requirements:
        'SaaS support experience; API troubleshooting; clear documentation.',
      skills: ['SaaS', 'APIs', 'Documentation', 'Zendesk', 'Troubleshooting'],
      careerLevel: 'Junior',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 18000,
      salaryMax: 28000,
    },
    {
      title: 'Customer Success Manager — Enterprise',
      description:
        'Onboard enterprise employers, drive adoption of analytics, and renew annual contracts.',
      requirements:
        'CSM experience; QBRs; upsell collaboration with sales.',
      skills: ['Customer Success', 'Onboarding', 'QBR', 'SaaS', 'Retention'],
      careerLevel: 'Senior',
      jobType: 'FullTime',
      workLocation: 'Hybrid',
      salaryMin: 40000,
      salaryMax: 62000,
    },
    {
      title: 'Help Desk Analyst',
      description:
        'First-line support for candidate application errors, password resets, and profile issues.',
      requirements:
        'Shift flexibility; bilingual Arabic/English preferred.',
      skills: ['Help Desk', 'Communication', 'CRM', 'Troubleshooting', 'Bilingual'],
      careerLevel: 'Entry',
      jobType: 'FullTime',
      workLocation: 'OnSite',
      salaryMin: 12000,
      salaryMax: 20000,
    },
    {
      title: 'Support Team Lead',
      description:
        'Manage support queue SLAs, knowledge base articles, and escalation to engineering.',
      requirements:
        'Leadership; KPI tracking; hiring tech domain a plus.',
      skills: ['Leadership', 'SLAs', 'Knowledge Base', 'Coaching', 'Hiring Tech'],
      careerLevel: 'Lead',
      jobType: 'FullTime',
      workLocation: 'OnSite',
      salaryMin: 36000,
      salaryMax: 52000,
    },
    {
      title: 'Solutions Support Engineer',
      description:
        'Debug integration issues between employer ATS systems and TallentX job feeds.',
      requirements:
        'REST/webhooks; log analysis; client-facing communication.',
      skills: ['Integrations', 'REST', 'Webhooks', 'Logs', 'Client Support'],
      careerLevel: 'MidLevel',
      jobType: 'FullTime',
      workLocation: 'Remote',
      salaryMin: 32000,
      salaryMax: 48000,
    },
  ],
};

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function buildSeedJobs(): PublicJobDto[] {
  const jobs: PublicJobDto[] = [];
  let id = 10001;
  let companyIndex = 0;
  let locationIndex = 0;

  (Object.keys(CATEGORY_TEMPLATES) as JobCategory[]).forEach((category) => {
    CATEGORY_TEMPLATES[category].forEach((template, variantIndex) => {
      const company = COMPANIES[companyIndex % COMPANIES.length];
      companyIndex += 1;
      const location = LOCATIONS[locationIndex % LOCATIONS.length];
      locationIndex += variantIndex + 1;

      const postedDaysAgo = 1 + ((id * 7) % 45);
      const applicants = 12 + ((id * 13) % 180);

      jobs.push({
        id,
        title: template.title,
        company,
        location,
        jobType: template.jobType,
        workLocation: template.workLocation,
        careerLevel: template.careerLevel,
        salaryMin: template.salaryMin,
        salaryMax: template.salaryMax,
        currency: template.currency ?? (location.includes('UK') ? 'GBP' : 'USD'),
        skills: template.skills.map((name, i) => ({
          id: id * 10 + i,
          name,
          requiredLevel: (1 + (i % 3)) as 1 | 2 | 3,
        })),
        applicantsCount: applicants,
        createdAt: daysAgo(postedDaysAgo),
        expiryDate: daysAgo(-60),
        description: template.description,
        requirements: template.requirements,
        category,
      });
      id += 1;
    });
  });

  return jobs;
}

/** 66 production-like public job postings across 11 categories. */
export const PUBLIC_JOB_SEED: PublicJobDto[] = buildSeedJobs();

export function findSeedJobById(jobId: number | string): PublicJobDto | undefined {
  const id = Number(jobId);
  return PUBLIC_JOB_SEED.find((j) => j.id === id);
}
