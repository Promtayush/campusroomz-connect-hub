
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Calendar, Clock, MapPin, Users, Plus, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import BookingForm from '@/components/booking/BookingForm';
import BookingList from '@/components/booking/BookingList';
import StatsCards from '@/components/dashboard/StatsCards';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchBookings();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setUserProfile(data);
    }
  };

  const fetchBookings = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });
    
    if (data) {
      // Transform database data to match component expectations
      const transformedBookings = data.map(booking => ({
        id: booking.id,
        roomName: booking.room_name,
        date: booking.date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        purpose: booking.purpose,
        attendees: booking.attendees,
        status: new Date(booking.date) < new Date() ? 'past' : 'upcoming',
        department: userProfile?.department || 'Computer Science'
      }));
      setBookings(transformedBookings);
    }
  };

  const handleNewBooking = async (bookingData: any) => {
    // Refresh bookings after creation
    await fetchBookings();
    setShowBookingForm(false);

    // Log activity
    if (user) {
      await supabase.from('activities').insert({
        user_id: user.id,
        action_type: 'booking_created',
        description: `Created booking for ${bookingData.roomName}`,
        metadata: bookingData
      });
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const pastBookings = bookings.filter(b => b.status === 'past');

  const displayName = userProfile?.name || user?.email?.split('@')[0] || 'User';
  const displayDepartment = userProfile?.department || 'Computer Science';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CampusRoomz</h1>
                <p className="text-sm text-gray-600">Room Booking System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-600">{displayDepartment}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome back, {displayName}!</h2>
                <p className="text-blue-100">Ready to book your next room or lab session?</p>
              </div>
              <Button
                onClick={() => setShowBookingForm(true)}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards bookings={bookings} />

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past Bookings</TabsTrigger>
              <TabsTrigger value="rooms">Available Rooms</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span>Today's Schedule</span>
                    </CardTitle>
                    <CardDescription>Your bookings for today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {upcomingBookings.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingBookings.slice(0, 3).map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{booking.roomName}</p>
                              <p className="text-sm text-gray-600">{booking.startTime} - {booking.endTime}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">{booking.purpose}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No bookings for today</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <span>Quick Stats</span>
                    </CardTitle>
                    <CardDescription>Your booking summary</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Bookings</span>
                        <span className="font-semibold">{bookings.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">This Month</span>
                        <span className="font-semibold">{bookings.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department</span>
                        <span className="font-semibold">{displayDepartment}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="upcoming">
              <BookingList 
                bookings={upcomingBookings} 
                title="Upcoming Bookings"
                emptyMessage="No upcoming bookings found"
              />
            </TabsContent>

            <TabsContent value="past">
              <BookingList 
                bookings={pastBookings} 
                title="Past Bookings"
                emptyMessage="No past bookings found"
              />
            </TabsContent>

            <TabsContent value="rooms">
              <Card>
                <CardHeader>
                  <CardTitle>Available Rooms & Labs</CardTitle>
                  <CardDescription>Browse and book available spaces</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['Conference Room A', 'Conference Room B', 'Lab B-202', 'Lab C-101', 'Seminar Hall', 'Meeting Room 3'].map((room) => (
                      <div key={room} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <h3 className="font-medium mb-2">{room}</h3>
                        <p className="text-sm text-gray-600 mb-3">Available for booking</p>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => setShowBookingForm(true)}
                        >
                          Book Now
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingForm
          onSubmit={handleNewBooking}
          onClose={() => setShowBookingForm(false)}
          user={{ name: displayName, department: displayDepartment }}
        />
      )}
    </div>
  );
};

export default Dashboard;
