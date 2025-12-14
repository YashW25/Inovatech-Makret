import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePlatform } from '@/contexts/PlatformContext';
import { Store, Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

type AuthStep = 'email' | 'otp' | 'success';
type UserRole = 'customer' | 'seller';

const Auth = () => {
  const { settings } = usePlatform();
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [role, setRole] = useState<UserRole>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    // Simulate OTP sending
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setStep('otp');
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    
    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setStep('success');
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In - {settings.siteName}</title>
        <meta name="description" content="Sign in to your account or create a new one" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 flex">
        {/* Left Side - Form */}
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero shadow-md">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                {settings.siteName}
              </span>
            </Link>

            {step === 'email' && (
              <div className="mt-8 animate-fade-in">
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Welcome back
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter your email to receive a one-time password
                </p>

                {/* Role Selection */}
                <div className="mt-6 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      role === 'customer'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    I'm a Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('seller')}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      role === 'seller'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    I'm a Seller
                  </button>
                </div>

                <form onSubmit={handleSendOTP} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground">
                      Email address
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

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <span className="font-medium text-primary">Sign up for free</span>
                </p>
              </div>
            )}

            {step === 'otp' && (
              <div className="mt-8 animate-fade-in">
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Check your email
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
                </p>

                <form onSubmit={handleVerifyOTP} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Enter verification code
                    </label>
                    <div className="flex gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOTPChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="h-12 w-12 rounded-xl border border-input bg-background text-center text-xl font-bold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      ))}
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </Button>
                </form>

                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-primary"
                >
                  Didn't receive the code? <span className="font-medium">Try again</span>
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="mt-8 text-center animate-fade-in">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
                  Welcome!
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  You've successfully signed in to your account
                </p>
                <Link to={role === 'seller' ? '/seller/dashboard' : '/'}>
                  <Button variant="hero" className="mt-6" size="lg">
                    {role === 'seller' ? 'Go to Dashboard' : 'Start Shopping'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="relative hidden flex-1 lg:block">
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
