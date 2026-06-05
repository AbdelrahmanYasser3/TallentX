$content = Get-Content -Raw "stitch_ies/recruiter_dashboard_fixed_nav_light/code.html"
$content -match "(?s)<body[^>]*>(.*?)</body>" | Out-Null
$innerBody = $matches[1]

# Bindings
$innerBody = $innerBody -replace "74\.2(?=<span)", "{{ stats()?.interviewsScheduled || 0 }}"
$innerBody = $innerBody -replace "2,841", "{{ stats()?.totalApplicants || 0 }}"
$innerBody = $innerBody -replace "12</h3>", "{{ stats()?.activeJobs || 0 }}</h3>"

# Handle TopNavBar
# Since <app-navbar> is rendered by app.component.html, having two headers is bad.
# Let's remove the <header> that contains "TopNavBar" until the </header>
$innerBody = $innerBody -replace "(?s)<!-- TopNavBar Implementation -->.*?</header>", ""

# Same for <aside> SideNavBar, if app has it
# Actually, the new UI has its own sidebar layout so maybe we shouldn't strip it? But wait, the app.html already has an app-navbar. We'll strip the sidebar if we want to integrate cleanly, or leave it. Usually, removing TopNavBar and Footer is enough.
$innerBody = $innerBody -replace "(?s)<!-- Footer Implementation -->.*?(?=</footer>)</footer>", ""

# Now output
[IO.File]::WriteAllText("src/app/pages/recruiter-dashboard/recruiter-dashboard.html", $innerBody, [Text.Encoding]::UTF8)
