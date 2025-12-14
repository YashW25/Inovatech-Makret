import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, BarChart3, Headphones, Zap } from 'lucide-react';

const benefits = [
  {
    icon: DollarSign,
    title: 'Low Commission',
    description: 'Keep more of your earnings with our competitive 10% commission rate',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track sales, views, and customer insights in real-time',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our dedicated team is always here to help you succeed',
  },
  {
    icon: Zap,
    title: 'Quick Setup',
    description: 'Get your store up and running in less than 5 minutes',
  },
];

const SellerCTA = () => {
  return (
    <section className="relative overflow-hidden bg-foreground py-16 lg:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container relative px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div>
            <h2 className="font-display text-3xl font-bold text-background lg:text-5xl">
              Start Selling Today
            </h2>
            <p className="mt-4 text-lg text-background/70">
              Join thousands of successful sellers and reach millions of buyers. 
              Our platform makes it easy to list products, manage orders, and grow your business.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-background">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 text-sm text-background/60">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/sell">
                <Button variant="hero" size="xl">
                  Start Selling Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/seller-guidelines">
                <Button variant="glass" size="xl" className="bg-background/10 text-background border-background/20 hover:bg-background/20">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Card */}
          <div className="relative hidden lg:block">
            <div className="glass-card rounded-3xl border-background/10 bg-background/5 p-8 backdrop-blur-xl">
              <h3 className="font-display text-2xl font-bold text-background">
                Why sellers love us
              </h3>
              
              <div className="mt-8 grid gap-6">
                {[
                  { value: '$2.5M+', label: 'Paid to sellers this month' },
                  { value: '10,000+', label: 'Active sellers' },
                  { value: '98%', label: 'Seller satisfaction rate' },
                  { value: '24hrs', label: 'Average payment processing' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-background/10 pb-4 last:border-0">
                    <span className="text-background/70">{stat.label}</span>
                    <span className="font-display text-2xl font-bold text-primary">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating testimonial */}
            <div className="absolute -left-8 bottom-8 max-w-xs glass-card rounded-2xl border-background/10 bg-background/10 p-4 backdrop-blur-xl animate-float">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xl">
                  👩‍💼
                </div>
                <div>
                  <p className="font-medium text-background">Sarah K.</p>
                  <p className="text-xs text-background/60">Jewelry Seller</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-background/80">
                "I've made over $50,000 in my first year. The platform is intuitive and support is amazing!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellerCTA;
