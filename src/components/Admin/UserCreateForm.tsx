import React, { useState } from 'react';

// Define the shape of the user data being created
interface NewUser {
  role: 'Admin' | 'Branch Manager' | 'Team Lead' | 'Agent' | '';
  name: string;
  email: string;
  username: string;
  password: string;
}

const UserCreateForm: React.FC = () => {
  const [user, setUser] = useState<NewUser>({
    role: '',
    name: '',
    email: '',
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ⚠️ No backend logic here, just simulation!
    console.log('Attempting to create user:', user);
    alert(`User ${user.username} created (simulated)!`);
    // Clear form after simulation
    setUser({ role: '', name: '', email: '', username: '', password: '' });
  };

  const InputField: React.FC<{ label: string; name: keyof NewUser; type?: string; value: string; }> = ({ label, name, type = 'text', value }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Create New User</h2>
      
      {/* Role Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Role
        </label>
        <select
          name="role"
          value={user.role}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
        >
          <option value="" disabled>Select Role</option>
          <option value="Admin">Admin</option>
          <option value="Branch Manager">Branch Manager</option>
          <option value="Team Lead">Team Lead</option>
          <option value="Agent">Agent</option>
        </select>
      </div>

      <InputField label="Full Name" name="name" value={user.name} />
      <InputField label="Email" name="email" type="email" value={user.email} />
      <InputField label="Username" name="username" value={user.username} />
      <InputField label="Initial Password" name="password" type="password" value={user.password} />
      
      <button
        type="submit"
        className="mt-4 w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition duration-200 font-semibold"
      >
        Provision User
      </button>
    </form>
  );
};

export default UserCreateForm;