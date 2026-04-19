const fs = require("fs");
let html = fs.readFileSync("stitch_ies/recruiter_dashboard_fixed_nav_light/code.html", "utf8");

let bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (bodyMatch) html = bodyMatch[1];

html = html.replace(/<!-- TopNavBar Implementation -->[\s\S]*?<\/header>/i, "");
html = html.replace(/<!-- Footer Implementation -->[\s\S]*?<\/footer>/i, "");

html = html.replace(/74\.2(?=<span)/g, "{{ stats()?.interviewsScheduled || 0 }}");
html = html.replace(/2,841/g, "{{ stats()?.totalApplicants || 0 }}");
html = html.replace(/>12<\/h3>/g, ">{{ stats()?.activeJobs || 0 }}</h3>");

let cardRegex = /<!-- Candidate Card 1 -->[\s\S]*?<!-- Candidate Card 4 -->\s*<div[^>]*>[\s\S]*?<\/div>\s*<\/div>/i;

let dynamicCards = `
<!-- Dynamic Candidate Feed -->
<a [routerLink]="['/recruiter/applicants', applicant.id]" class="bg-surface-container-lowest p-4 rounded-2xl flex items-center gap-4 hover:translate-x-1 transition-transform cursor-pointer" *ngFor="let applicant of recentApplicants()">
  <img alt="Candidate avatar" class="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjo2I1FR0k-RuQCvOb5Jn85zHv8l4wzQ3sD72e9YGzlyO0kBaGw3VFif0B-NnZEMEp8v3DCdI2hKi-HWi_DVsVpzK5vQXzDbWGySUyUqHrGU5hy10nDDNHmncerdzq4RQv0DCE_ZsbCzHijvHOFMmy7iYQ3G3_T-Gyu6u3H7iaatsd2DkgA_gT17Dg1HNbhT-VRKBlWbMGfyPZFpqx2Q60TC8NytgtJZlxlv9biWA0ls6Dg6tFNyYG4SGhv1_nsZI2LxKMB7A7tJk"/>
  <div class="flex-1 min-w-0">
    <h4 class="font-bold text-on-surface truncate">{{ applicant.name }}</h4>
    <p class="text-xs text-on-surface-variant truncate">Applicant</p>
  </div>
  <div class="flex flex-col items-end">
    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[60px] text-center"
          [ngClass]="{'text-success bg-emerald-50': applicant.status === 'Shortlisted', 'text-tertiary bg-tertiary-fixed': applicant.status !== 'Shortlisted'}">
      {{ applicant.status }}
    </span>
    <span class="text-[10px] text-outline mt-1">{{ applicant.appliedDate | date:'shortTime' }}</span>
  </div>
</a>
`;

html = html.replace(cardRegex, dynamicCards);
html = `<div class="bg-surface-bright font-body">\n${html}\n</div>`;

fs.writeFileSync("src/app/pages/recruiter-dashboard/recruiter-dashboard.html", html, "utf8");
console.log("Rewrote recruiter-dashboard.html successfully");
