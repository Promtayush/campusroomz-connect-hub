-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  head_of_department TEXT,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rooms table with detailed information
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  room_number TEXT,
  building TEXT,
  floor INTEGER,
  capacity INTEGER NOT NULL DEFAULT 1,
  room_type TEXT NOT NULL CHECK (room_type IN ('conference_room', 'lab', 'classroom', 'seminar_hall', 'meeting_room', 'auditorium')),
  description TEXT,
  equipment TEXT[], -- Array of equipment available
  is_active BOOLEAN DEFAULT true,
  booking_rules JSONB, -- Store special rules like advance booking time, max duration, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create equipment table
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- projector, whiteboard, computer, etc.
  is_portable BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create room_equipment junction table
CREATE TABLE public.room_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1,
  condition TEXT DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'out_of_order')),
  notes TEXT,
  UNIQUE(room_id, equipment_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  related_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create booking status history table
CREATE TABLE public.booking_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all new tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for departments (everyone can read)
CREATE POLICY "Everyone can view departments" 
  ON public.departments 
  FOR SELECT 
  USING (true);

-- RLS Policies for rooms (everyone can read)
CREATE POLICY "Everyone can view active rooms" 
  ON public.rooms 
  FOR SELECT 
  USING (is_active = true);

-- RLS Policies for equipment (everyone can read)
CREATE POLICY "Everyone can view equipment" 
  ON public.equipment 
  FOR SELECT 
  USING (true);

CREATE POLICY "Everyone can view room equipment" 
  ON public.room_equipment 
  FOR SELECT 
  USING (true);

-- RLS Policies for notifications (users can only see their own)
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for booking status history (users can see history for their bookings)
CREATE POLICY "Users can view their booking history" 
  ON public.booking_status_history 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE bookings.id = booking_status_history.booking_id 
      AND bookings.user_id = auth.uid()
    )
  );

-- Insert sample departments
INSERT INTO public.departments (name, description) VALUES
('Computer Science', 'Department of Computer Science and Engineering'),
('Mathematics', 'Department of Mathematics'),
('Physics', 'Department of Physics'),
('Chemistry', 'Department of Chemistry'),
('Biology', 'Department of Biology'),
('Business Administration', 'Department of Business Administration'),
('English', 'Department of English Literature');

-- Insert sample equipment
INSERT INTO public.equipment (name, description, category, is_portable) VALUES
('Projector', 'HD Digital Projector', 'presentation', true),
('Whiteboard', 'Interactive Whiteboard', 'writing', false),
('Computer', 'Desktop Computer', 'computing', false),
('Laptop', 'Portable Laptop Computer', 'computing', true),
('Microphone', 'Wireless Microphone System', 'audio', true),
('Speaker System', '5.1 Surround Sound System', 'audio', false),
('Video Camera', 'HD Video Recording Camera', 'recording', true),
('Smart TV', '65 inch Smart Display', 'display', false);

-- Insert sample rooms with proper details
INSERT INTO public.rooms (name, room_number, building, floor, capacity, room_type, description, equipment) VALUES
('Conference Room A', 'A-101', 'Main Building', 1, 20, 'conference_room', 'Large conference room with presentation facilities', ARRAY['Projector', 'Whiteboard', 'Speaker System']),
('Conference Room B', 'A-102', 'Main Building', 1, 12, 'conference_room', 'Medium conference room', ARRAY['Projector', 'Whiteboard']),
('Conference Room C', 'A-103', 'Main Building', 1, 8, 'conference_room', 'Small conference room for intimate meetings', ARRAY['Smart TV', 'Whiteboard']),
('Lab B-202', 'B-202', 'Science Building', 2, 30, 'lab', 'Computer Science Laboratory', ARRAY['Computer', 'Projector', 'Whiteboard']),
('Lab C-101', 'C-101', 'Science Building', 1, 25, 'lab', 'Physics Laboratory', ARRAY['Projector', 'Whiteboard']),
('Lab D-303', 'D-303', 'Science Building', 3, 35, 'lab', 'Chemistry Laboratory', ARRAY['Projector', 'Whiteboard']),
('Seminar Hall', 'SH-001', 'Main Building', 0, 100, 'seminar_hall', 'Large seminar hall for presentations', ARRAY['Projector', 'Microphone', 'Speaker System', 'Smart TV']),
('Meeting Room 1', 'M-201', 'Admin Building', 2, 6, 'meeting_room', 'Small meeting room', ARRAY['Smart TV']),
('Meeting Room 2', 'M-202', 'Admin Building', 2, 6, 'meeting_room', 'Small meeting room', ARRAY['Smart TV']),
('Meeting Room 3', 'M-203', 'Admin Building', 2, 10, 'meeting_room', 'Medium meeting room', ARRAY['Projector', 'Whiteboard']);

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_booking_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
  VALUES (p_user_id, p_title, p_message, p_type, p_booking_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log booking status changes
CREATE OR REPLACE FUNCTION public.log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.booking_status_history (booking_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
    
    -- Create notification for status change
    PERFORM public.create_notification(
      NEW.user_id,
      'Booking Status Updated',
      'Your booking for ' || NEW.room_name || ' on ' || NEW.date || ' has been ' || NEW.status,
      CASE 
        WHEN NEW.status = 'cancelled' THEN 'warning'
        WHEN NEW.status = 'confirmed' THEN 'success'
        ELSE 'info'
      END,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for booking status changes
CREATE TRIGGER booking_status_change_trigger
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.log_booking_status_change();

-- Function to send booking confirmation notification
CREATE OR REPLACE FUNCTION public.send_booking_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Send confirmation notification
  PERFORM public.create_notification(
    NEW.user_id,
    'Booking Confirmed',
    'Your booking for ' || NEW.room_name || ' on ' || NEW.date || ' from ' || NEW.start_time || ' to ' || NEW.end_time || ' has been confirmed.',
    'success',
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new bookings
CREATE TRIGGER booking_confirmation_trigger
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.send_booking_confirmation();

-- Add triggers for updated_at columns
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update bookings table to reference rooms table (optional migration for existing data)
-- ALTER TABLE public.bookings ADD COLUMN room_id UUID REFERENCES public.rooms(id);
-- This would require data migration, so keeping room_name for now

-- Create indexes for better performance
CREATE INDEX idx_bookings_date ON public.bookings(date);
CREATE INDEX idx_bookings_room_date ON public.bookings(room_name, date);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_rooms_type_active ON public.rooms(room_type, is_active);