-- Create custom types
CREATE TYPE public.app_role AS ENUM ('super_admin', 'seller', 'customer');
CREATE TYPE public.seller_status AS ENUM ('pending', 'active', 'suspended', 'banned');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE public.bargain_status AS ENUM ('pending', 'accepted', 'rejected', 'countered', 'expired');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'customer',
  UNIQUE (user_id, role)
);

-- Create sellers table
CREATE TABLE public.sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  status seller_status DEFAULT 'pending',
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  subscription_fee DECIMAL(10,2) DEFAULT 0.00,
  subscription_due_date TIMESTAMPTZ,
  total_earnings DECIMAL(12,2) DEFAULT 0.00,
  pending_charges DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  compare_price DECIMAL(12,2),
  stock INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  allow_bargain BOOLEAN DEFAULT FALSE,
  min_bargain_price DECIMAL(12,2),
  button_text TEXT DEFAULT 'Add to Cart',
  card_layout TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bargain_offers table
CREATE TABLE public.bargain_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
  offered_price DECIMAL(12,2) NOT NULL,
  counter_price DECIMAL(12,2),
  status bargain_status DEFAULT 'pending',
  message TEXT,
  seller_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL UNIQUE,
  status order_status DEFAULT 'pending',
  subtotal DECIMAL(12,2) NOT NULL,
  shipping_fee DECIMAL(10,2) DEFAULT 0.00,
  tax DECIMAL(10,2) DEFAULT 0.00,
  total DECIMAL(12,2) NOT NULL,
  shipping_address JSONB,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  bargain_offer_id UUID REFERENCES public.bargain_offers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create platform_settings table
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT DEFAULT 'MarketHub',
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '32 95% 44%',
  secondary_color TEXT DEFAULT '35 20% 94%',
  accent_color TEXT DEFAULT '15 75% 55%',
  font_display TEXT DEFAULT 'Playfair Display',
  font_body TEXT DEFAULT 'DM Sans',
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  subscription_fee DECIMAL(10,2) DEFAULT 0.00,
  allow_bargain BOOLEAN DEFAULT TRUE,
  allow_cod BOOLEAN DEFAULT TRUE,
  hero_title TEXT DEFAULT 'Discover Unique Products from Trusted Sellers',
  hero_subtitle TEXT DEFAULT 'A curated marketplace where quality meets authenticity.',
  hero_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create OTP table for email verification
CREATE TABLE public.otp_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Create function to check if user is seller owner
CREATE OR REPLACE FUNCTION public.is_seller_owner(_user_id UUID, _seller_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sellers WHERE id = _seller_id AND user_id = _user_id
  )
$$;

-- Create trigger function for new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON public.sellers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bargain_offers_updated_at BEFORE UPDATE ON public.bargain_offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON public.platform_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bargain_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_records ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Sellers policies
CREATE POLICY "Anyone can view active sellers" ON public.sellers FOR SELECT USING (status = 'active');
CREATE POLICY "Users can view own seller profile" ON public.sellers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own seller profile" ON public.sellers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create seller profile" ON public.sellers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all sellers" ON public.sellers FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Categories policies (public read)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Products policies
CREATE POLICY "Anyone can view active products from active sellers" ON public.products FOR SELECT USING (
  is_active = TRUE AND EXISTS (
    SELECT 1 FROM public.sellers WHERE id = seller_id AND status = 'active'
  )
);
CREATE POLICY "Sellers can manage own products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Bargain offers policies
CREATE POLICY "Customers can view own bargain offers" ON public.bargain_offers FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create bargain offers" ON public.bargain_offers FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Sellers can view bargain offers for their products" ON public.bargain_offers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid())
);
CREATE POLICY "Sellers can update bargain offers for their products" ON public.bargain_offers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view all bargain offers" ON public.bargain_offers FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- Orders policies
CREATE POLICY "Customers can view own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Order items policies
CREATE POLICY "Customers can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
);
CREATE POLICY "Customers can create order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
);
CREATE POLICY "Sellers can view order items for their products" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- Platform settings policies (public read, admin write)
CREATE POLICY "Anyone can view platform settings" ON public.platform_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage platform settings" ON public.platform_settings FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- OTP records policies (only via edge functions)
CREATE POLICY "No direct access to OTP records" ON public.otp_records FOR SELECT USING (FALSE);

-- Insert default platform settings
INSERT INTO public.platform_settings (site_name) VALUES ('MarketHub');

-- Insert default categories
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Electronics', 'electronics', 'Laptop'),
  ('Fashion', 'fashion', 'Shirt'),
  ('Home & Garden', 'home-garden', 'Home'),
  ('Beauty', 'beauty', 'Sparkles'),
  ('Sports', 'sports', 'Dumbbell'),
  ('Books', 'books', 'BookOpen');