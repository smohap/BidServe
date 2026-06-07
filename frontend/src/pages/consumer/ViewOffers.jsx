import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { LoadingSpinner } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';

export default function ViewOffers() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [request, setRequest] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getRequest(id),
      api.getOffersForRequest(id),
    ])
      .then(([reqData, offData]) => {
        setRequest(reqData.request);
        setOffers(offData.offers || []);
      })
      .catch((err) => {
        toast.error(err.message);
        navigate('/consumer/requests');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleRespond = async (offerId, status) => {
    setActionLoading(offerId);
    try {
      await api.respondToOffer(offerId, { status });
      toast.success(status === 'accepted' ? 'Offer accepted! Start chatting with the provider.' : 'Offer rejected.');
      const offData = await api.getOffersForRequest(id);
      setOffers(offData.offers || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending: 'badge badge-pending',
      accepted: 'badge badge-open',
      rejected: 'badge badge-rejected',
      countered: 'badge badge-pending',
    };
    return map[status] || 'badge badge-closed';
  };

  if (loading) return <LoadingSpinner />;
  if (!request) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/consumer/requests')} className="text-sm text-[#757575] hover:text-[#1A1A1A] mb-4 flex items-center gap-1 font-inter">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to my requests
      </button>

      <div className="card p-6 border border-gray-100 mb-6">
        <h2 className="heading-md text-[#1A1A1A] mb-2">{request.title}</h2>
        <p className="text-[#757575] mb-3 font-inter">{request.description}</p>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#00BFA5] font-semibold font-inter">Budget: ${parseFloat(request.budget).toFixed(2)}</span>
          <span className={request.status === 'open' ? 'badge badge-open' : 'badge badge-closed'}>{request.status}</span>
        </div>
      </div>

      <h3 className="heading-md mb-4 text-[#1A1A1A]">Offers ({offers.length})</h3>

      {offers.length === 0 ? (
        <div className="text-center py-8 card border border-gray-100">
          <p className="text-[#757575] font-inter">No offers yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className="card p-5 border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-lg text-[#1A1A1A] font-montserrat">${parseFloat(offer.price).toFixed(2)}</p>
                  <p className="text-sm text-[#757575] font-inter">by {offer.provider_name || 'Provider'}</p>
                </div>
                <span className={statusBadge(offer.status)}>{offer.status}</span>
              </div>
              {offer.message && <p className="text-sm text-[#757575] mb-3 font-inter">{offer.message}</p>}

              {offer.status === 'pending' && (
                <div className="flex gap-3">
                  <button onClick={() => handleRespond(offer.id, 'accepted')} disabled={actionLoading === offer.id}
                    className="btn-teal text-sm px-4 py-1.5 disabled:opacity-50">
                    {actionLoading === offer.id ? 'Accepting...' : 'Accept'}
                  </button>
                  <button onClick={() => handleRespond(offer.id, 'rejected')} disabled={actionLoading === offer.id}
                    className="btn-danger disabled:opacity-50">
                    {actionLoading === offer.id ? 'Rejecting...' : 'Reject'}
                  </button>
                  <button onClick={() => navigate(`/chat?requestId=${id}`)}
                    className="btn-ghost text-sm">
                    Message
                  </button>
                </div>
              )}
              {offer.status === 'accepted' && (
                <button onClick={() => {
                  toast.info('Navigating to chat...');
                  navigate(`/chat?requestId=${id}`);
                }}
                  className="btn-primary text-sm px-4 py-1.5">
                  Message Provider
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}