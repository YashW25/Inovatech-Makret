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
    queryFn: async () => {
      // Get seller counts by status
      const { data: sellers } = await supabase
        .from('sellers')
        .select('status');
      
      const activeSellers = sellers?.filter(s => s.status === 'active').length || 0;
      const pendingSellers = sellers?.filter(s => s.status === 'pending').length || 0;
      const suspendedSellers = sellers?.filter(s => s.status === 'suspended').length || 0;

      // Get total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true });

      // Get total customers (profiles count)
      const { count: totalCustomers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      // Get total revenue from orders
      const { data: orders } = await supabase
        .from('orders')
        .select('total')
        .eq('payment_status', 'paid');
      
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

      return {
        totalRevenue,
        activeSellers,
        totalProducts: totalProducts || 0,
        totalCustomers: totalCustomers || 0,
        pendingSellers,
        suspendedSellers
      } as AdminStats;
    }
  });
};
