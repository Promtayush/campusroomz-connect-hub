
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { X, Calendar, Clock, MapPin } from 'lucide-react';

interface BookingFormProps {
  onSubmit: (bookingData: any) => void;
  onClose: () => void;
  user: any;
}

const BookingForm = ({ onSubmit, onClose, user }: BookingFormProps) => {
  const [formData, setFormData] = useState({
    roomName: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: ''
  });

  const rooms = [
    'Conference Room A',
    'Conference Room B',
    'Conference Room C',
    'Lab B-202',
    'Lab C-101',
    'Lab D-303',
    'Seminar Hall',
    'Meeting Room 1',
    'Meeting Room 2',
    'Meeting Room 3'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.roomName || !formData.date || !formData.startTime || !formData.endTime || !formData.purpose) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Validate time
    if (formData.startTime >= formData.endTime) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive"
      });
      return;
    }

    // Validate working hours (9 AM to 6 PM)
    const startHour = parseInt(formData.startTime.split(':')[0]);
    const endHour = parseInt(formData.endTime.split(':')[0]);
    
    if (startHour < 9 || endHour > 18) {
      toast({
        title: "Error",
        description: "Bookings are only allowed during working hours (9 AM - 6 PM)",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: `Room ${formData.roomName} booked successfully!`
    });

    onSubmit(formData);
  };

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Book a Room</CardTitle>
                <CardDescription>Reserve a meeting room or lab for your event</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room/Lab *</Label>
                <select
                  id="roomName"
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  min={today}
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  min="09:00"
                  max="18:00"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-gray-500">Working hours: 9:00 AM - 6:00 PM</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  min="09:00"
                  max="18:00"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose/Event Description *</Label>
              <textarea
                id="purpose"
                name="purpose"
                placeholder="Describe the purpose of your booking..."
                value={formData.purpose}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="attendees">Expected Attendees</Label>
              <Input
                id="attendees"
                name="attendees"
                type="number"
                placeholder="Number of attendees"
                value={formData.attendees}
                onChange={handleInputChange}
                min="1"
                max="100"
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Teacher:</strong> {user.name}</p>
                <p><strong>Department:</strong> {user.department}</p>
                <p><strong>Room:</strong> {formData.roomName || 'Not selected'}</p>
                <p><strong>Date & Time:</strong> {formData.date || 'Not selected'} {formData.startTime && formData.endTime ? `${formData.startTime} - ${formData.endTime}` : ''}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Calendar className="h-4 w-4 mr-2" />
                Confirm Booking
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingForm;
