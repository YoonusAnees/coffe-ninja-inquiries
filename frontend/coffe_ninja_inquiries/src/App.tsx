import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import HomeRedirect from "./components/auth/HomeRedirect";
import RoleGuard from "./components/auth/RoleGuard";
import AppLayout from "./components/layout/AppLayout";
import NotFoundPage from "./pages/NotFoundPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminInquiriesPage from "./pages/admin/AdminInquiriesPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AccountPage from "./pages/auth/AccountPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import CustomerDashboardPage from "./pages/customer/CustomerDashboardPage";
import InquiryDetailsPage from "./pages/customer/InquiryDetailsPage";
import MyInquiriesPage from "./pages/customer/MyInquiriesPage";
import NewInquiryPage from "./pages/customer/NewInquiryPage";
import AssignedInquiriesPage from "./pages/employee/AssignedInquiriesPage";
import AssignedInquiryDetailsPage from "./pages/employee/AssignedInquiryDetailsPage";
import EmployeeDashboardPage from "./pages/employee/EmployeeDashboardPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<AppLayout />}>
          <Route path="/account" element={<AccountPage />} />

          <Route element={<RoleGuard allowedRoles={["CUSTOMER"]} />}>
            <Route path="/customer" element={<CustomerDashboardPage />} />
            <Route path="/inquiries" element={<MyInquiriesPage />} />
            <Route path="/inquiries/new" element={<NewInquiryPage />} />
            <Route path="/inquiries/:id" element={<InquiryDetailsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={["EMPLOYEE"]} />}>
            <Route path="/employee" element={<EmployeeDashboardPage />} />
            <Route
              path="/employee/inquiries"
              element={<AssignedInquiriesPage />}
            />
            <Route
              path="/employee/inquiries/:id"
              element={<AssignedInquiryDetailsPage />}
            />
            <Route
              path="/employee/notifications"
              element={<NotificationsPage />}
            />
          </Route>

          <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
