
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('AuthGuard - User:', user, 'Loading:', loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    console.log('AuthGuard - No user, redirecting to auth');
    // Redirect to login but save the current location they tried to access
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  console.log('AuthGuard - User authenticated, rendering children');
  return <>{children}</>;
}
