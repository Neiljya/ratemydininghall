import { Outlet } from 'react-router-dom';
import TopBar from '../topbar/Topbar'; 
import styles from './Layout.module.css';

export default function Layout() {
  return (

    <div className={styles.appContainer}>
    {/* Ensures the topbar always pinned to the top */}
      <div className={styles.header}>
        <TopBar header="RateMyDiningHall @ UCSD" />
      </div>

      {/* Outlet renders the current page (Login, Review, etc.) */}
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}