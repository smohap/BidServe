import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../components/AuthContext';
import { SkeletonCard, LoadingSpinner } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';

export default function MyOffers() {
  const { user } = useAuth();
  const toast = useToast();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // Placeholder until /offers/mine endpoint is available
    api.getAvailableRequests()
      .then(() => setOffers([]))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const statusBadge = (status) => {
    const map = {
      pending: 'badge badge-pending',
      accepted: 'badge badge-open',
      rejected: 'badge badge-rejected',
    };
    return map[status] || 'badge badge-closed';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="heading-lg text-[#1A1A1A] mb-6">My Offers</h2>

      {offers.length === 0 ? (
        <div className="text-center py-16 card border border-gray-100">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-[#757575] mb-4 font-inter">Your offers will appear here once you make them.</p>
          <p className="text-[#757575] text-sm mb-4 font-inter">Note: The offers listing endpoint is not yet available on the backend.</p>
          <Link to="/provider/browse" className="text-[#00BFA5] hover:underline font-semibold font-inter">
            Browse available requests
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className="card p-5 border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 font-montserrat text-[#1A1A1A]">{offer.request_title || 'Service Request'}</h3>
                  <div className="flex items-center gap-4 text-sm mb-2">
                    <span className="text-[#00BFA5] font-semibold font-inter">Your price: ${parseFloat(offer.price).toFixed(2)}</span>
                    <span className={statusBadge(offer.status)}>{offer.status}</span>
                  </div>
                  {offer.message && <p className="text-sm text-[#757575] font-inter">{offer.message}</p>}
                </div>
                {offer.status === 'accepted' && (
                  <Link to={`/chat?requestId=${offer.request_id}`}
                    className="btn-primary text-sm px-4 py-1.5 ml-4">
                    Chat
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}