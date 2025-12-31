import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  seller_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  stock: number;
  images: string[];
  is_active: boolean;
  allow_bargain: boolean;
  min_bargain_price: number | null;
  button_text: string;
  card_layout: string;
  created_at: string;
  sellers?: {
    business_name: string;
  };
  categories?: {
    name: string;
    slug: string;
  };
}

export const useProducts = (categorySlug?: string, searchQuery?: string) => {
  return useQuery({
    queryKey: ['products', categorySlug, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          sellers(business_name),
          categories(name, slug)
        `)
        .eq('is_active', true);
      
      if (categorySlug && categorySlug !== 'all') {
        query = query.eq('categories.slug', categorySlug);
      }
      
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }
      
      // Filter out products where seller relation failed (due to RLS)
      const validProducts = (data || []).filter(p => p.sellers !== null);
      return validProducts as Product[];
    },
    placeholderData: []
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          sellers(business_name, description, logo_url),
          categories(name, slug)
        `)
        .eq('id', productId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching product:', error);
        return null;
      }
      return data as Product | null;
    },
    enabled: !!productId
  });
};

export const useSellerProducts = (sellerId: string) => {
  return useQuery({
    queryKey: ['seller-products', sellerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching seller products:', error);
        return [];
      }
      return (data || []) as Product[];
    },
    enabled: !!sellerId,
    placeholderData: []
  });
};

interface CreateProductData {
  seller_id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_price?: number;
  stock?: number;
  images?: string[];
  category_id?: string;
  allow_bargain?: boolean;
  min_bargain_price?: number;
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (product: CreateProductData) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({
        title: 'Product created',
        description: 'Your product has been added successfully.'
      });
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to create product. Please try again.',
        variant: 'destructive'
      });
    }
  });
};