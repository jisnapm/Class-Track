
import React, { useState, useEffect } from 'react';
import { User, UserRole, ClassSession, AttendanceRecord, AppState } from './types';
import { getInitialData, saveData } from './services/db';
import LoginView from './views/Login';
import SignUpView from './views/SignUp';
import AdminDashboard from './views/AdminDashboard';
import TeacherDashboard from './views/TeacherDashboard';
import StudentDashboard from './views/StudentDashboard';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentUser: null,
    users: [],
    classes: [],
    attendance: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const data = getInitialData();
    setAppState(prev => ({ ...prev, ...data }));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const { users, classes, attendance } = appState;
      saveData({ users, classes, attendance });
    }
  }, [appState, isLoading]);

  const handleLogin = (user: User) => {
    setAppState(prev => ({ ...prev, currentUser: user }));
  };

  const handleSignUp = (newUser: User) => {
    setAppState(prev => ({
      ...prev,
      users: [...prev.users, newUser],
      currentUser: newUser
    }));
  };

  const handleLogout = () => {
    setAppState(prev => ({ ...prev, currentUser: null }));
    setView('login');
  };

  const updateState = (updater: (prev: AppState) => AppState) => {
    setAppState(updater);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-600 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold tracking-tight">Class-Track AI</h1>
          <p className="opacity-80 text-sm font-medium">Initializing Biometric Systems...</p>
        </div>
      </div>
    );
  }

  if (!appState.currentUser) {
    return view === 'login' 
      ? <LoginView users={appState.users} onLogin={handleLogin} onSwitchToSignUp={() => setView('signup')} />
      : <SignUpView onSignUp={handleSignUp} onSwitchToLogin={() => setView('login')} />;
  }

  const renderDashboard = () => {
    switch (appState.currentUser?.role) {
      case UserRole.ADMIN:
        return <AdminDashboard state={appState} updateState={updateState} onLogout={handleLogout} />;
      case UserRole.TEACHER:
        return <TeacherDashboard state={appState} updateState={updateState} onLogout={handleLogout} />;
      case UserRole.STUDENT:
        return <StudentDashboard state={appState} updateState={updateState} onLogout={handleLogout} />;
      default:
        return <div>Unauthorized Access</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {renderDashboard()}
    </div>
  );
};

export default App;
