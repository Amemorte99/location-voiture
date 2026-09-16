import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { FaArrowRight, FaLock } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function StripePaymentForm({ totalPrice, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [stripeError, setStripeError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe n'est pas initialisé");
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', 
    });

    if (error) {
      toast.error(error.message || "Le paiement a échoué");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentSuccess();
    } else {
      setIsProcessing(false);
    }
  };

  const handleChange = (event) => {
    if (event.error) {
      setStripeError(event.error.message);
    } else {
      setStripeError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col pt-1">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 mb-5 min-h-[150px] relative">
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-2xl z-10">
            <div className="w-8 h-8 border-4 border-[#C4A47C] border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Initialisation du terminal...</p>
          </div>
        )}
        <div className={isReady ? "block animate-fade-in" : "invisible h-0 overflow-hidden"}>
          <PaymentElement 
            options={{ layout: 'tabs' }} 
            onReady={() => setIsReady(true)}
            onChange={handleChange}
          />
        </div>
        {stripeError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 mt-3">
            <span>{stripeError}</span>
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={!stripe || !isReady || isProcessing}
        className="w-full py-4 mt-2 bg-[#111827] text-white rounded-[16px] font-black tracking-widest text-xs uppercase hover:bg-[#0D1321] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-black/10"
      >
        {isProcessing ? (
          "Validation en cours..."
        ) : (
          <>
            <FaLock size={10} className="text-white/60" />
            <span>Payer {totalPrice ? `${totalPrice} DH` : ""} & Confirmer</span>
          </>
        )}
        {!isProcessing && <FaArrowRight size={12} />}
      </button>
    </form>
  );
}
