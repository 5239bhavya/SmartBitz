-- =====================================================
-- ADDITIONAL DATA INSERT - Run this AFTER initial migration
-- This adds more suppliers, exporters, and marketplace listings
-- =====================================================

-- =====================================================
-- ADD 30 MORE SUPPLIERS (Total will be 50)
-- =====================================================

INSERT INTO public.suppliers (enterprise_name, district, state, enterprise_type, major_activity, nic_code, production_commenced, registration_date, social_category, contact_phone, contact_email) VALUES

-- More Food & Beverages (10 additional)
('Spice Garden Exports', 'KOCHI', 'KERALA', 'Small', 'Manufacturing', '10751', true, '2020-06-15', 'General', '+91 484 567 8901', 'export@spicegarden.in'),
('Himalayan Organic Foods', 'DEHRADUN', 'UTTARAKHAND', 'Micro', 'Manufacturing', '10320', true, '2022-08-22', 'General', '+91 135 234 5678', 'info@himalayanorganic.com'),
('South Indian Snacks Co', 'MADURAI', 'TAMIL NADU', 'Small', 'Manufacturing', '10730', true, '2021-03-18', 'OBC', '+91 452 345 6789', 'sales@southindiansnacks.in'),
('Premium Tea Estates', 'DARJEELING', 'WEST BENGAL', 'Medium', 'Manufacturing', '10721', true, '2019-11-05', 'General', '+91 354 456 7890', 'contact@premiumtea.co.in'),
('Millet Processing Unit', 'BANGALORE', 'KARNATAKA', 'Micro', 'Manufacturing', '10612', true, '2023-01-20', 'SC', '+91 80 3456 7890', 'info@milletprocessing.in'),
('Coastal Seafood Exports', 'VISAKHAPATNAM', 'ANDHRA PRADESH', 'Small', 'Manufacturing', '10201', true, '2020-09-12', 'General', '+91 891 234 5678', 'export@coastalseafood.com'),
('Organic Honey Producers', 'PUNE', 'MAHARASHTRA', 'Micro', 'Manufacturing', '10890', true, '2022-05-08', 'General', '+91 20 4567 8901', 'sales@organichoney.in'),
('Bakery Ingredients Supply', 'MUMBAI', 'MAHARASHTRA', 'Small', 'Services', '46391', true, '2021-07-14', 'General', '+91 22 5678 9012', 'info@bakeryingredients.co.in'),
('Frozen Food Manufacturers', 'DELHI', 'DELHI', 'Medium', 'Manufacturing', '10850', true, '2018-12-03', 'General', '+91 11 6789 0123', 'contact@frozenfood.in'),
('Beverage Concentrate Makers', 'AHMEDABAD', 'GUJARAT', 'Small', 'Manufacturing', '11040', true, '2020-04-25', 'General', '+91 79 5678 9012', 'sales@beverageconcentrate.com'),

-- More Textiles & Clothing (8 additional)
('Silk Weavers Cooperative', 'KANCHIPURAM', 'TAMIL NADU', 'Small', 'Manufacturing', '13201', true, '2019-02-14', 'OBC', '+91 44 4567 8901', 'info@silkweavers.co.in'),
('Denim Manufacturing Co', 'AHMEDABAD', 'GUJARAT', 'Medium', 'Manufacturing', '13930', true, '2018-08-20', 'General', '+91 79 6789 0123', 'sales@denimmanufacturing.in'),
('Embroidery & Lace Works', 'LUCKNOW', 'UTTAR PRADESH', 'Micro', 'Manufacturing', '13991', true, '2021-10-05', 'General', '+91 522 345 6789', 'contact@embroideryworks.in'),
('Woolen Garments Factory', 'LUDHIANA', 'PUNJAB', 'Small', 'Manufacturing', '14101', true, '2020-01-18', 'General', '+91 161 456 7890', 'info@woolengarments.com'),
('Sportswear Manufacturers', 'TIRUPUR', 'TAMIL NADU', 'Medium', 'Manufacturing', '14120', true, '2019-06-22', 'General', '+91 421 567 8901', 'export@sportswear.co.in'),
('Traditional Saree Makers', 'VARANASI', 'UTTAR PRADESH', 'Small', 'Manufacturing', '13201', true, '2020-11-30', 'OBC', '+91 542 345 6789', 'sales@traditionalsaree.in'),
('Kids Clothing Brand', 'BANGALORE', 'KARNATAKA', 'Small', 'Manufacturing', '14140', true, '2022-03-12', 'General', '+91 80 4567 8901', 'info@kidsclothing.co.in'),
('Fabric Printing Services', 'SURAT', 'GUJARAT', 'Micro', 'Services', '13301', true, '2021-09-08', 'General', '+91 261 567 8901', 'contact@fabricprinting.in'),

-- Electronics & Technology (5 additional)
('LED Manufacturing Unit', 'NOIDA', 'UTTAR PRADESH', 'Small', 'Manufacturing', '27401', true, '2020-07-15', 'General', '+91 120 678 9012', 'sales@ledmanufacturing.in'),
('PCB Assembly Services', 'BANGALORE', 'KARNATAKA', 'Medium', 'Manufacturing', '26110', true, '2019-04-20', 'General', '+91 80 5678 9012', 'info@pcbassembly.co.in'),
('Mobile Accessories Maker', 'DELHI', 'DELHI', 'Micro', 'Manufacturing', '26309', true, '2022-06-18', 'General', '+91 11 7890 1234', 'contact@mobileaccessories.in'),
('Solar Panel Suppliers', 'PUNE', 'MAHARASHTRA', 'Small', 'Services', '27110', true, '2021-02-25', 'General', '+91 20 6789 0123', 'sales@solarpanel.co.in'),
('Computer Hardware Traders', 'CHENNAI', 'TAMIL NADU', 'Small', 'Services', '46510', true, '2020-10-12', 'General', '+91 44 5678 9012', 'info@computerhardware.in'),

-- Packaging & Industrial (4 additional)
('Corrugated Box Makers', 'MUMBAI', 'MAHARASHTRA', 'Small', 'Manufacturing', '17021', true, '2019-09-08', 'General', '+91 22 7890 1234', 'sales@corrugatedbox.in'),
('Biodegradable Packaging', 'BANGALORE', 'KARNATAKA', 'Micro', 'Manufacturing', '17029', true, '2022-11-15', 'General', '+91 80 6789 0123', 'info@biodegradablepack.co.in'),
('Industrial Chemicals Supply', 'AHMEDABAD', 'GUJARAT', 'Medium', 'Services', '20110', true, '2018-05-20', 'General', '+91 79 7890 1234', 'contact@industrialchemicals.in'),
('Metal Fabrication Works', 'KOLKATA', 'WEST BENGAL', 'Small', 'Manufacturing', '25110', true, '2020-08-14', 'General', '+91 33 4567 8901', 'sales@metalfabrication.co.in'),

-- Export-Focused Businesses (3 additional)
('Gems & Jewelry Exporters', 'JAIPUR', 'RAJASTHAN', 'Medium', 'Services', '32120', true, '2017-12-10', 'General', '+91 141 890 1234', 'export@gemsjewelry.com'),
('Leather Goods Exporters', 'KANPUR', 'UTTAR PRADESH', 'Small', 'Manufacturing', '15110', true, '2019-03-25', 'General', '+91 512 345 6789', 'info@leatherexport.in'),
('Handicraft Export House', 'DELHI', 'DELHI', 'Small', 'Services', '47789', true, '2020-06-30', 'General', '+91 11 8901 2345', 'contact@handicraftexport.com');


-- =====================================================
-- ADD MARKETPLACE LISTINGS (30 listings across categories)
-- =====================================================

-- Note: Using a dummy UUID for user_id. Replace with actual user IDs in production.
-- For demo purposes, we'll use: '00000000-0000-0000-0000-000000000001'

INSERT INTO public.marketplace_listings (user_id, title, description, category, listing_type, price_range, quantity, location, contact_info, status) VALUES

-- SELL Listings - Food & Beverages (5)
('00000000-0000-0000-0000-000000000001', 'Premium Basmati Rice', 'Export quality aged basmati rice, 1121 variety. Available in bulk quantities. Certified organic.', 'Food & Beverages', 'sell', '₹80-120/kg', '500 MT', 'Amritsar, Punjab', '+91 183 234 5678', 'active'),
('00000000-0000-0000-0000-000000000001', 'Cold Pressed Coconut Oil', 'Pure virgin coconut oil, cold pressed. Perfect for cooking and cosmetic use. FSSAI certified.', 'Food & Beverages', 'sell', '₹350-450/L', '10,000 L', 'Kochi, Kerala', '+91 484 345 6789', 'active'),
('00000000-0000-0000-0000-000000000001', 'Organic Turmeric Powder', 'Premium quality organic turmeric powder. High curcumin content. Bulk orders welcome.', 'Food & Beverages', 'sell', '₹200-280/kg', '2000 kg', 'Erode, Tamil Nadu', '+91 424 456 7890', 'active'),
('00000000-0000-0000-0000-000000000001', 'Assam Tea Leaves', 'Premium CTC and orthodox tea from Assam gardens. Export quality. Wholesale rates available.', 'Food & Beverages', 'sell', '₹300-600/kg', '5000 kg', 'Guwahati, Assam', '+91 361 567 8901', 'active'),
('00000000-0000-0000-0000-000000000001', 'Cashew Nuts W320', 'Premium grade cashew nuts, W320 variety. Processed and ready to pack. Bulk orders only.', 'Food & Beverages', 'sell', '₹650-750/kg', '1000 kg', 'Kollam, Kerala', '+91 474 678 9012', 'active'),

-- SELL Listings - Textiles (5)
('00000000-0000-0000-0000-000000000001', 'Cotton Fabric Rolls', 'Pure cotton fabric, 60x60 thread count. Available in white and dyed colors. Minimum order 1000m.', 'Textiles & Clothing', 'sell', '₹120-180/meter', '50,000 m', 'Coimbatore, Tamil Nadu', '+91 422 234 5678', 'active'),
('00000000-0000-0000-0000-000000000001', 'Silk Sarees - Kanchipuram', 'Authentic Kanchipuram silk sarees. Traditional designs. Wholesale and export orders accepted.', 'Textiles & Clothing', 'sell', '₹5,000-25,000/piece', '500 pieces', 'Kanchipuram, Tamil Nadu', '+91 44 345 6789', 'active'),
('00000000-0000-0000-0000-000000000001', 'Denim Fabric - Premium', 'High quality denim fabric, 12-14 oz. Perfect for jeans manufacturing. Bulk orders welcome.', 'Textiles & Clothing', 'sell', '₹250-350/meter', '20,000 m', 'Ahmedabad, Gujarat', '+91 79 456 7890', 'active'),
('00000000-0000-0000-0000-000000000001', 'Readymade Garments - Kids', 'Trendy kids clothing, age 2-12 years. Cotton and blended fabrics. Wholesale rates available.', 'Textiles & Clothing', 'sell', '₹150-400/piece', '5,000 pieces', 'Tirupur, Tamil Nadu', '+91 421 567 8901', 'active'),
('00000000-0000-0000-0000-000000000001', 'Embroidered Fabric', 'Beautiful embroidered fabric for ethnic wear. Various designs and colors available.', 'Textiles & Clothing', 'sell', '₹400-800/meter', '3,000 m', 'Lucknow, Uttar Pradesh', '+91 522 678 9012', 'active'),

-- SELL Listings - Electronics (3)
('00000000-0000-0000-0000-000000000001', 'LED Bulbs - Wholesale', 'Energy efficient LED bulbs, 9W-18W. ISI certified. Bulk orders at factory price.', 'Electronics & Technology', 'sell', '₹50-120/piece', '10,000 pieces', 'Noida, Uttar Pradesh', '+91 120 234 5678', 'active'),
('00000000-0000-0000-0000-000000000001', 'Mobile Phone Chargers', 'Fast charging mobile chargers with Type-C and micro USB. BIS certified. Wholesale only.', 'Electronics & Technology', 'sell', '₹80-150/piece', '5,000 pieces', 'Delhi, Delhi', '+91 11 345 6789', 'active'),
('00000000-0000-0000-0000-000000000001', 'Solar Panels - 100W', 'Monocrystalline solar panels, 100W capacity. 25 year warranty. Bulk discounts available.', 'Electronics & Technology', 'sell', '₹3,500-4,500/panel', '500 panels', 'Pune, Maharashtra', '+91 20 456 7890', 'active'),

-- BUY Listings - Raw Materials (7)
('00000000-0000-0000-0000-000000000001', 'Looking for Cotton Yarn', 'Need high quality cotton yarn for textile manufacturing. Regular monthly requirement of 10 MT.', 'Textiles & Clothing', 'buy', '₹250-300/kg', '10,000 kg/month', 'Surat, Gujarat', '+91 261 234 5678', 'active'),
('00000000-0000-0000-0000-000000000001', 'Required: Food Grade Packaging', 'Looking for food grade plastic containers and packaging materials. FSSAI approved suppliers only.', 'Packaging & Materials', 'buy', 'Negotiable', '5,000 units', 'Mumbai, Maharashtra', '+91 22 345 6789', 'active'),
('00000000-0000-0000-0000-000000000001', 'Need Electronic Components', 'Require resistors, capacitors, and ICs for electronics manufacturing. ISO certified suppliers preferred.', 'Electronics & Technology', 'buy', 'Negotiable', 'Bulk', 'Bangalore, Karnataka', '+91 80 456 7890', 'active'),
('00000000-0000-0000-0000-000000000001', 'Wheat Flour - Bulk Purchase', 'Looking for quality wheat flour suppliers. Monthly requirement 50 MT. Long term contract preferred.', 'Food & Beverages', 'buy', '₹25-30/kg', '50,000 kg/month', 'Delhi, Delhi', '+91 11 567 8901', 'active'),
('00000000-0000-0000-0000-000000000001', 'Corrugated Boxes Needed', 'Need corrugated boxes for product packaging. Various sizes. Monthly requirement 10,000 boxes.', 'Packaging & Materials', 'buy', '₹15-40/box', '10,000 boxes/month', 'Pune, Maharashtra', '+91 20 678 9012', 'active'),
('00000000-0000-0000-0000-000000000001', 'Organic Vegetables - Bulk', 'Restaurant chain looking for organic vegetable suppliers. Daily fresh supply needed in Mumbai.', 'Food & Beverages', 'buy', 'Market Rate', '500 kg/day', 'Mumbai, Maharashtra', '+91 22 789 0123', 'active'),
('00000000-0000-0000-0000-000000000001', 'Leather Raw Material', 'Looking for tanned leather for footwear manufacturing. Quality and consistency important.', 'Raw Materials', 'buy', '₹400-600/sq ft', '1,000 sq ft/month', 'Kanpur, Uttar Pradesh', '+91 512 890 1234', 'active'),

-- EXPORT Listings (10)
('00000000-0000-0000-0000-000000000001', 'Export: Indian Spices', 'Exporting premium Indian spices worldwide. Turmeric, cumin, coriander, cardamom. IEC certified.', 'Food & Beverages', 'export', 'FOB: $3-8/kg', 'Container loads', 'Mumbai, Maharashtra', '+91 22 234 5678', 'active'),
('00000000-0000-0000-0000-000000000001', 'Export: Basmati Rice', 'Premium basmati rice export to Middle East, Europe, USA. 1121 and Pusa varieties. APEDA registered.', 'Food & Beverages', 'export', 'FOB: $800-1200/MT', 'Container loads', 'Amritsar, Punjab', '+91 183 345 6789', 'active'),
('00000000-0000-0000-0000-000000000001', 'Export: Handloom Textiles', 'Authentic Indian handloom products. Sarees, dress materials, home textiles. Export to USA, EU.', 'Textiles & Clothing', 'export', 'FOB: $15-50/piece', 'Min 1000 pcs', 'Varanasi, Uttar Pradesh', '+91 542 456 7890', 'active'),
('00000000-0000-0000-0000-000000000001', 'Export: Gems & Jewelry', 'Exporting precious and semi-precious gemstones, silver jewelry. Certified and hallmarked.', 'Handicrafts & Jewelry', 'export', 'FOB: $50-500/piece', 'As per order', 'Jaipur, Rajasthan', '+91 141 567 8901', 'active'),
('00000000-0000-0000-0000-000000000001', 'Export: Ayurvedic Products', 'Natural ayurvedic medicines and wellness products. FDA approved for export. Worldwide shipping.', 'Health & Beauty', 'export', 'FOB: $5-25/unit', 'Min 500 units', 'Kerala, Kerala', '+91 484 678 9012', 'active'),
('00000000-0000-0000-0000-000000000001', 'Export: Leather Goods', 'Premium leather bags, wallets, belts. Export quality. Shipping to Europe, USA, Middle East.', 'Leather & Footwear', 'export', 'FOB: $20-80/piece', 'Min 500 pcs', 'Kanpur, Uttar Pradesh', '+91 512 789 0123', 'active'),
('00000000-0000-0000-0000-000000000001', 'Export: Tea - Assam & Darjeeling', 'Premium Indian tea export. CTC and orthodox varieties. Direct from gardens. FSSAI certified.', 'Food & Beverages', 'export', 'FOB: $4-12/kg', 'Container loads', 'Kolkata, West Bengal', '+91 33 890 1234', 'active'),
('00000000-0000-0000-0000-000000000001', 'Export: Handicrafts', 'Traditional Indian handicrafts. Wood carvings, metal crafts, pottery. Export to global markets.', 'Handicrafts & Jewelry', 'export', 'FOB: $10-100/piece', 'Min 200 pcs', 'Delhi, Delhi', '+91 11 901 2345', 'active'),
('00000000-0000-0000-0000-000000000001', 'Export: Organic Cotton Fabric', 'GOTS certified organic cotton fabric. Export to fashion brands worldwide. Sustainable sourcing.', 'Textiles & Clothing', 'export', 'FOB: $5-10/meter', 'Min 5000 m', 'Coimbatore, Tamil Nadu', '+91 422 012 3456', 'active'),
('00000000-0000-0000-0000-000000000001', 'Export: Cashew Kernels', 'Premium cashew kernels W320, W240. Export to USA, Europe, Middle East. APEDA registered.', 'Food & Beverages', 'export', 'FOB: $8-12/kg', 'Container loads', 'Kollam, Kerala', '+91 474 123 4567', 'active');


-- =====================================================
-- DATA INSERT COMPLETE!
-- =====================================================
-- Summary of additions:
-- ✅ 30 additional suppliers (Total: 50 suppliers)
-- ✅ Diverse categories: Food, Textiles, Electronics, Packaging, Exports
-- ✅ 30 marketplace listings:
--    - 13 SELL listings (products for sale)
--    - 7 BUY listings (looking for suppliers)
--    - 10 EXPORT listings (export businesses)
-- ✅ All with realistic contact details and pricing
-- =====================================================
