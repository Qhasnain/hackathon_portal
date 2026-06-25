import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import StudentLayout from "@/layouts/StudentLayout";
import AdminLayout from "@/layouts/AdminLayout";
import PageLoader from "@/components/ui/PageLoader";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import PublicRoute from "@/components/routing/PublicRoute";
import { ROUTES } from "@/routes/paths";

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const HackathonsPage = lazy(() => import("@/pages/HackathonsPage"));
const HackathonDetailPage = lazy(() => import("@/pages/HackathonDetailPage"));
const RegistrationPage = lazy(() => import("@/pages/RegistrationPage"));
const SubmissionPage = lazy(() => import("@/pages/SubmissionPage"));
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage"));
const AdminHackathonListPage = lazy(() => import("@/pages/admin/HackathonListPage"));
const AdminHackathonFormPage = lazy(() => import("@/pages/admin/HackathonFormPage"));
const AdminProblemStatementListPage = lazy(() => import("@/pages/admin/ProblemStatementListPage"));
const AdminProblemStatementFormPage = lazy(() => import("@/pages/admin/ProblemStatementFormPage"));
const AdminRegistrationListPage = lazy(() => import("@/pages/admin/RegistrationListPage"));
const AdminSubmissionListPage = lazy(() => import("@/pages/admin/SubmissionListPage"));
const ProblemStatementDetailPage = lazy(() => import("@/pages/ProblemStatementDetailPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: withSuspense(<LandingPage />),
      },
      {
        element: <PublicRoute />,
        children: [
          {
            path: ROUTES.LOGIN,
            element: withSuspense(<LoginPage />),
          },
          {
            path: ROUTES.SIGNUP,
            element: withSuspense(<SignupPage />),
          },
        ],
      },
    ],
  },
  {
    path: "/student",
    element: <ProtectedRoute allowedRoles={["STUDENT"]} />,
    children: [
      {
        element: <StudentLayout />,
        children: [
          {
            index: true,
            element: withSuspense(<DashboardPage />),
          },
          {
            path: "hackathons",
            element: withSuspense(<HackathonsPage />),
          },
          {
            path: "hackathons/:slug",
            element: withSuspense(<HackathonDetailPage />),
          },
          {
            path: "hackathons/:slug/problems/:id",
            element: withSuspense(<ProblemStatementDetailPage />),
          },
          {
            path: "registration",
            element: withSuspense(<RegistrationPage />),
          },
          {
            path: "submission",
            element: withSuspense(<SubmissionPage />),
          },
          {
            path: "profile",
            element: withSuspense(<ProfilePage />),
          },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: withSuspense(<AdminDashboardPage />),
          },
          {
            path: "hackathons",
            element: withSuspense(<AdminHackathonListPage />),
          },
          {
            path: "hackathons/new",
            element: withSuspense(<AdminHackathonFormPage />),
          },
          {
            path: "hackathons/create",
            element: withSuspense(<AdminHackathonFormPage />),
          },
          {
            path: "hackathons/:slug/edit",
            element: withSuspense(<AdminHackathonFormPage />),
          },
          {
            path: "problem-statements",
            element: withSuspense(<AdminProblemStatementListPage />),
          },
          {
            path: "problem-statements/create",
            element: withSuspense(<AdminProblemStatementFormPage />),
          },
          {
            path: "problem-statements/:id/edit",
            element: withSuspense(<AdminProblemStatementFormPage />),
          },
          {
            path: "registrations",
            element: withSuspense(<AdminRegistrationListPage />),
          },
          {
            path: "submissions",
            element: withSuspense(<AdminSubmissionListPage />),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: withSuspense(<NotFoundPage />),
  },
]);
