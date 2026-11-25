import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/auth/LoginPage";
import AccountPage from "./pages/auth/AccountPage";
import RegisterPage from "./pages/auth/RegisterPage";
import CustomerLayout from "./pages/customer/CustomerLayout";
import MyInquiriesPage from "./pages/customer/MyInquiriesPage";
import NewInquiryPage from "./pages/customer/NewInquiryPage";
import InquiryDetailsPage from "./pages/customer/InquiryDetailsPage";
import AdminInquiriesPage from "./pages/admin/AdminInquiriesPage";
import EmployeeLayout from "./pages/employee/EmployeeLayout";
import AssignedInquiriesPage from "./pages/employee/AssignedInquiriesPage";
import AssignedInquiryDetailsPage from "./pages/employee/AssignedInquiryDetailsPage";
import NotificationsPage from "./pages/employee/NotificationsPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/account" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<CustomerLayout />}>
          <Route path="/inquiries" element={<MyInquiriesPage />} />
          <Route path="/inquiries/new" element={<NewInquiryPage />} />
          <Route path="/inquiries/:id" element={<InquiryDetailsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />

        <Route path="/employee" element={<EmployeeLayout />}>
          <Route path="inquiries" element={<AssignedInquiriesPage />} />
          <Route
            path="inquiries/:id"
            element={<AssignedInquiryDetailsPage />}
          />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
