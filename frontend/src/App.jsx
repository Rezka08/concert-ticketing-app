// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import AuthDebug from './components/common/AuthDebug';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Concerts from './pages/Concerts';
import ConcertDetail from './pages/ConcertDetail';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import AuthTest from './pages/AuthTest';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageConcerts from './pages/admin/ManageConcerts';
import ManageUsers from './pages/admin/ManageUsers';
import SalesReports from './pages/admin/SalesReports';

// Import Toaster for notifications
import { Toaster } from 'react-hot-toast';

function App() {
  console.log('🚀 App component rendered');
  
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-base-100">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/concerts" element={<Concerts />} />
              <Route path="/concerts/:id" element={<ConcertDetail />} />
              
              {/* Development/Test Routes */}
              {import.meta.env.DEV && (
                <Route path="/auth-test" element={<AuthTest />} />
              )}
              
              {/* Protected User Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/concerts" 
                element={
                  <ProtectedRoute adminOnly>
                    <ManageConcerts />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute adminOnly>
                    <ManageUsers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/reports" 
                element={
                  <ProtectedRoute adminOnly>
                    <SalesReports />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 Route */}
              <Route path="*" element={
                <div className="min-h-[50vh] flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-error mb-4">404</h1>
                    <p className="text-lg mb-4">Page Not Found</p>
                    <a href="/" className="btn btn-primary">Go Home</a>
                  </div>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
          
          {/* Debug component - only show in development */}
          {import.meta.env.DEV && <AuthDebug />}
        </div>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              fontSize: '14px',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            },
            error: {
              duration: 6000,
              style: {
                background: '#ef4444',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
            loading: {
              duration: Infinity,
              style: {
                background: '#3b82f6',
                color: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;