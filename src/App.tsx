import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SubmissionForm } from './components/SubmissionForm';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginPage } from './components/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';

function Navigation() {
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // No need to manually update user; useAuth handles it
  };

  if (loading) {
    return <div>Loading...</div>; // Optionally render a loading state
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center px-4 text-gray-900 hover:text-gray-600">
              Submit
            </Link>
            {user && (
              <Link to="/admin" className="flex items-center px-4 text-gray-900 hover:text-gray-600">
                Admin Dashboard
              </Link>
            )}
          </div>
          {user && (
            <button onClick={handleLogout} className="flex items-center px-4 text-gray-900 hover:text-gray-600">
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <main className="py-10">
          <Routes>
            <Route path="/" element={<SubmissionForm />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;