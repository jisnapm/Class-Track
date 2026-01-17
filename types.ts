
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for login verification
  role: UserRole;
  avatar?: string;
  enrolledFace?: string; // Deprecated
  enrolledFaces?: string[]; // Array of base64 strings (Front, Left, Right)
  canReenroll?: boolean; // Permission flag granted by Admin
}

export interface ClassSession {
  id: string;
  name: string;
  teacherId: string;
  startTime: string;
  endTime: string;
  studentIds: string[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  timestamp: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  confidence: number;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  classes: ClassSession[];
  attendance: AttendanceRecord[];
}
