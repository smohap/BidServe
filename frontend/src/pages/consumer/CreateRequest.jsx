import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useToast } from '../../components/Toast';

export default function CreateRequest() {
  const navigate = useNavigate();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [recording, setRecording] = useState(null);
  const [recordingName, setRecordingName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState({});
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const [isRecording, setIsRecording] = useState(false);

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (!budget || parseFloat(budget) <= 0) errs.budget = 'Budget must be greater than 0';
    return errs;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        setRecording(blob);
        setRecordingName(`recording-${Date.now()}.webm`);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch {
      toast.error('Microphone access denied. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setValidation(errs);
    if (Object.keys(errs).length) return;

    setError('');
    setLoading(true);
    try {
      const payload = { title, description, budget: parseFloat(budget) };
      await api.createRequest(payload);
      toast.success('Request posted successfully! Providers will start reviewing it.');
      navigate('/consumer/requests');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="heading-lg mb-6 text-[#1A1A1A]">Request a Service</h2>
      <form onSubmit={handleSubmit} className="card p-6 border border-gray-100 space-y-4">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-inter">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-[#757575] mb-1 font-inter">Title <span className="text-red-400">*</span></label>
          <input type="text" required value={title} onChange={(e) => { setTitle(e.target.value); setValidation((v) => ({...v, title: undefined})); }}
            placeholder="e.g., Fix my kitchen sink"
            className={`input-field ${validation.title ? 'border-red-400 focus:ring-red-400' : ''}`} />
          {validation.title && <p className="text-xs text-red-500 mt-1 font-inter">{validation.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#757575] mb-1 font-inter">Description <span className="text-red-400">*</span></label>
          <textarea required value={description} onChange={(e) => { setDescription(e.target.value); setValidation((v) => ({...v, description: undefined})); }}
            placeholder="Describe what you need done in detail..."
            rows={4}
            className={`input-field resize-y ${validation.description ? 'border-red-400 focus:ring-red-400' : ''}`} />
          {validation.description && <p className="text-xs text-red-500 mt-1 font-inter">{validation.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#757575] mb-1 font-inter">Your Budget ($) <span className="text-red-400">*</span></label>
          <input type="number" required min="1" step="0.01" value={budget} onChange={(e) => { setBudget(e.target.value); setValidation((v) => ({...v, budget: undefined})); }}
            placeholder="50.00"
            className={`input-field ${validation.budget ? 'border-red-400 focus:ring-red-400' : ''}`} />
          {validation.budget && <p className="text-xs text-red-500 mt-1 font-inter">{validation.budget}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#757575] mb-2 font-inter">Voice Recording (optional)</label>
          <div className="flex items-center gap-3">
            {!isRecording ? (
              <button type="button" onClick={startRecording}
                className="btn-ghost flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                Record
              </button>
            ) : (
              <button type="button" onClick={stopRecording}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700 font-inter">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                Stop Recording
              </button>
            )}
            {recordingName && <span className="text-sm text-[#757575] font-inter">{recordingName}</span>}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="btn-primary w-full">
          {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Posting...</span> : 'Post Request'}
        </button>
      </form>
    </div>
  );
}