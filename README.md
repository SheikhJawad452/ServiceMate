# ServiceMate Project Details

## 1) Project Overview

**ServiceMate** is a MERN-based service booking platform where customers can find technicians, book services, and manage jobs.  
The project supports three roles:

- **User**: browse technicians, create bookings, manage bookings, add reviews
- **Technician**: manage profile, services, portfolio, bookings, and workspace
- **Admin**: monitor platform users/bookings/reports and manage platform controls

Core auth flow is **JWT + OTP email verification**.

---

## 2) Tech Stack

### Frontend

- **React + Vite**: SPA framework and fast build tooling
- **Tailwind CSS**: utility-first styling
- **shadcn-style UI primitives** (`button`, UI composition): consistent component styling
- **React Router DOM**: client-side routing and protected route navigation
- **Axios**: API client with auth interceptor
- **Framer Motion**: smooth UI animations and section transitions
- **React Hot Toast / Sonner**: user feedback notifications
- **Lucide React**: icons
- **React Hook Form + Zod**: form handling and validation
- **country-state-city**: location dropdown support

### Backend

- **Node.js + Express**: REST API server
- **MongoDB + Mongoose**: data storage and schema modeling
- **JWT (`jsonwebtoken`)**: authentication tokens
- **bcryptjs**: password hashing
- **Nodemailer + otp-generator**: OTP generation and email verification
- **Multer + Cloudinary**: image upload and cloud storage (portfolio/media)
- **PDFKit**: booking/bill PDF generation
- **helmet, cors, xss-clean, mongo-sanitize, hpp, rate-limit**: security hardening
- **morgan, compression**: logging and response compression

---

## 3) Main Functional Modules

## Authentication & Access

- Signup/Login with role support
- OTP verification required for account activation
- JWT-protected endpoints
- Role-based route/API guards (`user`, `technician`, `admin`)

## User Module

- Search/filter technicians by location/service
- Create booking with date/time/location
- View and manage own bookings
- Leave and edit service reviews

## Technician Module

- Create/update technician profile
- Manage service offerings (CRUD)
- Unified **Technician Workspace** (`/technician`)
- Booking handling (accept/reject/complete with bill)
- Portfolio management (CRUD with image upload)

## Admin Module

- Admin dashboard monitoring
- User controls (active/block)
- Reports/bookings oversight

## Booking & Billing Module

- Booking lifecycle management
- Status transitions
- Final bill line-items
- PDF detail export

## Review Module

- Ratings and comments
- Technician rating aggregates and display

---

## 4) Frontend Libraries and Their Uses

- `react`, `react-dom`: core UI rendering
- `react-router-dom`: route definitions, navigation, role-protected pages
- `axios`: centralized API communication (`src/services/api.js`)
- `framer-motion`: premium section/card animations in workspace and pages
- `react-hot-toast`, `sonner`: success/error feedback notifications
- `lucide-react`: iconography for cards/stats/actions
- `tailwindcss`, `postcss`, `autoprefixer`: styling pipeline
- `class-variance-authority`, `clsx`, `tailwind-merge`: composable class utilities
- `react-hook-form`, `@hookform/resolvers`, `zod`: typed form validation workflows
- `@radix-ui/*`: accessible UI primitives used by design system components
- `country-state-city`: country/state/city selector data

---

## 5) Backend Libraries and Their Uses

- `express`: API routing and middleware orchestration
- `mongoose`: schema definitions, validation, query operations
- `jsonwebtoken`: token issue/verify for auth middleware
- `bcryptjs`: secure password hashing
- `nodemailer`, `otp-generator`: OTP emails and verification flow
- `multer`: multipart/form-data upload parsing
- `cloudinary`: hosted image storage for portfolio uploads
- `pdfkit`: booking and billing PDF generation
- `express-validator`: request payload validation
- `helmet`, `cors`, `express-rate-limit`, `xss-clean`, `express-mongo-sanitize`, `hpp`: API security stack
- `morgan`: API request logging
- `compression`: response compression

---

## 6) Current File Structure (Main)

```text
ServiceMate
├── backend
│   ├── src
│   │   ├── config
│   │   │   ├── cloudinary.js
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   ├── controllers
│   │   │   ├── admin/adminController.js
│   │   │   ├── auth/authController.js
│   │   │   ├── booking/bookingController.js
│   │   │   ├── review/reviewController.js
│   │   │   ├── service/serviceController.js
│   │   │   ├── technician/technicianController.js
│   │   │   ├── user/userController.js
│   │   │   └── healthController.js
│   │   ├── middleware
│   │   │   ├── asyncHandler.js
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── upload.js
│   │   ├── models
│   │   │   ├── Availability.js
│   │   │   ├── Booking.js
│   │   │   ├── Notification.js
│   │   │   ├── OTP.js
│   │   │   ├── Report.js
│   │   │   ├── Review.js
│   │   │   ├── Service.js
│   │   │   ├── Technician.js
│   │   │   ├── TechnicianActivity.js
│   │   │   └── User.js
│   │   ├── routes
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── healthRoutes.js
│   │   │   ├── index.js
│   │   │   ├── reviewRoutes.js
│   │   │   ├── serviceRoutes.js
│   │   │   ├── technicianRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── services/email/mailer.js
│   │   ├── templates
│   │   │   ├── bookingEmailTemplate.js
│   │   │   └── otpEmailTemplate.js
│   │   ├── utils
│   │   │   ├── AppError.js
│   │   │   ├── jwt.js
│   │   │   └── uploadToCloudinary.js
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
├── frontend
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   │   ├── common
│   │   │   ├── home
│   │   │   ├── layout
│   │   │   └── ui
│   │   ├── context
│   │   │   └── AuthContext.jsx
│   │   ├── hooks
│   │   │   └── useTechnicians.js
│   │   ├── pages
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── BookingCreatePage.jsx
│   │   │   ├── CompleteProfilePage.jsx
│   │   │   ├── DashboardRedirectPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── TechnicianWorkspacePage.jsx
│   │   │   ├── TechnicianBookingsPage.jsx
│   │   │   ├── TechnicianServicesPage.jsx
│   │   │   ├── TechnicianPortfolioPage.jsx
│   │   │   ├── TechnicianListingPage.jsx
│   │   │   ├── TechnicianProfilePage.jsx
│   │   │   ├── UserDashboardPage.jsx
│   │   │   └── UserBookingsPage.jsx
│   │   ├── routes
│   │   │   ├── index.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/api.js
│   │   ├── utils/technicianUtils.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── docs
│   ├── PRD.md
│   ├── TechStack.md
│   ├── Backend Schema.md
│   ├── Frontend Guidelines.md
│   └── App Flow.md
├── README.md
└── SERVICEMATE_PROJECT_DETAILS.md
```

---

## 7) Important Route Summary (Frontend)

- Public:
  - `/`
  - `/login`, `/signup`, `/verify-otp`
- User:
  - `/user/dashboard`, `/bookings`, `/bookings/new`
- Technician:
  - `/technician` (unified workspace)
  - `/technician/bookings`
  - `/technician/services`
  - `/technician/portfolio`
- Admin:
  - `/admin/dashboard`

---

## 8) Notes

- Technician dashboard experience has been consolidated into a **single unified workspace** route.
- Portfolio now supports **Create, Read, Update, Delete** for technicians.
- Auth is OTP-verified account access with JWT-protected API usage.
