import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../components/AuthContext';
import { useToast } from '../../components/Toast';
import { LoadingSpinner } from '../../components/Skeleton';

export default function Chat() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const requestId = searchParams.get('requestId');

  const [inputRequestId, setInputRequestId] = useState(requestId || '');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEnd = useRef(null);

  const activeRequestId = requestId || (inputRequestId.trim() || null);

  useEffect(() => {
    if (!activeRequestId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    api.getMessages(activeRequestId)
      .then((data) => setMessages(data.messages || []))
      .catch((err) => {
        setError(err.message);
        toast.error(err.message);
      })
      .finally(() => setLoading(false));
  }, [activeRequestId]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeRequestId) return;
    setSending(true);
    try {
      await api.sendMessage(activeRequestId, text);
      setText('');
      const data = await api.getMessages(activeRequestId);
      setMessages(data.messages || []);
      toast.success('Message sent!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleLoadRequest = () => {
    if (inputRequestId.trim()) {
      navigate(`/chat?requestId=${inputRequestId.trim()}`, { replace: true });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-3xl mx-auto">
      {/* Request selector */}
      <div className="bg-white p-4 border-b border-gray-200 rounded-t-xl flex gap-2 items-center" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <label className="text-sm font-medium text-[#757575] whitespace-nowrap font-inter">Request ID:</label>
        <input type="text" value={inputRequestId} onChange={(e) => setInputRequestId(e.target.value)}
          placeholder="Enter request ID to chat"
          className="input-field flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleLoadRequest()} />
        <button onClick={handleLoadRequest}
          className="btn-primary text-sm px-3 py-1.5">
          Load
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 bg-white overflow-y-auto p-4 space-y-3">
        {!activeRequestId ? (
          <div className="flex items-center justify-center h-full text-[#757575] text-sm font-inter">
            Enter a request ID above to start chatting
          </div>
        ) : loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-4 border-gray-200 border-t-[#003366]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-red-500 text-sm font-inter mb-2">{error}</p>
            <button onClick={() => navigate('/consumer/requests')}
              className="text-[#00BFA5] hover:underline font-semibold text-sm font-inter">
              Go to my requests
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-[#757575] text-sm py-8 font-inter">
            No messages yet. Send the first message!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm font-inter ${
                msg.sender_id === user?.id
                  ? 'bg-[#003366] text-white rounded-br-none'
                  : 'bg-[#F5F7FA] text-[#1A1A1A] rounded-bl-none'
              }`}>
                {msg.text}
                <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-white/60' : 'text-[#757575]'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSend} className="bg-white p-4 border-t border-gray-200 rounded-b-xl flex gap-2" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)}
          placeholder={activeRequestId ? "Type a message..." : "Load a request first"}
          disabled={!activeRequestId}
          className="input-field disabled:bg-gray-100" />
        <button type="submit" disabled={sending || !text.trim() || !activeRequestId}
          className="btn-primary disabled:opacity-50">
          {sending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" /> : 'Send'}
        </button>
      </form>
    </div>
  );
}