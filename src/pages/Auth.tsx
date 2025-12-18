import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePlatform } from '@/contexts/PlatformContext';
import { useAuth } from '@/contexts/AuthContext';
import { Store, Mail, ArrowRight, Loader2, Lock, User, Phone, MapPin, FileCheck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type AuthMode = 'signin' | 'signup';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

const Auth = () => {
  const { settings } = usePlatform();
  const { user, userRole, signIn, signUp, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Extended signup fields
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    pinCode: '',
    district: '',
    state: '',
    country: 'India',
    agreeTerms: false
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      if (userRole === 'super_admin') {
        navigate('/admin');
      } else if (userRole === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, userRole, authLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      
      if (mode === 'signup') {
        if (!formData.name.trim()) {
          setError('First name is required');
          return false;
        }
        if (!formData.surname.trim()) {
          setError('Surname is required');
          return false;
        }
        if (!formData.phone.trim()) {
          setError('Phone number is required');
          return false;
        }
        if (!formData.addressLine1.trim()) {
          setError('Address is required');
          return false;
        }
        if (!formData.city.trim()) {
          setError('City is required');
          return false;
        }
        if (!formData.pinCode.trim()) {
          setError('PIN code is required');
          return false;
        }
        if (!formData.state.trim()) {
          setError('State is required');
          return false;
        }
        if (!formData.agreeTerms) {
          setError('You must agree to the terms and conditions');
          return false;
        }
      }
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.errors[0].message);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const fullName = `${formData.name} ${formData.surname}`;
        const { error: signUpError } = await signUp(email, password, fullName);
        
        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setError('This email is already registered. Please sign in instead.');
          } else {
            setError(signUpError.message);
          }
        } else {
          // Wait for user to be created then update profile
          const { data: { user: newUser } } = await supabase.auth.getUser();
          if (newUser) {
            await supabase
              .from('profiles')
              .update({
                full_name: fullName,
                surname: formData.surname,
                phone: formData.phone,
                address_line_1: formData.addressLine1,
                address_line_2: formData.addressLine2,
                city: formData.city,
                pin_code: formData.pinCode,
                district: formData.district,
                state: formData.state,
                country: formData.country,
                agree_terms: formData.agreeTerms
              })
              .eq('id', newUser.id);
          }
          toast({
            title: 'Account created!',
            description: 'Welcome to ' + settings.siteName
          });
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(signInError.message);
          }
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have successfully signed in.'
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{mode === 'signin' ? 'Sign In' : 'Sign Up'} - {settings.siteName}</title>
        <meta name="description" content="Sign in to your account or create a new one" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 flex">
        {/* Left Side - Form */}
        <div className={`flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 ${mode === 'signup' ? 'overflow-y-auto' : ''}`}>
          <div className={`mx-auto w-full ${mode === 'signup' ? 'max-w-2xl' : 'max-w-sm lg:w-96'}`}>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero shadow-md">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                {settings.siteName}
              </span>
            </Link>

            <div className="mt-8 animate-fade-in">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === 'signin' 
                  ? 'Enter your credentials to access your account' 
                  : 'Join our marketplace community today'}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {mode === 'signup' && (
                  <>
                    {/* Personal Information */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground">
                          First Name *
                        </label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John"
                            className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="surname" className="block text-sm font-medium text-foreground">
                          Surname *
                        </label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <input
                            id="surname"
                            name="surname"
                            type="text"
                            value={formData.surname}
                            onChange={handleInputChange}
                            placeholder="Doe"
                            className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                        Phone Number *
                      </label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+91 98765 43210"
                          className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="border-t border-border pt-4">
                      <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="addressLine1" className="block text-sm font-medium text-foreground">
                            Address Line 1 *
                          </label>
                          <input
                            id="addressLine1"
                            name="addressLine1"
                            type="text"
                            value={formData.addressLine1}
                            onChange={handleInputChange}
                            placeholder="House/Flat No., Building Name, Street"
                            className="mt-1 w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div>
                          <label htmlFor="addressLine2" className="block text-sm font-medium text-foreground">
                            Address Line 2
                          </label>
                          <input
                            id="addressLine2"
                            name="addressLine2"
                            type="text"
                            value={formData.addressLine2}
                            onChange={handleInputChange}
                            placeholder="Landmark, Area (Optional)"
                            className="mt-1 w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="city" className="block text-sm font-medium text-foreground">
                              City *
                            </label>
                            <input
                              id="city"
                              name="city"
                              type="text"
                              value={formData.city}
                              onChange={handleInputChange}
                              placeholder="Mumbai"
                              className="mt-1 w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div>
                            <label htmlFor="pinCode" className="block text-sm font-medium text-foreground">
                              PIN Code *
                            </label>
                            <input
                              id="pinCode"
                              name="pinCode"
                              type="text"
                              value={formData.pinCode}
                              onChange={handleInputChange}
                              placeholder="400001"
                              className="mt-1 w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="district" className="block text-sm font-medium text-foreground">
                              District
                            </label>
                            <input
                              id="district"
                              name="district"
                              type="text"
                              value={formData.district}
                              onChange={handleInputChange}
                              placeholder="Mumbai Suburban"
                              className="mt-1 w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div>
                            <label htmlFor="state" className="block text-sm font-medium text-foreground">
                              State *
                            </label>
                            <input
                              id="state"
                              name="state"
                              type="text"
                              value={formData.state}
                              onChange={handleInputChange}
                              placeholder="Maharashtra"
                              className="mt-1 w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-foreground">
                            Country *
                          </label>
                          <input
                            id="country"
                            name="country"
                            type="text"
                            value={formData.country}
                            onChange={handleInputChange}
                            placeholder="India"
                            className="mt-1 w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Email address *
                  </label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Password *
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="flex items-start gap-3">
                    <input
                      id="agreeTerms"
                      name="agreeTerms"
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <label htmlFor="agreeTerms" className="text-sm text-muted-foreground">
                      I agree to the{' '}
                      <a href="#" className="text-primary hover:underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                      {' '}*
                    </label>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    <>
                      {mode === 'signin' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === 'signin' ? (
                  <>
                    Don't have an account?{' '}
                    <button 
                      onClick={() => { setMode('signup'); setError(''); }}
                      className="font-medium text-primary hover:underline"
                    >
                      Sign up for free
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button 
                      onClick={() => { setMode('signin'); setError(''); }}
                      className="font-medium text-primary hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Visual (hidden on signup due to form size) */}
        <div className={`relative flex-1 ${mode === 'signup' ? 'hidden xl:block' : 'hidden lg:block'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          
          <div className="relative flex h-full items-center justify-center p-12">
            <div className="max-w-md text-center">
              <h2 className="font-display text-4xl font-bold text-primary-foreground">
                Join Our Thriving Marketplace
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Connect with thousands of sellers and millions of buyers. 
                Whether you're shopping or selling, we've got you covered.
              </p>
              
              <div className="mt-8 grid grid-cols-3 gap-4">
                {['🛍️', '💎', '🎨'].map((emoji, i) => (
                  <div key={i} className="glass-card rounded-xl border-primary-foreground/10 bg-primary-foreground/10 p-4 backdrop-blur-xl animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                    <span className="text-4xl">{emoji}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;