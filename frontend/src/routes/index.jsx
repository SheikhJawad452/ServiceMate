import AdminDashboardPage from "@/pages/AdminDashboardPage";
import { Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import HomePage from "@/pages/HomePage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import BookingCreatePage from "@/pages/BookingCreatePage";
import CompleteProfilePage from "@/pages/CompleteProfilePage";
import DashboardRedirectPage from "@/pages/DashboardRedirectPage";
import LoginPage from "@/pages/LoginPage";
import OtpVerificationPage from "@/pages/OtpVerificationPage";
import SignupPage from "@/pages/SignupPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import TechnicianBookingsPage from "@/pages/TechnicianBookingsPage";
import TechnicianServicesPage from "@/pages/TechnicianServicesPage";
import TechnicianPortfolioPage from "@/pages/TechnicianPortfolioPage";
import TechnicianWorkspacePage from "@/pages/TechnicianWorkspacePage";
import TechnicianListingPage from "@/pages/TechnicianListingPage";
import TechnicianProfilePage from "@/pages/TechnicianProfilePage";
import UserBookingsPage from "@/pages/UserBookingsPage";
import UserDashboardPage from "@/pages/UserDashboardPage";
import ProtectedRoute from "@/routes/ProtectedRoute";

export const routesConfig = [
  {
    path: "/",
    element: <AppLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/verify-otp", element: <OtpVerificationPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardRedirectPage /> },
          { path: "/profile", element: <CompleteProfilePage /> },
          { path: "/technicians", element: <TechnicianListingPage /> },
          { path: "/technician/:id", element: <TechnicianProfilePage /> },
          { path: "/technicians/:id", element: <Navigate to="/technicians" replace /> },
          { path: "/complete-profile", element: <CompleteProfilePage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["user"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/user/dashboard", element: <UserDashboardPage /> },
          { path: "/bookings", element: <UserBookingsPage /> },
          { path: "/bookings/new", element: <BookingCreatePage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["technician"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/technician", element: <TechnicianWorkspacePage /> },
          { path: "/technician/dashboard", element: <Navigate to="/technician" replace /> },
          { path: "/technician/bookings", element: <TechnicianBookingsPage /> },
          { path: "/technician/services", element: <TechnicianServicesPage /> },
          { path: "/technician/portfolio", element: <TechnicianPortfolioPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [{ path: "/admin/dashboard", element: <AdminDashboardPage /> }],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
];
