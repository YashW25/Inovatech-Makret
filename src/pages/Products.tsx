import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { usePlatform } from '@/contexts/PlatformContext';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useCart } from '@/contexts/CartContext';
import { Helmet } from 'react-helmet-async';
import { 
  Search, 
  SlidersHorizontal, 
  Grid3X3, 
  List, 
  Heart,
  ShoppingCart,
  MessageSquare,
  Star,
  X,
  Loader2
} from 'lucide-react';

// Fallback demo products when database is empty
const demoProducts = [
  { id: 'demo-1', name: 'Handwoven Rattan Basket Set', seller: 'ArtisanHome', price: 79.99, originalPrice: 99.99, rating: 4.8, reviews: 124, image: '🧺', allowBargain: true, category: 'home' },
  { id: 'demo-2', name: 'Vintage Leather Journal', seller: 'CraftedMemories', price: 45.00, rating: 4.9, reviews: 89, image: '📔', allowBargain: true, category: 'art' },
  { id: 'demo-3', name: 'Ceramic Plant Pot Collection', seller: 'GreenThumb', price: 65.00, originalPrice: 85.00, rating: 4.7, reviews: 156, image: '🪴', category: 'home' },
  { id: 'demo-4', name: 'Minimalist Wall Clock', seller: 'ModernSpaces', price: 120.00, rating: 4.6, reviews: 67, image: '🕐', allowBargain: true, category: 'home' },
  { id: 'demo-5', name: 'Organic Cotton Throw Blanket', seller: 'CozyNest', price: 89.99, rating: 4.9, reviews: 203, image: '🛋️', category: 'home' },
  { id: 'demo-6', name: 'Hand-painted Ceramic Mug Set', seller: 'StudioCeramics', price: 55.00, originalPrice: 70.00, rating: 4.8, reviews: 178, image: '☕', category: 'home' },
  { id: 'demo-7', name: 'Boho Macrame Wall Hanging', seller: 'ThreadArtistry', price: 95.00, rating: 4.7, reviews: 92, image: '🎀', allowBargain: true, category: 'art' },
  { id: 'demo-8', name: 'Brass Candle Holder Set', seller: 'LuxeDecor', price: 75.00, rating: 4.5, reviews: 54, image: '🕯️', category: 'home' },
];

const defaultCategories = ['All', 'Home', 'Fashion', 'Art', 'Vintage', 'Electronics', 'Jewelry'];

const Products = () => {
  const { settings } = usePlatform();
  const { addItem } = useCart();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: dbProducts, isLoading: loadingProducts } = useProducts(
    selectedCategory === 'All' ? undefined : selectedCategory.toLowerCase()
  );
  const { data: dbCategories } = useCategories();

  // Use database products if available, otherwise show demo products
  const hasDbProducts = dbProducts && dbProducts.length > 0;
  
  const displayProducts = hasDbProducts 
    ? dbProducts.map(p => ({
        id: p.id,
        name: p.name,
        seller: p.sellers?.business_name || 'Seller',
        price: Number(p.price),
        originalPrice: p.compare_price ? Number(p.compare_price) : undefined,
        rating: 4.5 + Math.random() * 0.5, // Random rating for demo
        reviews: Math.floor(50 + Math.random() * 150),
        image: p.images?.[0] || '📦',
        allowBargain: p.allow_bargain || false,
        category: p.categories?.slug || 'home'
      }))
    : demoProducts;

  // Filter by category and search
  const filteredProducts = displayProducts.filter(p => {
    const matchesCategory = selectedCategory === 'All' || 
      p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const categories = dbCategories && dbCategories.length > 0
    ? ['All', ...dbCategories.map(c => c.name)]
    : defaultCategories;

  const handleAddToCart = (product: typeof displayProducts[0]) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      sellerId: 'demo-seller',
      sellerName: product.seller
    });
  };

  return (
    <>
      <Helmet>
        <title>Products - {settings.siteName}</title>
        <meta name="description" content="Browse our collection of unique products from trusted sellers" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container px-4 py-8 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
              All Products
            </h1>
            <p className="mt-2 text-muted-foreground">
              {loadingProducts ? 'Loading...' : `Showing ${sortedProducts.length} products`}
              {!hasDbProducts && ' (Demo Mode)'}
            </p>
          </div>

          {/* Filters Bar */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Best Rating</option>
              </select>

              <div className="hidden items-center gap-1 rounded-lg border border-input p-1 sm:flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-md p-1.5 ${viewMode === 'grid' ? 'bg-muted' : ''}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-md p-1.5 ${viewMode === 'list' ? 'bg-muted' : ''}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mb-6 rounded-2xl border border-border bg-card p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Price Range</label>
                  <div className="mt-2 flex items-center gap-4">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Seller Rating</label>
                  <select className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    <option>Any rating</option>
                    <option>4+ stars</option>
                    <option>4.5+ stars</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Special Offers</label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-input" />
                      <span className="text-sm text-muted-foreground">Open to Bargain</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-input" />
                      <span className="text-sm text-muted-foreground">On Sale</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" size="sm">Clear All</Button>
                <Button size="sm">Apply Filters</Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loadingProducts && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Products Grid */}
          {!loadingProducts && (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {sortedProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-slide-up ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  {/* Wishlist */}
                  <button className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground opacity-0 transition-all hover:text-destructive group-hover:opacity-100">
                    <Heart className="h-4 w-4" />
                  </button>

                  {/* Image */}
                  <Link 
                    to={`/product/${product.id}`}
                    className={`relative bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center ${
                      viewMode === 'list' ? 'w-48 shrink-0' : 'aspect-square'
                    }`}
                  >
                    <span className={`transition-transform duration-300 group-hover:scale-110 ${
                      viewMode === 'list' ? 'text-5xl' : 'text-7xl'
                    }`}>
                      {product.image}
                    </span>
                  </Link>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-display font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors cursor-pointer">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">{product.seller}</p>

                    <div className="mt-2 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({product.reviews})</span>
                    </div>

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

                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => handleAddToCart(product)}>
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
          )}

          {/* Empty State */}
          {!loadingProducts && sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found matching your criteria.</p>
            </div>
          )}

          {/* Pagination */}
          {sortedProducts.length > 0 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                    page === 1
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {page}
                </button>
              ))}
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Products;