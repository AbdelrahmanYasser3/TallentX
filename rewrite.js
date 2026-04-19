const fs = require("fs");
let html = fs.readFileSync("stitch_ies/recruiter_dashboard_fixed_nav_light/code.html", "utf8");

// extract body
let bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (bodyMatch) html = bodyMatch[1];

// strip top navbar and footer
html = html.replace(/<!-- TopNavBar Implementation -->[\s\S]*?<\/header>/i, "");
html = html.replace(/<!-- Footer Implementation -->[\s\S]*?<\/footer>/i, "");

// binding replacements
html = html.replace(/74\.2(?=<span)/g, "{{ stats()?.interviewsScheduled || 0 }}");
html = html.replace(/2,841/g, "{{ stats()?.totalApplicants || 0 }}");
html = html.replace(/>12<\/h3>/g, ">{{ stats()?.activeJobs || 0 }}</h3>");

// Candidate Feed
html = html.replace(/<!-- Candidate Card 1 -->[\s\S]*?<!-- Candidate Card 4 -->[\s\S]*?<\/div>\s*<\/div>/i, `
      <!-- Dynamic Candidate Feed -->
      <a [routerLink]="['/recruiter/applicants', applicant.id]" class="bg-surface-container-lowest p-4 rounded-2xl flex items-center gap-4 hover:translate-x-1 transition-transform cursor-pointer" *ngFor="let applicant of recentApplicants()">
        <img alt="Candidate avatar" class="w-12 h-12 rounded-full object-cover" [src]="applicant.avatarUrl || 'assets/default-avatar.png'"/>
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-on-surface truncate">{{ applicant.user?.firstName || 'Unknown' }} {{ applicant.user?.lastName || '' }}</h4>
          <p class="text-xs text-on-surface-variant truncate">{{ applicant.job?.title || 'Applicant' }}</p>
        </div>
        <div class="flex flex-col items-end">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                [ngClass]="{'text-success bg-emerald-50': applicant.status === 'Shortlisted', 'text-tertiary bg-tertiary-fixed': applicant.status === 'Applied'}">
            {{ applicant.status }}
          </span>
          <span class="text-[10px] text-outline mt-1">{{ applicant.appliedDate | date:'shortTime' }}</span>
        </div>
      </a>
    </div>
  </div>
`);

html = `<div class="bg-surface-bright font-body">\n${html}\n</div>`;

fs.writeFileSync("src/app/pages/recruiter-dashboard/recruiter-dashboard.html", html, "utf8");
console.log("Rewrote recruiter-dashboard.html");
