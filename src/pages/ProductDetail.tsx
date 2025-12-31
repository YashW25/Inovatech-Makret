import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { usePlatform } from '@/contexts/PlatformContext';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, 
  Heart, 
  ArrowLeft, 
  Star, 
  Truck, 
  Shield, 
  RefreshCw,
  MessageSquare,
  Minus,
  Plus,
  Loader2,
  Package,
  Store
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { settings } = usePlatform();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBargainForm, setShowBargainForm] = useState(false);
  const [bargainPrice, setBargainPrice] = useState('');

  const { data: product, isLoading, error } = useProduct(id || '');

  const handleAddToCart = () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.images?.[0] || '📦',
        sellerId: product.seller_id,
        sellerName: product.sellers?.business_name || 'Seller'
      });
    }
    
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`
    });
  };

  const handleSubmitBargain = () => {
    if (!bargainPrice) return;
    toast({
      title: 'Offer submitted',
      description: `Your offer of $${bargainPrice} has been sent to the seller.`
    });
    setShowBargainForm(false);
    setBargainPrice('');
  };

  const availableStock = product ? (product.stock || 0) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : ['📦'];
  const discount = product.compare_price 
    ? Math.round(((Number(product.compare_price) - Number(product.price)) / Number(product.compare_price)) * 100)
    : 0;

  return (
    <>
      <Helmet>
        <title>{product.name} - {settings.siteName}</title>
        <meta name="description" content={product.description || `Buy ${product.name} from ${product.sellers?.business_name}`} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container py-8 px-4">
          <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl bg-muted overflow-hidden relative">
                {images[selectedImage]?.startsWith('http') ? (
                  <img 
                    src={images[selectedImage]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-9xl">
                    {images[selectedImage]}
                  </div>
                )}
                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    -{discount}%
                  </div>
                )}
              </div>
              
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === i ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      {img.startsWith('http') ? (
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-2xl">
                          {img}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category & Title */}
              <div>
                {product.categories && (
                  <span className="text-sm text-primary font-medium">
                    {product.categories.name}
                  </span>
                )}
                <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mt-1">
                  {product.name}
                </h1>
              </div>

              {/* Seller Info */}
              <Link 
                to="#" 
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{product.sellers?.business_name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    <span>4.8</span>
                    <span className="mx-1">•</span>
                    <span>Verified Seller</span>
                  </div>
                </div>
              </Link>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl font-bold text-primary">
                  ${Number(product.price).toFixed(2)}
                </span>
                {product.compare_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${Number(product.compare_price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div>
                {availableStock > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    {availableStock < 5 ? (
                      <span className="text-warning font-medium">Only {availableStock} left in stock!</span>
                    ) : (
                      <span className="text-success font-medium">In Stock</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    <span className="text-destructive font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Quantity & Add to Cart */}
              {availableStock > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-foreground">Quantity:</span>
                    <div className="flex items-center border border-border rounded-lg">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-muted transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                        className="p-2 hover:bg-muted transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="hero" size="lg" className="flex-1" onClick={handleAddToCart}>
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="lg">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Bargain Button */}
                  {product.allow_bargain && settings.allowBargain && (
                    <div>
                      {!showBargainForm ? (
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => setShowBargainForm(true)}
                        >
                          <MessageSquare className="h-4 w-4" />
                          Make an Offer
                        </Button>
                      ) : (
                        <div className="p-4 rounded-xl border border-border bg-muted/50 space-y-3">
                          <p className="text-sm font-medium text-foreground">Your Offer</p>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={bargainPrice}
                              onChange={(e) => setBargainPrice(e.target.value)}
                              placeholder="Enter your price"
                              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                              min={product.min_bargain_price || 1}
                            />
                            <Button onClick={handleSubmitBargain}>Submit</Button>
                            <Button variant="ghost" onClick={() => setShowBargainForm(false)}>Cancel</Button>
                          </div>
                          {product.min_bargain_price && (
                            <p className="text-xs text-muted-foreground">
                              Minimum offer: ${Number(product.min_bargain_price).toFixed(2)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="text-center">
                  <Truck className="h-6 w-6 mx-auto text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Free Shipping</p>
                </div>
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Secure Payment</p>
                </div>
                <div className="text-center">
                  <RefreshCw className="h-6 w-6 mx-auto text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Easy Returns</p>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default ProductDetail;