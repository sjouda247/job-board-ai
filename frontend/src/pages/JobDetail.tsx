import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Job } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import styles from './JobDetail.module.css';

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
  });
  const [resume, setResume] = useState<File | null>(null);

  useEffect(() => {
    if (!id) return;
    api.jobs
      .get(parseInt(id))
      .then((res) => setJob(res.job))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        full_name: user.full_name,
        email: user.email,
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !resume) {
      setSubmitError('Please fill all fields and upload a resume.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    const fd = new FormData();
    fd.append('job_id', job.id.toString());
    fd.append('full_name', form.full_name);
    fd.append('email', form.email);
    fd.append('phone', form.phone);
    fd.append('resume', resume);
    try {
      await api.applications.submit(fd);
      setSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error || !job) return <div className={styles.error}>{error || 'Job not found'}</div>;

  if (success) {
    return (
      <div className={styles.success}>
        <h2>Application submitted!</h2>
        <p>Your application is being reviewed. Check back soon for feedback.</p>
        <button type="button" onClick={() => navigate('/applications')}>
          View my applications
        </button>
      </div>
    );
  }

  return (
    <div className={styles.detail}>
      <h1>{job.title}</h1>
      <p className={styles.meta}>
        {job.location} · {job.salary_range}
      </p>
      <section>
        <h2>Description</h2>
        <p>{job.description}</p>
      </section>
      <section>
        <h2>Requirements</h2>
        <p>{job.requirements}</p>
      </section>

      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Apply for this position</h2>
        <label>
          Full name *
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            required
          />
        </label>
        <label>
          Email *
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
        </label>
        <label>
          Phone
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </label>
        <label>
          Resume (PDF, DOC, DOCX) *
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResume(e.target.files?.[0] || null)}
            required
          />
        </label>
        {submitError && <p className={styles.submitError}>{submitError}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
