import React, { useState, createContext } from "react";
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

import "./styles/general.css";
import "./styles/header.css";
import "./styles/footer.css";
import "./styles/homepage.css";
import "./styles/login-register.css";
import "./styles/dashboard.css";
import "./styles/create-order.css";
import "./styles/view-orders.css";
import "./styles/portfolio.css";

// Create User Context
export const UserContext = createContext();

function App() {
  const [user, setUser] = useState(null); // State for managing user data

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <Header />
        <div className="content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />

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
          </Routes>
        </div>
        <Footer />
      </Router>
    </UserContext.Provider>
  );
}



export default App;