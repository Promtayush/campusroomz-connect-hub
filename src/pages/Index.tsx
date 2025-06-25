
import { useAuth } from '@/hooks/useAuth';
import Login from '@/components/auth/Login';
import Dashboard from '@/components/dashboard/Dashboard';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <Dashboard />;
};

export default Index;
