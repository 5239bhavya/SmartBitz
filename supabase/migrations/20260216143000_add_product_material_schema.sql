-- =====================================================
-- DATABASE MIGRATION: ADVANCED BUSINESS LOGIC
-- Date: 2026-02-16
-- Purpose: Add support for Products, Materials, and Direct Supplier Mapping
-- =====================================================

-- 1. BUSINESS DEFINITIONS (Types of businesses supported)
CREATE TABLE IF NOT EXISTS public.business_definitions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- e.g., "Bakery", "Garment Manufacturing"
    description TEXT,
    industry TEXT NOT NULL, -- e.g., "Food Processing", "Textiles"
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. PRODUCTS (What the business sells)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.business_definitions(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Whole Wheat Bread"
    description TEXT,
    avg_selling_price DECIMAL(10, 2), -- Estimated market price
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. RAW MATERIALS (What is needed to make products)
CREATE TABLE IF NOT EXISTS public.raw_materials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- e.g., "Wheat Flour", "Sugar", "Yarn"
    unit TEXT NOT NULL, -- e.g., "kg", "meter", "liter"
    avg_cost_per_unit DECIMAL(10, 2), -- Estimated market cost
    category TEXT, -- e.g., "Grains", "Fabric", "Chemicals"
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. PRODUCT-MATERIAL MAP (Recipe/BOM)
CREATE TABLE IF NOT EXISTS public.product_materials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.raw_materials(id) ON DELETE CASCADE,
    quantity_required DECIMAL(10, 2) NOT NULL, -- per 1 unit of product
    unit_cost_at_creation DECIMAL(10, 2), -- Snapshot of cost
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(product_id, material_id)
);

-- 5. SUPPLIER-MATERIAL MAP (Who sells what)
CREATE TABLE IF NOT EXISTS public.supplier_materials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.raw_materials(id) ON DELETE CASCADE,
    price_offer DECIMAL(10, 2), -- Specific price from this supplier (optional)
    is_primary_supplier BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(supplier_id, material_id)
);

-- =====================================================
-- INDEXES & RLS
-- =====================================================

CREATE INDEX idx_products_business ON public.products(business_id);
CREATE INDEX idx_prod_mat_product ON public.product_materials(product_id);
CREATE INDEX idx_supp_mat_material ON public.supplier_materials(material_id);
CREATE INDEX idx_supp_mat_supplier ON public.supplier_materials(supplier_id);

-- Enable RLS
ALTER TABLE public.business_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_materials ENABLE ROW LEVEL SECURITY;

-- Public Read Access
CREATE POLICY "Public read business_definitions" ON public.business_definitions FOR SELECT USING (true);
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read raw_materials" ON public.raw_materials FOR SELECT USING (true);
CREATE POLICY "Public read product_materials" ON public.product_materials FOR SELECT USING (true);
CREATE POLICY "Public read supplier_materials" ON public.supplier_materials FOR SELECT USING (true);

-- =====================================================
-- SEED DATA (INITIAL KNOWLEDGE BASE)
-- =====================================================

-- 1. Insert Business Definitions
INSERT INTO public.business_definitions (name, description, industry) VALUES 
('Bakery', 'Production of baked goods like bread, cakes, and pastries.', 'Food Processing'),
('Garment Manufacturing', 'Production of clothing items from fabric.', 'Textiles')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Raw Materials
INSERT INTO public.raw_materials (name, unit, avg_cost_per_unit, category) VALUES
('Wheat Flour (Maida)', 'kg', 45.00, 'Grains'),
('Sugar', 'kg', 42.00, 'Groceries'),
('Butter', 'kg', 550.00, 'Dairy'),
('Yeast', 'kg', 800.00, 'Additives'),
('Cotton Fabric', 'meter', 120.00, 'Textiles'),
('Sewing Thread', 'spool', 25.00, 'Textiles'),
('Buttons', 'packet', 50.00, 'Accessories')
ON CONFLICT (name) DO NOTHING;

-- 3. Insert Products & Map to Materials (Need to fetch IDs first, using DO block for dynamic insertion)
DO $$
DECLARE
    bakery_id UUID;
    garment_id UUID;
    
    -- Material IDs
    flour_id UUID;
    sugar_id UUID;
    butter_id UUID;
    yeast_id UUID;
    fabric_id UUID;
    thread_id UUID;
    btn_id UUID;
    
    -- Product IDs
    bread_id UUID;
    cake_id UUID;
    shirt_id UUID;
BEGIN
    -- Get Business IDs
    SELECT id INTO bakery_id FROM public.business_definitions WHERE name = 'Bakery';
    SELECT id INTO garment_id FROM public.business_definitions WHERE name = 'Garment Manufacturing';
    
    -- Get Material IDs
    SELECT id INTO flour_id FROM public.raw_materials WHERE name = 'Wheat Flour (Maida)';
    SELECT id INTO sugar_id FROM public.raw_materials WHERE name = 'Sugar';
    SELECT id INTO butter_id FROM public.raw_materials WHERE name = 'Butter';
    SELECT id INTO yeast_id FROM public.raw_materials WHERE name = 'Yeast';
    SELECT id INTO fabric_id FROM public.raw_materials WHERE name = 'Cotton Fabric';
    SELECT id INTO thread_id FROM public.raw_materials WHERE name = 'Sewing Thread';
    SELECT id INTO btn_id FROM public.raw_materials WHERE name = 'Buttons';
    
    -- Insert Products: BAKERY
    INSERT INTO public.products (business_id, name, description, avg_selling_price) 
    VALUES (bakery_id, 'White Bread (400g)', 'Standard loaf of white bread', 40.00)
    RETURNING id INTO bread_id;
    
    INSERT INTO public.products (business_id, name, description, avg_selling_price) 
    VALUES (bakery_id, 'Chocolate Cake (1kg)', 'Rich chocolate sponge cake', 600.00)
    RETURNING id INTO cake_id;
    
    -- Insert Products: GARMENT
    INSERT INTO public.products (business_id, name, description, avg_selling_price) 
    VALUES (garment_id, 'Men''s Cotton Shirt', 'Formal full-sleeve cotton shirt', 850.00)
    RETURNING id INTO shirt_id;
    
    -- Map Product -> Materials (Recipe)
    
    -- Bread: 0.25kg Flour, 0.01kg Sugar, 0.005kg Yeast per unit
    INSERT INTO public.product_materials (product_id, material_id, quantity_required) VALUES
    (bread_id, flour_id, 0.25),
    (bread_id, sugar_id, 0.01),
    (bread_id, yeast_id, 0.005);
    
    -- Cake: 0.3kg Flour, 0.3kg Sugar, 0.2kg Butter per unit
    INSERT INTO public.product_materials (product_id, material_id, quantity_required) VALUES
    (cake_id, flour_id, 0.3),
    (cake_id, sugar_id, 0.3),
    (cake_id, butter_id, 0.2);
    
    -- Shirt: 2m Fabric, 1 Thread, 0.1 Button Packet
    INSERT INTO public.product_materials (product_id, material_id, quantity_required) VALUES
    (shirt_id, fabric_id, 2.0),
    (shirt_id, thread_id, 1.0),
    (shirt_id, btn_id, 0.1);
    
    -- Link Suppliers to Materials (Random assignment for demo)
    -- Assuming suppliers exist from previous migration, let's link a few if possible by name
    -- This part is tricky without knowing exact Supplier IDs. 
    -- We will try to link based on names from the known dummy data created in 20260213012000...
    
    -- Link "Shree Krishna Food Products" -> Flour, Sugar
    INSERT INTO public.supplier_materials (supplier_id, material_id)
    SELECT id, flour_id FROM public.suppliers WHERE enterprise_name LIKE 'Shree Krishna%'
    ON CONFLICT DO NOTHING;
    
    INSERT INTO public.supplier_materials (supplier_id, material_id)
    SELECT id, sugar_id FROM public.suppliers WHERE enterprise_name LIKE 'Shree Krishna%'
    ON CONFLICT DO NOTHING;
    
    -- Link "Cotton Craft Textiles" -> Fabric
    INSERT INTO public.supplier_materials (supplier_id, material_id)
    SELECT id, fabric_id FROM public.suppliers WHERE enterprise_name LIKE 'Cotton Craft%'
    ON CONFLICT DO NOTHING;
    
END $$;
