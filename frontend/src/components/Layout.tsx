import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Layout.module.css';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          AI Job Board
        </Link>
        <nav className={styles.nav}>
          <Link to="/">Jobs</Link>
          {user ? (
            <>
              {user.role === 'applicant' && (
                <Link to="/applications">My Applications</Link>
              )}
              {user.role === 'hr' && (
                <Link to="/hr">HR Dashboard</Link>
              )}
              <span className={styles.userName}>{user.full_name}</span>
              <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className={styles.registerBtn}>
                Register
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
