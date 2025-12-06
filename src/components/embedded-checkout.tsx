'use client';

import { useEffect, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import type { StripeEmbeddedCheckout } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface EmbeddedCheckoutProps {
  clientSecret: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function EmbeddedCheckout({ clientSecret, onComplete, onError }: EmbeddedCheckoutProps) {
  const checkoutRef = useRef<HTMLDivElement>(null);
  const checkoutInstanceRef = useRef<StripeEmbeddedCheckout | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const clientSecretRef = useRef<string | null>(null);

  useEffect(() => {
    // Prevent re-initialization if the clientSecret hasn't changed
    if (clientSecretRef.current === clientSecret && isInitialized) {
      return;
    }

    let mounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    async function initializeCheckout() {
      try {
        console.log('🎨 Initializing embedded checkout with clientSecret:', clientSecret?.substring(0, 30) + '...');
        
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Stripe failed to load');
        }
        console.log('✅ Stripe loaded');

        // Destroy any existing checkout before creating a new one
        if (checkoutInstanceRef.current) {
          console.log('🧹 Cleaning up existing checkout');
          try {
            checkoutInstanceRef.current.destroy();
          } catch (e) {
            console.warn('Error destroying existing checkout:', e);
          }
          checkoutInstanceRef.current = null;
        }

        if (!mounted) return;

        const embeddedCheckout = await stripe.initEmbeddedCheckout({
          clientSecret,
          onComplete: () => {
            console.log('✅ Checkout completed!');
            if (mounted && onComplete) {
              onComplete();
            }
          },
        });
        console.log('✅ Embedded checkout initialized');

        if (!mounted) {
          embeddedCheckout.destroy();
          return;
        }

        checkoutInstanceRef.current = embeddedCheckout;
        clientSecretRef.current = clientSecret;

        // Mount checkout
        if (checkoutRef.current) {
          console.log('✅ Mounting checkout to DOM');
          embeddedCheckout.mount(checkoutRef.current);
          setIsInitialized(true);
        }

      } catch (error) {
        console.error('❌ Error initializing checkout:', error);
        if (mounted) {
          onError?.(error as Error);
        }
      }
    }

    initializeCheckout();

    return () => {
      mounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (checkoutInstanceRef.current) {
        console.log('🧹 Destroying checkout on unmount');
        try {
          checkoutInstanceRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying checkout:', e);
        }
        checkoutInstanceRef.current = null;
        clientSecretRef.current = null;
        setIsInitialized(false);
      }
    };
  }, [clientSecret, onComplete, onError]);

  return (
    <div className="w-full pb-4">
      <div ref={checkoutRef} id="checkout-container" />
    </div>
  );
}

