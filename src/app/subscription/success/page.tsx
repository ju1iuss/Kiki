'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const planNames: Record<string, string> = {
  starter: 'Try out',
  pro: 'Starter',
  business: 'Business',
};

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [planName, setPlanName] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan) {
      setPlanName(planNames[plan] || plan);
    }

    // Refresh user data to get updated subscription
    const refreshUserData = async () => {
      try {
        setIsRefreshing(true);
        await supabase.auth.refreshSession();
        
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Error refreshing session:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    refreshUserData();
  }, [supabase, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#191919]">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">
            {planName ? `${planName} Plan Activated!` : 'Subscription Successful!'}
          </h1>
          <p className="text-gray-600">
            {planName 
              ? `Your ${planName} subscription has been activated. You can now start creating mockups.`
              : 'Your subscription has been activated. You can now start creating mockups.'
            }
          </p>
          {isRefreshing && (
            <p className="text-sm text-gray-500 mt-2">
              Updating your account...
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-black text-white hover:bg-gray-800"
            disabled={isRefreshing}
          >
            Go to Dashboard
          </Button>
          <Button
            onClick={() => router.push('/settings')}
            variant="outline"
            className="w-full"
            disabled={isRefreshing}
          >
            Manage Subscription
          </Button>
        </div>
      </div>
    </div>
  );
}

