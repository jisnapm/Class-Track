
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  enrolledFace?: string; // Deprecated but kept for backward compatibility
  enrolledFaces?: string[]; // Array of base64 strings (Front, Left, Right)
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
