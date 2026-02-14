const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  } else {
    delete headers['Content-Type'];
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }
  return data as T;
}

export const api = {
  auth: {
    register: (body: { email: string; password: string; full_name: string }) =>
      request<{ token: string; user: { id: number; email: string; full_name: string; role: string } }>(
        '/auth/register',
        { method: 'POST', body: JSON.stringify(body) }
      ),
    login: (body: { email: string; password: string }) =>
      request<{ token: string; user: { id: number; email: string; full_name: string; role: string } }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify(body) }
      ),
    me: () =>
      request<{ id: number; email: string; full_name: string; role: string }>('/auth/me'),
  },
  jobs: {
    list: () => request<{ jobs: Job[] }>('/jobs'),
    get: (id: number) => request<{ job: Job }>(`/jobs/${id}`),
  },
  applications: {
    submit: (formData: FormData) =>
      request<{ message: string; application: { id: number; status: string } }>(
        '/applications',
        { method: 'POST', body: formData }
      ),
    myApplications: () =>
      request<{ applications: ApplicationWithJob[] }>('/applications/my-applications'),
    get: (id: number) =>
      request<{ application: ApplicationDetail }>(`/applications/${id}`),
  },
  hr: {
    applications: (params?: { status?: string; job_id?: string }) => {
      const q = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
      return request<{ applications: HRApplication[]; count: number }>(`/hr/applications${q}`);
    },
    applicationDetails: (id: number) =>
      request<{ application: HRApplicationDetail }>(`/hr/applications/${id}`),
    updateStatus: (id: number, status: string) =>
      request<{ message: string }>(`/hr/applications/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    stats: () =>
      request<HRStats>('/hr/stats'),
  },
};

export interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary_range: string;
  status: string;
}

export interface ApplicationWithJob {
  id: number;
  job_id: number;
  full_name: string;
  email: string;
  status: string;
  ai_score: number | null;
  ai_feedback: string | null;
  created_at: string;
  job: { title: string; location: string; company: string } | null;
}

export interface ApplicationDetail {
  id: number;
  job_id: number;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  ai_score: number | null;
  ai_feedback: string | null;
  created_at: string;
  job: { title: string; description: string; location: string } | null;
}

export interface HRApplication {
  id: number;
  job_id: number;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  ai_score: number | null;
  ai_feedback: string | null;
  created_at: string;
  job_title?: string;
  job_location?: string;
}

export interface HRApplicationDetail extends HRApplication {
  job: {
    id: number;
    title: string;
    description: string;
    requirements: string;
    location: string;
    salary_range: string;
  } | null;
}

export interface HRStats {
  total_applications: number;
  pending: number;
  evaluating: number;
  under_review: number;
  accepted: number;
  rejected: number;
  total_jobs: number;
  active_jobs: number;
  average_ai_score: number | null;
}
