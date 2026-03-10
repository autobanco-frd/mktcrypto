import React from 'react';

const SuccessModal = ({ card, onClose }) => (
  <div className="fixed inset-0 bg-slate-200/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h3 className="text-2xl font-bold text-emerald-700 mb-2">Payment Successful!</h3>
      <p className="text-slate-700 mb-6">
        Your payment of {card.price_sats.toLocaleString()} Sats has been confirmed.
      </p>
      <button
        onClick={onClose}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg w-full transition-all"
      >
        Done
      </button>
    </div>
  </div>
);

export default SuccessModal;
