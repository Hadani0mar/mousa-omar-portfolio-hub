
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './components/AuthProvider';
import { Toaster } from './components/ui/toaster';
import HomePage from './pages/HomePage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProjectView from './pages/ProjectView';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="portfolio-theme">
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/project/:id" element={<ProjectView />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
        <Analytics />
        <SpeedInsights />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
