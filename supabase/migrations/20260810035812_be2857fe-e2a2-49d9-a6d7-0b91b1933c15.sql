
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL DEFAULT 'Hamro Kirana Management',
  owner_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cust_id1 UUID;
  cust_id2 UUID;
  cust_id3 UUID;
  sale_id1 UUID;
  sale_id2 UUID;
  sale_id3 UUID;
BEGIN
  -- 1. Create profile
  INSERT INTO public.profiles (id, owner_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;

  -- 2. Populate Products
  INSERT INTO public.products (user_id, name, category, barcode, price, pack_stock, low_stock_at, emoji) VALUES
  (NEW.id, 'Wai Wai Noodles', 'Snacks', '8901491100013', 25, 42, 20, '🍜'),
  (NEW.id, 'Coca-Cola 500ml', 'Drinks', '5449000000996', 80, 18, 10, '🥤'),
  (NEW.id, 'Basmati Rice 5kg', 'Grocery', '8901012345678', 950, 8, 4, '🍚'),
  (NEW.id, 'Surya Cigarette', 'Tobacco', '8901234500012', 400, 6, 5, '🚬'),
  (NEW.id, 'Amul Milk 1L', 'Dairy', '8901234100104', 90, 12, 6, '🥛'),
  (NEW.id, 'Britannia Biscuit', 'Snacks', '8901063010102', 30, 55, 15, '🍪'),
  (NEW.id, 'Dettol Soap', 'Household', '8901396111117', 55, 22, 10, '🧼'),
  (NEW.id, 'Sunlight Detergent', 'Household', '8901030826317', 120, 14, 8, '🧴'),
  (NEW.id, 'Maggi Masala', 'Grocery', '8901058851234', 20, 78, 25, '🌶️'),
  (NEW.id, 'Dairy Milk Chocolate', 'Snacks', '7622210411020', 50, 2, 8, '🍫'),
  (NEW.id, 'Bourn Vita 500g', 'Dairy', '8901058999912', 320, 9, 5, '🍯'),
  (NEW.id, 'Red Bull 250ml', 'Drinks', '9002490100070', 250, 15, 5, '⚡');

  -- 3. Populate Customers
  INSERT INTO public.customers (user_id, name, phone, avatar_color) VALUES
  (NEW.id, 'Ram Bahadur', '+977 98-4123-1122', 'oklch(0.72 0.15 30)') RETURNING id INTO cust_id1;
  INSERT INTO public.customers (user_id, name, phone, avatar_color) VALUES
  (NEW.id, 'Sita Sharma', '+977 98-4200-7799', 'oklch(0.65 0.18 340)') RETURNING id INTO cust_id2;
  INSERT INTO public.customers (user_id, name, phone, avatar_color) VALUES
  (NEW.id, 'Hari Prasad', '+977 98-1234-5678', 'oklch(0.6 0.18 250)') RETURNING id INTO cust_id3;

  -- 4. Seed Khata entries & corresponding sales
  INSERT INTO public.sales (user_id, customer_id, total, method) VALUES
  (NEW.id, cust_id1, 2450, 'khata') RETURNING id INTO sale_id1;
  INSERT INTO public.khata_entries (user_id, customer_id, sale_id, type, amount, note) VALUES
  (NEW.id, cust_id1, sale_id1, 'debit', 2450, 'Monthly groceries invoice');

  INSERT INTO public.sales (user_id, customer_id, total, method) VALUES
  (NEW.id, cust_id2, 1180, 'khata') RETURNING id INTO sale_id2;
  INSERT INTO public.khata_entries (user_id, customer_id, sale_id, type, amount, note) VALUES
  (NEW.id, cust_id2, sale_id2, 'debit', 1180, 'Rice and oil purchase');

  INSERT INTO public.sales (user_id, customer_id, total, method) VALUES
  (NEW.id, cust_id3, 5620, 'khata') RETURNING id INTO sale_id3;
  INSERT INTO public.khata_entries (user_id, customer_id, sale_id, type, amount, note) VALUES
  (NEW.id, cust_id3, sale_id3, 'debit', 5620, 'Bulk supplies credit');

  -- Add some cash/qr transactions for charts & stats
  INSERT INTO public.sales (user_id, total, method) VALUES
  (NEW.id, 155, 'qr'),
  (NEW.id, 90, 'cash'),
  (NEW.id, 60, 'cash'),
  (NEW.id, 1120, 'qr'),
  (NEW.id, 320, 'cash'),
  (NEW.id, 950, 'qr'),
  (NEW.id, 50, 'cash'),
  (NEW.id, 250, 'qr');

  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_np TEXT,
  category TEXT NOT NULL DEFAULT 'Grocery',
  barcode TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  pack_stock INTEGER NOT NULL DEFAULT 0,
  loose_units_per_pack INTEGER,
  loose_units INTEGER,
  low_stock_at INTEGER NOT NULL DEFAULT 5,
  emoji TEXT NOT NULL DEFAULT '📦',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own products" ON public.products FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX products_user_idx ON public.products(user_id);

-- customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_color TEXT NOT NULL DEFAULT 'oklch(0.6 0.18 250)',
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own customers" ON public.customers FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX customers_user_idx ON public.customers(user_id);

-- sales
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  method TEXT NOT NULL DEFAULT 'cash',
  sold_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sales" ON public.sales FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX sales_user_idx ON public.sales(user_id);

-- sale items
CREATE TABLE public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  qty NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'pack',
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sale_items TO authenticated;
GRANT ALL ON public.sale_items TO service_role;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sale items" ON public.sale_items FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX sale_items_sale_idx ON public.sale_items(sale_id);

-- khata entries
CREATE TABLE public.khata_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'debit',
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  note TEXT,
  entry_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.khata_entries TO authenticated;
GRANT ALL ON public.khata_entries TO service_role;
ALTER TABLE public.khata_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own khata" ON public.khata_entries FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX khata_customer_idx ON public.khata_entries(customer_id);
