-- Phase 1: Extend profiles table with additional fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS surname text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address_line_1 text,
ADD COLUMN IF NOT EXISTS address_line_2 text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS pin_code text,
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'India',
ADD COLUMN IF NOT EXISTS agree_terms boolean DEFAULT false;

-- Phase 2: Add stock reservation columns to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS reserved_stock integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS reserved_until timestamp with time zone;

-- Phase 3: Create cart_reservations table for temporary stock holds
CREATE TABLE IF NOT EXISTS public.cart_reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  reserved_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '48 hours'),
  is_converted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on cart_reservations
ALTER TABLE public.cart_reservations ENABLE ROW LEVEL SECURITY;

-- RLS policies for cart_reservations
CREATE POLICY "Users can view own cart reservations"
ON public.cart_reservations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create cart reservations"
ON public.cart_reservations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart reservations"
ON public.cart_reservations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart reservations"
ON public.cart_reservations FOR DELETE
USING (auth.uid() = user_id);

-- Function to clean up expired reservations and restore stock
CREATE OR REPLACE FUNCTION public.cleanup_expired_reservations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Restore stock for expired reservations
  UPDATE products p
  SET reserved_stock = GREATEST(0, p.reserved_stock - cr.quantity)
  FROM cart_reservations cr
  WHERE cr.product_id = p.id
    AND cr.expires_at < now()
    AND cr.is_converted = false;

  -- Delete expired reservations
  DELETE FROM cart_reservations
  WHERE expires_at < now() AND is_converted = false;
END;
$$;

-- Function to reserve stock when adding to cart
CREATE OR REPLACE FUNCTION public.reserve_stock(
  p_user_id uuid,
  p_product_id uuid,
  p_quantity integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  available_stock integer;
BEGIN
  -- Clean up expired reservations first
  PERFORM cleanup_expired_reservations();

  -- Get available stock (total stock - reserved stock)
  SELECT (stock - COALESCE(reserved_stock, 0))
  INTO available_stock
  FROM products
  WHERE id = p_product_id;

  -- Check if enough stock available
  IF available_stock < p_quantity THEN
    RETURN false;
  END IF;

  -- Update reserved stock
  UPDATE products
  SET reserved_stock = COALESCE(reserved_stock, 0) + p_quantity,
      reserved_until = now() + interval '48 hours'
  WHERE id = p_product_id;

  -- Create reservation record
  INSERT INTO cart_reservations (user_id, product_id, quantity)
  VALUES (p_user_id, p_product_id, p_quantity);

  RETURN true;
END;
$$;

-- Function to convert reservation to order (permanent stock reduction)
CREATE OR REPLACE FUNCTION public.convert_reservation_to_order(
  p_user_id uuid,
  p_product_id uuid,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reduce actual stock permanently
  UPDATE products
  SET stock = GREATEST(0, stock - p_quantity),
      reserved_stock = GREATEST(0, COALESCE(reserved_stock, 0) - p_quantity)
  WHERE id = p_product_id;

  -- Mark reservation as converted
  UPDATE cart_reservations
  SET is_converted = true
  WHERE user_id = p_user_id
    AND product_id = p_product_id
    AND is_converted = false;
END;
$$;

-- Function to release reservation (remove from cart without ordering)
CREATE OR REPLACE FUNCTION public.release_reservation(
  p_user_id uuid,
  p_product_id uuid,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Restore reserved stock
  UPDATE products
  SET reserved_stock = GREATEST(0, COALESCE(reserved_stock, 0) - p_quantity)
  WHERE id = p_product_id;

  -- Delete reservation
  DELETE FROM cart_reservations
  WHERE user_id = p_user_id
    AND product_id = p_product_id
    AND is_converted = false;
END;
$$;

-- Ensure platform_settings has at least one row (will be used to auto-create if empty)
INSERT INTO public.platform_settings (
  site_name,
  primary_color,
  secondary_color,
  accent_color,
  font_display,
  font_body,
  commission_rate,
  subscription_fee,
  allow_bargain,
  allow_cod,
  hero_title,
  hero_subtitle
)
SELECT
  'MarketHub',
  '32 95% 44%',
  '35 20% 94%',
  '15 75% 55%',
  'Playfair Display',
  'DM Sans',
  10.00,
  0.00,
  true,
  true,
  'Discover Unique Products from Trusted Sellers',
  'A curated marketplace where quality meets authenticity. Shop directly from verified vendors worldwide.'
WHERE NOT EXISTS (SELECT 1 FROM public.platform_settings LIMIT 1);