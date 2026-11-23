import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/auth/LoginPage";
import AccountPage from "./pages/auth/AccountPage";
import RegisterPage from "./pages/auth/RegisterPage";
import MyInquiriesPage from "./pages/Inquiry/MyInquiriesPage";
import NewInquiryPage from "./pages/Inquiry/NewInquiryPage";
import InquiryDetailsPage from "./pages/Inquiry/InquiryDetailsPage";
import AdminInquiriesPage from "./pages/Inquiry/AdminInquiriesPage";
import AssignedInquiriesPage from "./pages/Inquiry/Employee/AssignedInquiriesPage";
import AssignedInquiryDetailsPage from "./pages/Inquiry/Employee/AssignedInquiryDetailsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/account" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/inquiries" element={<MyInquiriesPage />} />
        <Route path="inquiries/new" element={<NewInquiryPage />} />
        <Route path="/inquiries/:id" element={<InquiryDetailsPage />} />
        <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
        <Route path="/employee/inquiries" element={<AssignedInquiriesPage />} />
        <Route
          path="/employee/inquiries/:id"
          element={<AssignedInquiryDetailsPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
