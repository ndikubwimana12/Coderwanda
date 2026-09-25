const fs = require('node:fs');
fs.copyFileSync('README.md', '.checks/README-before-learning.md');
fs.appendFileSync('README.md', `

## Learning platform

Create a course under **Dashboard > Courses**, then open **Learning studio** to select it and author ordered modules and learning units. Each unit supports lesson text/transcripts, an image and a video. Upload PNG/JPEG/WebP images up to 5 MB and MP4/WebM videos up to 250 MB, or supply direct media URLs. Add a unit assessment for every unit and one final exam per course. Content stays private until you publish its module, unit and assessment.

Assessments support weighted multiple-choice questions (including true/false), explanations, a configurable pass mark, time limit and attempt limit. Correct answers and grading remain on the server. Attempts keep a question snapshot, resume before expiry, and save selected answers in the student's browser. Expired attempts receive zero; administrators can grant another attempt. These are automatically graded assessments, without live proctoring or manual essay grading.

Students apply from a course page. Under **Students & progress**, approve the application to create a student account automatically. Existing accounts retain their password and role. New students receive a single-use activation link valid for 48 hours and choose their own password. Administrators can copy or regenerate the link. Students sign in at **Student Portal** (/learn), join modules, study units in order, pass unit assessments and unlock the final exam. Their dashboard shows completed units, percentage progress, marks and certificates. A unit requires a published assessment to complete.

Passing the final exam after completing the units awards a certificate with a unique public verification URL. Students can print or save it as PDF. Administrators can review student progress/results and revoke or restore certificates. Public certificate verification exposes the recipient name, course, score and issue date, without contact details.

### Activation email setup

Set PUBLIC_ORIGIN to the website's browser-facing origin. Configure SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD and SMTP_FROM in server/.env using server/.env.example. Restart the backend after changing environment settings. Approval queues an email and the backend retries pending messages every minute; the dashboard also offers Retry email delivery. Without SMTP, accounts are still created and admins can share activation links manually. Tests disable SMTP and never send emails.

### Learning storage and deployment

The additive migration includes server/learning-schema.sql. Back up MySQL, server/uploads and server/learning-media. Uploaded lesson media uses signed, expiring URLs and rechecks enrollment access, including video range requests. External media URLs retain the external host's access rules. Set LEARNING_MEDIA_SECRET to a stable random secret in production and configure the reverse proxy to accept uploads of at least 250 MB. Run one notification worker/server instance unless distributed job locking is added.

Learning API tests cover approval, single-use activation, existing accounts, prerequisites, timed assessments, attempt limits, grading, certificates and private-media authorization. The browser test also authors content, approves a student, activates the account, completes a module assessment and final exam, and verifies the certificate and mobile dashboard. Test artifacts are under .checks/.
`);
console.log('Learning documentation added.');
