import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Job } from '../api/client';
import styles from './Home.module.css';

export function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.jobs
      .list()
      .then((res) => setJobs(res.jobs))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Loading jobs...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.home}>
      <h1>Open Positions</h1>
      <div className={styles.grid}>
        {jobs.map((job) => (
          <article key={job.id} className={styles.card}>
            <h2>{job.title}</h2>
            <p className={styles.location}>{job.location}</p>
            <p className={styles.salary}>{job.salary_range}</p>
            <p className={styles.desc}>{job.description.slice(0, 120)}...</p>
            <Link to={`/jobs/${job.id}`} className={styles.applyLink}>
              View & Apply
            </Link>
          </article>
        ))}
      </div>
      {jobs.length === 0 && (
        <p className={styles.empty}>No open positions at the moment.</p>
      )}
    </div>
  );
}
