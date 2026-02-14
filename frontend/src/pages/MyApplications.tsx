import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApplicationWithJob } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import styles from './MyApplications.module.css';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  evaluating: 'Evaluating',
  under_review: 'Under review',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export function MyApplications() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'applicant') {
      navigate('/');
      return;
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role !== 'applicant') return;
    api.applications
      .myApplications()
      .then((res) => setApplications(res.applications))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || (user && user.role !== 'applicant')) return null;

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.page}>
      <h1>My Applications</h1>
      {applications.length === 0 ? (
        <p className={styles.empty}>
          You haven&apos;t applied to any jobs yet.{' '}
          <Link to="/">Browse jobs</Link>
        </p>
      ) : (
        <div className={styles.list}>
          {applications.map((app) => (
            <article key={app.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>{app.job?.title || 'Job'}</h2>
                <span className={`${styles.status} ${styles[app.status]}`}>
                  {STATUS_LABELS[app.status] || app.status}
                </span>
              </div>
              <p className={styles.location}>{app.job?.location}</p>
              {app.ai_score != null && (
                <p className={styles.score}>AI Score: {app.ai_score}/10</p>
              )}
              {app.ai_feedback && (
                <p className={styles.feedback}>{app.ai_feedback}</p>
              )}
              <Link to={`/applications/${app.id}`} className={styles.viewLink}>
                View details
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
