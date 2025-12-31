import { ShieldCheck, RefreshCcw, CreditCard, Truck } from 'lucide-react';

const badges = [
  {
    icon: ShieldCheck,
    title: 'Secure Checkout',
    description: 'SSL encrypted payments',
  },
  {
    icon: RefreshCcw,
    title: 'Easy Returns',
    description: '30-day return policy',
  },
  {
    icon: CreditCard,
    title: 'Safe Payment',
    description: 'Multiple payment options',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Worldwide shipping',
  },
];

const TrustBadges = () => {
  return (
    <section className="border-y border-border bg-muted/30 py-8">
      <div className="container px-4 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {badges.map((badge, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <badge.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">
                  {badge.title}
                </h3>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
