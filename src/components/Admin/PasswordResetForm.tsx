import React, { useState } from 'react';

const PasswordResetForm: React.FC = () => {
  const [resetData, setResetData] = useState({
    userId: '',
    newPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResetData({ ...resetData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ⚠️ No backend logic here, just simulation!
    console.log('Attempting password reset:', resetData);
    alert(`Password reset for User ID: ${resetData.userId} (simulated)!`);
    // Clear form after simulation
    setResetData({ userId: '', newPassword: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Reset User Password</h2>
      
      {/* User ID Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          User ID / Username
        </label>
        <input
          type="text"
          name="userId"
          value={resetData.userId}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* New Password Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          New Password
        </label>
        <input
          type="password"
          name="newPassword"
          value={resetData.newPassword}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      
      <button
        type="submit"
        className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-200 font-semibold"
      >
        Reset Password
      </button>
    </form>
  );
};

export default PasswordResetForm;