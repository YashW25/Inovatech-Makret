import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  customer_id: string | null;
  order_number: string;
  status: OrderStatus | null;
  subtotal: number;
  shipping_fee: number | null;
  tax: number | null;
  total: number;
  shipping_address: any;
  payment_method: string | null;
  payment_status: string | null;
  notes: string | null;
  created_at: string | null;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  seller_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export const useCustomerOrders = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['customer-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching customer orders:', error);
        return [];
      }
      return (data || []) as Order[];
    },
    enabled: !!user,
    placeholderData: []
  });
};

export const useSellerOrders = (sellerId: string) => {
  return useQuery({
    queryKey: ['seller-orders', sellerId],
    queryFn: async (): Promise<Order[]> => {
      if (!sellerId) return [];
      
      // First get order items for this seller
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('order_id')
        .eq('seller_id', sellerId);
      
      if (itemsError) {
        console.error('Error fetching seller order items:', itemsError);
        return [];
      }
      
      if (!orderItems || orderItems.length === 0) return [];
      
      // Get unique order IDs
      const orderIds = [...new Set(orderItems.map(item => item.order_id))];
      
      // Then fetch those orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .in('id', orderIds)
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('Error fetching seller orders:', ordersError);
        return [];
      }
      
      return (orders || []) as Order[];
    },
    enabled: !!sellerId,
    placeholderData: []
  });
};

export const useAllOrders = () => {
  const { userRole } = useAuth();
  
  return useQuery({
    queryKey: ['all-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching all orders:', error);
        return [];
      }
      return (data || []) as Order[];
    },
    enabled: userRole === 'super_admin',
    placeholderData: []
  });
};