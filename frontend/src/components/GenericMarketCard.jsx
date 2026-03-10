import React, { useState, useEffect } from 'react';
import { BadgeCheck, Zap } from 'lucide-react';
import SuccessModal from './SuccessModal';

const GenericMarketCard = ({ card, onStatusChange }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Conexión SSE para actualizaciones en tiempo real
    const eventSource = new EventSource(`/api/v1/cards/stream/${card.id}`);
    
    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      if (update.data.status === 'PAID') {
        setShowSuccess(true);
        onStatusChange?.(update.data);
      }
    };

    return () => eventSource.close();
  }, [card.id]);

  const formatTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'OPEN': return 'Available';
      case 'PAID': return 'Payment Received';
      case 'SETTLED': return 'Completed';
      case 'EXPIRED': return 'Expired';
      case 'DISPUTED': return 'Disputed';
      default: return 'Unavailable';
    }
  };

  const renderCardContent = () => {
    switch (card.type) {
      case 'PREDICTION':
        return <PredictionContent metadata={card.metadata} />;
      case 'BEAUTY':
        return <BeautyContent metadata={card.metadata} />;
      case 'SERVICE':
        return <ServiceContent metadata={card.metadata} />;
      default:
        return <DefaultContent metadata={card.metadata} />;
    }
  };

  const handlePaymentClick = () => {
    // Payment modal removed - function left for future implementation
    console.log('Payment functionality deferred');
  };

  const getImageSrc = () => {
    const url = card?.metadata?.image_url;
    if (url) return url;

    const type = card?.type || 'MARKET';
    const title = card?.metadata?.title || type;

    const bg = '#f8fafc';
    const frame = '#cbd5e1';
    const accent = type === 'BEAUTY' ? '#ec4899' : type === 'SERVICE' ? '#10b981' : '#3b82f6';

    const safeTitle = String(title).slice(0, 28);
    const safeType = String(type).slice(0, 14);

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg}"/>
      <stop offset="1" stop-color="#e2e8f0"/>
    </linearGradient>
  </defs>
  <rect width="800" height="400" fill="url(#g)"/>
  <circle cx="92" cy="92" r="10" fill="${accent}" opacity="0.9"/>
  <circle cx="124" cy="92" r="6" fill="${accent}" opacity="0.55"/>
  <text x="56" y="170" fill="#0f172a" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="40" font-weight="700">${safeTitle}</text>
  <text x="56" y="225" fill="#334155" font-family="JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="22" font-weight="600" letter-spacing="2">${safeType}</text>
  <path d="M56 280 H240" stroke="${accent}" stroke-width="6" opacity="0.7" stroke-linecap="round"/>
</svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl card-shadow overflow-hidden flex flex-col group transition-all hover:border-slate-300">
      {/* Loading Skeleton */}
      {isLoading && <LoadingSkeleton />}
      
      {/* Card Header */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent z-10" />
        <img 
          src={getImageSrc()} 
          alt={card?.metadata?.title || 'Market card'}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        
        {/* Type Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className="glass-badge text-cyan-700 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-cyan-300/40">
            {card.type}
          </span>
        </div>
        
        {/* Creator Info */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full border border-slate-200 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-700">
                {card.metadata.creator_name?.[0] || '?'}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-900">{card.metadata.creator_name || 'Anonymous'}</span>
              <span className="text-[10px] text-slate-600 block">Verified Seller</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400">98% REP</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {card.metadata.title}
            </h2>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono text-blue-700 text-lg font-bold">
                {card.price_sats.toLocaleString()} Sats
              </span>
              <span className="text-slate-500 text-xs font-medium">Floor Price</span>
            </div>
          </div>
          
          {/* Dynamic Content Based on Card Type */}
          {renderCardContent()}
          
          {/* Market Status Graph */}
          <div className="h-12 w-full flex items-end gap-1 px-1">
            <div className="flex-1 bg-blue-200 h-[40%] rounded-t-sm"></div>
            <div className="flex-1 bg-blue-200 h-[60%] rounded-t-sm"></div>
            <div className="flex-1 bg-blue-200 h-[55%] rounded-t-sm"></div>
            <div className="flex-1 bg-blue-200 h-[75%] rounded-t-sm"></div>
            <div className="flex-1 bg-blue-500 h-[90%] rounded-t-sm shadow-[0_0_10px_rgba(37,99,235,0.25)]"></div>
            <div className="flex-1 bg-blue-300 h-[65%] rounded-t-sm"></div>
            <div className="flex-1 bg-blue-300 h-[80%] rounded-t-sm"></div>
            <div className="flex-1 bg-blue-500 h-[100%] rounded-t-sm shadow-[0_0_12px_rgba(37,99,235,0.28)]"></div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 pb-8 pt-4 flex flex-col gap-5">
        <div className="flex items-center justify-between border-t border-slate-200 pt-6 pb-1">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Volume</span>
            <span className="font-mono text-slate-700 text-sm block">
              {card.metadata.total_volume || '0'} Sats
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ends In</span>
            <span className="text-slate-700 text-sm font-medium block">
              {card.expires_at ? formatTimeRemaining(card.expires_at) : 'No expiry'}
            </span>
          </div>
        </div>
        
        {/* Zap Action Button */}
        <button 
          onClick={handlePaymentClick}
          disabled={card.status !== 'OPEN'}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all transform active:scale-[0.98] mt-4 ${
            card.status === 'OPEN' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Zap className="h-5 w-5" />
          <span>
            {card.status === 'OPEN' 
              ? `Zap for ${card.price_sats.toLocaleString()} Sats` 
              : getStatusText(card.status)
            }
          </span>
        </button>
      </div>


      {/* Success Modal */}
      {showSuccess && (
        <SuccessModal 
          card={card}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};

// Helper Components
const LoadingSkeleton = () => (
  <div className="animate-shimmer">
    <div className="h-48 skeleton-bg" />
    <div className="p-5 space-y-4">
      <div className="h-6 skeleton-bg rounded-md" />
      <div className="h-4 skeleton-bg rounded-md w-3/4" />
      <div className="h-12 skeleton-bg rounded-md" />
    </div>
  </div>
);

// Content Type Components
const PredictionContent = ({ metadata }) => (
  <div className="space-y-3">
    <div className="flex gap-2">
      <button className="flex-1 bg-blue-50 border border-blue-200 rounded-lg py-2 text-blue-800 font-bold">
        YES {metadata.yes_price || 50}%
      </button>
      <button className="flex-1 bg-rose-50 border border-rose-200 rounded-lg py-2 text-rose-800 font-bold">
        NO {metadata.no_price || 50}%
      </button>
    </div>
    <p className="text-slate-600 text-sm">{metadata.question || 'Prediction question'}</p>
  </div>
);

const BeautyContent = ({ metadata }) => (
  <div className="space-y-3">
    <div className="flex gap-2 flex-wrap">
      {(metadata.tags || ['beauty', 'skincare']).map(tag => (
        <span key={tag} className="text-xs bg-pink-50 text-pink-800 px-2 py-1 rounded border border-pink-200">
          {tag}
        </span>
      ))}
    </div>
    <p className="text-slate-600 text-sm">{metadata.description || 'Premium beauty product'}</p>
  </div>
);

const ServiceContent = ({ metadata }) => (
  <div className="space-y-3">
    <div className="flex gap-2 flex-wrap">
      {(metadata.skills || ['service']).map(skill => (
        <span key={skill} className="text-xs bg-sky-50 text-sky-800 px-2 py-1 rounded border border-sky-200">
          {skill}
        </span>
      ))}
    </div>
    <p className="text-slate-600 text-sm">{metadata.description || 'Professional service offering'}</p>
  </div>
);

const DefaultContent = ({ metadata }) => (
  <div className="space-y-3">
    <p className="text-slate-600 text-sm">{metadata.description || 'Market card description'}</p>
  </div>
);

export default GenericMarketCard;
