import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { usePlatform } from '@/contexts/PlatformContext';
import { Helmet } from 'react-helmet-async';
import { adminApi } from '@/lib/api';
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
  TrendingUp,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  Save,
  X,
  Loader2
} from 'lucide-react';

const platformStats = [
  { label: 'Total Revenue', value: '$284,500', change: '+18.2%', icon: DollarSign },
  { label: 'Active Sellers', value: '1,247', change: '+24', icon: UserCheck },
  { label: 'Total Products', value: '48,392', change: '+156', icon: Package },
  { label: 'Total Customers', value: '52,847', change: '+892', icon: Users },
];

const pendingSellers = [
  { id: 1, name: "John's Crafts", email: 'john@example.com', date: '2024-01-10', status: 'pending' },
  { id: 2, name: 'Artisan Studio', email: 'studio@example.com', date: '2024-01-09', status: 'pending' },
];

const suspendedSellers = [
  { id: 1, name: 'Late Payments LLC', reason: 'Unpaid commission: $450', dueDate: '2024-01-05' },
];

const AdminDashboard = () => {
  const { settings, updateSettings, refreshSettings } = usePlatform();
  const [activeTab, setActiveTab] = useState('overview');
  const [editingSettings, setEditingSettings] = useState(false);
  const [formData, setFormData] = useState<Partial<typeof settings>>({});
  const [isSaving, setIsSaving] = useState(false);

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'sellers', label: 'Manage Sellers', icon: Users },
    { id: 'products', label: 'All Products', icon: Package },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'branding', label: 'Branding & Theme', icon: Palette },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ];

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
                  5
                </span>
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
                    {pendingSellers.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {pendingSellers.map((seller) => (
                    <div key={seller.id} className="flex items-center justify-between rounded-xl bg-background p-3">
                      <div>
                        <p className="font-medium text-foreground">{seller.name}</p>
                        <p className="text-sm text-muted-foreground">{seller.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="seller">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive">
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suspended Sellers */}
              <div className="rounded-2xl border border-destructive/50 bg-destructive/5 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <UserX className="h-5 w-5 text-destructive" />
                  <h3 className="font-semibold text-foreground">Suspended Sellers</h3>
                  <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground font-bold">
                    {suspendedSellers.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {suspendedSellers.map((seller) => (
                    <div key={seller.id} className="flex items-center justify-between rounded-xl bg-background p-3">
                      <div>
                        <p className="font-medium text-foreground">{seller.name}</p>
                        <p className="text-sm text-destructive">{seller.reason}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform Settings Editor */}
            {(activeTab === 'settings' || activeTab === 'branding') && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      {activeTab === 'branding' ? 'Branding & Theme' : 'Platform Settings'}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Customize your platform appearance and behavior
                    </p>
                  </div>
                  {!editingSettings && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setFormData(settings);
                        setEditingSettings(true);
                      }}
                    >
                      Edit <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>

                {editingSettings ? (
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setIsSaving(true);
                      try {
                        await updateSettings(formData);
                        await refreshSettings();
                        setEditingSettings(false);
                      } catch (error) {
                        console.error('Failed to save settings:', error);
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    className="space-y-6"
                  >
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground">Basic Information</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="siteName">Site Name</Label>
                          <Input
                            id="siteName"
                            value={formData.siteName || ''}
                            onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                            placeholder="MarketHub"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="metaDescription">Meta Description</Label>
                          <Input
                            id="metaDescription"
                            value={formData.metaDescription || ''}
                            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                            placeholder="Platform description for SEO"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="logo">Logo URL</Label>
                          <Input
                            id="logo"
                            value={formData.logo || ''}
                            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                            placeholder="https://example.com/logo.png"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="favicon">Favicon URL</Label>
                          <Input
                            id="favicon"
                            value={formData.favicon || ''}
                            onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                            placeholder="https://example.com/favicon.ico"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Hero Section */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground">Hero Section</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="heroTitle">Hero Title</Label>
                          <Input
                            id="heroTitle"
                            value={formData.heroTitle || ''}
                            onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                            placeholder="Discover Unique Products"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                          <Textarea
                            id="heroSubtitle"
                            value={formData.heroSubtitle || ''}
                            onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                            placeholder="Platform description"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="heroImage">Hero Image URL</Label>
                          <Input
                            id="heroImage"
                            value={formData.heroImage || ''}
                            onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                            placeholder="https://example.com/hero.jpg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Colors & Theme */}
                    {activeTab === 'branding' && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">Colors & Theme</h3>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="primaryColor">Primary Color (HSL)</Label>
                            <Input
                              id="primaryColor"
                              value={formData.primaryColor || ''}
                              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                              placeholder="32 95% 44%"
                            />
                            <p className="text-xs text-muted-foreground">Format: hue saturation% lightness%</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="secondaryColor">Secondary Color (HSL)</Label>
                            <Input
                              id="secondaryColor"
                              value={formData.secondaryColor || ''}
                              onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                              placeholder="35 20% 94%"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="accentColor">Accent Color (HSL)</Label>
                            <Input
                              id="accentColor"
                              value={formData.accentColor || ''}
                              onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                              placeholder="15 75% 55%"
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="fontDisplay">Display Font</Label>
                            <Input
                              id="fontDisplay"
                              value={formData.fontDisplay || ''}
                              onChange={(e) => setFormData({ ...formData, fontDisplay: e.target.value })}
                              placeholder="Playfair Display"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fontBody">Body Font</Label>
                            <Input
                              id="fontBody"
                              value={formData.fontBody || ''}
                              onChange={(e) => setFormData({ ...formData, fontBody: e.target.value })}
                              placeholder="DM Sans"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Business Settings */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground">Business Settings</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                          <Input
                            id="commissionRate"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={formData.commissionRate || 0}
                            onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subscriptionFee">Subscription Fee ($/month)</Label>
                          <Input
                            id="subscriptionFee"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.subscriptionFee || 0}
                            onChange={(e) => setFormData({ ...formData, subscriptionFee: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="allowBargain">Allow Bargain Feature</Label>
                            <p className="text-sm text-muted-foreground">Enable customers to negotiate prices</p>
                          </div>
                          <Switch
                            id="allowBargain"
                            checked={formData.allowBargain ?? true}
                            onCheckedChange={(checked) => setFormData({ ...formData, allowBargain: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="allowCOD">Allow Cash on Delivery</Label>
                            <p className="text-sm text-muted-foreground">Enable COD payment method</p>
                          </div>
                          <Switch
                            id="allowCOD"
                            checked={formData.allowCOD ?? true}
                            onCheckedChange={(checked) => setFormData({ ...formData, allowCOD: checked })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Social Media */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground">Social Media</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="ogImage">Open Graph Image URL</Label>
                          <Input
                            id="ogImage"
                            value={formData.ogImage || ''}
                            onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                            placeholder="https://example.com/og-image.png"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="twitterHandle">Twitter Handle</Label>
                          <Input
                            id="twitterHandle"
                            value={formData.twitterHandle || ''}
                            onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                            placeholder="@yourhandle"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button type="submit" variant="hero" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setEditingSettings(false);
                          setFormData({});
                        }}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Site Name</p>
                      <p className="font-medium text-foreground">{settings.siteName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Commission Rate</p>
                      <p className="font-medium text-foreground">{settings.commissionRate}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Subscription Fee</p>
                      <p className="font-medium text-foreground">${settings.subscriptionFee}/month</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Bargain Feature</p>
                      <p className={`font-medium ${settings.allowBargain ? 'text-success' : 'text-destructive'}`}>
                        {settings.allowBargain ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">COD Payments</p>
                      <p className={`font-medium ${settings.allowCOD ? 'text-success' : 'text-destructive'}`}>
                        {settings.allowCOD ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Primary Color</p>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-primary" />
                        <span className="font-mono text-sm text-muted-foreground">
                          hsl({settings.primaryColor})
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Overview Content */}
            {activeTab === 'overview' && (
              <>
                {/* Platform Settings Preview */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      Platform Settings
                    </h2>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setActiveTab('settings')}
                    >
                      Edit <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Site Name</p>
                      <p className="font-medium text-foreground">{settings.siteName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Commission Rate</p>
                      <p className="font-medium text-foreground">{settings.commissionRate}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Subscription Fee</p>
                      <p className="font-medium text-foreground">${settings.subscriptionFee}/month</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Bargain Feature</p>
                      <p className={`font-medium ${settings.allowBargain ? 'text-success' : 'text-destructive'}`}>
                        {settings.allowBargain ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">COD Payments</p>
                      <p className={`font-medium ${settings.allowCOD ? 'text-success' : 'text-destructive'}`}>
                        {settings.allowCOD ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Primary Color</p>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-primary" />
                        <span className="font-mono text-sm text-muted-foreground">
                          hsl({settings.primaryColor})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
