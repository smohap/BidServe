import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../components/AuthContext';
import { SkeletonCard, LoadingSpinner } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';

export default function MyRequests() {
  const { user } = useAuth();
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.getMyRequests(user.id)
      .then((data) => setRequests(data.requests || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const statusBadge = (status) => {
    const map = {
      open: 'badge badge-open',
      in_progress: 'badge badge-pending',
      completed: 'badge badge-closed',
      closed: 'badge badge-closed',
    };
    return map[status] || 'badge badge-closed';
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-40 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="heading-lg text-[#1A1A1A]">My Requests</h2>
        <Link to="/consumer/requests/new" className="btn-primary text-sm">
          + New Request
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 card border border-gray-100">
          <p className="text-[#757575] mb-4 font-inter">You haven't made any requests yet.</p>
          <Link to="/consumer/requests/new" className="text-[#00BFA5] hover:underline font-semibold font-inter">
            Request a service
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Link key={req.id} to={`/consumer/requests/${req.id}`}
              className="block card p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 font-montserrat text-[#1A1A1A]">{req.title}</h3>
                  <p className="text-[#757575] text-sm line-clamp-2 mb-2 font-inter">{req.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-[#00BFA5] font-semibold font-inter">Budget: ${parseFloat(req.budget).toFixed(2)}</span>
                    <span className={statusBadge(req.status)}>
                      {req.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-[#757575] ml-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}