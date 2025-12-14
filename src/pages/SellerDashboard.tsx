import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePlatform } from '@/contexts/PlatformContext';
import { Helmet } from 'react-helmet-async';
import { 
  Store, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  BarChart3, 
  Settings, 
  MessageSquare,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Bell,
  ChevronRight,
  Users,
  Star,
  Eye
} from 'lucide-react';

const stats = [
  { label: 'Total Revenue', value: '$12,450', change: '+12.5%', positive: true, icon: DollarSign },
  { label: 'Orders', value: '156', change: '+8.2%', positive: true, icon: ShoppingCart },
  { label: 'Products', value: '48', change: '+2', positive: true, icon: Package },
  { label: 'Store Views', value: '2,847', change: '-3.1%', positive: false, icon: Eye },
];

const recentOrders = [
  { id: 'ORD-001', customer: 'John D.', product: 'Handwoven Basket', amount: 79.99, status: 'completed' },
  { id: 'ORD-002', customer: 'Sarah M.', product: 'Ceramic Mug Set', amount: 55.00, status: 'processing' },
  { id: 'ORD-003', customer: 'Mike R.', product: 'Wall Clock', amount: 120.00, status: 'pending' },
  { id: 'ORD-004', customer: 'Emma L.', product: 'Leather Journal', amount: 45.00, status: 'shipped' },
];

const bargainRequests = [
  { id: 1, customer: 'Alex K.', product: 'Vintage Telescope', originalPrice: 245, offerPrice: 200 },
  { id: 2, customer: 'Lisa P.', product: 'Silk Scarf', originalPrice: 129, offerPrice: 100 },
];

const SellerDashboard = () => {
  const { settings } = usePlatform();
  const [activeTab, setActiveTab] = useState('overview');

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'bargains', label: 'Bargain Requests', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <>
      <Helmet>
        <title>Seller Dashboard - {settings.siteName}</title>
        <meta name="description" content="Manage your store, products, and orders" />
      </Helmet>

      <div className="min-h-screen bg-muted/30">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
                  <Store className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="hidden font-display text-lg font-bold sm:inline-block">
                  {settings.siteName}
                </span>
              </Link>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Seller
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                  3
                </span>
              </Button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                A
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 border-r border-border bg-background p-4 lg:block">
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Commission Notice */}
            <div className="mt-6 rounded-xl border border-warning/50 bg-warning/10 p-4">
              <h4 className="font-medium text-warning-foreground">Commission Due</h4>
              <p className="mt-1 text-2xl font-bold text-warning-foreground">$124.50</p>
              <p className="mt-1 text-xs text-warning-foreground/70">Due by Dec 31, 2024</p>
              <Button size="sm" className="mt-3 w-full" variant="warning">
                Pay Now
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
                  Welcome back, Artisan 👋
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Here's what's happening with your store today
                </p>
              </div>
              <Button variant="hero">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <span className={`flex items-center gap-1 text-sm font-medium ${
                      stat.positive ? 'text-success' : 'text-destructive'
                    }`}>
                      {stat.positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {stat.change}
                    </span>
                  </div>
                  <p className="mt-4 text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Orders */}
              <div className="rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border p-4">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Recent Orders
                  </h2>
                  <Button variant="ghost" size="sm">
                    View All <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="divide-y divide-border">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
                          📦
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{order.product}</p>
                          <p className="text-sm text-muted-foreground">{order.customer}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">${order.amount.toFixed(2)}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          order.status === 'completed' ? 'bg-success/10 text-success' :
                          order.status === 'processing' ? 'bg-primary/10 text-primary' :
                          order.status === 'shipped' ? 'bg-accent/10 text-accent' :
                          'bg-warning/10 text-warning'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bargain Requests */}
              <div className="rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border p-4">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Bargain Requests
                  </h2>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {bargainRequests.length}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {bargainRequests.map((request) => (
                    <div key={request.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-foreground">{request.product}</p>
                          <p className="text-sm text-muted-foreground">From {request.customer}</p>
                        </div>
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Original</p>
                          <p className="font-semibold text-muted-foreground line-through">
                            ${request.originalPrice}
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Offer</p>
                          <p className="font-bold text-primary">${request.offerPrice}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" variant="seller">
                          Accept
                        </Button>
                        <Button size="sm" className="flex-1" variant="outline">
                          Counter
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default SellerDashboard;
