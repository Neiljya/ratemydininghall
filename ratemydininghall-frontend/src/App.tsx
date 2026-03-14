// App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDiningHallsBootstrap } from '@hooks/useDiningHallsBootstrap';
import { useReviewsBootstrap } from '@hooks/useReviewsBootstrap';
import { setCachePolicies } from '@utils/cache';
import ProfilePage from './pages/profile/ProfilePage';
import Layout from '@components/layout/Layout';
import ReviewPage from './pages/review-page/ReviewPage';
import LoginPage from './pages/auth/LoginPage';
import AdminPanelPage from './pages/admin/AdminPanelPage';
import DiningHallDetailPage from './pages/dining-hall-detail/DiningHallDetailPage';

// Clerk imports
import { useUser, useAuth } from "@clerk/clerk-react";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

setCachePolicies({
  diningHalls: { v: 2, ttlMs: 10 * 60 * 1000 },
  reviews:     { v: 1, ttlMs: 2 * 60 * 1000 },
  menuItems:   { v: 3, ttlMs: 5 * 60 * 1000 },
});

// Refactored to use Clerk instead of Redux
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  // Wait for Clerk to initialize
  if (!isLoaded) return null; 

  // Check if they are logged in AND have the admin metadata
  const isAdmin = user?.publicMetadata?.role === 'admin';

  if (!isSignedIn || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  useDiningHallsBootstrap();
  useReviewsBootstrap();

  // You can remove Redux's dispatch(fetchMe()) entirely! Clerk handles it.

  return (
    <Routes>
        <Route element={<Layout />}>
            <Route path="/" element={<ReviewPage />} />

            <Route 
              path="/profile" 
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              } 
            />
            {/* universal login */}
            <Route path="/login/*" element={<LoginPage />} />
            <Route path="/dining-hall/:slug" element={<DiningHallDetailPage />} />

            {/* admin-only area */}
            <Route
            path="/admin"
            element={
                <RequireAdmin>
                  <AdminPanelPage />
                </RequireAdmin>
            }
            />
        </Route>
    </Routes>
  );
}

export default App;