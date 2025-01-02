import React, { useState, createContext, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import LoginForm from "./components/LoginForm";
import UserDashboard from "./pages/UserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateOrderPage from "./pages/CreateOrderPage";
import ViewOrdersPage from "./pages/ViewOrdersPage";
import CreatorDashboard from "./pages/CreatorDashboard";
import PortfolioManagement from "./pages/PortfolioManagement";
import ExploreOpportunities from "./pages/ExploreOpportunities"; // Import the new component
import ProposalsPage from "./pages/ProposalsPage";
import MyProposalsPage from "./pages/MyProposalsPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import UploadProjectPage from "./pages/UploadProjectPage";
import ProjectDiscussionPage from "./pages/ProjectDiscussionPage";

import "./styles/general.css";
import "./styles/header.css";
import "./styles/footer.css";
import "./styles/homepage.css";
import "./styles/login-register.css";
import "./styles/dashboard.css";
import "./styles/create-order.css";
import "./styles/view-orders.css";
import "./styles/portfolio.css";
import "./styles/ExploreOpportunities.css";

// Create User Context
export const UserContext = createContext();

function App() {
  const [user, setUser] = useState(null); // State for managing user data

  useEffect(() => {
    // Retrieve user from localStorage on app load
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <div className="wrapper">
          <Header />
          <div className="content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-cancelled" element={<PaymentCancelled />} />
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creator-dashboard"
                element={
                  <ProtectedRoute>
                    <CreatorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute>
                    <PortfolioManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/opportunities"
                element={
                  <ProtectedRoute>
                    <ExploreOpportunities />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-order"
                element={
                  <ProtectedRoute>
                    <CreateOrderPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/view-orders"
                element={
                  <ProtectedRoute>
                    <ViewOrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:orderId/proposals"
                element={
                  <ProtectedRoute>
                    <ProposalsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-proposals"
                element={
                  <ProtectedRoute>
                    <MyProposalsPage />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/upload-project/:proposalId" 
                element={
                  <ProtectedRoute>
                    <UploadProjectPage />
                  </ProtectedRoute>} 
              />
              <Route
                path="/discussion/:proposalId"
                element={
                  <ProtectedRoute>
                    <ProjectDiscussionPage />
                  </ProtectedRoute>
              }
            />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
