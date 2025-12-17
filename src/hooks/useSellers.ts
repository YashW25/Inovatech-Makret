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
}

export const useSellers = (status?: SellerStatus) => {
  const { userRole } = useAuth();
  
  return useQuery({
    queryKey: ['sellers', status],
    queryFn: async () => {
      // For admin users, try using the admin function first
      if (userRole === 'super_admin' && status) {
        const { data, error } = await supabase
          .rpc('admin_get_sellers_by_status', { seller_status: status });
        
        if (!error && data) {
          return data as Seller[];
        }
      }

      // Fallback to direct query
      let query = supabase
        .from('sellers')
        .select('*');
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching sellers:', error);
        return [];
      }
      return (data || []) as Seller[];
    },
    // Provide empty array as placeholder to prevent undefined
    placeholderData: []
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
      
      if (error) {
        console.error('Error fetching current seller:', error);
        return null;
      }
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
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({
        title: 'Status updated',
        description: `Seller has been ${status}.`
      });
    },
    onError: (error) => {
      console.error('Error updating seller status:', error);
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
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      toast({
        title: 'Application submitted',
        description: 'Your seller application is under review.'
      });
    },
    onError: (error) => {
      console.error('Error registering as seller:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit application.',
        variant: 'destructive'
      });
    }
  });
};