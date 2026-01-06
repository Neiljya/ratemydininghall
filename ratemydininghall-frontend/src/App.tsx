import { useDiningHallsBootstrap } from '@hooks/useDiningHallsBootstrap';
import { useReviewsBootstrap } from '@hooks/useReviewsBootstrap';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { selectAuthLoading, selectIsAdmin } from '@redux/auth-slice/authSelectors';
import { useEffect } from 'react';
import { fetchMe } from '@redux/auth-slice/authSlice';
import { Routes, Route, Navigate } from 'react-router-dom';
import { setCachePolicies } from '@utils/cache';

setCachePolicies({
  diningHalls: { v: 2, ttlMs: 10 * 60 * 1000 },
  reviews:     { v: 1, ttlMs: 2 * 60 * 1000 },
  menuItems:   { v: 3, ttlMs: 5 * 60 * 1000 },
});
// components
import Layout from '@components/layout/Layout';

// pages
import ReviewPage from './pages/review-page/ReviewPage';
import LoginPage from './pages/auth/LoginPage';
import AdminPanelPage from './pages/admin/AdminPanelPage';
import DiningHallDetailPage from './pages/dining-hall-detail/DiningHallDetailPage';

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const isAdmin = useAppSelector(selectIsAdmin);
  const loading = useAppSelector(selectAuthLoading);

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  useDiningHallsBootstrap();
  useReviewsBootstrap();

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <Routes>
        <Route element={<Layout />}>
            <Route path="/" element={<ReviewPage />} />

            {/* universal login */}
            <Route path="/login" element={<LoginPage />} />
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
