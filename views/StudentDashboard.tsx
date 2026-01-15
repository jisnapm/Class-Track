
import React, { useState, useEffect } from 'react';
import { AppState, UserRole } from '../types';
import Camera from '../components/Camera';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface StudentDashboardProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ state, updateState, onLogout }) => {
  const [enrollStep, setEnrollStep] = useState<number | null>(null);
  const [capturedFaces, setCapturedFaces] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const myAttendance = state.attendance.filter(a => a.studentId === state.currentUser?.id);
  const myClasses = state.classes.filter(c => c.studentIds.includes(state.currentUser?.id || ''));

  // Automatically check for enrollment on mount
  useEffect(() => {
    if (state.currentUser && !state.currentUser.enrolledFaces?.length) {
      setEnrollStep(0);
    }
  }, [state.currentUser]);

  const attendancePercentage = myClasses.length === 0 ? 0 : 
    Math.round((myAttendance.length / myClasses.length) * 100);

  const pieData = [
    { name: 'Present', value: myAttendance.length },
    { name: 'Missed', value: myClasses.length - myAttendance.length }
  ];

  const chartData = [
    { day: 'Mon', count: 1 },
    { day: 'Tue', count: 2 },
    { day: 'Wed', count: 0 },
    { day: 'Thu', count: 1 },
    { day: 'Fri', count: 1 },
  ];

  const handleCaptureStep = (base64: string) => {
    setIsProcessing(true);
    
    // Artificial delay to simulate biometric processing/feature extraction
    setTimeout(() => {
      const newFaces = [...capturedFaces, base64];
      setCapturedFaces(newFaces);
      
      if (enrollStep !== null && enrollStep < 2) {
        setEnrollStep(enrollStep + 1);
      } else {
        // Finalize enrollment
        updateState(prev => ({
          ...prev,
          users: prev.users.map(u => 
            u.id === prev.currentUser?.id ? { ...u, enrolledFaces: newFaces } : u
          ),
          currentUser: prev.currentUser ? { ...prev.currentUser, enrolledFaces: newFaces } : null
        }));
        setEnrollStep(null);
        setCapturedFaces([]);
      }
      setIsProcessing(false);
    }, 800);
  };

  const enrollmentSteps = [
    { title: "Front View", instruction: "Look directly into the camera.", icon: "👤" },
    { title: "Left Profile", instruction: "Turn your head slowly to the left.", icon: "⬅️" },
    { title: "Right Profile", instruction: "Turn your head slowly to the right.", icon: "➡️" }
  ];

  // If enrolling, block the dashboard
  if (enrollStep !== null) {
    const current = enrollmentSteps[enrollStep];
    return (
      <div className="min-h-screen bg-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="p-8 text-center border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-center space-x-2 mb-6">
              {[0, 1, 2].map(i => (
                <div 
                  key={i} 
                  className={`h-2 w-12 rounded-full transition-all duration-500 ${
                    i === enrollStep ? 'bg-indigo-600' : i < enrollStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} 
                />
              ))}
            </div>
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
              {current.icon}
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Step {enrollStep + 1}: {current.title}</h2>
            <p className="text-gray-500 mt-1 font-medium">{current.instruction}</p>
          </div>

          <div className="p-8">
            <div className="relative group">
              <Camera 
                onCapture={handleCaptureStep} 
                isProcessing={isProcessing} 
                label={`Capture ${current.title}`} 
              />
              {/* Optional silhouette overlay could be added here */}
            </div>

            <div className="mt-8 flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest px-2">
              <span>Security Level: High</span>
              <span>AES-256 Encrypted</span>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 text-center">
            <button 
              onClick={onLogout}
              className="text-gray-400 hover:text-red-500 transition-colors text-sm font-bold"
            >
              Cancel & Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar navigation */}
      <nav className="lg:w-80 bg-white border-r border-gray-200 p-8 flex flex-col">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img src={state.currentUser?.avatar} className="w-24 h-24 rounded-full border-4 border-indigo-50 p-1 mx-auto" alt="Avatar" />
            <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center text-xs shadow-lg ${state.currentUser?.enrolledFaces?.length ? 'bg-green-500' : 'bg-amber-500'}`}>
              {state.currentUser?.enrolledFaces?.length ? '✓' : '!'}
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-4">{state.currentUser?.name}</h2>
          <p className="text-gray-500 text-sm font-medium">{state.currentUser?.email}</p>
        </div>

        <div className="flex-1 space-y-4">
           <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Attendance Score</p>
             <div className="flex items-end justify-between">
                <span className="text-3xl font-black text-indigo-600">{attendancePercentage}%</span>
                <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full mb-1">Active</span>
             </div>
             <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
               <div 
                 className="bg-indigo-600 h-2 rounded-full transition-all duration-1000" 
                 style={{ width: `${attendancePercentage}%` }} 
               />
             </div>
           </div>

           <div className="space-y-2 pt-4">
              <button className="w-full text-left px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center space-x-3">
                <span>🏠</span> <span>Dashboard</span>
              </button>
              <button 
                onClick={() => setEnrollStep(0)}
                className="w-full text-left px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 transition-all flex items-center space-x-3"
              >
                <span>👤</span> <span>Recalibrate Face</span>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 transition-all flex items-center space-x-3">
                <span>🗓️</span> <span>Schedule</span>
              </button>
              <button onClick={onLogout} className="w-full text-left px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all flex items-center space-x-3">
                <span>🚪</span> <span>Logout</span>
              </button>
           </div>
        </div>
      </nav>

      {/* Main Panel */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
           <div>
             <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Dashboard</h1>
             <p className="text-gray-500 font-medium">Monitoring your academic presence</p>
           </div>
           <div className="text-sm font-bold text-gray-400 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
             {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
           </div>
        </header>

        <div className="space-y-10">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="h-48 w-full">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Activity Index</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
                <h3 className="text-lg font-bold text-gray-800 self-start mb-4">Class Composition</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={60} outerRadius={80} dataKey="value">
                        <Cell fill="#4f46e5" />
                        <Cell fill="#e2e8f0" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                    <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" /> Present
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                    <div className="w-2.5 h-2.5 bg-gray-200 rounded-full" /> Absent
                  </div>
                </div>
             </div>
          </div>

          {/* Recent Attendance Log */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Attendance History</h3>
                <button className="text-indigo-600 font-bold text-sm hover:underline">Download Report</button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                     <tr>
                        <th className="px-8 py-4">Course Name</th>
                        <th className="px-8 py-4">Date</th>
                        <th className="px-8 py-4">Time</th>
                        <th className="px-8 py-4">Accuracy</th>
                        <th className="px-8 py-4">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {myAttendance.length === 0 ? (
                       <tr><td colSpan={5} className="px-8 py-10 text-center text-gray-400 italic font-medium">No biometric records logged yet.</td></tr>
                     ) : (
                       myAttendance.map(record => {
                         const cls = state.classes.find(c => c.id === record.classId);
                         return (
                           <tr key={record.id} className="hover:bg-indigo-50/30 transition-colors">
                              <td className="px-8 py-5 font-bold text-gray-800">{cls?.name}</td>
                              <td className="px-8 py-5 text-gray-500">{new Date(record.timestamp).toLocaleDateString()}</td>
                              <td className="px-8 py-5 text-gray-500">{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-100 h-1.5 rounded-full w-20 overflow-hidden">
                                       <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${record.confidence * 100}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400">{(record.confidence * 100).toFixed(0)}%</span>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase">Verified</span>
                              </td>
                           </tr>
                         );
                       })
                     )}
                  </tbody>
               </table>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
