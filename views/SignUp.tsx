
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import Camera from '../components/Camera';

interface SignUpProps {
  onSignUp: (user: User) => void;
  onSwitchToLogin: () => void;
}

const SignUpView: React.FC<SignUpProps> = ({ onSignUp, onSwitchToLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'FORM' | 'BIOMETRICS'>('FORM');
  const [enrollStep, setEnrollStep] = useState(0);
  const [capturedFaces, setCapturedFaces] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For students, we MUST collect biometrics before finalizing
    if (role === UserRole.STUDENT) {
      setStep('BIOMETRICS');
    } else {
      // Teachers and Admins don't need face enrollment on signup in this model
      finalizeSignUp([]);
    }
  };

  const handleCaptureFace = (base64: string) => {
    setIsProcessing(true);
    
    // Use a small delay to simulate biometric processing and provide feedback
    setTimeout(() => {
      const newFaces = [...capturedFaces, base64];
      setCapturedFaces(newFaces);
      
      if (enrollStep < 2) {
        setEnrollStep(enrollStep + 1);
      } else {
        finalizeSignUp(newFaces);
      }
      setIsProcessing(false);
    }, 1000);
  };

  const finalizeSignUp = (faces: string[]) => {
    const newUser: User = {
      id: `u_${Date.now()}`,
      name,
      email,
      password, // Persist password for future logins
      role,
      avatar: `https://picsum.photos/seed/${name}/200`,
      enrolledFaces: faces,
      canReenroll: false // Initially locked
    };
    onSignUp(newUser);
  };

  const enrollmentSteps = [
    { title: "Front View", instruction: "Position your face in the center and look at the camera.", icon: "👤" },
    { title: "Left Profile", instruction: "Slowly turn your head to the left side.", icon: "⬅️" },
    { title: "Right Profile", instruction: "Slowly turn your head to the right side.", icon: "➡️" }
  ];

  if (step === 'BIOMETRICS') {
    const current = enrollmentSteps[enrollStep];
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-900 p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="p-8 text-center border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-center space-x-2 mb-6">
              {[0, 1, 2].map(i => (
                <div 
                  key={i} 
                  className={`h-2 w-16 rounded-full transition-all duration-700 ${
                    i === enrollStep ? 'bg-indigo-600 scale-x-110 shadow-sm' : i < enrollStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} 
                />
              ))}
            </div>
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner border border-indigo-100">
              {current.icon}
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Step {enrollStep + 1}: {current.title}</h2>
            <p className="text-gray-500 mt-2 font-medium max-w-xs mx-auto leading-relaxed">{current.instruction}</p>
          </div>

          <div className="p-8">
            <div className="relative rounded-2xl overflow-hidden bg-black ring-8 ring-indigo-50">
              <Camera 
                onCapture={handleCaptureFace} 
                isProcessing={isProcessing} 
                label={`Capture ${current.title}`} 
              />
            </div>
            <div className="mt-8 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 border-t border-gray-50 pt-6">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Secure Enclave Active</span>
              <span>AES-256 Multi-Angle</span>
            </div>
          </div>
          
          <div className="p-6 bg-gray-50/50 text-center">
            <button 
              onClick={() => setStep('FORM')}
              className="text-gray-400 hover:text-red-500 transition-colors text-sm font-bold uppercase tracking-tighter"
            >
              Cancel & Restart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-700 to-cyan-600 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center bg-gray-50 border-b border-gray-100">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4 transform -rotate-6 shadow-lg">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">Join the Class-Track Identity Network</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-4">
              {(Object.values(UserRole) as UserRole[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    role === r ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-500'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Alice Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent text-gray-900 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-gray-300 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Institutional Email</label>
              <input
                type="email"
                required
                placeholder="email@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent text-gray-900 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-gray-300 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Account Password</label>
              <input
                type="password"
                required
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent text-gray-900 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-gray-300 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all text-sm uppercase tracking-widest mt-2"
            >
              {role === UserRole.STUDENT ? 'Next: Enroll Biometrics' : 'Finalize Registration'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <button onClick={onSwitchToLogin} className="text-indigo-600 font-bold hover:underline">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpView;
