-- Create transport table
CREATE TABLE public.transports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reference TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('maize', 'flour')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_transit', 'delivered')),
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  actual_departure TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery table
CREATE TABLE public.deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transport_id UUID NOT NULL,
  received_by TEXT NOT NULL,
  received_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_quantity DECIMAL NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('excellent', 'good', 'fair', 'damaged')),
  damage_claims TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Create foreign key relationship
ALTER TABLE public.deliveries ADD CONSTRAINT deliveries_transport_id_fkey 
FOREIGN KEY (transport_id) REFERENCES public.transports(id) ON DELETE CASCADE;

-- Create RLS policies for transports
CREATE POLICY "Users can view their own transports" 
ON public.transports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transports" 
ON public.transports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transports" 
ON public.transports 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transports" 
ON public.transports 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for deliveries
CREATE POLICY "Users can view their own deliveries" 
ON public.deliveries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deliveries" 
ON public.deliveries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deliveries" 
ON public.deliveries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deliveries" 
ON public.deliveries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_transports_updated_at
BEFORE UPDATE ON public.transports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at
BEFORE UPDATE ON public.deliveries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();