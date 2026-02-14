import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { JobDetail } from './pages/JobDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MyApplications } from './pages/MyApplications';
import { ApplicationDetail } from './pages/ApplicationDetail';
import { HRDashboard } from './pages/HRDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/applications" element={<MyApplications />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
            <Route path="/hr" element={<HRDashboard />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
