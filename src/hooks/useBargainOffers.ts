import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

type BargainStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';

interface BargainOffer {
  id: string;
  product_id: string;
  customer_id: string;
  seller_id: string;
  offered_price: number;
  counter_price: number | null;
  status: BargainStatus;
  message: string | null;
  seller_message: string | null;
  created_at: string;
  products?: {
    name: string;
    price: number;
    images: string[];
  };
  profiles?: {
    full_name: string | null;
    email: string;
  };
}

export const useCustomerBargainOffers = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['customer-bargain-offers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bargain_offers')
        .select(`
          *,
          products(name, price, images)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BargainOffer[];
    },
    enabled: !!user
  });
};

export const useSellerBargainOffers = (sellerId: string) => {
  return useQuery({
    queryKey: ['seller-bargain-offers', sellerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bargain_offers')
        .select(`
          *,
          products(name, price, images)
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BargainOffer[];
    },
    enabled: !!sellerId
  });
};

export const useCreateBargainOffer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      productId, 
      sellerId, 
      offeredPrice, 
      message 
    }: { 
      productId: string; 
      sellerId: string; 
      offeredPrice: number; 
      message?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');
      
      const { data, error } = await supabase
        .from('bargain_offers')
        .insert({
          product_id: productId,
          seller_id: sellerId,
          customer_id: user.id,
          offered_price: offeredPrice,
          message
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bargain-offers'] });
      toast({
        title: 'Offer submitted',
        description: 'Your bargain offer has been sent to the seller.'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit offer.',
        variant: 'destructive'
      });
    }
  });
};

export const useRespondToBargain = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      offerId, 
      status, 
      counterPrice, 
      sellerMessage 
    }: { 
      offerId: string; 
      status: BargainStatus; 
      counterPrice?: number;
      sellerMessage?: string;
    }) => {
      const { error } = await supabase
        .from('bargain_offers')
        .update({ 
          status, 
          counter_price: counterPrice,
          seller_message: sellerMessage 
        })
        .eq('id', offerId);
      
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['seller-bargain-offers'] });
      toast({
        title: 'Response sent',
        description: `Offer has been ${status}.`
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to respond to offer.',
        variant: 'destructive'
      });
    }
  });
};
