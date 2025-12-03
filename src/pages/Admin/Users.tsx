import React, { useState } from 'react';
import UserCreateForm from '../../components/Admin/UserCreateForm';
import PasswordResetForm from '../../components/Admin/PasswordResetForm';

// Define the two available views for this page
type View = 'create' | 'reset';

const UsersPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('create');
  
  // Tailwind classes for the active/inactive state of the tab buttons
  const activeClass = 'bg-teal-600 text-white shadow-lg';
  const inactiveClass = 'bg-gray-200 text-gray-700 hover:bg-gray-300';

  return (
    <div className="p-8 bg-gray-50 min-h-screen dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">User Administration</h1>
      
      {/* Tab/Segmented Control */}
      <div className="flex space-x-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-800 w-fit mb-8">
        <button
          onClick={() => setCurrentView('create')}
          className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
            currentView === 'create' ? activeClass : inactiveClass
          }`}
        >
          Create New User
        </button>
        <button
          onClick={() => setCurrentView('reset')}
          className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
            currentView === 'reset' ? activeClass : inactiveClass
          }`}
        >
          Reset Password
        </button>
      </div>

      {/* Conditional Rendering of Forms */}
      <div className="max-w-xl">
        {currentView === 'create' ? <UserCreateForm /> : <PasswordResetForm />}
      </div>
    </div>
  );
};

export default UsersPage;