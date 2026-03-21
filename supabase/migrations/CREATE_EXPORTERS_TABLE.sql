-- =====================================================
-- CREATE EXPORTERS TABLE AND ADD 50 EXPORTERS
-- Run this to create a dedicated exporters table
-- =====================================================

-- =====================================================
-- CREATE EXPORTERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.exporters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  business_type TEXT NOT NULL, -- Manufacturer, Trader, Service Provider
  export_category TEXT NOT NULL, -- Food, Textiles, Handicrafts, etc.
  products_exported TEXT NOT NULL,
  export_destinations TEXT NOT NULL, -- Countries they export to
  iec_code TEXT, -- Import Export Code
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  established_year INTEGER,
  annual_turnover_range TEXT,
  employee_count_range TEXT,
  certifications TEXT, -- ISO, APEDA, FSSAI, etc.
  contact_person TEXT,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  website_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_exporters_state ON public.exporters(state);
CREATE INDEX IF NOT EXISTS idx_exporters_district ON public.exporters(district);
CREATE INDEX IF NOT EXISTS idx_exporters_category ON public.exporters(export_category);
CREATE INDEX IF NOT EXISTS idx_exporters_business_type ON public.exporters(business_type);

-- Enable RLS
ALTER TABLE public.exporters ENABLE ROW LEVEL SECURITY;

-- Anyone can view exporters (public data)
CREATE POLICY "Anyone can view exporters"
ON public.exporters
FOR SELECT
USING (true);

-- Only authenticated users can suggest new exporters
CREATE POLICY "Authenticated users can insert exporters"
ON public.exporters
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_exporters_updated_at
BEFORE UPDATE ON public.exporters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================
-- INSERT 50 EXPORTERS
-- =====================================================

INSERT INTO public.exporters (
  company_name, business_type, export_category, products_exported, 
  export_destinations, iec_code, district, state, established_year, 
  annual_turnover_range, employee_count_range, certifications, 
  contact_person, contact_phone, contact_email, website_url
) VALUES

-- Food & Beverages Exporters (15)
('Spice Route International', 'Manufacturer', 'Food & Beverages', 'Turmeric, Cumin, Coriander, Red Chili, Cardamom', 'USA, UK, UAE, Saudi Arabia, Malaysia', 'IEC0123456789', 'MUMBAI', 'MAHARASHTRA', 2015, '₹50-100 Cr', '100-200', 'APEDA, FSSAI, ISO 22000, Spices Board', 'Rajesh Kumar', '+91 22 2345 6789', 'export@spiceroute.com', 'www.spiceroute.com'),

('Basmati Exports India', 'Manufacturer', 'Food & Beverages', '1121 Basmati Rice, Pusa Basmati, Traditional Basmati', 'Middle East, Europe, USA, Canada', 'IEC0234567890', 'AMRITSAR', 'PUNJAB', 2010, '₹100-500 Cr', '200-500', 'APEDA, ISO 9001, HACCP, Organic Certified', 'Harpreet Singh', '+91 183 234 5678', 'info@basmatiexports.in', 'www.basmatiexports.in'),

('Ocean Fresh Seafood Exports', 'Manufacturer', 'Food & Beverages', 'Frozen Shrimp, Fish, Squid, Crab, Lobster', 'Japan, USA, EU, China, South Korea', 'IEC0345678901', 'VISAKHAPATNAM', 'ANDHRA PRADESH', 2012, '₹200-500 Cr', '500-1000', 'MPEDA, HACCP, BRC, ISO 22000', 'Venkat Reddy', '+91 891 345 6789', 'export@oceanfresh.co.in', 'www.oceanfreshexports.com'),

('Kerala Spice Garden', 'Manufacturer', 'Food & Beverages', 'Black Pepper, Cardamom, Clove, Nutmeg, Vanilla', 'USA, Germany, France, Japan, Australia', 'IEC0456789012', 'KOCHI', 'KERALA', 2008, '₹25-50 Cr', '50-100', 'APEDA, FSSAI, Organic India, Spices Board', 'Suresh Menon', '+91 484 456 7890', 'sales@keralaspice.com', 'www.keralaspicegarden.in'),

('Darjeeling Tea Exporters', 'Manufacturer', 'Food & Beverages', 'Darjeeling Tea, Assam Tea, Green Tea, Orthodox Tea', 'UK, USA, Russia, Germany, Japan', 'IEC0567890123', 'DARJEELING', 'WEST BENGAL', 2005, '₹50-100 Cr', '100-200', 'Tea Board, FSSAI, ISO 22000, Organic Certified', 'Anil Sharma', '+91 354 567 8901', 'export@darjeelingtea.in', 'www.darjeelingteaexports.com'),

('Cashew Corporation', 'Manufacturer', 'Food & Beverages', 'Cashew Kernels W320, W240, W180, Cashew Pieces', 'USA, UAE, UK, Netherlands, Australia', 'IEC0678901234', 'KOLLAM', 'KERALA', 2013, '₹100-200 Cr', '200-500', 'APEDA, FSSAI, HACCP, ISO 9001', 'Thomas Joseph', '+91 474 678 9012', 'info@cashewcorp.in', 'www.cashewcorporation.com'),

('Organic Honey Exports', 'Manufacturer', 'Food & Beverages', 'Multi-flora Honey, Eucalyptus Honey, Acacia Honey', 'Germany, USA, UK, France, Canada', 'IEC0789012345', 'PUNE', 'MAHARASHTRA', 2016, '₹10-25 Cr', '20-50', 'APEDA, FSSAI, Organic Certified, USDA Organic', 'Priya Deshmukh', '+91 20 789 0123', 'export@organichoney.co.in', 'www.organichoneyexports.in'),

('Mango Pulp Processors', 'Manufacturer', 'Food & Beverages', 'Alphonso Mango Pulp, Totapuri Pulp, Mixed Fruit Pulp', 'USA, UK, UAE, Saudi Arabia, Kuwait', 'IEC0890123456', 'RATNAGIRI', 'MAHARASHTRA', 2011, '₹50-100 Cr', '100-200', 'APEDA, FSSAI, HACCP, ISO 22000', 'Mangesh Patil', '+91 2352 890 1234', 'sales@mangopulp.in', 'www.mangopulpexports.com'),

('Coffee Beans International', 'Manufacturer', 'Food & Beverages', 'Arabica Coffee, Robusta Coffee, Instant Coffee', 'Italy, USA, Germany, Japan, South Korea', 'IEC0901234567', 'CHIKMAGALUR', 'KARNATAKA', 2009, '₹75-150 Cr', '150-300', 'Coffee Board, FSSAI, ISO 22000, Rainforest Alliance', 'Kiran Kumar', '+91 8262 901 2345', 'export@coffeeintl.in', 'www.coffeebeansinternational.com'),

('Fruit & Vegetable Exports', 'Trader', 'Food & Beverages', 'Fresh Grapes, Pomegranate, Onion, Potato, Okra', 'Bangladesh, UAE, UK, Netherlands, Malaysia', 'IEC1012345678', 'NASHIK', 'MAHARASHTRA', 2014, '₹25-50 Cr', '50-100', 'APEDA, FSSAI, Global GAP', 'Ramesh Pawar', '+91 253 012 3456', 'info@fruitvegexport.in', 'www.fruitvegetableexports.com'),

('Wheat Products Exporters', 'Manufacturer', 'Food & Beverages', 'Wheat Flour, Semolina, Wheat Bran, Whole Wheat', 'Middle East, Africa, Bangladesh, Sri Lanka', 'IEC1123456789', 'LUDHIANA', 'PUNJAB', 2010, '₹50-100 Cr', '100-200', 'APEDA, FSSAI, ISO 9001', 'Gurpreet Kaur', '+91 161 123 4567', 'export@wheatproducts.in', 'www.wheatexports.com'),

('Frozen Food Exports', 'Manufacturer', 'Food & Beverages', 'Frozen Vegetables, Frozen Fruits, Ready-to-Eat Meals', 'USA, UK, UAE, Singapore, Hong Kong', 'IEC1234567890', 'DELHI', 'DELHI', 2015, '₹100-200 Cr', '200-500', 'APEDA, FSSAI, HACCP, BRC, IFS', 'Amit Verma', '+91 11 234 5678', 'sales@frozenfoodexports.in', 'www.frozenfoodexports.com'),

('Dairy Products International', 'Manufacturer', 'Food & Beverages', 'Ghee, Butter, Milk Powder, Paneer, Cheese', 'UAE, Saudi Arabia, USA, UK, Singapore', 'IEC2345678901', 'ANAND', 'GUJARAT', 2008, '₹200-500 Cr', '500-1000', 'APEDA, FSSAI, ISO 22000, HACCP', 'Jayesh Patel', '+91 2692 345 6789', 'export@dairyintl.in', 'www.dairyproductsinternational.com'),

('Pickle & Chutney Exports', 'Manufacturer', 'Food & Beverages', 'Mango Pickle, Mixed Pickle, Chutneys, Papad', 'USA, UK, Canada, Australia, UAE', 'IEC3456789012', 'HYDERABAD', 'TELANGANA', 2012, '₹10-25 Cr', '50-100', 'APEDA, FSSAI, ISO 22000', 'Lakshmi Reddy', '+91 40 456 7890', 'info@pickleexports.in', 'www.picklechutneyexports.com'),

('Organic Grains Exporters', 'Manufacturer', 'Food & Beverages', 'Organic Quinoa, Millets, Brown Rice, Oats', 'USA, Germany, UK, France, Netherlands', 'IEC4567890123', 'BANGALORE', 'KARNATAKA', 2017, '₹25-50 Cr', '50-100', 'APEDA, Organic India, USDA Organic, EU Organic', 'Deepak Rao', '+91 80 567 8901', 'export@organicgrains.co.in', 'www.organicgrainsexports.com'),

-- Textiles & Clothing Exporters (12)
('Silk Saree Exports', 'Manufacturer', 'Textiles & Clothing', 'Kanchipuram Silk Sarees, Banarasi Sarees, Silk Fabrics', 'USA, UK, Canada, Australia, UAE', 'IEC5678901234', 'KANCHIPURAM', 'TAMIL NADU', 2006, '₹50-100 Cr', '200-500', 'Handloom Export Council, ISO 9001', 'Lakshmi Sundaram', '+91 44 678 9012', 'export@silksaree.in', 'www.silksareeexports.com'),

('Cotton Fabric International', 'Manufacturer', 'Textiles & Clothing', 'Cotton Fabric, Organic Cotton, Dyed Fabric, Printed Fabric', 'USA, EU, Japan, South Korea, Turkey', 'IEC6789012345', 'COIMBATORE', 'TAMIL NADU', 2010, '₹100-200 Cr', '500-1000', 'GOTS, OEKO-TEX, ISO 9001, BCI', 'Murugan Pillai', '+91 422 789 0123', 'sales@cottonfabricintl.in', 'www.cottonfabricinternational.com'),

('Denim Exports India', 'Manufacturer', 'Textiles & Clothing', 'Denim Fabric, Denim Jeans, Denim Jackets', 'USA, EU, Japan, Canada, Australia', 'IEC7890123456', 'AHMEDABAD', 'GUJARAT', 2008, '₹200-500 Cr', '1000+', 'OEKO-TEX, GOTS, ISO 9001, WRAP', 'Ketan Shah', '+91 79 890 1234', 'export@denimexports.in', 'www.denimexportsindia.com'),

('Handloom Textiles Export', 'Manufacturer', 'Textiles & Clothing', 'Handloom Sarees, Dress Materials, Home Textiles', 'USA, UK, Germany, France, Japan', 'IEC8901234567', 'VARANASI', 'UTTAR PRADESH', 2005, '₹25-50 Cr', '100-200', 'Handloom Export Council, GI Tag, ISO 9001', 'Ravi Shankar', '+91 542 901 2345', 'info@handloomexport.in', 'www.handloomtextilesexport.com'),

('Garment Manufacturers & Exporters', 'Manufacturer', 'Textiles & Clothing', 'T-Shirts, Shirts, Trousers, Kids Wear, Sportswear', 'USA, EU, UK, Canada, Australia', 'IEC9012345678', 'TIRUPUR', 'TAMIL NADU', 2012, '₹500-1000 Cr', '1000+', 'WRAP, OEKO-TEX, ISO 9001, SA 8000', 'Senthil Kumar', '+91 421 012 3456', 'export@garmentmfg.in', 'www.garmentexporters.com'),

('Home Textiles International', 'Manufacturer', 'Textiles & Clothing', 'Bed Sheets, Towels, Curtains, Table Linen, Cushion Covers', 'USA, UK, Germany, Australia, UAE', 'IEC0123456780', 'PANIPAT', 'HARYANA', 2009, '₹100-200 Cr', '500-1000', 'OEKO-TEX, ISO 9001, BSCI', 'Rajiv Gupta', '+91 180 123 4567', 'sales@hometextilesintl.in', 'www.hometextilesinternational.com'),

('Embroidery & Lace Exporters', 'Manufacturer', 'Textiles & Clothing', 'Embroidered Fabrics, Lace, Trims, Embroidered Garments', 'USA, UK, France, Italy, Spain', 'IEC1234567801', 'LUCKNOW', 'UTTAR PRADESH', 2011, '₹25-50 Cr', '100-200', 'ISO 9001, OEKO-TEX', 'Farhan Khan', '+91 522 234 5678', 'export@embroideryexports.in', 'www.embroideryexporters.com'),

('Woolen Products Export', 'Manufacturer', 'Textiles & Clothing', 'Woolen Shawls, Sweaters, Blankets, Carpets', 'USA, UK, Germany, Russia, Canada', 'IEC2345678012', 'LUDHIANA', 'PUNJAB', 2007, '₹50-100 Cr', '200-500', 'ISO 9001, Woolmark', 'Harjeet Singh', '+91 161 345 6789', 'info@woolenexport.in', 'www.woolenproductsexport.com'),

('Sportswear Exports', 'Manufacturer', 'Textiles & Clothing', 'Sports T-Shirts, Track Pants, Jerseys, Gym Wear', 'USA, UK, Germany, Australia, UAE', 'IEC3456789023', 'TIRUPUR', 'TAMIL NADU', 2013, '₹100-200 Cr', '500-1000', 'WRAP, OEKO-TEX, ISO 9001', 'Prakash Raj', '+91 421 456 7890', 'export@sportswearexports.in', 'www.sportswearexports.com'),

('Ethnic Wear Exporters', 'Manufacturer', 'Textiles & Clothing', 'Kurtis, Salwar Suits, Lehengas, Indo-Western Wear', 'USA, UK, Canada, Australia, UAE', 'IEC4567890134', 'JAIPUR', 'RAJASTHAN', 2014, '₹50-100 Cr', '200-500', 'ISO 9001, OEKO-TEX', 'Neha Agarwal', '+91 141 567 8901', 'sales@ethnicwearexports.in', 'www.ethnicwearexporters.com'),

('Technical Textiles Export', 'Manufacturer', 'Textiles & Clothing', 'Industrial Fabrics, Medical Textiles, Geotextiles', 'USA, EU, Japan, South Korea, China', 'IEC5678901245', 'SURAT', 'GUJARAT', 2015, '₹200-500 Cr', '500-1000', 'ISO 9001, ISO 13485, CE Certified', 'Bharat Patel', '+91 261 678 9012', 'export@technicaltextiles.in', 'www.technicaltextilesexport.com'),

('Leather Garments Export', 'Manufacturer', 'Textiles & Clothing', 'Leather Jackets, Leather Pants, Leather Accessories', 'USA, UK, Germany, Italy, Russia', 'IEC6789012356', 'KANPUR', 'UTTAR PRADESH', 2010, '₹75-150 Cr', '300-500', 'ISO 9001, LWG Certified, REACH Compliant', 'Mohit Agarwal', '+91 512 789 0123', 'info@leathergarments.in', 'www.leathergarmentsexport.com'),

-- Handicrafts & Jewelry Exporters (8)
('Gems & Jewelry International', 'Manufacturer', 'Handicrafts & Jewelry', 'Precious Gemstones, Silver Jewelry, Gold Jewelry', 'USA, UAE, UK, Hong Kong, Singapore', 'IEC7890123467', 'JAIPUR', 'RAJASTHAN', 2005, '₹500-1000 Cr', '500-1000', 'BIS Hallmark, ISO 9001, RJC Certified', 'Vikram Singhania', '+91 141 890 1234', 'export@gemsintl.in', 'www.gemsjewelryinternational.com'),

('Handicraft Export House', 'Trader', 'Handicrafts & Jewelry', 'Wood Carvings, Metal Crafts, Pottery, Stone Crafts', 'USA, UK, Germany, France, Australia', 'IEC8901234578', 'DELHI', 'DELHI', 2008, '₹25-50 Cr', '100-200', 'Export Promotion Council for Handicrafts', 'Sanjay Malhotra', '+91 11 901 2345', 'sales@handicraftexport.in', 'www.handicraftexporthouse.com'),

('Brass & Copper Exports', 'Manufacturer', 'Handicrafts & Jewelry', 'Brass Utensils, Copper Bottles, Metal Decoratives', 'USA, UK, UAE, Australia, Canada', 'IEC9012345689', 'MORADABAD', 'UTTAR PRADESH', 2010, '₹50-100 Cr', '200-500', 'ISO 9001, Export Promotion Council', 'Ashok Kumar', '+91 591 012 3456', 'export@brasscopper.in', 'www.brasscoppereexports.com'),

('Marble & Stone Handicrafts', 'Manufacturer', 'Handicrafts & Jewelry', 'Marble Statues, Stone Carvings, Marble Inlay Work', 'USA, UK, Italy, UAE, Australia', 'IEC0123456791', 'AGRA', 'UTTAR PRADESH', 2007, '₹25-50 Cr', '100-200', 'ISO 9001, Export Promotion Council', 'Ramesh Sharma', '+91 562 123 4567', 'info@marblehandicrafts.in', 'www.marblestonehandicrafts.com'),

('Artificial Jewelry Exports', 'Manufacturer', 'Handicrafts & Jewelry', 'Fashion Jewelry, Imitation Jewelry, Costume Jewelry', 'USA, UK, UAE, Australia, South Africa', 'IEC1234567802', 'MUMBAI', 'MAHARASHTRA', 2012, '₹50-100 Cr', '200-500', 'ISO 9001, REACH Compliant', 'Pooja Shah', '+91 22 234 5678', 'export@artificialjewelry.in', 'www.artificialjewelryexports.com'),

('Wooden Handicrafts Export', 'Manufacturer', 'Handicrafts & Jewelry', 'Wooden Furniture, Wood Carvings, Wooden Toys', 'USA, UK, Germany, Australia, UAE', 'IEC2345678913', 'SAHARANPUR', 'UTTAR PRADESH', 2009, '₹25-50 Cr', '100-200', 'FSC Certified, ISO 9001', 'Arjun Singh', '+91 132 345 6789', 'sales@woodenhandicrafts.in', 'www.woodenhandicraftsexport.com'),

('Terracotta & Pottery Exports', 'Manufacturer', 'Handicrafts & Jewelry', 'Terracotta Items, Pottery, Clay Crafts, Ceramic Items', 'USA, UK, Germany, France, Japan', 'IEC3456789024', 'KOLKATA', 'WEST BENGAL', 2011, '₹10-25 Cr', '50-100', 'Export Promotion Council for Handicrafts', 'Biplab Das', '+91 33 456 7890', 'export@terracottaexports.in', 'www.terracottapotteryexports.com'),

('Tribal Art & Crafts Export', 'Manufacturer', 'Handicrafts & Jewelry', 'Tribal Paintings, Warli Art, Madhubani Art, Dokra Crafts', 'USA, UK, Germany, France, Australia', 'IEC4567890135', 'BHOPAL', 'MADHYA PRADESH', 2013, '₹10-25 Cr', '50-100', 'GI Tag, Export Promotion Council', 'Kavita Verma', '+91 755 567 8901', 'info@tribalartexport.in', 'www.tribalartcraftsexport.com'),

-- Leather & Footwear Exporters (5)
('Leather Goods International', 'Manufacturer', 'Leather & Footwear', 'Leather Bags, Wallets, Belts, Leather Accessories', 'USA, UK, Germany, Italy, France', 'IEC5678901246', 'KANPUR', 'UTTAR PRADESH', 2008, '₹100-200 Cr', '500-1000', 'ISO 9001, LWG Certified, REACH Compliant', 'Sunil Gupta', '+91 512 678 9012', 'export@leathergoodsintl.in', 'www.leathergoodsinternational.com'),

('Footwear Exports India', 'Manufacturer', 'Leather & Footwear', 'Leather Shoes, Sports Shoes, Sandals, Boots', 'USA, UK, Germany, UAE, Australia', 'IEC6789012357', 'AGRA', 'UTTAR PRADESH', 2010, '₹200-500 Cr', '1000+', 'ISO 9001, CE Certified, SATRA Approved', 'Rajesh Agarwal', '+91 562 789 0123', 'sales@footwearexports.in', 'www.footwearexportsindia.com'),

('Premium Leather Exporters', 'Manufacturer', 'Leather & Footwear', 'Finished Leather, Crust Leather, Leather Hides', 'Italy, Spain, China, Vietnam, Bangladesh', 'IEC7890123468', 'CHENNAI', 'TAMIL NADU', 2007, '₹100-200 Cr', '300-500', 'ISO 9001, LWG Certified, ISO 14001', 'Karthik Raman', '+91 44 890 1234', 'export@premiumleather.in', 'www.premiumleatherexporters.com'),

('Saddlery & Harness Exports', 'Manufacturer', 'Leather & Footwear', 'Horse Saddles, Harness, Riding Equipment, Pet Accessories', 'USA, UK, Germany, Australia, UAE', 'IEC8901234579', 'KANPUR', 'UTTAR PRADESH', 2009, '₹25-50 Cr', '100-200', 'ISO 9001, CE Certified', 'Anil Sharma', '+91 512 901 2345', 'info@saddleryexports.in', 'www.saddleryharnessexports.com'),

('Leather Garments International', 'Manufacturer', 'Leather & Footwear', 'Leather Jackets, Coats, Gloves, Leather Apparel', 'USA, UK, Germany, Russia, Canada', 'IEC9012345680', 'DELHI', 'DELHI', 2011, '₹75-150 Cr', '300-500', 'ISO 9001, LWG Certified, REACH Compliant', 'Manish Khanna', '+91 11 012 3456', 'export@leathergarmentsintl.in', 'www.leathergarmentsinternational.com'),

-- Health & Beauty Exporters (5)
('Ayurvedic Products Export', 'Manufacturer', 'Health & Beauty', 'Ayurvedic Medicines, Herbal Supplements, Wellness Products', 'USA, UK, UAE, Australia, Canada', 'IEC0123456792', 'KOCHI', 'KERALA', 2010, '₹50-100 Cr', '200-500', 'AYUSH, FSSAI, ISO 22000, GMP Certified', 'Dr. Sreekumar Nair', '+91 484 123 4567', 'export@ayurvedicexports.in', 'www.ayurvedicproductsexport.com'),

('Cosmetics & Beauty Exports', 'Manufacturer', 'Health & Beauty', 'Natural Cosmetics, Herbal Beauty Products, Skincare', 'USA, UK, UAE, Singapore, Malaysia', 'IEC1234567803', 'MUMBAI', 'MAHARASHTRA', 2013, '₹25-50 Cr', '100-200', 'ISO 22716, USFDA Registered, Cruelty-Free', 'Priyanka Mehta', '+91 22 345 6789', 'sales@cosmeticsexports.in', 'www.cosmeticsbeautyexports.com'),

('Essential Oils International', 'Manufacturer', 'Health & Beauty', 'Essential Oils, Aromatherapy Oils, Carrier Oils', 'USA, UK, France, Germany, Japan', 'IEC2345678914', 'KANNAUJ', 'UTTAR PRADESH', 2009, '₹25-50 Cr', '50-100', 'ISO 9001, Organic Certified, ECOCERT', 'Mohit Verma', '+91 5694 456 7890', 'export@essentialoils.in', 'www.essentialoilsinternational.com'),

('Herbal Extract Exporters', 'Manufacturer', 'Health & Beauty', 'Plant Extracts, Herbal Powders, Nutraceuticals', 'USA, EU, Japan, South Korea, Australia', 'IEC3456789025', 'BANGALORE', 'KARNATAKA', 2012, '₹50-100 Cr', '100-200', 'ISO 9001, GMP, HACCP, Organic Certified', 'Deepa Krishnan', '+91 80 567 8901', 'info@herbalextracts.in', 'www.herbalextractexporters.com'),

('Yoga & Wellness Exports', 'Manufacturer', 'Health & Beauty', 'Yoga Mats, Yoga Accessories, Meditation Products, Incense', 'USA, UK, Germany, Australia, Canada', 'IEC4567890136', 'RISHIKESH', 'UTTARAKHAND', 2014, '₹10-25 Cr', '50-100', 'ISO 9001, Eco-Friendly Certified', 'Swami Anand', '+91 135 678 9012', 'export@yogawellness.in', 'www.yogawellnessexports.com'),

-- Other Categories (5)
('Furniture Exports India', 'Manufacturer', 'Furniture & Home Decor', 'Wooden Furniture, Metal Furniture, Home Decor Items', 'USA, UK, UAE, Australia, Singapore', 'IEC5678901247', 'JODHPUR', 'RAJASTHAN', 2008, '₹100-200 Cr', '500-1000', 'FSC Certified, ISO 9001, CARB Compliant', 'Mahendra Singh', '+91 291 789 0123', 'export@furnitureexports.in', 'www.furnitureexportsindia.com'),

('Automobile Parts Export', 'Manufacturer', 'Automobile & Engineering', 'Auto Components, Spare Parts, Fasteners, Castings', 'USA, EU, Japan, Mexico, Thailand', 'IEC6789012358', 'PUNE', 'MAHARASHTRA', 2010, '₹500-1000 Cr', '1000+', 'ISO 9001, TS 16949, ISO 14001', 'Sandeep Desai', '+91 20 890 1234', 'sales@autopartsexport.in', 'www.automobilepartsexport.com'),

('Pharmaceutical Exports', 'Manufacturer', 'Pharmaceuticals', 'Generic Medicines, APIs, Formulations, Nutraceuticals', 'USA, EU, Africa, Latin America, Asia', 'IEC7890123469', 'HYDERABAD', 'TELANGANA', 2009, '₹1000+ Cr', '1000+', 'USFDA, WHO-GMP, ISO 9001, ISO 14001', 'Dr. Ramesh Reddy', '+91 40 901 2345', 'export@pharmaexports.in', 'www.pharmaceuticalexports.com'),

('Chemicals & Dyes Export', 'Manufacturer', 'Chemicals & Dyes', 'Textile Dyes, Industrial Chemicals, Pigments', 'China, Bangladesh, Vietnam, Turkey, Egypt', 'IEC8901234570', 'AHMEDABAD', 'GUJARAT', 2011, '₹200-500 Cr', '500-1000', 'ISO 9001, ISO 14001, REACH Registered', 'Kiran Patel', '+91 79 012 3456', 'info@chemicalsexport.in', 'www.chemicalsdyesexport.com'),

('Plastic Products Export', 'Manufacturer', 'Plastics & Packaging', 'Plastic Containers, Packaging Materials, Plastic Components', 'USA, UK, UAE, Kenya, Nigeria', 'IEC9012345681', 'MUMBAI', 'MAHARASHTRA', 2012, '₹100-200 Cr', '300-500', 'ISO 9001, ISO 14001, FDA Approved', 'Nitin Shah', '+91 22 123 4567', 'export@plasticproducts.in', 'www.plasticproductsexport.com');


-- =====================================================
-- EXPORTERS TABLE COMPLETE!
-- =====================================================
-- Summary:
-- ✅ Created dedicated exporters table
-- ✅ Added 50 detailed exporters
-- ✅ Categories: Food (15), Textiles (12), Handicrafts (8), 
--    Leather (5), Health & Beauty (5), Others (5)
-- ✅ All with complete details: IEC codes, certifications,
--    export destinations, contact info, turnover, employees
-- ✅ Indexes for fast queries
-- ✅ RLS policies enabled
-- =====================================================
