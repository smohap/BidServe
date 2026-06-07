import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { LoadingSpinner } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';

export default function MakeOffer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [request, setRequest] = useState(null);
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState({});

  useEffect(() => {
    setLoading(true);
    api.getRequest(id)
      .then((data) => {
        setRequest(data.request);
        setPrice(data.request.budget || '');
      })
      .catch((err) => {
        toast.error(err.message);
        navigate('/provider/browse');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const validate = () => {
    const errs = {};
    if (!price || parseFloat(price) <= 0) errs.price = 'Price must be greater than 0';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setValidation(errs);
    if (Object.keys(errs).length) return;

    setError('');
    setSubmitting(true);
    try {
      await api.createOffer(id, { price: parseFloat(price), message });
      toast.success('Offer submitted successfully! The client will be notified.');
      navigate('/provider/offers');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!request) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/provider/browse')} className="text-sm text-[#757575] hover:text-[#1A1A1A] mb-4 flex items-center gap-1 font-inter">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to browse
      </button>

      <div className="card p-6 border border-gray-100 mb-6">
        <h2 className="heading-md text-[#1A1A1A] mb-2">{request.title}</h2>
        <p className="text-[#757575] mb-3 font-inter">{request.description}</p>
        <span className="text-[#00BFA5] font-semibold font-inter">Client's budget: ${parseFloat(request.budget).toFixed(2)}</span>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 border border-gray-100 space-y-4">
        <h3 className="heading-md text-[#1A1A1A]">Make Your Offer</h3>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-inter">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-[#757575] mb-1 font-inter">Your Price ($) <span className="text-red-400">*</span></label>
          <input type="number" required min="1" step="0.01" value={price}
            onChange={(e) => { setPrice(e.target.value); setValidation((v) => ({...v, price: undefined})); }}
            className={`input-field ${validation.price ? 'border-red-400 focus:ring-red-400' : ''}`} />
          {validation.price && <p className="text-xs text-red-500 mt-1 font-inter">{validation.price}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#757575] mb-1 font-inter">Message to Client</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe what you'll do, timeline, etc..."
            rows={3}
            className="input-field resize-y" />
          <p className="text-xs text-[#757575] mt-1 font-inter">A good message increases your chance of being chosen.</p>
        </div>

        <button type="submit" disabled={submitting}
          className="btn-primary w-full">
          {submitting ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</span> : 'Submit Offer'}
        </button>
      </form>
    </div>
  );
}