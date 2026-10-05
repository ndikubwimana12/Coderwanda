# CodeRwanda

React/Vite/Tailwind website and administration dashboard with an Express/MySQL API.

## Local setup

Use Node.js 22.12 or newer and MySQL 8 (or compatible MariaDB). Install dependencies in both folders:

```powershell
cd server
npm ci
cd ../frontend
npm ci
```

Create an empty MySQL database named `coderwanda`, then copy `server/.env.example` to `server/.env` and set the connection values. Keep an existing `.env` when upgrading.

Run the API and frontend in separate terminals:

```powershell
cd server
npm run dev
```

```powershell
cd frontend
npm run dev
```

Open the Vite URL (normally http://localhost:5173). Vite forwards `/api` and `/uploads` to port 5000. The backend verifies the database before listening and creates missing tables and course-detail columns. Existing content is preserved; deleted content is never automatically reseeded.

## Administrator access

Existing administrator accounts retain full access. Sign in again after upgrading: old Base64 login data is no longer accepted.

For a new installation, register your account through the website, then deliberately promote that account from the server directory:

```powershell
npm run admin
```

Sign in again and open `/admin`. Public registration always creates a normal account. Administrators can create/edit/delete users and custom roles, assign full dashboard access, and manage every content module. Built-in role identities remain stable, and the final administrator cannot be removed or demoted.

## Dashboard and public content

- Users and roles: account details, passwords, role assignment, and dashboard access.
- Services, products, courses, job listings, projects, blog posts, testimonials, and partners: create, read, edit, delete, search, CSV export, and images where applicable.
- Orders: customer/delivery details, items, payment method, and status; totals come from catalog prices. Saving an edited order recalculates its items at current prices.
- Enrollments, job applications, contacts, and subscribers: record management and exports.
- Settings: public contact information and homepage headings/description.
- Analytics: database-derived counts, revenue, trends, and authenticated CSV exports.
- Activity logs: recorded create/update/delete/upload actions, search, and removal. Logs are not editable fabricated events.

Homepage catalogs, services, store categories/products, courses and their detail/enrollment pages, careers, projects, testimonials, partners, and news load API data. Empty catalogs remain empty, and failures display an error with retry. Admin updates refresh open pages in the same browser and pages refresh on focus.

Image fields accept an HTTP(S) image URL or a PNG/JPEG/WebP upload up to 5 MB. Uploaded files live in `server/uploads`; persist and back up this directory along with MySQL. Deleting a record does not delete an image that may be shared by another record.

Checkout records an order and the selected payment method. It does not charge Mobile Money; a payment-provider integration is a separate feature.

## Build checks

```powershell
cd frontend
npm run lint
npm run build
cd ../server
node --check index.js
node --check app.js
```

## Production

Build the frontend with `npm run build` in `frontend` and publish the contents of `frontend/dist` to the `coderwanda.net.rw` document root, including the hidden `.htaccess` file. It sends client-side page requests such as `/admin/settings` back to `index.html`. Deploy the updated Node source from `server` to the cPanel Node application configured for `api.coderwanda.net.rw`, then restart that application so database migrations and notification workers run. Keep the existing `server/uploads` directory and its files when deploying; uploaded files are stored there. The production frontend points file requests to `https://api.coderwanda.net.rw/uploads/<filename>`, and the Node app serves those paths from `server/uploads`. Verify a real URL directly, for example `https://api.coderwanda.net.rw/uploads/24fccb03-8960-49a7-a6c6-6762b70447f7.png`. If it returns 404 after restarting the Node app, confirm the API subdomain is attached to that Node application and its application root is `/home/<cpanel-user>/server`; the frontend document root must not receive `/uploads` requests.

Admin alerts are queued for new accounts, contact messages, enrollments, job applications, orders and newsletter subscriptions. Set `ADMIN_NOTIFICATION_EMAIL=ndikubwimanaeric2019@gmail.com` and configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` and `SMTP_FROM` in the Node application's environment to deliver the email alerts. Alerts still appear in the dashboard notification bell if SMTP is unavailable; queued email is retried by the backend worker.

The schema is assembled by `server/base-schema.sql` plus additive updates in `server/migrate.js`. Sessions are random, expire after seven days, and are stored hashed in MySQL. Admin permissions are checked against the database on every request.


## Learning platform

Create a course under **Dashboard > Courses**, then open **Learning studio** to select it and author ordered modules and learning units. Each unit supports lesson text/transcripts, an image and a video. Upload PNG/JPEG/WebP images up to 5 MB and MP4/WebM videos up to 250 MB, or supply direct media URLs. Add a unit assessment for every unit and one final exam per course. Content stays private until you publish its module, unit and assessment.

Assessments support weighted multiple-choice questions (including true/false), explanations, a configurable pass mark, time limit and attempt limit. Correct answers and grading remain on the server. Attempts keep a question snapshot, resume before expiry, and save selected answers in the student's browser. Expired attempts receive zero; administrators can grant another attempt. These are automatically graded assessments, without live proctoring or manual essay grading.

Students apply from a course page. Under **Students & progress**, approve the application to create a student account automatically. Existing accounts retain their password and role. New students receive a single-use activation link valid for 48 hours and choose their own password. Administrators can copy or regenerate the link. Students sign in at **Student Portal** (/learn), join modules, study units in order, pass unit assessments and unlock the final exam. Their dashboard shows completed units, percentage progress, marks and certificates. A unit requires a published assessment to complete.

Passing the final exam after completing the units awards a certificate with a unique public verification URL. Students can print or save it as PDF. Administrators can review student progress/results and revoke or restore certificates. Public certificate verification exposes the recipient name, course, score and issue date, without contact details.

### Activation email setup

Set PUBLIC_ORIGIN to the website's browser-facing origin. Configure SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD and SMTP_FROM in server/.env using server/.env.example. Restart the backend after changing environment settings. Approval queues an email and the backend retries pending messages every minute; the dashboard also offers Retry email delivery. Without SMTP, accounts are still created and admins can share activation links manually.

### Learning storage and deployment

The additive migration includes server/learning-schema.sql. Back up MySQL, server/uploads and server/learning-media. Uploaded lesson media uses signed, expiring URLs and rechecks enrollment access, including video range requests. External media URLs retain the external host's access rules. Set LEARNING_MEDIA_SECRET to a stable random secret in production and configure the reverse proxy to accept uploads of at least 250 MB. Run one notification worker/server instance unless distributed job locking is added.

## Practical coding, marking and classroom interaction

**Admin > Practicals & Chat** and **Trainer studio** (/teach) let you create unit-level practical tasks, starter files, self-tests and marking rubrics. Admins assign existing active users as course trainers without granting them full dashboard rights. Students open practicals inside a lesson or use **Coding playground** for independent practice.

Drafts save automatically with conflict detection. Submissions preserve their code, task instructions and rubric. Trainers award criterion marks, leave overall guidance, and attach mistake/suggestion/strength comments to exact file lines. Students see marks and feedback in their workspace and dashboard, then submit improved work after review. Official marks are calculated and validated on the server; self-test claims cannot award marks.

Required practicals must pass before a unit completes or its next unit/final exam unlocks. A studied unit can use a required practical in place of a multiple-choice assessment; if both exist, both must pass. Previously issued certificates keep their recorded award.

Course classrooms have persistent shared discussion and private student-trainer help threads, replies, earlier-message loading and moderation. Messages refresh every four seconds. Every request verifies current enrollment or assigned-trainer access; private threads are unavailable to other students.

JavaScript functions run in a sandboxed browser worker with a three-second timeout. HTML/CSS previews disable scripts, navigation and external resources; JavaScript runs separately without DOM access. The CodeRwanda logo is used in the learning shell, certificates and browser favicon.

The wider programming-language catalog and console execution use a **local-only Judge0 adapter**. It supports single-file languages installed in that runner, with compilation errors, input/output tests and resource limits. The service has not been deployed on this workstation: Docker is absent, and its WSL environment needs administrator/kernel setup. See [runner/README.md](runner/README.md) for the prepared service package and live verification command. No external runner endpoint is accepted. Runtime integration tests use a local API test double; they do not prove real compilers are installed.

