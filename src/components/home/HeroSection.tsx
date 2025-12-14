import { Button } from '@/components/ui/button';
import { usePlatform } from '@/contexts/PlatformContext';
import { ArrowRight, ShieldCheck, Truck, Tag, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const { settings } = usePlatform();

  const stats = [
    { icon: Users, value: '10K+', label: 'Sellers' },
    { icon: Tag, value: '50K+', label: 'Products' },
    { icon: Truck, value: '100K+', label: 'Deliveries' },
    { icon: ShieldCheck, value: '99.9%', label: 'Satisfaction' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -left-4 top-1/4 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container relative px-4 py-16 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              Trusted by 10,000+ sellers worldwide
            </div>

            <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {settings.heroTitle.split(' ').map((word, i) => (
                <span key={i}>
                  {['Unique', 'Trusted'].includes(word) ? (
                    <span className="text-gradient">{word}</span>
                  ) : (
                    word
                  )}{' '}
                </span>
              ))}
            </h1>

            <p className="mt-6 text-lg text-muted-foreground animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {settings.heroSubtitle}
            </p>

            <div className="mt-8 flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/products">
                <Button variant="hero" size="xl">
                  Explore Products
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/sell">
                <Button variant="glass" size="xl">
                  Become a Seller
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              {stats.map((stat, i) => (
                <div key={i} className="text-center sm:text-left">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image / Cards */}
          <div className="relative hidden lg:block">
            <div className="relative h-[500px]">
              {/* Main Card */}
              <div className="absolute left-0 top-0 w-72 glass-card rounded-2xl p-4 animate-float">
                <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-6xl">👜</span>
                </div>
                <h3 className="mt-3 font-display font-semibold text-foreground">
                  Handcrafted Bags
                </h3>
                <p className="text-sm text-muted-foreground">By ArtisanCraft</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-display text-xl font-bold text-primary">$89.00</span>
                  <Button size="sm">Add to Cart</Button>
                </div>
              </div>

              {/* Secondary Card */}
              <div className="absolute right-0 top-24 w-64 glass-card rounded-2xl p-4 animate-float" style={{ animationDelay: '1s' }}>
                <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-accent/20 to-warning/20 flex items-center justify-center">
                  <span className="text-5xl">⌚</span>
                </div>
                <h3 className="mt-3 font-display font-semibold text-foreground">
                  Vintage Watch
                </h3>
                <p className="text-sm text-muted-foreground">By TimePieces</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                    Open to Offers
                  </span>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute bottom-12 left-12 glass-card rounded-xl px-4 py-3 animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {['👤', '👩', '🧑'].map((emoji, i) => (
                      <div
                        key={i}
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-sm"
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">500+ joined today</p>
                    <p className="text-xs text-muted-foreground">Happy customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
