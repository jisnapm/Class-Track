
import React, { useState } from 'react';
import { AppState, ClassSession, UserRole, AttendanceRecord } from '../types';
import Camera from '../components/Camera';
import { verifyFace } from '../services/gemini';

interface TeacherDashboardProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ state, updateState, onLogout }) => {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isAttendanceMode, setIsAttendanceMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<any>(null);

  const teacherClasses = state.classes.filter(c => c.teacherId === state.currentUser?.id);
  const activeClass = state.classes.find(c => c.id === selectedClassId);

  const handleCapture = async (capturedBase64: string) => {
    if (!activeClass) return;
    setIsProcessing(true);
    setLastScanResult(null);

    // Get students in this class
    const students = state.users.filter(u => activeClass.studentIds.includes(u.id));
    
    // Find the next student who hasn't marked attendance yet
    const alreadyPresent = state.attendance
      .filter(a => a.classId === activeClass.id)
      .map(a => a.studentId);
    
    const targetStudent = students.find(s => !alreadyPresent.includes(s.id));

    if (!targetStudent || (!targetStudent.enrolledFaces?.length && !targetStudent.enrolledFace)) {
       setLastScanResult({ error: "No student detected or biometric data missing for pending group." });
       setIsProcessing(false);
       return;
    }

    // Use the first enrolled face for comparison (Front view)
    const referenceFace = targetStudent.enrolledFaces?.[0] || targetStudent.enrolledFace || "";
    const verification = await verifyFace(capturedBase64, referenceFace);
    
    if (verification.match && verification.confidence > 0.6) {
      const newRecord: AttendanceRecord = {
        id: `att_${Date.now()}`,
        studentId: targetStudent.id,
        classId: activeClass.id,
        timestamp: new Date().toISOString(),
        status: 'PRESENT',
        confidence: verification.confidence
      };

      updateState(prev => ({
        ...prev,
        attendance: [...prev.attendance, newRecord]
      }));

      setLastScanResult({ success: true, studentName: targetStudent.name, confidence: verification.confidence });
    } else {
      setLastScanResult({ success: false, msg: "Face mismatch or low confidence score." });
    }
    
    setIsProcessing(false);
  };

  const getAttendanceForClass = (classId: string) => {
    return state.attendance.filter(a => a.classId === classId);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen">
      {/* Sidebar navigation */}
      <nav className="w-full md:w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-indigo-600 mb-1">Teacher Hub</h2>
          <p className="text-sm text-gray-500">Welcome, {state.currentUser?.name}</p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">My Sessions</h3>
            <div className="space-y-2">
              {teacherClasses.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedClassId(c.id); setIsAttendanceMode(false); }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedClassId === c.id 
                    ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                    : 'border-gray-100 hover:border-indigo-200 bg-white'
                  }`}
                >
                  <p className="font-bold text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <span className="opacity-60">🕒</span> {c.startTime} - {c.endTime}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 space-y-2">
             <button onClick={onLogout} className="w-full flex items-center space-x-2 text-gray-500 hover:text-red-600 p-2 rounded-lg transition-colors text-sm font-semibold">
               <span>🚪</span>
               <span>Sign Out</span>
             </button>
          </div>
        </div>
      </nav>

      {/* Main Panel */}
      <main className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
        {activeClass ? (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em] px-2 py-1 bg-indigo-50 rounded border border-indigo-100">Biometric Session</span>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">{activeClass.name}</h1>
                <p className="text-gray-500">Scanner is live and ready for face verification.</p>
              </div>
              <div className="flex gap-3">
                 <button 
                  onClick={() => setIsAttendanceMode(!isAttendanceMode)}
                  className={`px-6 py-2 rounded-xl font-bold transition-all shadow-sm ${
                    isAttendanceMode 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
                  }`}
                >
                  {isAttendanceMode ? '🛑 Stop Feed' : '📸 Start Tracking'}
                </button>
                <button className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors font-bold text-sm text-gray-600">
                  Export
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Scanner Section */}
              <div className="space-y-6">
                <div className={`bg-white p-6 rounded-3xl shadow-sm border-2 transition-all ${isAttendanceMode ? 'border-indigo-400' : 'border-transparent opacity-60'}`}>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" /> Live Analysis
                  </h3>
                  {isAttendanceMode ? (
                    <Camera onCapture={handleCapture} isProcessing={isProcessing} label="Mark Attendance" />
                  ) : (
                    <div className="aspect-video bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                      Feed Inactive
                    </div>
                  )}
                  
                  {lastScanResult && (
                    <div className={`mt-6 p-4 rounded-2xl border-2 flex items-center space-x-4 animate-in fade-in zoom-in duration-300 ${
                      lastScanResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                      <div className="text-2xl">{lastScanResult.success ? '✅' : '❌'}</div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{lastScanResult.success ? 'Verification Success' : 'Verification Failed'}</p>
                        <p className="text-xs opacity-90">{lastScanResult.success ? `${lastScanResult.studentName} identified (${(lastScanResult.confidence * 100).toFixed(0)}% accuracy)` : lastScanResult.msg || lastScanResult.error}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                   <h3 className="font-bold text-gray-800 mb-4">Class Stats</h3>
                   <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Enrolled</p>
                        <p className="text-xl font-black text-gray-900">{activeClass.studentIds.length}</p>
                      </div>
                      <div className="text-center p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Present</p>
                        <p className="text-xl font-black text-indigo-900">{getAttendanceForClass(activeClass.id).length}</p>
                      </div>
                      <div className="text-center p-3 bg-amber-50 rounded-2xl border border-amber-100">
                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Absent</p>
                        <p className="text-xl font-black text-amber-900">{activeClass.studentIds.length - getAttendanceForClass(activeClass.id).length}</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Attendance Log Section */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-gray-800">Arrival Timeline</h3>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                  {getAttendanceForClass(activeClass.id).length === 0 ? (
                    <div className="p-10 text-center text-gray-400 font-medium italic">
                      No scans performed in this session.
                    </div>
                  ) : (
                    getAttendanceForClass(activeClass.id).map(record => {
                      const student = state.users.find(u => u.id === record.studentId);
                      return (
                        <div key={record.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <img src={student?.avatar} className="w-10 h-10 rounded-full border border-indigo-100" alt="" />
                              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm leading-tight">{student?.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium uppercase">{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-green-600 px-2 py-0.5 bg-green-50 rounded-full border border-green-100 uppercase tracking-widest">{record.status}</p>
                             <p className="text-[9px] text-gray-400 mt-1 font-bold italic">{(record.confidence * 100).toFixed(0)}% matching</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale">
            <div className="text-8xl mb-6">🏛️</div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Select Course Session</h2>
            <p className="text-gray-500 font-medium mt-2">Initialize the biometric environment from the side panel</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
