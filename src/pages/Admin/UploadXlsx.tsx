import React, { useState } from 'react';
import { CloudArrowUp, FileEarmarkExcel, ClockHistory, Eye } from 'react-bootstrap-icons';
import { UploadHistoryTable } from '../../components/Admin/UploadHistoryTable'; 
import type { FileProps } from '../../components/Admin/UploadHistoryTable';

// Mock data for the upload history table
const MOCK_HISTORY: FileProps[] = [
  { id: 'u003', date: '2025-11-30', fileName: 'Q4_Leads_Europe.xlsx', accepted: 985, rejected: 15, status: 'Completed' },
  { id: 'u002', date: '2025-11-28', fileName: 'Q4_Leads_India.xls', accepted: 450, rejected: 50, status: 'Completed' },
  { id: 'u001', date: '2025-11-25', fileName: 'Demo_Upload.xlsx', accepted: 100, rejected: 0, status: 'Completed' },
];

const UploadXlsxPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<{ accepted: number; rejected: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // Simple validation for .xlsx and .xls
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setProcessResult(null); // Reset results on new file selection
      } else {
        alert('Invalid file type. Please upload a .xlsx or .xls file.');
        setFile(null);
      }
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setIsProcessing(true);
    // Simulate API processing delay
    setTimeout(() => {
      setIsProcessing(false);
      // Simulate results
      const totalRows = Math.floor(Math.random() * 1000) + 100;
      const rejectedCount = Math.floor(Math.random() * 50);
      setProcessResult({
        accepted: totalRows - rejectedCount,
        rejected: rejectedCount,
      });
      setFile(null); // Clear file input after "upload"
    }, 2500);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        <FileEarmarkExcel className="inline mr-3 text-teal-600" size={30} />
        Excel Intake System
      </h1>

      {/* Upload and Processing Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl mb-10 max-w-3xl">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upload Raw File</h2>
        
        {/* File Input */}
        <div className="flex items-center space-x-4 mb-4">
          <input
            type="file"
            id="xlsx-upload"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <label 
            htmlFor="xlsx-upload" 
            className="cursor-pointer bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md border border-dashed border-gray-300 dark:border-gray-600 hover:border-teal-500 transition-colors"
          >
            {file ? file.name : 'Choose .xlsx or .xls File'}
          </label>
          <button
            onClick={handleUpload}
            disabled={!file || isProcessing}
            className={`flex items-center px-4 py-2 rounded-md font-semibold transition duration-200 
              ${!file || isProcessing 
                ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed' 
                : 'bg-teal-600 text-white hover:bg-teal-700'
              }`
            }
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <><CloudArrowUp className="mr-2" /> Start Upload & Filter</>
            )}
          </button>
        </div>

        {/* Processing Logic UI: Results Display */}
        {processResult && (
          <div className="mt-6 flex space-x-6">
            <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Accepted Leads (Valid)</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{processResult.accepted.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Rejected Leads (Invalid)</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{processResult.rejected.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <ClockHistory className="mr-2 text-teal-600" size={20} /> Upload History
        </h2>
        <UploadHistoryTable history={MOCK_HISTORY} />
      </div>
    </div>
  );
};

export default UploadXlsxPage;