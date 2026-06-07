import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { SkeletonCard, LoadingSpinner } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';

export default function BrowseRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    api.getAvailableRequests()
      .then((data) => setRequests(data.requests || data.feed || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = requests.filter((r) =>
    !search || r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-lg w-64 animate-pulse ml-auto" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="heading-lg text-[#1A1A1A]">Available Requests</h2>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search requests..."
          className="input-field w-full sm:w-64" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 card border border-gray-100">
          <p className="text-[#757575] font-inter">
            {search ? 'No requests match your search.' : 'No requests available right now. Check back soon!'}
          </p>
          {search && (
            <button onClick={() => setSearch('')} className="text-[#00BFA5] hover:underline font-semibold mt-2 font-inter inline-block">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((req) => (
            <Link key={req.id} to={`/provider/offer/${req.id}`}
              className="block card p-5 border border-gray-100 hover:shadow-md transition">
              <h3 className="font-semibold text-lg mb-1 font-montserrat text-[#1A1A1A]">{req.title}</h3>
              <p className="text-[#757575] text-sm line-clamp-2 mb-3 font-inter">{req.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#00BFA5] font-semibold font-inter">Budget: ${parseFloat(req.budget).toFixed(2)}</span>
                <span className="text-[#757575] font-inter">{req.offers_count || 0} offers</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}