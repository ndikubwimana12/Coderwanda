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
npm run admin -- admin@gmail.com
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

## Verification

```powershell
cd frontend
npm run lint
npm run build
cd ../server
npm test
npm run test:browser
```

API and browser tests create a random `coderwanda_test_*` database and remove only that database when done; they never write test records into the configured application database. The configured MySQL account needs create/drop database privileges to run them. Browser tests use local Chrome in hidden headless mode; set `CHROME_PATH` if its executable is elsewhere. Screenshots are saved under `.checks/`.

Tests cover authorization, forged credentials, every management resource, publishing/empty states, server-side prices, validation, last-admin protection, reports, settings, and database migrations. Browser tests cover login, dashboard navigation/editors, product CRUD, public database content, forms, and mobile layout.

## Production

Build `frontend`, then run `npm start` from `server`. Express serves `frontend/dist`, API routes, and uploaded images on the same origin, including direct navigation to nested routes. Put HTTPS in front of the application, set `FRONTEND_ORIGIN` to the website origin if cross-origin access is needed, and provide durable MySQL and uploads storage.

The schema is assembled by `server/base-schema.sql` plus additive updates in `server/migrate.js`. `server/schema.sql` is the original reference schema with sample data; it is not the startup migration. Sessions are random, expire after seven days, and are stored hashed in MySQL. Admin permissions are checked against the database on every request.

Source snapshots made during this upgrade are under `.checks/` (ignored by Git). No Git repository was present in the supplied workspace.
