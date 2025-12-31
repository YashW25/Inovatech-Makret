import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, ArrowRight, Star, MessageSquare } from 'lucide-react';

const products = [
  {
    id: 1,
    name: 'Handwoven Rattan Basket Set',
    seller: 'ArtisanHome',
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.8,
    reviews: 124,
    image: '🧺',
    allowBargain: true,
    badge: 'Best Seller',
  },
  {
    id: 2,
    name: 'Vintage Leather Journal',
    seller: 'CraftedMemories',
    price: 45.00,
    rating: 4.9,
    reviews: 89,
    image: '📔',
    allowBargain: true,
  },
  {
    id: 3,
    name: 'Ceramic Plant Pot Collection',
    seller: 'GreenThumb',
    price: 65.00,
    originalPrice: 85.00,
    rating: 4.7,
    reviews: 156,
    image: '🪴',
    badge: 'Sale',
  },
  {
    id: 4,
    name: 'Minimalist Wall Clock',
    seller: 'ModernSpaces',
    price: 120.00,
    rating: 4.6,
    reviews: 67,
    image: '🕐',
    allowBargain: true,
  },
  {
    id: 5,
    name: 'Organic Cotton Throw Blanket',
    seller: 'CozyNest',
    price: 89.99,
    rating: 4.9,
    reviews: 203,
    image: '🛋️',
    badge: 'New',
  },
  {
    id: 6,
    name: 'Hand-painted Ceramic Mug Set',
    seller: 'StudioCeramics',
    price: 55.00,
    originalPrice: 70.00,
    rating: 4.8,
    reviews: 178,
    image: '☕',
  },
  {
    id: 7,
    name: 'Boho Macrame Wall Hanging',
    seller: 'ThreadArtistry',
    price: 95.00,
    rating: 4.7,
    reviews: 92,
    image: '🎀',
    allowBargain: true,
  },
  {
    id: 8,
    name: 'Brass Candle Holder Set',
    seller: 'LuxeDecor',
    price: 75.00,
    rating: 4.5,
    reviews: 54,
    image: '🕯️',
  },
];

const FeaturedProducts = () => {
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
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
              <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <span className="text-7xl transition-transform duration-300 group-hover:scale-110">
                  {product.image}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <Link to={`/products/${product.id}`}>
                  <h3 className="font-display font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground">{product.seller}</p>

                {/* Rating */}
                <div className="mt-2 flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="text-sm font-medium text-foreground">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">({product.reviews})</span>
                </div>

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
                  <Button size="sm" className="flex-1">
                    <ShoppingCart className="h-4 w-4" />
                    Add
                  </Button>
                  {product.allowBargain && (
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
