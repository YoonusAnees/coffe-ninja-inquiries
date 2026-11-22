import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/auth/LoginPage";
import AccountPage from "./pages/auth/AccountPage";
import RegisterPage from "./pages/auth/RegisterPage";
import MyInquiriesPage from "./pages/Inquiry/MyInquiriesPage";
import NewInquiryPage from "./pages/Inquiry/NewInquiryPage";
import InquiryDetailsPage from "./pages/Inquiry/InquiryDetailsPage";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
