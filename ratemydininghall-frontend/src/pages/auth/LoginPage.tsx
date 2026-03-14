// pages/auth/LoginPage.tsx
import { SignIn } from '@clerk/clerk-react';
import styles from './login-page.module.css'; // You can keep your wrapper styles to center it

export default function LoginPage() {
  return (
    <div className={styles.wrapper}>
      <SignIn 
        routing="path" 
        path="/login" 
        // Redirects users to the home page after successful login
        fallbackRedirectUrl="/" 
      />
    </div>
  );
}