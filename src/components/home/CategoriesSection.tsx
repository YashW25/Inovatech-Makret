import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categories = [
  { id: 1, name: 'Fashion', icon: '👗', count: 2500, color: 'from-pink-500/20 to-rose-500/20' },
  { id: 2, name: 'Electronics', icon: '📱', count: 1800, color: 'from-blue-500/20 to-cyan-500/20' },
  { id: 3, name: 'Home & Garden', icon: '🏡', count: 3200, color: 'from-green-500/20 to-emerald-500/20' },
  { id: 4, name: 'Jewelry', icon: '💎', count: 950, color: 'from-purple-500/20 to-violet-500/20' },
  { id: 5, name: 'Art & Crafts', icon: '🎨', count: 1400, color: 'from-orange-500/20 to-amber-500/20' },
  { id: 6, name: 'Vintage', icon: '🕰️', count: 780, color: 'from-amber-500/20 to-yellow-500/20' },
  { id: 7, name: 'Sports', icon: '⚽', count: 1100, color: 'from-red-500/20 to-orange-500/20' },
  { id: 8, name: 'Books', icon: '📚', count: 2100, color: 'from-indigo-500/20 to-blue-500/20' },
];

const CategoriesSection = () => {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="container px-4 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
              Shop by Category
            </h2>
            <p className="mt-2 text-muted-foreground">
              Explore our diverse collection of products
            </p>
          </div>
          <Link
            to="/categories"
            className="hidden items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
          >
            View All Categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/products?category=${category.name.toLowerCase()}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 transition-opacity group-hover:opacity-100`} />
              
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-3xl transition-transform group-hover:scale-110">
                  {category.icon}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {category.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {category.count.toLocaleString()} products
                </p>
              </div>
            </Link>
          ))}
        </div>

        <Link
          to="/categories"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:hidden"
        >
          View All Categories
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};

export default CategoriesSection;
