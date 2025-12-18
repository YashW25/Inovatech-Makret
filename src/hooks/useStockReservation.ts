import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useReserveStock = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .rpc('reserve_stock', {
          p_user_id: user.id,
          p_product_id: productId,
          p_quantity: quantity
        });

      if (error) throw error;
      return data as boolean;
    },
    onError: (error) => {
      console.error('Error reserving stock:', error);
    }
  });
};

export const useReleaseReservation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .rpc('release_reservation', {
          p_user_id: user.id,
          p_product_id: productId,
          p_quantity: quantity
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};

export const useConvertReservation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (items: { productId: string; quantity: number }[]) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Convert all reservations for the order
      for (const item of items) {
        const { error } = await supabase
          .rpc('convert_reservation_to_order', {
            p_user_id: user.id,
            p_product_id: item.productId,
            p_quantity: item.quantity
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      console.error('Error converting reservation:', error);
      toast({
        title: 'Error',
        description: 'Failed to process order stock.',
        variant: 'destructive'
      });
    }
  });
};