-- Create admin view functions with SECURITY DEFINER for bypassing RLS
CREATE OR REPLACE FUNCTION public.admin_get_all_sellers()
RETURNS SETOF sellers
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM sellers ORDER BY created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS TABLE (
  total_revenue numeric,
  active_sellers bigint,
  total_products bigint,
  total_customers bigint,
  pending_sellers bigint,
  suspended_sellers bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE((SELECT SUM(total) FROM orders WHERE payment_status = 'paid'), 0) as total_revenue,
    (SELECT COUNT(*) FROM sellers WHERE status = 'active') as active_sellers,
    (SELECT COUNT(*) FROM products) as total_products,
    (SELECT COUNT(*) FROM profiles) as total_customers,
    (SELECT COUNT(*) FROM sellers WHERE status = 'pending') as pending_sellers,
    (SELECT COUNT(*) FROM sellers WHERE status = 'suspended') as suspended_sellers;
$$;

-- Function to get sellers by status for admin
CREATE OR REPLACE FUNCTION public.admin_get_sellers_by_status(seller_status seller_status)
RETURNS SETOF sellers
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM sellers WHERE status = seller_status ORDER BY created_at DESC;
$$;