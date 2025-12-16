import React, { useState } from 'react';
import { Eye, CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';
import Modal from 'react-modal'; // You would need to install react-modal or create a custom one

// Modal.setAppElement('#root'); // Important for accessibility if using react-modal

export interface FileProps {
  id: string;
  date: string;
  fileName: string;
  accepted: number;
  rejected: number;
  status: 'Completed' | 'Failed' | 'Processing';
}

interface UploadHistoryTableProps {
  history: FileProps[];
}

const rawData = `[
  {"name": "Alice Johnson", "phone": "9876543210", "city": "Mumbai"},
  {"name": "Bob Smith", "phone": "123456789X", "city": "Delhi", "error": "Invalid Phone Format"},
  // ... 100 rows total
]`;

export const UploadHistoryTable: React.FC<UploadHistoryTableProps> = ({ history }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileProps | null>(null);

  const openModal = (file: FileProps) => {
    setSelectedFile(file);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedFile(null);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">File Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Accepted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rejected</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {history.map((file) => (
              <tr key={file.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{file.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{file.fileName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">{file.accepted.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600 dark:text-red-400">{file.rejected.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {file.status === 'Completed' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      <CheckCircleFill className="mr-1" /> {file.status}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                      <XCircleFill className="mr-1" /> {file.status}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openModal(file)}
                    className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-200 flex items-center"
                  >
                    <Eye className="mr-1" /> View Raw
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Viewer */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Raw Data Viewer"
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75"
      >
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Raw Data for: {selectedFile?.fileName}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl">
              &times;
            </button>
          </div>
          <div className="p-5 overflow-y-auto max-h-[60vh]">
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
              {/* This simulates the JSON output of the raw uploaded data */}
              {rawData}
            </pre>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              * This view shows the first few rows of the data ingested.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};