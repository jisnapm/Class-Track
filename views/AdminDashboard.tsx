
import React from 'react';
import { AppState, UserRole, User, ClassSession } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface AdminDashboardProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ state, updateState, onLogout }) => {
  const { users, classes, attendance } = state;

  const stats = [
    { label: 'Total Students', value: users.filter(u => u.role === UserRole.STUDENT).length, color: 'text-blue-600', icon: '👥' },
    { label: 'Faculties', value: users.filter(u => u.role === UserRole.TEACHER).length, color: 'text-indigo-600', icon: '👨‍🏫' },
    { label: 'Active Classes', value: classes.length, color: 'text-purple-600', icon: '🏫' },
    { label: 'Records Logged', value: attendance.length, color: 'text-green-600', icon: '📝' },
  ];

  const roleData = [
    { name: 'Students', value: users.filter(u => u.role === UserRole.STUDENT).length },
    { name: 'Teachers', value: users.filter(u => u.role === UserRole.TEACHER).length },
    { name: 'Admins', value: users.filter(u => u.role === UserRole.ADMIN).length },
  ];

  const COLORS = ['#3b82f6', '#6366f1', '#a855f7'];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 rounded-lg">CT</span>
            Class-Track
          </h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <a href="#" className="flex items-center space-x-3 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl font-medium">
            <span>📊</span> <span>Overview</span>
          </a>
          <a href="#" className="flex items-center space-x-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl transition-all">
            <span>👥</span> <span>Manage Users</span>
          </a>
          <a href="#" className="flex items-center space-x-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl transition-all">
            <span>🏫</span> <span>Classes</span>
          </a>
          <a href="#" className="flex items-center space-x-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl transition-all">
            <span>🛡️</span> <span>AI Settings</span>
          </a>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={onLogout} className="flex items-center space-x-3 text-red-600 hover:bg-red-50 w-full px-4 py-3 rounded-xl transition-all">
            <span>🚪</span> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-10">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Command Center</h1>
            <p className="text-gray-500">Managing institutional intelligence and records</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
              🔔
            </button>
            <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
              <img src={state.currentUser?.avatar} className="w-8 h-8 rounded-full" alt="Profile" />
              <span className="font-medium text-sm">{state.currentUser?.name}</span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          ))}
        </div>

        {/* Visual Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6 text-gray-800">Enrollment by Role</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6 text-gray-800">Role Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Recent Users</h3>
            <button className="text-blue-600 font-semibold text-sm hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Face Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <img src={user.avatar} className="w-10 h-10 rounded-full border border-gray-200" alt="" />
                      <span className="font-semibold text-gray-800">{user.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                        user.role === UserRole.TEACHER ? 'bg-indigo-100 text-indigo-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center ${user.enrolledFace ? 'text-green-600' : 'text-amber-500'}`}>
                        {user.enrolledFace ? '✅ Verified' : '⚠️ Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-gray-400 hover:text-blue-600 transition-colors">
                        ⚙️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
