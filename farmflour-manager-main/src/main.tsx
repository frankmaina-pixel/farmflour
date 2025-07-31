import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import IndexPage from '@/pages/Index';
import { Auth } from '@/pages/Auth';
import { AppProvider } from '@/contexts/AppContext';
import { Toaster } from '@/components/ui/toaster';
import './index.css'

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={
          <AuthWrapper>
            <IndexPage />
          </AuthWrapper>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  </BrowserRouter>
);
