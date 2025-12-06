'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EmbeddedCheckout } from './embedded-checkout';
import { X } from 'lucide-react';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientSecret: string | null;
  onSuccess: () => void;
}

export function CheckoutModal({ open, onOpenChange, clientSecret, onSuccess }: CheckoutModalProps) {
  const handleComplete = () => {
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Complete Your Subscription</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {clientSecret ? (
            <EmbeddedCheckout
              clientSecret={clientSecret}
              onComplete={handleComplete}
              onError={(error) => {
                console.error('Checkout error:', error);
                alert('An error occurred. Please try again.');
              }}
            />
          ) : (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

