import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

type SellerStatus = 'pending' | 'active' | 'suspended' | 'banned';

interface Seller {
  id: string;
  user_id: string;
  business_name: string;
  description: string | null;
  logo_url: string | null;
  status: SellerStatus;
  commission_rate: number;
  subscription_fee: number;
  subscription_due_date: string | null;
  total_earnings: number;
  pending_charges: number;
  created_at: string;
  profiles?: {
    email: string;
    full_name: string | null;
  };
}

export const useSellers = (status?: SellerStatus) => {
  return useQuery({
    queryKey: ['sellers', status],
    queryFn: async () => {
      let query = supabase
        .from('sellers')
        .select('*');
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Seller[];
    }
  });
};

export const useCurrentSeller = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['current-seller', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Seller | null;
    },
    enabled: !!user
  });
};

export const useUpdateSellerStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ sellerId, status }: { sellerId: string; status: SellerStatus }) => {
      const { error } = await supabase
        .from('sellers')
        .update({ status })
        .eq('id', sellerId);
      
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      toast({
        title: 'Status updated',
        description: `Seller has been ${status}.`
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update seller status.',
        variant: 'destructive'
      });
    }
  });
};

export const useRegisterAsSeller = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (businessName: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { data, error } = await supabase
        .from('sellers')
        .insert({
          user_id: user.id,
          business_name: businessName,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-seller'] });
      toast({
        title: 'Application submitted',
        description: 'Your seller application is under review.'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit application.',
        variant: 'destructive'
      });
    }
  });
};
