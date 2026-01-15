
import { User, UserRole, ClassSession, AttendanceRecord } from '../types';

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Dr. Sarah Connor', email: 'admin@school.com', role: UserRole.ADMIN, avatar: 'https://picsum.photos/seed/admin/200' },
  { id: '2', name: 'John Doe', email: 'teacher@school.com', role: UserRole.TEACHER, avatar: 'https://picsum.photos/seed/teacher/200' },
  { id: '3', name: 'Alice Smith', email: 'student@school.com', role: UserRole.STUDENT, avatar: 'https://picsum.photos/seed/student1/200' },
  { id: '4', name: 'Bob Wilson', email: 'student2@school.com', role: UserRole.STUDENT, avatar: 'https://picsum.photos/seed/student2/200' },
];

const INITIAL_CLASSES: ClassSession[] = [
  { id: 'c1', name: 'CS101: Intro to AI', teacherId: '2', startTime: '09:00', endTime: '10:30', studentIds: ['3', '4'] },
  { id: 'c2', name: 'CS202: Data Structures', teacherId: '2', startTime: '11:00', endTime: '12:30', studentIds: ['3'] },
];

export const getInitialData = () => {
  const saved = localStorage.getItem('class_track_data');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Ensure we have users even if localStorage is corrupted
      if (!parsed.users || parsed.users.length === 0) return { users: INITIAL_USERS, classes: INITIAL_CLASSES, attendance: [] };
      return parsed;
    } catch (e) {
      return { users: INITIAL_USERS, classes: INITIAL_CLASSES, attendance: [] };
    }
  }
  return { users: INITIAL_USERS, classes: INITIAL_CLASSES, attendance: [] };
};

export const saveData = (data: any) => {
  localStorage.setItem('class_track_data', JSON.stringify(data));
};
