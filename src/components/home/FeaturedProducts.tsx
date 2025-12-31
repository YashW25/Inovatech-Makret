import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, ArrowRight, Star, MessageSquare, Loader2, Package } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';

const FeaturedProducts = () => {
  const { data: dbProducts, isLoading } = useProducts();
  const { addItem } = useCart();

  // Map database products to display format
  const displayProducts = (dbProducts || []).slice(0, 8).map((p, index) => ({
    id: p.id,
    name: p.name,
    seller: p.sellers?.business_name || 'Seller',
    sellerId: p.seller_id,
    price: Number(p.price),
    originalPrice: p.compare_price ? Number(p.compare_price) : undefined,
    rating: 4.5 + Math.random() * 0.5,
    reviews: Math.floor(50 + Math.random() * 150),
    image: p.images?.[0] || '📦',
    allowBargain: p.allow_bargain || false,
    badge: index === 0 ? 'Best Seller' : p.compare_price ? 'Sale' : undefined,
    stock: p.stock || 0
  }));

  const handleAddToCart = (product: typeof displayProducts[0]) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      sellerId: product.sellerId,
      sellerName: product.seller
    });
  };

  // Empty state when no products
  if (!isLoading && displayProducts.length === 0) {
    return (
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container px-4 lg:px-8">
          <div className="text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              No Products Yet
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Products will appear here once sellers add them to the marketplace.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-muted/30 py-16 lg:py-24">
      <div className="container px-4 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
              Featured Products
            </h2>
            <p className="mt-2 text-muted-foreground">
              Handpicked items from our top sellers
            </p>
          </div>
          <Link
            to="/products"
            className="hidden items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {displayProducts.map((product, index) => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Badge */}
                {product.badge && (
                  <div className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-semibold ${
                    product.badge === 'Sale' ? 'bg-destructive text-destructive-foreground' :
                    product.badge === 'New' ? 'bg-success text-success-foreground' :
                    'bg-primary text-primary-foreground'
                  }`}>
                    {product.badge}
                  </div>
                )}

                {/* Wishlist Button */}
                <button className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground opacity-0 transition-all hover:bg-background hover:text-destructive group-hover:opacity-100">
                  <Heart className="h-4 w-4" />
                </button>

                {/* Image */}
                <Link to={`/product/${product.id}`} className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  {product.image.startsWith('http') ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-7xl transition-transform duration-300 group-hover:scale-110">
                      {product.image}
                    </span>
                  )}
                </Link>

                {/* Content */}
                <div className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-display font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">{product.seller}</p>

                  {/* Rating */}
                  <div className="mt-2 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="text-sm font-medium text-foreground">{product.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({product.reviews})</span>
                  </div>

                  {/* Stock Warning */}
                  {product.stock > 0 && product.stock < 5 && (
                    <p className="mt-1 text-xs text-warning font-medium">
                      Only {product.stock} left in stock
                    </p>
                  )}

                  {/* Price & Actions */}
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <span className="font-display text-xl font-bold text-primary">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="ml-2 text-sm text-muted-foreground line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1" 
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {product.stock === 0 ? 'Out of Stock' : 'Add'}
                    </Button>
                    {product.allowBargain && product.stock > 0 && (
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="h-4 w-4" />
                        Offer
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/products"
          className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:hidden"
        >
          View All Products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProducts;