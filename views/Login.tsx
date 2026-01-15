
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === selectedRole);
    if (found) {
      onLogin(found);
    } else {
      alert(`Invalid credentials for ${selectedRole}. Try using: ${selectedRole.toLowerCase()}@school.com`);
    }
  };

  const quickFill = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(`${role.toLowerCase()}@school.com`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center bg-gray-50 border-b border-gray-100">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 transform rotate-12 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Class-Track AI</h1>
          <p className="text-gray-500 mt-2">Next-Gen Attendance Management</p>
        </div>

        <div className="p-8">
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            {(Object.values(UserRole) as UserRole[]).map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  selectedRole === role ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institutional Email</label>
              <input
                type="email"
                required
                placeholder={`e.g., ${selectedRole.toLowerCase()}@school.com`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Token / Password</label>
              <input
                type="password"
                required
                defaultValue="password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 active:transform active:scale-95 transition-all"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="mt-6">
            <p className="text-xs text-center text-gray-400 mb-3 uppercase tracking-wider font-bold">Quick Demo Login</p>
            <div className="flex justify-between gap-2">
              <button onClick={() => quickFill(UserRole.ADMIN)} className="flex-1 text-[10px] bg-gray-50 border border-gray-200 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">Admin</button>
              <button onClick={() => quickFill(UserRole.TEACHER)} className="flex-1 text-[10px] bg-gray-50 border border-gray-200 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">Teacher</button>
              <button onClick={() => quickFill(UserRole.STUDENT)} className="flex-1 text-[10px] bg-gray-50 border border-gray-200 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">Student</button>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            Powered by Gemini Vision Biometrics &bull; v2.5
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
