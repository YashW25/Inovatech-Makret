import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import { useCreateProduct } from '@/hooks/useProducts';
import { usePlatform } from '@/contexts/PlatformContext';
import { Loader2, X, Plus, ImagePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
}

const ProductFormModal = ({ isOpen, onClose, sellerId }: ProductFormModalProps) => {
  const { settings } = usePlatform();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compare_price: '',
    stock: '',
    category_id: '',
    allow_bargain: false,
    min_bargain_price: '',
  });
  const [images, setImages] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.stock || Number(formData.stock) < 0) {
      newErrors.stock = 'Stock quantity is required';
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }
    
    const validImages = images.filter(img => img.trim() !== '');
    if (validImages.length < 1) {
      newErrors.images = 'At least 1 image URL is required';
    }
    if (validImages.length > 10) {
      newErrors.images = 'Maximum 10 images allowed';
    }

    if (formData.allow_bargain && formData.min_bargain_price) {
      const minPrice = Number(formData.min_bargain_price);
      const price = Number(formData.price);
      if (minPrice >= price) {
        newErrors.min_bargain_price = 'Minimum bargain price must be less than regular price';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive'
      });
      return;
    }

    const validImages = images.filter(img => img.trim() !== '');

    createProduct.mutate({
      seller_id: sellerId,
      name: formData.name.trim(),
      slug: generateSlug(formData.name),
      description: formData.description.trim(),
      price: Number(formData.price),
      compare_price: formData.compare_price ? Number(formData.compare_price) : undefined,
      stock: Number(formData.stock),
      images: validImages,
      category_id: formData.category_id || undefined,
      allow_bargain: formData.allow_bargain,
      min_bargain_price: formData.min_bargain_price ? Number(formData.min_bargain_price) : undefined,
    }, {
      onSuccess: () => {
        onClose();
        setFormData({
          name: '',
          description: '',
          price: '',
          compare_price: '',
          stock: '',
          category_id: '',
          allow_bargain: false,
          min_bargain_price: '',
        });
        setImages(['']);
        setErrors({});
      }
    });
  };

  const addImageField = () => {
    if (images.length < 10) {
      setImages([...images, '']);
    }
  };

  const removeImageField = (index: number) => {
    if (images.length > 1) {
      setImages(images.filter((_, i) => i !== index));
    }
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add New Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Product Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your product"
              rows={4}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
          </div>

          {/* Price & Compare Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Price <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className={errors.price ? 'border-destructive' : ''}
              />
              {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Compare Price (Optional)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.compare_price}
                onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Stock & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Stock Quantity <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                className={errors.stock ? 'border-destructive' : ''}
              />
              {errors.stock && <p className="text-sm text-destructive mt-1">{errors.stock}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category <span className="text-destructive">*</span>
              </label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger className={errors.category_id ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-sm text-destructive mt-1">{errors.category_id}</p>}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Product Images <span className="text-destructive">*</span>
              <span className="text-muted-foreground font-normal ml-2">(1-10 images)</span>
            </label>
            <div className="space-y-2">
              {images.map((img, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={img}
                    onChange={(e) => updateImage(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1"
                  />
                  {images.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeImageField(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {images.length < 10 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImageField}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Image URL
              </Button>
            )}
            {errors.images && <p className="text-sm text-destructive mt-1">{errors.images}</p>}
          </div>

          {/* Allow Bargain */}
          {settings.allowBargain && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="font-medium text-foreground">Allow Bargaining</p>
                  <p className="text-sm text-muted-foreground">Let customers make price offers</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, allow_bargain: !formData.allow_bargain })}
                  className={`relative h-6 w-11 rounded-full transition-colors ${formData.allow_bargain ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${formData.allow_bargain ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {formData.allow_bargain && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Minimum Bargain Price
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.min_bargain_price}
                    onChange={(e) => setFormData({ ...formData, min_bargain_price: e.target.value })}
                    placeholder="Lowest acceptable price"
                    className={errors.min_bargain_price ? 'border-destructive' : ''}
                  />
                  {errors.min_bargain_price && <p className="text-sm text-destructive mt-1">{errors.min_bargain_price}</p>}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="hero"
              className="flex-1"
              disabled={createProduct.isPending}
            >
              {createProduct.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Create Product
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormModal;
