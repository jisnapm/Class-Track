
import React, { useState } from 'react';
import { AppState, UserRole, User } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface AdminDashboardProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ state, updateState, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');

  const { users, classes, attendance } = state;

  const handleTogglePermission = (userId: string) => {
    updateState(prev => ({
      ...prev,
      users: prev.users.map(u => 
        u.id === userId ? { ...u, canReenroll: !u.canReenroll } : u
      )
    }));
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === state.currentUser?.id) {
      alert("Security Error: You cannot delete your own administrative account.");
      return;
    }
    
    if (confirm("Are you sure you want to permanently delete this user? All biometric data will be wiped.")) {
      updateState(prev => ({
        ...prev,
        users: prev.users.filter(u => u.id !== userId)
      }));
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = [
    { label: 'Total Students', value: users.filter(u => u.role === UserRole.STUDENT).length, color: 'text-blue-600', icon: '👥' },
    { label: 'Faculties', value: users.filter(u => u.role === UserRole.TEACHER).length, color: 'text-indigo-600', icon: '👨‍🏫' },
    { label: 'Active Classes', value: classes.length, color: 'text-purple-600', icon: '🏫' },
    { label: 'System Uptime', value: '99.9%', color: 'text-green-600', icon: '⚡' },
  ];

  const roleData = [
    { name: 'Students', value: users.filter(u => u.role === UserRole.STUDENT).length, color: '#3b82f6' },
    { name: 'Teachers', value: users.filter(u => u.role === UserRole.TEACHER).length, color: '#6366f1' },
    { name: 'Admins', value: users.filter(u => u.role === UserRole.ADMIN).length, color: '#a855f7' },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
      {/* Navigation Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
              CT
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight leading-none">Class-Track</h2>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</span>
            </div>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">📊</span>
              <span>Overview</span>
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                activeTab === 'users' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">👥</span>
              <span>Manage Users</span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-gray-100">
          <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <img src={state.currentUser?.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Admin" />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{state.currentUser?.name}</p>
              <p className="text-[10px] text-gray-400 font-bold truncate">Root Privileges</p>
            </div>
          </div>
          <button 
            onClick={onLogout} 
            className="w-full flex items-center justify-center space-x-2 bg-white text-red-600 border-2 border-red-50 py-3 rounded-2xl font-black text-sm hover:bg-red-50 transition-all uppercase tracking-widest"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        {activeTab === 'overview' ? (
          <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Health</h1>
              <p className="text-gray-500 font-medium mt-1">Real-time biometrics and enrollment monitoring.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    <p className={`text-3xl font-black ${stat.color} mt-2`}>{stat.value}</p>
                  </div>
                  <div className="text-3xl bg-gray-50 w-14 h-14 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-gray-900">Enrollment Distribution</h3>
                  <div className="flex space-x-2">
                    <div className="flex items-center space-x-1.5"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-[10px] font-bold text-gray-400 uppercase">Students</span></div>
                    <div className="flex items-center space-x-1.5"><div className="w-3 h-3 rounded-full bg-indigo-500"></div><span className="text-[10px] font-bold text-gray-400 uppercase">Teachers</span></div>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roleData}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                      <YAxis hide />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                        {roleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Account Balance</h3>
                <p className="text-sm text-gray-400 font-medium mb-8">User type breakdown across institution.</p>
                <div className="flex-1 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie 
                        data={roleData} 
                        innerRadius={60} 
                        outerRadius={80} 
                        paddingAngle={8} 
                        dataKey="value"
                      >
                        {roleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-6">
                  {roleData.map((role, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: role.color}}></div>
                        <span className="font-bold text-gray-600">{role.name}</span>
                      </div>
                      <span className="font-black text-gray-900">{role.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Manage Users</h1>
                <p className="text-gray-500 font-medium mt-1">Total database capacity: {users.length} unique identities.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl w-full sm:w-64 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-sm"
                  />
                </div>
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-sm text-gray-600"
                >
                  <option value="ALL">All Roles</option>
                  <option value={UserRole.STUDENT}>Students</option>
                  <option value={UserRole.TEACHER}>Teachers</option>
                  <option value={UserRole.ADMIN}>Admins</option>
                </select>
              </div>
            </header>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black">
                    <tr>
                      <th className="px-8 py-6">Personal Identity</th>
                      <th className="px-8 py-6">Biometric Status</th>
                      <th className="px-8 py-6">Control Access</th>
                      <th className="px-8 py-6 text-right">Database Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center">
                          <div className="text-5xl mb-4">🔦</div>
                          <p className="text-gray-400 font-bold">No users found matching your search parameters.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(user => (
                        <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <img src={user.avatar} className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm" alt="" />
                                {user.role === UserRole.ADMIN && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white">⭐</div>
                                )}
                              </div>
                              <div>
                                <p className="font-extrabold text-gray-900 text-base leading-tight">{user.name}</p>
                                <p className="text-xs font-medium text-gray-400 mt-0.5">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            {user.role === UserRole.STUDENT ? (
                              <div className="flex items-center space-x-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${user.enrolledFaces?.length ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
                                <div className="flex flex-col">
                                  <span className={`text-[11px] font-black uppercase tracking-wider ${user.enrolledFaces?.length ? 'text-green-700' : 'text-amber-700'}`}>
                                    {user.enrolledFaces?.length ? 'Verified Dataset' : 'Dataset Pending'}
                                  </span>
                                  {user.enrolledFaces?.length && (
                                    <span className="text-[10px] text-gray-400 font-bold">{user.enrolledFaces.length} Angles Stored</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">Exempt</span>
                            )}
                          </td>
                          <td className="px-8 py-6">
                            {user.role === UserRole.STUDENT && (
                              <div className="flex items-center space-x-2">
                                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                                  user.canReenroll 
                                  ? 'bg-green-50 text-green-600 border-green-100' 
                                  : 'bg-gray-50 text-gray-400 border-gray-200'
                                }`}>
                                  {user.canReenroll ? 'Face Reset Granted' : 'Locked Mode'}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end items-center gap-2">
                              {user.role === UserRole.STUDENT && (
                                <button 
                                  onClick={() => handleTogglePermission(user.id)}
                                  className={`p-2.5 rounded-xl transition-all border-2 ${
                                    user.canReenroll 
                                    ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' 
                                    : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'
                                  }`}
                                  title={user.canReenroll ? "Revoke Permission" : "Grant Face Reset"}
                                >
                                  {user.canReenroll ? '🔒' : '🔑'}
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={user.id === state.currentUser?.id}
                                className={`p-2.5 rounded-xl border-2 transition-all ${
                                  user.id === state.currentUser?.id 
                                  ? 'opacity-20 cursor-not-allowed border-gray-200' 
                                  : 'bg-white text-gray-400 border-gray-100 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
                                }`}
                                title="Delete Account"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
