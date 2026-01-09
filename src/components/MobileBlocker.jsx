import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, ShieldAlert } from 'lucide-react';

const MobileBlocker = ({ children }) => {
  // Check width on mount
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    // Function to check width whenever screen resizes
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    
    // Cleanup listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- THE BLOCKING SCREEN ---
  if (isMobile) {
    return (
      <div className="min-h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center z-50 fixed top-0 left-0">
        
        <div className="bg-red-500/10 p-6 rounded-full mb-6 border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
          <ShieldAlert size={64} className="text-red-500" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2">Access Restricted</h1>
        
        <p className="text-slate-400 max-w-md text-lg mb-8">
          For security and compliance compliance, the IMS Portal is only accessible via 
          <span className="text-white font-bold"> approved Desktop Workstations</span>.
        </p>

        <div className="flex items-center gap-8 text-sm font-medium text-slate-500">
          <div className="flex flex-col items-center gap-2 opacity-50">
            <Smartphone size={32} />
            <span className="line-through decoration-red-500 decoration-2">Mobile</span>
          </div>
          
          <div className="h-12 w-px bg-slate-700"></div>

          <div className="flex flex-col items-center gap-2 text-green-400">
            <Monitor size={32} />
            <span>Desktop</span>
          </div>
        </div>

        <div className="mt-12 text-xs text-slate-600 font-mono">
          Error: DEVICE_TYPE_UNAUTHORIZED
          <br/>
          Resolution: Please login from your office PC.
        </div>
      </div>
    );
  }

  // If Desktop, render the actual app
  return children;
};

export default MobileBlocker;