
export enum UserRole {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  TEACHER = 'TEACHER'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  teacherId?: string;
}

export interface SchoolClass {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credit: number;
  type: 'Fundamental' | 'Additional';
}

export interface Assignment {
  id: string;
  supervisorId: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  status: 'PENDING' | 'COMPLETED';
  year: string;
  semester: string;
}

export interface CriteriaItem {
  id: string;
  label: string;
}

export interface CriteriaSection {
  id: string;
  title: string;
  color: string;
  items: CriteriaItem[];
}

export interface RatingScaleLevel {
  value: number;
  label: string;
}

export interface SystemSettings {
  maxScaleValue: number;
  ratingLevels: RatingScaleLevel[];
}

export interface Evaluation {
  id: string;
  assignmentId: string;
  date: string;
  scores: Record<string, number>;
  totalScore: number;
  percentage: number;
  grade: string;
  strengths: string;
  improvements: string;
  suggestions: string;
  photos: string[]; // Base64 strings
}
