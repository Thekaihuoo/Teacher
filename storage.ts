
import { User, SchoolClass, Subject, Assignment, Evaluation, UserRole, CriteriaSection, SystemSettings } from './types';

const KEYS = {
  USERS: 'dss_users',
  CLASSES: 'dss_classes',
  SUBJECTS: 'dss_subjects',
  ASSIGNMENTS: 'dss_assignments',
  EVALUATIONS: 'dss_evaluations',
  CRITERIA: 'dss_criteria',
  SETTINGS: 'dss_settings'
};

export const initializeData = () => {
  const users = localStorage.getItem(KEYS.USERS);
  if (!users) {
    const defaultUsers: User[] = [
      { id: '1', username: 'admin', password: '0000', name: 'ผู้ดูแลระบบ', role: UserRole.ADMIN },
      { id: '2', username: 'sup1', password: 'password', name: 'ครูสมชาย (ผู้นิเทศ)', role: UserRole.SUPERVISOR },
      { id: '3', username: 'sup2', password: 'password', name: 'ครูสมหญิง (ผู้นิเทศ)', role: UserRole.SUPERVISOR },
      { id: '4', username: 'tea1', name: 'ครูวิชัย', role: UserRole.TEACHER, teacherId: 'T001' },
      { id: '5', username: 'tea2', name: 'ครูวิมล', role: UserRole.TEACHER, teacherId: 'T002' },
    ];
    localStorage.setItem(KEYS.USERS, JSON.stringify(defaultUsers));

    const defaultClasses: SchoolClass[] = [
      { id: 'c1', name: 'ม.1/1' },
      { id: 'c2', name: 'ม.4/2' },
      { id: 'c3', name: 'ม.6/1' },
    ];
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(defaultClasses));

    const defaultSubjects: Subject[] = [
      { id: 's1', code: 'ค21101', name: 'คณิตศาสตร์พื้นฐาน', credit: 1.5, type: 'Fundamental' },
      { id: 's2', code: 'ว21101', name: 'วิทยาศาสตร์', credit: 1.5, type: 'Fundamental' },
      { id: 's3', code: 'พ21101', name: 'สุขศึกษา', credit: 0.5, type: 'Fundamental' },
      { id: 's4', code: 'ท31101', name: 'ภาษาไทย', credit: 1.0, type: 'Fundamental' },
      { id: 's5', code: 'อ33201', name: 'ภาษาอังกฤษเพื่อการสื่อสาร', credit: 1.0, type: 'Additional' },
    ];
    localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(defaultSubjects));

    const defaultCriteria: CriteriaSection[] = [
      { id: 'sec1', title: '1. การจัดบรรยากาศและบริหารชั้นเรียน', color: '#26A69A', items: [
        { id: 'p1_1', label: '1.1 การตรงต่อเวลา' },
        { id: 'p1_2', label: '1.2 การควบคุมความเป็นระเบียบในชั้นเรียน' },
        { id: 'p1_3', label: '1.3 การให้คำปรึกษาแก่ผู้เรียนในชั้นเรียน' },
        { id: 'p1_4', label: '1.4 การรักษาความสะอาดในชั้นเรียน' }
      ]},
      { id: 'sec2', title: '2. บุคลิกภาพ', color: '#AED581', items: [
        { id: 'p2_1', label: '2.1 การแต่งกายสุภาพ เหมาะสม' },
        { id: 'p2_2', label: '2.2 การใช้น้ำเสียง มีความชัดเจน' },
        { id: 'p2_3', label: '2.3 ความเชื่อมั่นใจตนเอง' },
        { id: 'p2_4', label: '2.4 การใช้ภาษาสื่อสารและสร้างบรรยากาศการเรียนรู้' }
      ]},
      { id: 'sec3', title: '3. การดำเนินการสอน', color: '#FFCA28', items: [
        { id: 'p3_1', label: '3.1 วางแผนการจัดการเรียนรู้สอดคล้องกับมาตรฐาน/ตัวชี้วัด' },
        { id: 'p3_2', label: '3.2 เนื้อหาสอดคล้องกับจุดประสงค์การเรียนรู้' },
        { id: 'p3_3', label: '3.3 การสอดแทรกความรู้ทั่วไปและคุณธรรม จริยธรรม' },
        { id: 'p3_4', label: '3.4 การใช้วิธีการสอนที่เหมาะสมน่าสนใจ (บรรยาย, สาธิต, กลุ่ม, ฯลฯ)' },
        { id: 'p3_5', label: '3.5 การเปิดโอกาสให้ผู้เรียนซักถามหรือแสดงความคิดเห็น' },
        { id: 'p3_6', label: '3.6 มีการตั้งคำถามที่กระตุ้นผู้เรียนใช้กระบวนการคิด' },
        { id: 'p3_7', label: '3.7 การสรุปเนื้อหา ได้ตรงตามจุดประสงค์' }
      ]},
      { id: 'sec4', title: '4. การใช้สื่อและนวัตกรรมการเรียนรู้', color: '#FF8A65', items: [
        { id: 'p4_1', label: '4.1 ใช้สื่อการสอนที่สอดคล้องตามตัวชี้วัด' },
        { id: 'p4_2', label: '4.2 ใช้สื่อที่มีความถูกต้อง ทันสมัย' },
        { id: 'p4_3', label: '4.3 ใช้สื่อหรือตัวอย่างที่หลากหลายในการจัดการเรียนรู้' }
      ]},
      { id: 'sec5', title: '5. การวัดและประเมินผล', color: '#EF5350', items: [
        { id: 'p5_1', label: '5.1 สอดคล้องและครอบคลุมจุดประสงค์' },
        { id: 'p5_2', label: '5.2 การประเมินผลตามสภาพจริง (สอบ, รายงาน, มอบหมายงาน, สังเกต)' }
      ]}
    ];
    localStorage.setItem(KEYS.CRITERIA, JSON.stringify(defaultCriteria));

    const defaultSettings: SystemSettings = {
      maxScaleValue: 5,
      ratingLevels: [
        { value: 1, label: 'ไม่ผ่าน' },
        { value: 2, label: 'ควรปรับปรุง' },
        { value: 3, label: 'พอใช้' },
        { value: 4, label: 'ดี' },
        { value: 5, label: 'ดีมาก' },
      ]
    };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(defaultSettings));

    const sampleAssignment: Assignment = {
      id: 'a1',
      supervisorId: '2',
      teacherId: '4',
      classId: 'c1',
      subjectId: 's1',
      status: 'COMPLETED',
      year: '2568',
      semester: '1'
    };
    localStorage.setItem(KEYS.ASSIGNMENTS, JSON.stringify([sampleAssignment]));

    const sampleEval: Evaluation = {
      id: 'e1',
      assignmentId: 'a1',
      date: new Date().toISOString(),
      scores: {
        p1_1: 5, p1_2: 4, p1_3: 5, p1_4: 4,
        p2_1: 5, p2_2: 5, p2_3: 4, p2_4: 4,
        p3_1: 5, p3_2: 4, p3_3: 5, p3_4: 5, p3_5: 4, p3_6: 5, p3_7: 4,
        p4_1: 4, p4_2: 5, p4_3: 4,
        p5_1: 5, p5_2: 5
      },
      totalScore: 91,
      percentage: 91,
      grade: 'ดีมาก',
      strengths: 'เตรียมการสอนมาอย่างดี นักเรียนมีส่วนร่วมสูง',
      improvements: 'เพิ่มการใช้เทคโนโลยีในบางช่วง',
      suggestions: 'ควรนำ AI มาช่วยในการตรวจทานงานนักเรียน',
      photos: ['https://picsum.photos/400/300']
    };
    localStorage.setItem(KEYS.EVALUATIONS, JSON.stringify([sampleEval]));
  }
};

export const getData = <T,>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const getSingleData = <T,>(key: string): T | null => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const saveData = <T,>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export { KEYS };
