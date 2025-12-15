import { useDiningHallsBootstrap } from '@hooks/useDiningHallsBootstrap';
import { useReviewsBootstrap } from '@hooks/useReviewsBootstrap';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { selectAuthLoading, selectIsAdmin } from '@redux/auth-slice/authSelectors';
import { useEffect } from 'react';
import { fetchMe } from '@redux/auth-slice/authSlice';
import { Routes, Route, Navigate } from 'react-router-dom';

// components
import Layout from '@components/layout/Layout';

// pages
import ReviewPage from './pages/review-page/ReviewPage';
import LoginPage from './pages/auth/LoginPage';

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

            {/* admin-only area */}
            {/* <Route
            path="/admin"
            element={
                <RequireAdmin>
                <AdminPage />
                </RequireAdmin>
            }
            /> */}

        </Route>
    </Routes>
  );
}

export default App;
