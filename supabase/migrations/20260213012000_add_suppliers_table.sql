-- Create suppliers table for MSME/verified supplier data
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enterprise_name TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  enterprise_type TEXT NOT NULL CHECK (enterprise_type IN ('Micro', 'Small', 'Medium')),
  major_activity TEXT NOT NULL CHECK (major_activity IN ('Manufacturing', 'Services')),
  nic_code TEXT NOT NULL,
  production_commenced BOOLEAN NOT NULL DEFAULT true,
  registration_date DATE,
  social_category TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_suppliers_state ON public.suppliers(state);
CREATE INDEX idx_suppliers_district ON public.suppliers(district);
CREATE INDEX idx_suppliers_nic_code ON public.suppliers(nic_code);
CREATE INDEX idx_suppliers_enterprise_type ON public.suppliers(enterprise_type);
CREATE INDEX idx_suppliers_major_activity ON public.suppliers(major_activity);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Anyone can view suppliers (public data)
CREATE POLICY "Anyone can view suppliers"
ON public.suppliers
FOR SELECT
USING (true);

-- Only authenticated users can suggest new suppliers (for future feature)
CREATE POLICY "Authenticated users can insert suppliers"
ON public.suppliers
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert dummy supplier data
INSERT INTO public.suppliers (enterprise_name, district, state, enterprise_type, major_activity, nic_code, production_commenced, registration_date, social_category, contact_phone, contact_email) VALUES
-- Food & Beverages
('Shree Krishna Food Products', 'MUMBAI', 'MAHARASHTRA', 'Small', 'Manufacturing', '10712', true, '2022-03-15', 'General', '+91 22 2345 6789', 'info@skfoodproducts.com'),
('Annapurna Spices & Masala', 'DELHI', 'DELHI', 'Micro', 'Manufacturing', '10751', true, '2021-08-20', 'General', '+91 11 4567 8901', 'sales@annapurnaspices.in'),
('Fresh Valley Organic Foods', 'BANGALORE', 'KARNATAKA', 'Small', 'Manufacturing', '10320', true, '2023-01-10', 'General', '+91 80 2234 5678', 'contact@freshvalley.co.in'),
('Golden Harvest Flour Mills', 'LUDHIANA', 'PUNJAB', 'Medium', 'Manufacturing', '10611', true, '2020-05-12', 'General', '+91 161 234 5678', 'info@goldenharvest.com'),
('Dairy Fresh Products Ltd', 'PUNE', 'MAHARASHTRA', 'Small', 'Manufacturing', '10501', true, '2021-11-25', 'General', '+91 20 3456 7890', 'orders@dairyfresh.in'),

-- Textiles & Clothing
('Rajasthan Handloom Exports', 'JAIPUR', 'RAJASTHAN', 'Small', 'Manufacturing', '13201', true, '2019-07-18', 'General', '+91 141 234 5678', 'export@rajhandloom.com'),
('Cotton Craft Textiles', 'COIMBATORE', 'TAMIL NADU', 'Medium', 'Manufacturing', '13101', true, '2018-03-22', 'General', '+91 422 345 6789', 'sales@cottoncraft.co.in'),
('Fashion Forward Garments', 'SURAT', 'GUJARAT', 'Small', 'Manufacturing', '14101', true, '2022-09-05', 'General', '+91 261 456 7890', 'info@fashionforward.in'),

-- Electronics & Technology
('TechVision Electronics', 'NOIDA', 'UTTAR PRADESH', 'Small', 'Manufacturing', '26401', true, '2021-06-14', 'General', '+91 120 567 8901', 'contact@techvision.in'),
('Smart Components India', 'CHENNAI', 'TAMIL NADU', 'Medium', 'Manufacturing', '26110', true, '2020-02-28', 'General', '+91 44 2345 6789', 'sales@smartcomponents.co.in'),

-- Agriculture & Raw Materials
('Green Fields Agro Suppliers', 'NASHIK', 'MAHARASHTRA', 'Micro', 'Services', '01110', true, '2022-04-10', 'General', '+91 253 234 5678', 'info@greenfields.in'),
('Organic Harvest Co-operative', 'INDORE', 'MADHYA PRADESH', 'Small', 'Services', '01130', true, '2021-12-05', 'General', '+91 731 345 6789', 'contact@organicharvest.co.in'),

-- Packaging & Industrial
('EcoPack Solutions', 'AHMEDABAD', 'GUJARAT', 'Small', 'Manufacturing', '17021', true, '2023-02-18', 'General', '+91 79 4567 8901', 'sales@ecopack.in'),
('Prime Plastic Industries', 'KOLKATA', 'WEST BENGAL', 'Medium', 'Manufacturing', '22201', true, '2019-10-30', 'General', '+91 33 2345 6789', 'info@primeplastic.com'),

-- Export Partners
('Global Trade Solutions', 'MUMBAI', 'MAHARASHTRA', 'Small', 'Services', '46900', true, '2020-08-15', 'General', '+91 22 6789 0123', 'export@globaltradesolutions.in'),
('India Export Hub', 'DELHI', 'DELHI', 'Medium', 'Services', '52291', true, '2018-11-20', 'General', '+91 11 5678 9012', 'contact@indiaexporthub.com'),

-- Handicrafts & Artisan
('Heritage Handicrafts', 'VARANASI', 'UTTAR PRADESH', 'Micro', 'Manufacturing', '32120', true, '2021-05-08', 'OBC', '+91 542 234 5678', 'sales@heritagehandicrafts.in'),
('Artisan Collective India', 'JAIPUR', 'RAJASTHAN', 'Small', 'Manufacturing', '31091', true, '2022-07-22', 'General', '+91 141 345 6789', 'info@artisancollective.co.in'),

-- Health & Beauty
('Ayurvedic Wellness Products', 'KOCHI', 'KERALA', 'Small', 'Manufacturing', '21001', true, '2020-12-10', 'General', '+91 484 456 7890', 'contact@ayurvedicwellness.in'),
('Natural Beauty Cosmetics', 'HYDERABAD', 'TELANGANA', 'Micro', 'Manufacturing', '20423', true, '2023-03-15', 'General', '+91 40 2345 6789', 'sales@naturalbeauty.co.in');
