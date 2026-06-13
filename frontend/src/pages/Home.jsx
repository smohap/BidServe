import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

export default function Home() {
  const { user, hasRole } = useAuth();
  const isConsumer = hasRole('consumer');
  const isProvider = hasRole('provider');

  return (
    <div className="flex flex-col items-center text-center py-16">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1A1A1A] mb-4 font-montserrat">
        Name Your Price.<br />
        <span className="text-[#00BFA5]">Get It Done.</span>
      </h1>
      <p className="text-lg text-[#757575] max-w-xl mb-8 font-inter">
        Need a service? Describe what you need and name your budget.
        Providers will compete for your business. Fair pricing, no surprises.
      </p>
      <div className="flex flex-wrap gap-4 justify-center mb-16">
        {!user && (
          <>
            <Link to="/register" className="bg-[#003366] text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition font-inter">
              Get Started
            </Link>
            <Link to="/login" className="bg-white text-[#003366] border-2 border-[#003366] px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition font-inter">
              Sign In
            </Link>
          </>
        )}
        {isConsumer && (
          <Link to="/consumer/requests/new" className="bg-[#003366] text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition font-inter">
            Request a Service
          </Link>
        )}
        {isProvider && (
          <Link to="/provider/browse" className="bg-[#003366] text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition font-inter">
            Browse Requests
          </Link>
        )}
      </div>

      {/* How it works */}
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl w-full">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div className="w-12 h-12 bg-[#00BFA5]/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl font-montserrat font-bold text-[#003366]">1</span>
          </div>
          <h3 className="font-semibold text-lg mb-2 font-montserrat">Describe &amp; Name Price</h3>
          <p className="text-[#757575] text-sm font-inter">Tell us what you need and set your budget. Voice recordings supported.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div className="w-12 h-12 bg-[#00BFA5]/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl font-montserrat font-bold text-[#003366]">2</span>
          </div>
          <h3 className="font-semibold text-lg mb-2 font-montserrat">Receive Offers</h3>
          <p className="text-[#757575] text-sm font-inter">Providers send you offers. Accept, reject, or counter-offer.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div className="w-12 h-12 bg-[#00BFA5]/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl font-montserrat font-bold text-[#003366]">3</span>
          </div>
          <h3 className="font-semibold text-lg mb-2 font-montserrat">Get It Done</h3>
          <p className="text-[#757575] text-sm font-inter">Agree on terms and coordinate directly. No middleman, just results.</p>
        </div>
      </div>
    </div>
  );
}