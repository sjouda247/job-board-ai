import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, ApplicationDetail as AppDetailType } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import styles from './ApplicationDetail.module.css';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  evaluating: 'Evaluating',
  under_review: 'Under review',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [application, setApplication] = useState<AppDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!id || !user) return;
    api.applications
      .get(parseInt(id))
      .then((res) => setApplication(res.application))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (authLoading) return null;
  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error || !application) return <div className={styles.error}>{error || 'Not found'}</div>;

  return (
    <div className={styles.page}>
      <h1>Application details</h1>
      <article className={styles.card}>
        <h2>{application.job?.title}</h2>
        <p className={styles.location}>{application.job?.location}</p>
        <span className={`${styles.status} ${styles[application.status]}`}>
          {STATUS_LABELS[application.status] || application.status}
        </span>
        <dl>
          <dt>Full name</dt>
          <dd>{application.full_name}</dd>
          <dt>Email</dt>
          <dd>{application.email}</dd>
          <dt>Phone</dt>
          <dd>{application.phone || '-'}</dd>
          <dt>Applied</dt>
          <dd>{new Date(application.created_at).toLocaleDateString()}</dd>
        </dl>
        {application.ai_score != null && (
          <p className={styles.score}>AI Score: {application.ai_score}/10</p>
        )}
        {application.ai_feedback && (
          <div>
            <h3>AI Feedback</h3>
            <p>{application.ai_feedback}</p>
          </div>
        )}
        <button type="button" onClick={() => navigate('/applications')}>
          Back to my applications
        </button>
      </article>
    </div>
  );
}
