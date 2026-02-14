import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, HRStats, HRApplication } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import styles from './HRDashboard.module.css';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  evaluating: 'Evaluating',
  under_review: 'Under review',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export function HRDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<HRStats | null>(null);
  const [applications, setApplications] = useState<HRApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'hr') {
      navigate('/');
      return;
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role !== 'hr') return;
    Promise.all([
      api.hr.stats(),
      api.hr.applications(statusFilter ? { status: statusFilter } : undefined),
    ])
      .then(([statsRes, appsRes]) => {
        setStats(statsRes);
        setApplications(appsRes.applications);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, statusFilter]);

  const handleStatusChange = async (appId: number, newStatus: string) => {
    setUpdating(appId);
    try {
      await api.hr.updateStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      if (stats) {
        setStats((prev) => {
          if (!prev) return prev;
          const s = { ...prev };
          const old = applications.find((a) => a.id === appId)?.status;
          if (old) (s as Record<string, number>)[old] = Math.max(0, (s as Record<string, number>)[old] - 1);
          (s as Record<string, number>)[newStatus] = ((s as Record<string, number>)[newStatus] || 0) + 1;
          return s;
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  if (authLoading || (user && user.role !== 'hr')) return null;

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.page}>
      <h1>HR Dashboard</h1>
      {stats && (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.total_applications}</span>
            <span>Total applications</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.pending}</span>
            <span>Pending</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.evaluating}</span>
            <span>Evaluating</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.under_review}</span>
            <span>Under review</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.accepted}</span>
            <span>Accepted</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.rejected}</span>
            <span>Rejected</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.active_jobs}</span>
            <span>Active jobs</span>
          </div>
          {stats.average_ai_score != null && (
            <div className={styles.stat}>
              <span className={styles.statValue}>{stats.average_ai_score}</span>
              <span>Avg AI score</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.filters}>
        <label>
          Filter by status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="evaluating">Evaluating</option>
            <option value="under_review">Under review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Applicant</th>
              <th>Job</th>
              <th>Status</th>
              <th>AI Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>{app.id}</td>
                <td>
                  <div>{app.full_name}</div>
                  <div className={styles.email}>{app.email}</div>
                </td>
                <td>{app.job_title || `Job #${app.job_id}`}</td>
                <td>
                  <span className={`${styles.status} ${styles[app.status]}`}>
                    {STATUS_LABELS[app.status] || app.status}
                  </span>
                </td>
                <td>{app.ai_score != null ? `${app.ai_score}/10` : '-'}</td>
                <td>
                  {app.status === 'under_review' && (
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.acceptBtn}
                        disabled={updating === app.id}
                        onClick={() => handleStatusChange(app.id, 'accepted')}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className={styles.rejectBtn}
                        disabled={updating === app.id}
                        onClick={() => handleStatusChange(app.id, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {app.status === 'pending' && (
                    <span className={styles.waiting}>Evaluating...</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {applications.length === 0 && (
        <p className={styles.empty}>No applications match the filter.</p>
      )}
    </div>
  );
}
