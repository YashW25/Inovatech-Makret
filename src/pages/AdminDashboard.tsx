import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePlatform } from '@/contexts/PlatformContext';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { 
  Store, 
  Users, 
  Package, 
  DollarSign, 
  Settings, 
  BarChart3,
  Shield,
  Palette,
  Bell,
  ChevronRight,
  ArrowUpRight,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  LogOut,
  Save,
  Loader2,
  Image,
  Type
} from 'lucide-react';
import { useSellers, useUpdateSellerStatus } from '@/hooks/useSellers';
import { useAdminStats } from '@/hooks/useAdminStats';
import { usePlatformSettings, useUpdatePlatformSettings } from '@/hooks/usePlatformSettings';

const FONT_OPTIONS = [
  'Playfair Display',
  'DM Sans',
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans Pro',
  'Merriweather',
];

const AdminDashboard = () => {
  const { settings, updateSettings, refetch } = usePlatform();
  const { user, userRole, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Form state for ALL settings
  const [formData, setFormData] = useState({
    siteName: settings.siteName,
    logoUrl: settings.logo,
    faviconUrl: settings.favicon,
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
    accentColor: settings.accentColor,
    fontDisplay: settings.fontDisplay,
    fontBody: settings.fontBody,
    commissionRate: settings.commissionRate,
    subscriptionFee: settings.subscriptionFee,
    allowBargain: settings.allowBargain,
    allowCOD: settings.allowCOD,
    heroTitle: settings.heroTitle,
    heroSubtitle: settings.heroSubtitle,
    heroImage: settings.heroImage,
  });
  
  const { data: pendingSellers, isLoading: loadingPending } = useSellers('pending');
  const { data: suspendedSellers, isLoading: loadingSuspended } = useSellers('suspended');
  const { data: adminStats, isLoading: loadingStats } = useAdminStats();
  const { data: dbSettings, isLoading: loadingSettings } = usePlatformSettings();
  const updatePlatformSettings = useUpdatePlatformSettings();
  const updateSellerStatus = useUpdateSellerStatus();

  // Sync form with database settings
  useEffect(() => {
    if (dbSettings) {
      setFormData({
        siteName: dbSettings.site_name || settings.siteName,
        logoUrl: dbSettings.logo_url || '',
        faviconUrl: dbSettings.favicon_url || '',
        primaryColor: dbSettings.primary_color || settings.primaryColor,
        secondaryColor: dbSettings.secondary_color || settings.secondaryColor,
        accentColor: dbSettings.accent_color || settings.accentColor,
        fontDisplay: dbSettings.font_display || settings.fontDisplay,
        fontBody: dbSettings.font_body || settings.fontBody,
        commissionRate: dbSettings.commission_rate ?? settings.commissionRate,
        subscriptionFee: dbSettings.subscription_fee ?? settings.subscriptionFee,
        allowBargain: dbSettings.allow_bargain ?? settings.allowBargain,
        allowCOD: dbSettings.allow_cod ?? settings.allowCOD,
        heroTitle: dbSettings.hero_title || settings.heroTitle,
        heroSubtitle: dbSettings.hero_subtitle || settings.heroSubtitle,
        heroImage: dbSettings.hero_image || '',
      });
    }
  }, [dbSettings]);

  // Redirect if not super admin
  useEffect(() => {
    if (!authLoading && (!user || userRole !== 'super_admin')) {
      navigate('/auth');
    }
  }, [user, userRole, authLoading, navigate]);

  const handleApproveSeller = (sellerId: string) => {
    updateSellerStatus.mutate({ sellerId, status: 'active' });
  };

  const handleRejectSeller = (sellerId: string) => {
    updateSellerStatus.mutate({ sellerId, status: 'banned' });
  };

  const handleSaveSettings = async () => {
    await updatePlatformSettings.mutateAsync({
      site_name: formData.siteName,
      logo_url: formData.logoUrl || null,
      favicon_url: formData.faviconUrl || null,
      primary_color: formData.primaryColor,
      secondary_color: formData.secondaryColor,
      accent_color: formData.accentColor,
      font_display: formData.fontDisplay,
      font_body: formData.fontBody,
      commission_rate: formData.commissionRate,
      subscription_fee: formData.subscriptionFee,
      allow_bargain: formData.allowBargain,
      allow_cod: formData.allowCOD,
      hero_title: formData.heroTitle,
      hero_subtitle: formData.heroSubtitle,
      hero_image: formData.heroImage || null,
    });
    
    // Update context
    updateSettings({
      siteName: formData.siteName,
      logo: formData.logoUrl,
      favicon: formData.faviconUrl,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      accentColor: formData.accentColor,
      fontDisplay: formData.fontDisplay,
      fontBody: formData.fontBody,
      commissionRate: formData.commissionRate,
      subscriptionFee: formData.subscriptionFee,
      allowBargain: formData.allowBargain,
      allowCOD: formData.allowCOD,
      heroTitle: formData.heroTitle,
      heroSubtitle: formData.heroSubtitle,
      heroImage: formData.heroImage,
    });
    
    await refetch();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'sellers', label: 'Manage Sellers', icon: Users },
    { id: 'products', label: 'All Products', icon: Package },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'branding', label: 'Branding & Theme', icon: Palette },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ];

  const platformStats = [
    { label: 'Total Revenue', value: `$${adminStats?.totalRevenue?.toLocaleString() || '0'}`, change: '+18.2%', icon: DollarSign },
    { label: 'Active Sellers', value: adminStats?.activeSellers?.toString() || '0', change: '+24', icon: UserCheck },
    { label: 'Total Products', value: adminStats?.totalProducts?.toString() || '0', change: '+156', icon: Package },
    { label: 'Total Customers', value: adminStats?.totalCustomers?.toString() || '0', change: '+892', icon: Users },
  ];

  if (authLoading || loadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - {settings.siteName}</title>
        <meta name="description" content="Platform administration and management" />
      </Helmet>

      <div className="min-h-screen bg-muted/30">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 border-b border-border bg-foreground">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="hidden font-display text-lg font-bold text-background sm:inline-block">
                  Admin Panel
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative text-background/70 hover:text-background hover:bg-background/10">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                  {(pendingSellers?.length || 0) + (suspendedSellers?.length || 0)}
                </span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-background/70 hover:text-background hover:bg-background/10"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                SA
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 border-r border-border bg-background p-4 lg:block min-h-[calc(100vh-4rem)]">
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
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-8">
            {activeTab === 'overview' && (
              <>
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div>
                    <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
                      Platform Overview
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                      Monitor and manage your entire marketplace
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setActiveTab('branding')}>
                      <Palette className="h-4 w-4" />
                      Customize Theme
                    </Button>
                    <Button variant="hero" onClick={() => setActiveTab('settings')}>
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  {platformStats.map((stat, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <stat.icon className="h-5 w-5" />
                        </div>
                        <span className="flex items-center gap-1 text-sm font-medium text-success">
                          <ArrowUpRight className="h-4 w-4" />
                          {stat.change}
                        </span>
                      </div>
                      <p className="mt-4 text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Alerts */}
                <div className="mb-8 grid gap-4 lg:grid-cols-2">
                  {/* Pending Approvals */}
                  <div className="rounded-2xl border border-warning/50 bg-warning/5 p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <h3 className="font-semibold text-foreground">Pending Seller Approvals</h3>
                      <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-warning text-xs text-warning-foreground font-bold">
                        {pendingSellers?.length || 0}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {loadingPending ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : pendingSellers?.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No pending approvals</p>
                      ) : (
                        pendingSellers?.map((seller) => (
                          <div key={seller.id} className="flex items-center justify-between rounded-xl bg-background p-3">
                            <div>
                              <p className="font-medium text-foreground">{seller.business_name}</p>
                              <p className="text-sm text-muted-foreground">Applied {new Date(seller.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="seller"
                                onClick={() => handleApproveSeller(seller.id)}
                                disabled={updateSellerStatus.isPending}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-destructive"
                                onClick={() => handleRejectSeller(seller.id)}
                                disabled={updateSellerStatus.isPending}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Suspended Sellers */}
                  <div className="rounded-2xl border border-destructive/50 bg-destructive/5 p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <UserX className="h-5 w-5 text-destructive" />
                      <h3 className="font-semibold text-foreground">Suspended Sellers</h3>
                      <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground font-bold">
                        {suspendedSellers?.length || 0}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {loadingSuspended ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : suspendedSellers?.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No suspended sellers</p>
                      ) : (
                        suspendedSellers?.map((seller) => (
                          <div key={seller.id} className="flex items-center justify-between rounded-xl bg-background p-3">
                            <div>
                              <p className="font-medium text-foreground">{seller.business_name}</p>
                              <p className="text-sm text-destructive">Pending charges: ${seller.pending_charges}</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateSellerStatus.mutate({ sellerId: seller.id, status: 'active' })}
                            >
                              Reactivate
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-2xl">
                <h1 className="font-display text-2xl font-bold text-foreground mb-8">
                  Platform Settings
                </h1>
                
                <div className="space-y-6">
                  {/* Site Identity */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      Site Identity
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Site Name
                        </label>
                        <Input
                          value={formData.siteName}
                          onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                          placeholder="Your marketplace name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Logo URL
                        </label>
                        <Input
                          value={formData.logoUrl}
                          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Favicon URL
                        </label>
                        <Input
                          value={formData.faviconUrl}
                          onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
                          placeholder="https://example.com/favicon.ico"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Settings */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Business Settings
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Commission Rate (%)
                          </label>
                          <Input
                            type="number"
                            value={formData.commissionRate}
                            onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                            min="0"
                            max="100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Subscription Fee ($)
                          </label>
                          <Input
                            type="number"
                            value={formData.subscriptionFee}
                            onChange={(e) => setFormData({ ...formData, subscriptionFee: Number(e.target.value) })}
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-border p-4">
                        <div>
                          <p className="font-medium text-foreground">Allow Bargaining</p>
                          <p className="text-sm text-muted-foreground">Let customers make offers on products</p>
                        </div>
                        <button
                          onClick={() => setFormData({ ...formData, allowBargain: !formData.allowBargain })}
                          className={`relative h-6 w-11 rounded-full transition-colors ${formData.allowBargain ? 'bg-primary' : 'bg-muted'}`}
                        >
                          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${formData.allowBargain ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-border p-4">
                        <div>
                          <p className="font-medium text-foreground">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">Allow customers to pay on delivery</p>
                        </div>
                        <button
                          onClick={() => setFormData({ ...formData, allowCOD: !formData.allowCOD })}
                          className={`relative h-6 w-11 rounded-full transition-colors ${formData.allowCOD ? 'bg-primary' : 'bg-muted'}`}
                        >
                          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${formData.allowCOD ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Hero Section */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      Hero Section
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Hero Title
                        </label>
                        <Input
                          value={formData.heroTitle}
                          onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                          placeholder="Discover Unique Products"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Hero Subtitle
                        </label>
                        <Input
                          value={formData.heroSubtitle}
                          onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                          placeholder="A curated marketplace..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Hero Image URL
                        </label>
                        <Input
                          value={formData.heroImage}
                          onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                          placeholder="https://example.com/hero.jpg"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="hero" 
                    className="w-full"
                    onClick={handleSaveSettings}
                    disabled={updatePlatformSettings.isPending}
                  >
                    {updatePlatformSettings.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save All Settings
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="max-w-2xl">
                <h1 className="font-display text-2xl font-bold text-foreground mb-8">
                  Branding & Theme
                </h1>
                
                <div className="space-y-6">
                  {/* Colors */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Colors (HSL Format)
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enter colors in HSL format: "H S% L%" (e.g., "32 95% 44%")
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Primary Color
                        </label>
                        <div className="flex gap-3 items-center">
                          <div 
                            className="h-10 w-10 rounded-lg border border-border"
                            style={{ backgroundColor: `hsl(${formData.primaryColor})` }}
                          />
                          <Input
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            placeholder="32 95% 44%"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Secondary Color
                        </label>
                        <div className="flex gap-3 items-center">
                          <div 
                            className="h-10 w-10 rounded-lg border border-border"
                            style={{ backgroundColor: `hsl(${formData.secondaryColor})` }}
                          />
                          <Input
                            value={formData.secondaryColor}
                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                            placeholder="35 20% 94%"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Accent Color
                        </label>
                        <div className="flex gap-3 items-center">
                          <div 
                            className="h-10 w-10 rounded-lg border border-border"
                            style={{ backgroundColor: `hsl(${formData.accentColor})` }}
                          />
                          <Input
                            value={formData.accentColor}
                            onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                            placeholder="15 75% 55%"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Type className="h-5 w-5" />
                      Typography
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Display Font
                        </label>
                        <select
                          value={formData.fontDisplay}
                          onChange={(e) => setFormData({ ...formData, fontDisplay: e.target.value })}
                          className="w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {FONT_OPTIONS.map((font) => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                        <p className="mt-2 text-lg" style={{ fontFamily: formData.fontDisplay }}>
                          Preview: The quick brown fox
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Body Font
                        </label>
                        <select
                          value={formData.fontBody}
                          onChange={(e) => setFormData({ ...formData, fontBody: e.target.value })}
                          className="w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {FONT_OPTIONS.map((font) => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                        <p className="mt-2" style={{ fontFamily: formData.fontBody }}>
                          Preview: The quick brown fox jumps over the lazy dog.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="hero" 
                    className="w-full"
                    onClick={handleSaveSettings}
                    disabled={updatePlatformSettings.isPending}
                  >
                    {updatePlatformSettings.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Branding
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
