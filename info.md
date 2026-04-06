# ServiceMate - Complete Project Summary

A **MERN-stack service booking platform** connecting users with skilled technicians. Built with React + Vite frontend and Node.js + Express backend with MongoDB.

---

## 🎯 Project Overview

**ServiceMate** enables customers to discover technicians, book services, and manage jobs with three core roles:
- **User** – Browse technicians, book services, manage bookings, write reviews
- **Technician** – Manage profile, services, bookings, and portfolio
- **Admin** – Platform monitoring, user control, oversight

**Authentication**: JWT + OTP email verification

---

## 📁 Complete Folder Structure

```
ServiceMate/
├── backend/
│   ├── .env                          # Environment variables
│   ├── .gitignore
│   ├── package.json                  # Backend dependencies
│   └── src/
│       ├── app.js                    # Express app setup (middleware, CORS, routes)
│       ├── server.js                 # Server entry point, DB connection, admin seeding
│       │
│       ├── config/
│       │   ├── cloudinary.js         # Cloudinary configuration
│       │   ├── db.js                 # MongoDB connection
│       │   └── env.js                # Environment variables loader
│       │
│       ├── controllers/
│       │   ├── healthController.js   # Health check endpoint
│       │   ├── admin/
│       │   │   └── adminController.js    # Admin operations
│       │   ├── auth/
│       │   │   └── authController.js     # Signup, login, OTP, password reset
│       │   ├── booking/
│       │   │   └── bookingController.js  # Booking CRUD, status, PDF generation
│       │   ├── review/
│       │   │   └── reviewController.js   # Review CRUD, ratings
│       │   ├── service/
│       │   │   └── serviceController.js  # Service CRUD
│       │   ├── technician/
│       │   │   └── technicianController.js # Technician profile, portfolio
│       │   └── user/
│       │       └── userController.js     # User profile management
│       │
│       ├── middleware/
│       │   ├── asyncHandler.js       # Async error wrapper
│       │   ├── auth.js               # JWT protection & role authorization
│       │   ├── errorHandler.js       # Global error handling
│       │   └── upload.js             # Multer file upload middleware
│       │
│       ├── models/
│       │   ├── index.js              # Model exports
│       │   ├── Availability.js       # Technician availability schema
│       │   ├── Booking.js            # Booking schema (user, technician, service, dates, billing)
│       │   ├── Notification.js       # Notification schema
│       │   ├── OTP.js                # OTP verification schema
│       │   ├── Report.js             # Report schema
│       │   ├── Review.js             # Review schema (rating, comment)
│       │   ├── Service.js            # Service schema (name, price, description)
│       │   ├── Technician.js         # Technician profile (bio, portfolio, location, rating)
│       │   ├── TechnicianActivity.js # Technician activity tracking
│       │   └── User.js               # User schema (auth, role, location)
│       │
│       ├── routes/
│       │   ├── index.js              # Route aggregator
│       │   ├── adminRoutes.js        # /api/v1/admin/*
│       │   ├── authRoutes.js         # /api/v1/auth/*
│       │   ├── bookingRoutes.js      # /api/v1/bookings/*
│       │   ├── healthRoutes.js       # /api/v1/health
│       │   ├── reviewRoutes.js       # /api/v1/reviews/*
│       │   ├── serviceRoutes.js      # /api/v1/services/*
│       │   ├── technicianRoutes.js   # /api/v1/technicians/*
│       │   └── userRoutes.js         # /api/v1/user/*
│       │
│       ├── services/
│       │   └── email/
│       │       └── mailer.js         # Nodemailer email service
│       │
│       ├── templates/
│       │   ├── bookingEmailTemplate.js   # Booking notification email HTML
│       │   └── otpEmailTemplate.js       # OTP verification email HTML
│       │
│       ├── utils/
│       │   ├── AppError.js           # Custom error class
│       │   ├── jwt.js                # JWT token generation/verification
│       │   └── uploadToCloudinary.js # Cloudinary upload utility
│       │
│       └── asset/                    # Static assets
│
├── frontend/
│   ├── .env.local                    # Frontend environment variables
│   ├── .gitignore
│   ├── components.json               # shadcn/ui config
│   ├── index.html                    # Entry HTML
│   ├── package.json                  # Frontend dependencies
│   ├── postcss.config.js             # PostCSS config
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── vite.config.js                # Vite build config
│   │
│   └── src/
│       ├── App.jsx                   # Main app with router
│       ├── main.jsx                  # React entry point with AuthProvider
│       ├── index.css                 # Global styles (Tailwind)
│       │
│       ├── assets/                   # Static assets (images, icons)
│       │
│       ├── components/
│       │   ├── common/
│       │   │   ├── AuthInput.jsx         # Styled form input
│       │   │   ├── AuthNavbar.jsx        # Auth pages navbar
│       │   │   ├── AuthTabs.jsx          # Login/Signup tabs
│       │   │   ├── IndianLocationSelect.jsx  # Country/State/City selector
│       │   │   ├── LoadingScreen.jsx     # App loading screen
│       │   │   └── Navbar.jsx            # Main navigation bar
│       │   │
│       │   ├── home/
│       │   │   ├── HeroSection.jsx       # Homepage hero
│       │   │   ├── MainCta.jsx           # Call-to-action section
│       │   │   ├── PopularServices.jsx   # Popular services showcase
│       │   │   ├── StartupFooter.jsx     # Footer component
│       │   │   ├── TopTechnicians.jsx    # Featured technicians
│       │   │   ├── TrustStrip.jsx        # Trust indicators
│       │   │   └── WhyChooseUs.jsx       # Features section
│       │   │
│       │   ├── layout/
│       │   │   ├── AppLayout.jsx         # Main app layout wrapper
│       │   │   ├── AuthenticatedLayout.jsx # Layout for logged-in users
│       │   │   ├── AuthLayout.jsx        # Layout for auth pages
│       │   │   └── PageWrapper.jsx       # Page transition wrapper
│       │   │
│       │   └── ui/
│       │       ├── button.jsx            # shadcn Button component
│       │       └── card-stack.jsx        # Card stack animation component
│       │
│       ├── context/
│       │   └── AuthContext.jsx       # Authentication context (login, logout, user state)
│       │
│       ├── hooks/
│       │   ├── useNavigateWithLoader.js  # Navigation with loading state
│       │   └── useTechnicians.js         # Technician data fetching hook
│       │
│       ├── lib/
│       │   └── utils.js              # Utility functions (cn for classnames)
│       │
│       ├── pages/
│       │   ├── AdminDashboardPage.jsx        # Admin dashboard
│       │   ├── BookingCreatePage.jsx         # Create new booking
│       │   ├── CompleteProfilePage.jsx       # Profile completion
│       │   ├── DashboardRedirectPage.jsx     # Role-based dashboard redirect
│       │   ├── ForgotPasswordPage.jsx        # Password recovery
│       │   ├── HomePage.jsx                  # Landing page
│       │   ├── LoginPage.jsx                 # User login
│       │   ├── OtpVerificationPage.jsx       # OTP verification
│       │   ├── ResetPasswordPage.jsx         # Password reset
│       │   ├── SignupPage.jsx                # User registration
│       │   ├── TechnicianBookingsPage.jsx    # Technician bookings management
│       │   ├── TechnicianDashboardPage.jsx   # Technician dashboard
│       │   ├── TechnicianListingPage.jsx     # Browse all technicians
│       │   ├── TechnicianPortfolioPage.jsx   # Manage portfolio
│       │   ├── TechnicianProfilePage.jsx     # Public technician profile
│       │   ├── TechnicianServicesPage.jsx    # Manage services
│       │   ├── TechnicianWorkspacePage.jsx   # Unified technician workspace
│       │   ├── UserBookingsPage.jsx          # User bookings list
│       │   └── UserDashboardPage.jsx         # User dashboard
│       │
│       ├── routes/
│       │   ├── index.jsx             # Route configuration
│       │   └── ProtectedRoute.jsx    # Auth-protected route wrapper
│       │
│       ├── services/
│       │   └── api.js                # Axios instance with interceptors
│       │
│       └── utils/
│           └── technicianUtils.js    # Technician helper functions
│
├── README.md                         # Project documentation
├── FILE_STRUCTURE.md                 # File structure documentation
├── Project_dairy.txt                 # Project notes/diary
├── ServiceMate_SDD.pdf               # Software Design Document
└── EmailDeliveryFlow.png             # Email flow diagram
```

---

## 🔧 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| Vite 6 | Build tool & dev server |
| Tailwind CSS 3 | Styling |
| React Router DOM 6 | Routing |
| Axios | HTTP client |
| React Query (TanStack) | Server state management |
| React Hook Form + Zod | Form handling & validation |
| Framer Motion | Animations |
| Lucide React | Icons |
| React Hot Toast / Sonner | Notifications |
| country-state-city | Location selection |
| Radix UI | Accessible UI primitives |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express 4 | Web framework |
| MongoDB + Mongoose 8 | Database & ODM |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| Nodemailer | Email sending |
| otp-generator | OTP generation |
| Multer | File upload handling |
| Cloudinary | Image storage/CDN |
| PDFKit | PDF generation |

### Security Middleware
- `helmet` - HTTP headers security
- `cors` - Cross-origin resource sharing
- `xss-clean` - XSS attack prevention
- `express-mongo-sanitize` - NoSQL injection prevention
- `hpp` - HTTP parameter pollution prevention
- `express-rate-limit` - Rate limiting

---

## 🗄️ Database Models

### User
```javascript
{
  fullName: String,           // Required, 2-120 chars
  email: String,              // Required, unique, lowercase
  password: String,           // Required, min 6 chars, hashed
  phone: String,              // Optional, validated format
  role: "user" | "technician" | "admin",  // Default: "user"
  avatarUrl: String,          // Optional
  location: { country, state, city },
  isVerified: Boolean,        // Email verified
  isActive: Boolean,          // Account active
  lastLoginAt: Date
}
```

### Technician
```javascript
{
  user: ObjectId (ref: User),  // Required, unique
  bio: String,                 // Max 2000 chars
  portfolio: [{
    title: String,
    imageUrl: String,
    description: String
  }],
  experienceYears: Number,     // 0-70
  services: [ObjectId (ref: Service)],
  location: { country, state, city },  // Required
  geoLocation: { type: "Point", coordinates: [lng, lat] },
  hourlyRate: Number,
  avgRating: Number,           // 0-5
  totalReviews: Number,
  completedBookings: Number,
  isAvailableForBooking: Boolean
}
```

### Service
```javascript
{
  technician: ObjectId (ref: Technician),
  serviceName: String,         // Required, 2-120 chars
  description: String,         // 3-2000 chars
  price: Number,               // Required, min 0
  isActive: Boolean
}
```

### Booking
```javascript
{
  user: ObjectId (ref: User),
  technician: ObjectId (ref: Technician),
  service: ObjectId (ref: Service),
  scheduledDate: Date,
  startTime: String,           // HH:mm format
  endTime: String,             // HH:mm format
  location: {
    country, state, city,
    addressLine: String,       // Required
    postalCode: String         // Required
  },
  phone: String,
  mapUrl: String,
  notes: String,               // Required, max 1000 chars
  totalPrice: Number,
  serviceCharge: Number,
  finalAmount: Number,
  billItems: [{ name, price }],
  status: "Pending" | "Accepted" | "Rejected" | "Completed" | "Cancelled",
  cancellationReason: String,
  cancelledBy: ObjectId,
  completedAt: Date
}
```

### Review
```javascript
{
  booking: ObjectId (ref: Booking),   // Unique
  user: ObjectId (ref: User),
  technician: ObjectId (ref: Technician),
  rating: Number,              // 1-5
  comment: String,             // 3-1000 chars
  isVisible: Boolean,
  adminReply: String
}
```

### OTP
```javascript
{
  user: ObjectId (ref: User),
  email: String,
  code: String,
  purpose: "email_verification" | "password_reset",
  expiresAt: Date,
  isUsed: Boolean,
  attempts: Number
}
```

---

## 🛣️ API Routes

### Base URL: `/api/v1`

### Auth Routes (`/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/signup` | Register new user | Public |
| POST | `/verify-otp` | Verify email OTP | Public |
| POST | `/login` | User login | Public |
| POST | `/forgot-password` | Request password reset | Public |
| POST | `/verify-reset-otp` | Verify reset OTP | Public |
| POST | `/reset-password` | Set new password | Public |
| GET | `/me` | Get current user | Protected |

### Technician Routes (`/technicians`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all technicians | Public |
| GET | `/city/:city` | Get technicians by city | Public |
| GET | `/:technicianId` | Get technician by ID | Public |
| GET | `/me/profile` | Get own profile | Technician |
| POST | `/profile` | Create technician profile | Technician |
| POST | `/me/portfolio` | Add portfolio item | Technician |
| PATCH | `/me/portfolio/:itemId` | Update portfolio item | Technician |
| DELETE | `/me/portfolio/:itemId` | Delete portfolio item | Technician |

### Booking Routes (`/bookings`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create booking | User |
| GET | `/user` | Get user's bookings | User |
| GET | `/technician` | Get technician's bookings | Technician |
| GET | `/my` | Get my bookings | All roles |
| GET | `/:bookingId/pdf` | Download booking PDF | All roles |
| PATCH | `/cancel/:bookingId` | Cancel booking | User |
| PATCH | `/complete/:bookingId` | Complete with bill | Technician |
| PATCH | `/:bookingId/status` | Update booking status | All roles |

### Service Routes (`/services`)
- Service CRUD for technicians

### Review Routes (`/reviews`)
- Review CRUD for completed bookings

### Admin Routes (`/admin`)
- Platform management, user control

### User Routes (`/user`)
- Profile management

### Health Routes (`/health`)
- API health check

---

## 🌐 Frontend Routes

### Public Routes
| Path | Page | Description |
|------|------|-------------|
| `/` | HomePage | Landing page |
| `/login` | LoginPage | User login |
| `/signup` | SignupPage | User registration |
| `/verify-otp` | OtpVerificationPage | Email verification |
| `/forgot-password` | ForgotPasswordPage | Password recovery |
| `/reset-password` | ResetPasswordPage | Set new password |

### Protected Routes (All authenticated users)
| Path | Page | Description |
|------|------|-------------|
| `/dashboard` | DashboardRedirectPage | Role-based redirect |
| `/profile` | CompleteProfilePage | Profile management |
| `/technicians` | TechnicianListingPage | Browse technicians |
| `/technician/:id` | TechnicianProfilePage | View technician |
| `/complete-profile` | CompleteProfilePage | Complete profile |

### User Routes
| Path | Page | Description |
|------|------|-------------|
| `/user/dashboard` | UserDashboardPage | User dashboard |
| `/bookings` | UserBookingsPage | My bookings |
| `/bookings/new` | BookingCreatePage | Create booking |

### Technician Routes
| Path | Page | Description |
|------|------|-------------|
| `/technician` | TechnicianWorkspacePage | Unified workspace |
| `/technician/bookings` | TechnicianBookingsPage | Manage bookings |
| `/technician/services` | TechnicianServicesPage | Manage services |
| `/technician/portfolio` | TechnicianPortfolioPage | Manage portfolio |

### Admin Routes
| Path | Page | Description |
|------|------|-------------|
| `/admin/dashboard` | AdminDashboardPage | Admin panel |

---

## 🔐 Authentication Flow

1. **Signup**: User registers → OTP sent to email
2. **Verify OTP**: User enters OTP → Account verified → JWT issued
3. **Login**: Email + Password → JWT issued (if verified)
4. **Protected Routes**: JWT in Authorization header → Middleware validates
5. **Password Reset**: Email → OTP → Verify OTP → Set new password

### JWT Token Structure
```javascript
{
  id: userId,
  role: "user" | "technician" | "admin"
}
```

---

## 📦 Key Features

### Booking Lifecycle
```
Pending → Accepted → Completed (with bill)
       → Rejected
       → Cancelled (by user)
```

### Technician Portfolio
- Image uploads via Multer + Cloudinary
- CRUD operations for portfolio items

### PDF Generation
- Booking receipts generated with PDFKit
- Includes bill items, service details

### Email System
- OTP verification emails
- Booking notifications
- HTML templates for professional formatting

---

## ⚙️ Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://...
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
OTP_EXPIRY_MINUTES=10
CLIENT_URL=http://localhost:5173

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 🚀 Running the Project

### Backend
```bash
cd backend
npm install
npm run dev    # Development with nodemon
npm start      # Production
```

### Frontend
```bash
cd frontend
npm install
npm run dev    # Development server
npm run build  # Production build
```

### Default Admin Account
- Email: `admin@servicemate.com`
- Password: `12345678`

---

## 🔄 User Workflows

### 👤 User Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER WORKFLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

1. REGISTRATION & AUTHENTICATION
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  Signup  │ ──► │ Receive  │ ──► │  Verify  │ ──► │  Login   │
   │   Form   │     │   OTP    │     │   OTP    │     │          │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘

2. BROWSING & DISCOVERY
   ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  Browse  │ ──► │  Filter  │ ──► │   View   │
   │Technicians│    │ by City/ │     │ Profile  │
   │          │     │ Service  │     │ & Reviews│
   └──────────┘     └──────────┘     └──────────┘

3. BOOKING PROCESS
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  Select  │ ──► │  Choose  │ ──► │   Fill   │ ──► │  Submit  │
   │Technician│     │ Service  │     │ Booking  │     │ Booking  │
   │          │     │          │     │ Details  │     │          │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │  Details: Date, Time, Location, Notes       │
                    └─────────────────────────────────────────────┘

4. BOOKING MANAGEMENT
   ┌──────────┐     ┌─────────────────────────────────────────────┐
   │  View    │ ──► │  Actions:                                   │
   │  My      │     │  • Track Status (Pending/Accepted/etc.)     │
   │ Bookings │     │  • Cancel Booking (if Pending)              │
   │          │     │  • Download PDF Receipt                     │
   └──────────┘     │  • Write Review (after Completed)           │
                    └─────────────────────────────────────────────┘

5. POST-SERVICE
   ┌──────────┐     ┌──────────┐     ┌──────────┐
   │ Service  │ ──► │  Leave   │ ──► │  View    │
   │Completed │     │  Rating  │     │  Invoice │
   │          │     │ & Review │     │   PDF    │
   └──────────┘     └──────────┘     └──────────┘
```

**User Capabilities:**
- Register and verify account via OTP
- Browse technicians by location/service
- View technician profiles, portfolios, and reviews
- Book services with specific date, time, and location
- Track booking status in real-time
- Cancel pending bookings
- Write reviews for completed services
- Download booking/invoice PDFs

---

### 🔧 Technician Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TECHNICIAN WORKFLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

1. REGISTRATION & PROFILE SETUP
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  Signup  │ ──► │  Verify  │ ──► │ Complete │ ──► │   Add    │
   │ as Tech  │     │   OTP    │     │ Profile  │     │ Services │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │  Profile: Bio, Experience, Location,        │
                    │           Hourly Rate, Avatar               │
                    └─────────────────────────────────────────────┘

2. SERVICE MANAGEMENT
   ┌──────────────────────────────────────────────────────────────┐
   │                    SERVICES CRUD                              │
   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
   │  │  Create │  │  Read   │  │ Update  │  │ Delete  │         │
   │  │ Service │  │Services │  │ Service │  │ Service │         │
   │  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
   │                                                               │
   │  Each Service: Name, Description, Price                       │
   └──────────────────────────────────────────────────────────────┘

3. PORTFOLIO MANAGEMENT
   ┌──────────────────────────────────────────────────────────────┐
   │                   PORTFOLIO CRUD                              │
   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
   │  │   Add   │  │  View   │  │  Edit   │  │ Remove  │         │
   │  │  Item   │  │Portfolio│  │  Item   │  │  Item   │         │
   │  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
   │                                                               │
   │  Portfolio Item: Title, Image (Cloudinary), Description       │
   └──────────────────────────────────────────────────────────────┘

4. BOOKING MANAGEMENT
   ┌──────────┐     ┌─────────────────────────────────────────────┐
   │ Receive  │ ──► │  Actions:                                   │
   │ Booking  │     │  ┌─────────────────────────────────────┐    │
   │ Request  │     │  │         ACCEPT Booking              │    │
   └──────────┘     │  └──────────────┬──────────────────────┘    │
                    │                 │                            │
                    │                 ▼                            │
                    │  ┌─────────────────────────────────────┐    │
                    │  │      Complete with Billing          │    │
                    │  │  • Add bill items (parts, labor)    │    │
                    │  │  • Set final amount                 │    │
                    │  │  • Mark as Completed                │    │
                    │  └─────────────────────────────────────┘    │
                    │                                              │
                    │  ┌─────────────────────────────────────┐    │
                    │  │         REJECT Booking              │    │
                    │  │  • Provide rejection reason         │    │
                    │  └─────────────────────────────────────┘    │
                    └─────────────────────────────────────────────┘

5. DASHBOARD & ANALYTICS
   ┌──────────────────────────────────────────────────────────────┐
   │  • View all bookings (Pending, Accepted, Completed, etc.)    │
   │  • Track earnings and completed jobs                         │
   │  • Monitor ratings and reviews                               │
   │  • Manage availability status                                │
   └──────────────────────────────────────────────────────────────┘
```

**Technician Capabilities:**
- Create and manage professional profile
- Add/edit/delete services with pricing
- Build portfolio with image uploads (Cloudinary)
- Accept or reject booking requests
- Complete bookings with detailed billing
- Generate invoices/receipts for customers
- Track performance metrics (ratings, reviews, completed jobs)
- Toggle availability for new bookings

---

### 🛡️ Admin Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             ADMIN WORKFLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

1. AUTHENTICATION (Pre-seeded Admin Account)
   ┌──────────┐     ┌──────────┐
   │  Login   │ ──► │  Admin   │
   │ as Admin │     │Dashboard │
   └──────────┘     └──────────┘

2. USER MANAGEMENT
   ┌──────────────────────────────────────────────────────────────┐
   │                    USER CONTROL                               │
   │                                                               │
   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
   │  │    View     │  │  Activate/  │  │   Monitor   │          │
   │  │  All Users  │  │ Deactivate  │  │  Activity   │          │
   │  └─────────────┘  └─────────────┘  └─────────────┘          │
   │                                                               │
   │  • View user details and profiles                            │
   │  • Suspend/unsuspend accounts                                │
   │  • Filter users by role (User/Technician)                    │
   └──────────────────────────────────────────────────────────────┘

3. TECHNICIAN OVERSIGHT
   ┌──────────────────────────────────────────────────────────────┐
   │               TECHNICIAN MANAGEMENT                           │
   │                                                               │
   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
   │  │    View     │  │   Verify/   │  │   Monitor   │          │
   │  │ Technicians │  │  Approve    │  │Performance  │          │
   │  └─────────────┘  └─────────────┘  └─────────────┘          │
   │                                                               │
   │  • Review technician profiles and portfolios                 │
   │  • Monitor service quality and ratings                       │
   │  • Handle escalated issues                                   │
   └──────────────────────────────────────────────────────────────┘

4. BOOKING OVERSIGHT
   ┌──────────────────────────────────────────────────────────────┐
   │                 BOOKING MONITORING                            │
   │                                                               │
   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
   │  │  View All   │  │   Resolve   │  │   Track     │          │
   │  │  Bookings   │  │  Disputes   │  │  Metrics    │          │
   │  └─────────────┘  └─────────────┘  └─────────────┘          │
   │                                                               │
   │  • Monitor all platform bookings                             │
   │  • Intervene in problematic bookings                         │
   │  • View booking statistics                                   │
   └──────────────────────────────────────────────────────────────┘

5. REVIEW MANAGEMENT
   ┌──────────────────────────────────────────────────────────────┐
   │                  REVIEW CONTROL                               │
   │                                                               │
   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
   │  │  View All   │  │   Hide/     │  │    Reply    │          │
   │  │   Reviews   │  │   Show      │  │  to Reviews │          │
   │  └─────────────┘  └─────────────┘  └─────────────┘          │
   │                                                               │
   │  • Moderate inappropriate reviews                            │
   │  • Toggle review visibility                                  │
   │  • Add admin replies to reviews                              │
   └──────────────────────────────────────────────────────────────┘

6. PLATFORM ANALYTICS
   ┌──────────────────────────────────────────────────────────────┐
   │                    DASHBOARD METRICS                          │
   │                                                               │
   │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐    │
   │  │   Total   │ │   Total   │ │   Total   │ │  Revenue  │    │
   │  │   Users   │ │Technicians│ │  Bookings │ │  Stats    │    │
   │  └───────────┘ └───────────┘ └───────────┘ └───────────┘    │
   │                                                               │
   │  • Platform-wide statistics and KPIs                         │
   │  • User growth trends                                        │
   │  • Booking completion rates                                  │
   └──────────────────────────────────────────────────────────────┘
```

**Admin Capabilities:**
- Access pre-seeded admin account (admin@servicemate.com)
- View and manage all users (activate/deactivate accounts)
- Monitor technician profiles and performance
- Oversee all platform bookings
- Moderate reviews (hide/show, admin replies)
- Access platform-wide analytics and metrics
- Handle disputes and escalated issues

---

## 📋 Summary

ServiceMate is a complete service booking platform with:
- **Clean modular architecture** (MVC pattern)
- **Role-based access control** (User, Technician, Admin)
- **Secure authentication** (JWT + OTP email verification)
- **Full booking lifecycle** with billing and PDF export
- **Portfolio management** with Cloudinary image hosting
- **Modern React frontend** with Tailwind CSS
- **Production-ready security** middleware stack
