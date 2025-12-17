import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalRevenue: number;
  activeSellers: number;
  totalProducts: number;
  totalCustomers: number;
  pendingSellers: number;
  suspendedSellers: number;
}

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      // Try using the admin function first (bypasses RLS)
      const { data: statsData, error: statsError } = await supabase
        .rpc('admin_get_stats');
      
      if (!statsError && statsData && statsData.length > 0) {
        const stats = statsData[0];
        return {
          totalRevenue: Number(stats.total_revenue) || 0,
          activeSellers: Number(stats.active_sellers) || 0,
          totalProducts: Number(stats.total_products) || 0,
          totalCustomers: Number(stats.total_customers) || 0,
          pendingSellers: Number(stats.pending_sellers) || 0,
          suspendedSellers: Number(stats.suspended_sellers) || 0
        };
      }

      // Fallback: Direct queries (may be limited by RLS)
      const [sellersRes, productsRes, customersRes, ordersRes] = await Promise.all([
        supabase.from('sellers').select('status'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total').eq('payment_status', 'paid')
      ]);

      const sellers = sellersRes.data || [];
      const activeSellers = sellers.filter(s => s.status === 'active').length;
      const pendingSellers = sellers.filter(s => s.status === 'pending').length;
      const suspendedSellers = sellers.filter(s => s.status === 'suspended').length;

      const totalRevenue = (ordersRes.data || []).reduce((sum, order) => sum + Number(order.total || 0), 0);

      return {
        totalRevenue,
        activeSellers,
        totalProducts: productsRes.count || 0,
        totalCustomers: customersRes.count || 0,
        pendingSellers,
        suspendedSellers
      };
    },
    // Return default values while loading
    placeholderData: {
      totalRevenue: 0,
      activeSellers: 0,
      totalProducts: 0,
      totalCustomers: 0,
      pendingSellers: 0,
      suspendedSellers: 0
    }
  });
};