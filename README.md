# FileMaster Tools — Production SaaS Platform

**Convert • Compress • Merge • Manage**

FileMaster Tools is a modern, high-performance, privacy-first online file utility and document processing platform. Designed with client-side WebAssembly and HTML5 Canvas engines alongside scalable Express/Node.js backend worker pipelines.

---

## Architecture Overview

1. **Client-Side Engine**:
   - `pdf-lib` + `pdfjs-dist`: in-browser PDF generation, merging, splitting, page reordering, rotation, extraction, deletion, and rasterization.
   - `Canvas 2D API`: instant client-side image conversions (JPG, PNG, WEBP), image compression with exact byte savings, pixel-perfect resizing, and aspect-ratio cropping.
   - `JSZip`: automated in-memory multi-file zip packaging.
   - Zero-server leakage for confidential personal documents and photos.

2. **Backend Services (`server.ts`)**:
   - Express REST API with security header hardening (nosniff, sameorigin, referrer-policy).
   - StorageService abstraction supporting local development storage and S3/R2/Cloud Storage.
   - Asynchronous job queue (`/api/tools/:tool/process`, `/api/jobs/:id`) for heavy document tasks.
   - Server-controlled user allowance & usage limits (`/api/user/usage`).
   - Payment order creation and webhook verification architecture (Razorpay / Stripe ready).
   - Administrative portal APIs (`/api/admin/users`, `/api/admin/tools`, `/api/admin/settings`, `/api/admin/statistics`, `/api/admin/audit-logs`).
   - Automatic temporary file retention purging cron.

3. **User & Admin Panels**:
   - `/dashboard`: Overview metrics, My Files manager, Conversion History log, Saved favorite tools, and Account profile credentials.
   - `/admin`: Role-protected superadmin console with live database counters, user management (suspend/activate/delete), tool registry configuration, global settings, and audit logs.

---

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm 9+

### 1. Installation

```bash
git clone https://github.com/your-username/filemaster-tools.git
cd filemaster-tools
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Configure your secrets in `.env`:
- `DATABASE_URL`: PostgreSQL / Cloud SQL connection string
- `AUTH_SECRET`: Secret key for session/JWT encryption
- `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`: Object storage credentials
- `PAYMENT_KEY_ID`, `PAYMENT_KEY_SECRET`: Razorpay or Stripe credentials

### 3. Running in Development

```bash
npm run dev
```

The application runs on `http://localhost:3000` with Express API routes mounted alongside Vite middlewares.

### 4. Admin Credentials

Default initial administrator:
- **Email**: `admin@filemaster.com`
- **Password**: `AdminPassword123!`

---

## Production Deployment

### Building for Production

```bash
npm run build
```

This compiles client assets into `/dist`.

### Running Production Server

```bash
npm start
```

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## SEO & Google Search Console

- `sitemap.xml`: Available at `/sitemap.xml`
- `robots.txt`: Available at `/robots.txt`
- Verification Guide: Documented inside the app at `/gsc-guide`

---

## License

Apache-2.0
