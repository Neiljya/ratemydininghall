import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { login, logout } from '@redux/auth-slice/authSlice';
import {
  selectIsAuthed,
  selectAuthRole,
  selectAuthLoading,
  selectAuthError,
} from '@redux/auth-slice/authSelectors';
import styles from './login-page.module.css';
import containerStyles from '@containerStyles/globalContainer.module.css';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectAuthRole);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // track if the user clicked the button
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await dispatch(login({ username, password }));
    
    if (login.fulfilled.match(res) && res.payload.ok) {
      navigate('/');
    } else {
      // only turn off submitting if we failed and are staying on the page
      setIsSubmitting(false);
    }
  };

  const onLogout = async () => {
    await dispatch(logout());
  };

  return (
    <div className={styles.wrapper}>
      <div className={`${containerStyles.roundContainer} ${styles.card}`}>
        <h2 className={styles.title}>Login</h2>
        <p className={styles.subtitle}>
          Account creation not yet implemented (coming soon)
        </p>

        {isAuthed ? (
          <>
            <p className={styles.sessionInfo}>
              Signed in{role ? ` as ${role}` : ''}.
            </p>

            <div className={styles.actions}>
              <button 
                type="button" 
                className={styles.button}
                onClick={() => navigate('/')}
              >
                Back to app
              </button>
              <button 
                type="button" 
                className={styles.button}
                onClick={onLogout} 
                disabled={loading}
              >
                {loading ? '...' : 'Logout'}
              </button>
            </div>
          </>
        ) : (
          <form className={styles.form} onSubmit={onLogin}>
            <label className={styles.label}>
              Username
              <input
                className={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </label>

            <label className={styles.label}>
              Password
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.button}
                // disabled if still loading state or in process of logging in
                disabled={loading || isSubmitting}
              >
                {/* only change text if the user clicked submit */}
                {isSubmitting ? 'Logging in…' : 'Login'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}