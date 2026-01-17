
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  onSwitchToSignUp: () => void;
}

const LoginView: React.FC<LoginProps> = ({ users, onLogin, onSwitchToSignUp }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Find user by email and role, and verify password if it exists (default to 'password' for pre-seeded users)
    const found = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.role === selectedRole &&
      (u.password === password || (!u.password && password === 'password'))
    );

    if (found) {
      onLogin(found);
    } else {
      alert(`Invalid credentials for ${selectedRole}. Please check your email and password.`);
    }
  };

  const quickFill = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(`${role.toLowerCase()}@school.com`);
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center bg-gray-50 border-b border-gray-100">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 transform rotate-6 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Sign In</h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">Class-Track Biometric Portal</p>
        </div>

        <div className="p-8">
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
            {(Object.values(UserRole) as UserRole[]).map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  selectedRole === role ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Institutional Email</label>
              <input
                type="email"
                required
                placeholder="e.g., student@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent text-gray-900 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent text-gray-900 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-300 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Access Dashboard
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              New student?{' '}
              <button onClick={onSwitchToSignUp} className="text-blue-600 font-bold hover:underline">
                Register Face
              </button>
            </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2">
              <button onClick={() => quickFill(UserRole.ADMIN)} className="text-[9px] bg-gray-50 py-2 rounded-lg font-black text-gray-400 hover:text-blue-600 transition-colors uppercase">Admin</button>
              <button onClick={() => quickFill(UserRole.TEACHER)} className="text-[9px] bg-gray-50 py-2 rounded-lg font-black text-gray-400 hover:text-blue-600 transition-colors uppercase">Teacher</button>
              <button onClick={() => quickFill(UserRole.STUDENT)} className="text-[9px] bg-gray-50 py-2 rounded-lg font-black text-gray-400 hover:text-blue-600 transition-colors uppercase">Student</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
