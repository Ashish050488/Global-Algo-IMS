import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { User, Phone, Clock, MessageSquare, Save, X, Play, Square, Wand2, Send, Smartphone } from 'lucide-react';

const LeadDetails = () => {
  const { state } = useLocation();
  const lead = state?.lead;
  const navigate = useNavigate();

  // --- STATE MACHINE: 'IDLE' | 'CALLING' | 'LOGGING' ---
  const [mode, setMode] = useState('IDLE'); 
  
  // Call Timer State
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    outcome: '',
    notes: '',
    duration: 0
  });
  
  // AI & WhatsApp State
  const [generatedMsg, setGeneratedMsg] = useState('');
  const [isWhatsappConnected, setIsWhatsappConnected] = useState(true); // Mock Check
  const [loading, setLoading] = useState(false);

  if (!lead) return <div className="p-10">No Lead Selected</div>;

  // --- TIMER LOGIC ---
  const startCall = () => {
    setMode('CALLING');
    setTimer(0);
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const endCall = () => {
    clearInterval(timerRef.current);
    setMode('LOGGING');
    setFormData(prev => ({ ...prev, duration: timer }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- AI LOGIC ---
  const generateAiMessage = async (type) => {
    if (!formData.outcome && type === 'follow_up') {
      alert("Please select an Outcome first so the AI knows what to say.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post('/api/ai/generate', {
        leadName: lead.name,
        outcome: formData.outcome,
        notes: formData.notes,
        type
      });
      setGeneratedMsg(res.data.message);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- SAVE & CLOSE ---
  const handleLogCall = async () => {
    // Validation Gatekeeper
    if (!formData.outcome) return alert("Error: Outcome is required.");
    if (!formData.notes) return alert("Error: Notes cannot be empty.");
    if (formData.duration === 0) return alert("Error: Duration cannot be zero.");

    setLoading(true);
    try {
      await api.post('/leads/log-call', {
        leadId: lead._id,
        outcome: formData.outcome,
        notes: formData.notes,
        duration: formData.duration,
        messageSent: generatedMsg // Save the msg if we generated one
      });
      
      alert("Call Logged Successfully!");
      navigate('/my-leads');
    } catch (err) {
      alert("Failed to log call");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-brand-dark flex items-center gap-1">
          &larr; Back to Queue
        </button>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isWhatsappConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">WhatsApp {isWhatsappConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- LEFT: LEAD CARD --- */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-brand-medium">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-3 text-brand-medium font-bold text-2xl">
                {lead.name ? lead.name[0] : 'U'}
              </div>
              <h2 className="text-xl font-bold text-gray-800">{lead.name || "Unknown Lead"}</h2>
              <p className="text-brand-light font-mono">{lead.phoneNumber}</p>
            </div>
            
            <div className="space-y-3">
               {/* CALL ACTION BUTTONS */}
               {mode === 'IDLE' && (
                 <button onClick={startCall} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg transition">
                   <Phone size={20} /> Start Call
                 </button>
               )}
               
               {mode === 'CALLING' && (
                 <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center animate-pulse">
                   <p className="text-red-600 font-bold mb-2">CALL IN PROGRESS</p>
                   <p className="text-4xl font-mono font-black text-gray-800 mb-4">{formatTime(timer)}</p>
                   <button onClick={endCall} className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow transition">
                     <Square size={18} fill="white" /> End Call
                   </button>
                 </div>
               )}

               {mode === 'LOGGING' && (
                 <div className="bg-gray-100 p-3 rounded text-center">
                   <p className="text-xs text-gray-500">Call Duration</p>
                   <p className="text-xl font-mono font-bold">{formatTime(formData.duration)}</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* --- RIGHT: THE ACW HUB --- */}
        <div className="lg:col-span-2">
          {mode === 'IDLE' || mode === 'CALLING' ? (
            // Placeholder while calling
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl h-full flex flex-col items-center justify-center text-gray-400 p-10">
              <Phone size={48} className="mb-4 opacity-20" />
              <p>Start a call to enable the Logging Workstation.</p>
            </div>
          ) : (
            // THE LOGGING INTERFACE (ACW)
            <div className="bg-white rounded-xl shadow-lg border-t-4 border-blue-500 overflow-hidden">
              <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                <h3 className="font-bold text-blue-800 flex items-center gap-2">
                  <Save size={18} /> After-Call Work (ACW)
                </h3>
                <span className="text-xs text-blue-600 font-mono">Timer Stopped</span>
              </div>

              <div className="p-6 space-y-6">
                
                {/* 1. OUTCOME & NOTES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Call Outcome *</label>
                    <select 
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={formData.outcome}
                      onChange={(e) => setFormData({...formData, outcome: e.target.value})}
                    >
                      <option value="">-- Select Result --</option>
                      <option value="Connected - Interested">Connected - Interested</option>
                      <option value="Busy">Busy / Call Later</option>
                      <option value="Wrong Number">Wrong Number</option>
                      <option value="DND">DND Request</option>
                      <option value="Ringing">Ringing (No Answer)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration (Sec) *</label>
                    <input 
                      type="number" 
                      className="w-full p-2.5 border rounded-lg bg-gray-50"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Call Notes *</label>
                  <textarea 
                    rows="3"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="E.g. Discussed Gold Bonds, client asked for details..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>

                {/* 2. AI CO-PILOT */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-bold text-purple-800 flex items-center gap-2">
                      <Wand2 size={16} /> AI WhatsApp Drafter
                    </h4>
                    <span className="text-xs text-purple-600">Based on Outcome & Notes</span>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <button onClick={() => generateAiMessage('follow_up')} className="px-3 py-1 bg-white border border-purple-200 rounded text-xs font-bold text-purple-700 hover:bg-purple-100">
                      Smart Follow-up
                    </button>
                    <button onClick={() => generateAiMessage('greeting')} className="px-3 py-1 bg-white border border-purple-200 rounded text-xs font-bold text-purple-700 hover:bg-purple-100">
                      Greeting
                    </button>
                    <button onClick={() => generateAiMessage('kyc')} className="px-3 py-1 bg-white border border-purple-200 rounded text-xs font-bold text-purple-700 hover:bg-purple-100">
                      KYC Link
                    </button>
                  </div>

                  <textarea 
                    className="w-full p-3 border border-purple-200 rounded bg-white text-sm text-gray-700 focus:outline-none"
                    rows="3"
                    placeholder="AI generated message will appear here..."
                    value={generatedMsg}
                    onChange={(e) => setGeneratedMsg(e.target.value)}
                  />
                  
                  {generatedMsg && (
                    <div className="mt-2 flex justify-end">
                      <button 
                        onClick={() => window.open(`https://wa.me/${lead.phoneNumber}?text=${encodeURIComponent(generatedMsg)}`, '_blank')}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-bold transition"
                      >
                        <Send size={14} /> Send via WhatsApp
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. SUBMIT */}
                <button 
                  onClick={handleLogCall}
                  disabled={loading}
                  className="w-full py-4 bg-brand-medium hover:bg-brand-dark text-white rounded-lg font-bold shadow-lg transition text-lg"
                >
                  {loading ? 'Saving Record...' : 'Save & Close Lead'}
                </button>

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LeadDetails;