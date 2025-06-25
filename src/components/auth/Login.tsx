
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const { signUp, signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    department: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  const departments = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Business Administration'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || (isRegistering && (!formData.name || !formData.department))) {
      return;
    }

    setLoading(true);

    if (isRegistering) {
      await signUp(formData.email, formData.password, {
        name: formData.name,
        department: formData.department,
        role: 'teacher'
      });
    } else {
      await signIn(formData.email, formData.password);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 bg-blue-600 rounded-xl">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">CampusRoomz</h1>
            </div>
            <p className="text-xl text-gray-600 leading-relaxed">
              Streamline your college's room and lab booking process with our intelligent scheduling system
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Smart Scheduling</h3>
                <p className="text-gray-600">Book rooms instantly with real-time availability</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Department Integration</h3>
                <p className="text-gray-600">Seamless coordination across all departments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 lg:hidden">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">CampusRoomz</h1>
              </div>
              <CardTitle className="text-2xl">
                {isRegistering ? 'Create Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription>
                {isRegistering 
                  ? 'Join your college\'s room booking system' 
                  : 'Sign in to manage your room bookings'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegistering && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required={isRegistering}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="teacher@college.edu"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                {isRegistering && (
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={isRegistering}
                    >
                      <option value="">Select your department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : (isRegistering ? 'Create Account' : 'Sign In')}
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    disabled={loading}
                  >
                    {isRegistering 
                      ? 'Already have an account? Sign in' 
                      : 'Need an account? Register here'
                    }
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
