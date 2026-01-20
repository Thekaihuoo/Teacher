
import React, { useState, useEffect } from 'react';
import { User, Assignment, Evaluation, Subject, SchoolClass, CriteriaSection, SystemSettings } from '../types';
import { getData, getSingleData, saveData, KEYS } from '../storage';
import { 
  ClipboardCheck, 
  Camera, 
  Check, 
  X, 
  Loader2, 
  Star, 
  ArrowLeft, 
  Settings, 
  Plus, 
  Trash2, 
  SlidersHorizontal, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  Eye,
  FileText,
  Printer
} from 'lucide-react';

declare const Swal: any;

interface SupervisorDashboardProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ user, activeTab, onTabChange }) => {
  const [assignmentStatus, setAssignmentStatus] = useState<'PENDING' | 'COMPLETED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [criteria, setCriteria] = useState<CriteriaSection[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    maxScaleValue: 5,
    ratingLevels: []
  });

  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState({ strengths: '', improvements: '', suggestions: '' });

  const view = (activeTab === 'criteria' ? 'criteria' : 'assignments') as 'assignments' | 'criteria';

  useEffect(() => {
    refreshData();
  }, [user.id, activeTab]);

  const refreshData = () => {
    const allAssignments = getData<Assignment>(KEYS.ASSIGNMENTS);
    setAssignments(allAssignments.filter(a => a.supervisorId === user.id));
    setEvaluations(getData<Evaluation>(KEYS.EVALUATIONS));
    setCriteria(getData<CriteriaSection>(KEYS.CRITERIA));
    
    const storedSettings = getSingleData<SystemSettings>(KEYS.SETTINGS);
    if (storedSettings) setSettings(storedSettings);
  };

  const handleScoreChange = (id: string, value: number) => {
    setScores({ ...scores, [id]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const showFullImage = (url: string) => {
    Swal.fire({
      imageUrl: url,
      imageAlt: 'Full size view',
      showConfirmButton: false,
      showCloseButton: true,
      background: 'transparent',
      customClass: {
        image: 'rounded-[24px] shadow-2xl max-h-[90vh]'
      }
    });
  };

  const handlePrint = (ev: Evaluation, teacherName: string, supervisorName: string, subject: Subject, assignment: Assignment) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>รายงานการนิเทศ - ${subject.name}</title>
            <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;700;900&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'Kanit', sans-serif; padding: 50px; color: #334155; line-height: 1.8; }
              .header { text-align: center; border-bottom: 4px solid #26A69A; padding-bottom: 30px; margin-bottom: 40px; }
              .header h1 { margin: 0; font-weight: 900; font-size: 32px; color: #0F172A; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px; font-size: 16px; }
              .score-box { background: #F0FDFA; padding: 40px; border-radius: 24px; text-align: center; margin-bottom: 40px; border: 2px solid #CCFBF1; }
              .section { margin-bottom: 30px; }
              .section-title { font-weight: 900; color: #26A69A; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-left: 6px solid #26A69A; padding-left: 15px; }
              .footer { margin-top: 80px; text-align: right; font-weight: bold; }
              @media print { body { padding: 0; } .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>สรุปผลการนิเทศการจัดการเรียนรู้</h1>
              <p style="text-transform: uppercase; font-weight: bold; letter-spacing: 2px; color: #64748B;">Digital Supervision Platform 2025</p>
            </div>
            <div class="info-grid">
              <div><strong>ชื่อผู้รับการนิเทศ:</strong> ${teacherName}</div>
              <div><strong>ชื่อผู้นิเทศ:</strong> ${supervisorName}</div>
              <div><strong>รหัสและชื่อวิชา:</strong> ${subject.code} ${subject.name}</div>
              <div><strong>ปีการศึกษา/เทอม:</strong> ${assignment.year} / ${assignment.semester}</div>
              <div><strong>วันที่นิเทศ:</strong> ${new Date(ev.date).toLocaleDateString('th-TH')}</div>
            </div>
            <div class="score-box">
              <div style="font-size: 14px; font-weight: 900; color: #0D9488; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">ระดับคะแนนประเมิน</div>
              <div style="font-size: 64px; font-weight: 900; color: #0D9488; line-height: 1;">${ev.percentage}%</div>
              <div style="font-size: 24px; font-weight: 900; color: #14B8A6; margin-top: 10px;">${ev.grade}</div>
            </div>
            <div class="section">
              <div class="section-title">จุดเด่นที่พบเห็น</div>
              <div style="padding-left: 21px;">${ev.strengths || 'ไม่ระบุ'}</div>
            </div>
            <div class="section">
              <div class="section-title">สิ่งที่ควรพัฒนา/ปรับปรุง</div>
              <div style="padding-left: 21px;">${ev.improvements || 'ไม่ระบุ'}</div>
            </div>
            <div class="section">
              <div class="section-title">ข้อเสนอแนะเพิ่มเติม</div>
              <div style="padding-left: 21px;">${ev.suggestions || 'ไม่ระบุ'}</div>
            </div>
            <div class="footer">
              <p>ลงชื่อ....................................................................ผู้นิเทศ</p>
              <p style="margin-right: 40px;">(${supervisorName})</p>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const calculateGrade = (percentage: number) => {
    if (percentage >= 91) return 'ดีมาก';
    if (percentage >= 81) return 'ดี';
    if (percentage >= 71) return 'พอใช้';
    if (percentage >= 61) return 'ควรปรับปรุง';
    return 'ไม่ผ่าน';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalItems = criteria.reduce((acc, sec) => acc + sec.items.length, 0);
    if (Object.keys(scores).length < totalItems) {
      Swal.fire('ประเมินไม่ครบ', `กรุณาประเมินให้ครบทุกข้อ (${totalItems} ข้อ)`, 'warning');
      return;
    }

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));

    const totalRaw = (Object.values(scores) as number[]).reduce((a: number, b: number) => a + b, 0);
    const percentage = Number(((totalRaw / (totalItems * settings.maxScaleValue)) * 100).toFixed(0));
    const grade = calculateGrade(percentage);

    const newEvaluation: Evaluation = {
      id: Date.now().toString(),
      assignmentId: selectedAssignmentId,
      date: new Date().toISOString(),
      scores,
      totalScore: totalRaw,
      percentage,
      grade,
      strengths: comments.strengths,
      improvements: comments.improvements,
      suggestions: comments.suggestions,
      photos
    };

    const evals = getData<Evaluation>(KEYS.EVALUATIONS);
    saveData(KEYS.EVALUATIONS, [...evals, newEvaluation]);

    const assigns = getData<Assignment>(KEYS.ASSIGNMENTS);
    const updatedAssigns = assigns.map(a => a.id === selectedAssignmentId ? { ...a, status: 'COMPLETED' as const } : a);
    saveData(KEYS.ASSIGNMENTS, updatedAssigns);

    setIsSubmitting(false);
    setIsEvaluating(false);
    setSelectedAssignmentId('');
    setScores({});
    setComments({ strengths: '', improvements: '', suggestions: '' });
    setPhotos([]);
    refreshData();

    Swal.fire({
      title: 'บันทึกสำเร็จ!',
      text: `ผลการประเมิน: ${grade} (${percentage}%)`,
      icon: 'success',
      confirmButtonColor: '#26A69A'
    });
  };

  const viewEvalDetails = (assignmentId: string) => {
    const ev = evaluations.find(e => e.assignmentId === assignmentId);
    if (!ev) return;

    const allAssigns = getData<Assignment>(KEYS.ASSIGNMENTS);
    const assign = allAssigns.find(a => a.id === assignmentId)!;
    const allUsers = getData<User>(KEYS.USERS);
    const teacher = allUsers.find(u => u.id === assign.teacherId)!;
    const supervisor = allUsers.find(u => u.id === assign.supervisorId)!;
    const allSubjs = getData<Subject>(KEYS.SUBJECTS);
    const subject = allSubjs.find(s => s.id === assign.subjectId)!;

    Swal.fire({
      title: `<span class="text-3xl font-black text-gray-800 tracking-tight">รายละเอียดผลการนิเทศ</span>`,
      width: '800px',
      html: `
        <div class="text-left space-y-6 max-h-[70vh] overflow-y-auto px-4 custom-scrollbar mt-4">
          <div class="bg-teal-50 p-6 rounded-2xl border-2 border-teal-100 flex justify-between items-center shadow-sm">
             <div>
               <p class="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">ผลคะแนนรวม</p>
               <p class="text-4xl font-black text-teal-700">${ev.percentage}%</p>
             </div>
             <div class="text-right">
               <p class="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">ระดับคุณภาพ</p>
               <p class="text-xl font-black text-teal-700">${ev.grade}</p>
             </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
               <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ครูผู้รับนิเทศ</p>
               <p class="font-bold text-gray-800">${teacher.name}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
               <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">วิชา</p>
               <p class="font-bold text-gray-800">${subject.code} ${subject.name}</p>
            </div>
          </div>
          <div class="space-y-4">
            <div class="p-5 bg-teal-50/50 rounded-xl border-l-4 border-teal-500">
              <p class="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">จุดเด่น</p>
              <p class="text-sm font-bold text-gray-700">${ev.strengths || '-'}</p>
            </div>
            <div class="p-5 bg-orange-50/50 rounded-xl border-l-4 border-orange-500">
              <p class="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">สิ่งที่ควรพัฒนา</p>
              <p class="text-sm font-bold text-gray-700">${ev.improvements || '-'}</p>
            </div>
            <div class="p-5 bg-blue-50/50 rounded-xl border-l-4 border-blue-500">
              <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">ข้อเสนอแนะ</p>
              <p class="text-sm font-bold text-gray-700">${ev.suggestions || '-'}</p>
            </div>
          </div>
          <div>
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">ภาพประกอบ (${ev.photos.length})</p>
            <div class="grid grid-cols-4 gap-3">
              ${ev.photos.map(p => `<div class="aspect-square rounded-xl overflow-hidden border-2 border-white shadow-sm"><img src="${p}" class="w-full h-full object-cover" /></div>`).join('')}
              ${ev.photos.length === 0 ? '<div class="col-span-4 py-8 text-center text-gray-300 font-bold uppercase text-xs border-2 border-dashed rounded-xl">ไม่มีรูปภาพ</div>' : ''}
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<div class="flex items-center gap-2"><i class="lucide-printer"></i> พิมพ์รายงาน PDF</div>',
      confirmButtonColor: '#26A69A',
      cancelButtonText: 'ปิดหน้าต่าง',
      cancelButtonColor: '#94A3B8',
      buttonsStyling: true,
      customClass: {
          confirmButton: 'rounded-[16px] font-black uppercase text-sm px-6 py-3',
          cancelButton: 'rounded-[16px] font-black uppercase text-sm px-6 py-3'
      }
    }).then((result: any) => {
      if (result.isConfirmed) handlePrint(ev, teacher.name, supervisor.name, subject, assign);
    });
  };

  // Filter assignments based on search and status
  const filteredAssignments = assignments.filter(a => {
    const teacher = getData<User>(KEYS.USERS).find(u => u.id === a.teacherId);
    const subj = getData<Subject>(KEYS.SUBJECTS).find(s => s.id === a.subjectId);
    const matchesSearch = 
      teacher?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subj?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subj?.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && a.status === assignmentStatus;
  });

  if (view === 'criteria') {
    // Criteria setting view...
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-800 tracking-tight">ตั้งค่าเกณฑ์และการประเมิน</h1>
            <p className="text-gray-400 font-bold mt-2">จัดการส่วน ข้อประเมิน และระดับคะแนน</p>
          </div>
          <button 
            onClick={() => onTabChange('my-assignments')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-500 font-bold rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft size={20} /> กลับไปหน้างานนิเทศ
          </button>
        </div>

        {/* Rating Scale Section */}
        <div className="bg-white rounded-[24px] shadow-xl card-shadow border border-gray-100 overflow-hidden">
          <div className="h-2 w-full bg-[#FFCA28]"></div>
          <div className="p-8 space-y-6">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <SlidersHorizontal className="text-[#FFCA28]" size={28} /> ตั้งค่าระดับคะแนน
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <label className="text-sm font-bold text-teal-700">จำนวนระดับคะแนนสูงสุด</label>
                <div className="flex gap-4">
                  {[3, 4, 5, 10].map(val => (
                    <button 
                      key={val}
                      onClick={() => {
                        const newLevels = [];
                        for (let i = 1; i <= val; i++) {
                          const existing = settings.ratingLevels.find(l => l.value === i);
                          newLevels.push(existing || { value: i, label: `ระดับ ${i}` });
                        }
                        const newSettings = { ...settings, maxScaleValue: val, ratingLevels: newLevels };
                        setSettings(newSettings);
                        saveData(KEYS.SETTINGS, newSettings);
                      }}
                      className={`flex-1 py-4 rounded-xl font-black transition-all border-2 ${settings.maxScaleValue === val ? 'bg-[#FFCA28] border-[#FFCA28] text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-amber-200'}`}
                    >
                      {val} ระดับ
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-teal-700">คำอธิบายแต่ละระดับคะแนน</label>
                <div className="space-y-3">
                  {settings.ratingLevels.map((level) => (
                    <div key={level.value} className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                        {level.value}
                      </div>
                      <input 
                        className="flex-1 p-3 vivid-input bg-gray-50 font-bold text-sm"
                        value={level.label}
                        onChange={(e) => {
                          const newLevels = settings.ratingLevels.map(l => l.value === level.value ? { ...l, label: e.target.value } : l);
                          const newSettings = { ...settings, ratingLevels: newLevels };
                          setSettings(newSettings);
                          saveData(KEYS.SETTINGS, newSettings);
                        }}
                        placeholder={`คำอธิบายระดับ ${level.value}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Criteria Sections */}
        <div className="space-y-8">
          {criteria.map((section) => (
            <div key={section.id} className="bg-white rounded-[24px] shadow-xl card-shadow border border-gray-100 overflow-hidden">
              <div className="h-2 w-full" style={{ backgroundColor: section.color }}></div>
              <div className="p-8 space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">ชื่อส่วนการประเมิน</label>
                    <input 
                      className="w-full p-4 vivid-input bg-gray-50 font-black text-gray-800 text-xl" 
                      value={section.title}
                      onChange={(e) => {
                        const updated = criteria.map(s => s.id === section.id ? { ...s, title: e.target.value } : s);
                        setCriteria(updated);
                        saveData(KEYS.CRITERIA, updated);
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      className="w-12 h-12 rounded-xl border-none cursor-pointer" 
                      value={section.color}
                      onChange={(e) => {
                        const updated = criteria.map(s => s.id === section.id ? { ...s, color: e.target.value } : s);
                        setCriteria(updated);
                        saveData(KEYS.CRITERIA, updated);
                      }}
                    />
                    <button 
                      onClick={() => {
                        Swal.fire({
                          title: 'ลบส่วนนี้?',
                          text: "รายการประเมินทั้งหมดในส่วนนี้จะหายไป",
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#EF5350',
                          confirmButtonText: 'ลบข้อมูล'
                        }).then((result: any) => {
                          if (result.isConfirmed) {
                            const updated = criteria.filter(s => s.id !== section.id);
                            setCriteria(updated);
                            saveData(KEYS.CRITERIA, updated);
                          }
                        });
                      }}
                      className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">ข้อประเมิน ({section.items.length} รายการ)</p>
                    <button 
                      onClick={() => {
                        const updated = criteria.map(s => s.id === section.id ? { ...s, items: [...s.items, { id: 'item' + Date.now(), label: 'ข้อประเมินใหม่' }] } : s);
                        setCriteria(updated);
                        saveData(KEYS.CRITERIA, updated);
                      }}
                      className="flex items-center gap-2 text-teal-600 font-black text-xs hover:text-teal-700 transition-colors"
                    >
                      <Plus size={16} /> เพิ่มข้อประเมิน
                    </button>
                  </div>
                  {section.items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center group">
                      <input 
                        className="flex-1 p-4 vivid-input bg-gray-50 font-bold text-gray-700"
                        value={item.label}
                        onChange={(e) => {
                          const updated = criteria.map(s => s.id === section.id ? { ...s, items: s.items.map(i => i.id === item.id ? { ...i, label: e.target.value } : i) } : s);
                          setCriteria(updated);
                          saveData(KEYS.CRITERIA, updated);
                        }}
                      />
                      <button 
                        onClick={() => {
                          const updated = criteria.map(s => s.id === section.id ? { ...s, items: s.items.filter(i => i.id !== item.id) } : s);
                          setCriteria(updated);
                          saveData(KEYS.CRITERIA, updated);
                        }}
                        className="w-12 h-12 rounded-xl bg-gray-50 text-gray-300 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={() => {
              const newSection = { id: 'sec' + Date.now(), title: 'ส่วนใหม่', color: '#26A69A', items: [] };
              const updated = [...criteria, newSection];
              setCriteria(updated);
              saveData(KEYS.CRITERIA, updated);
            }}
            className="w-full py-8 border-4 border-dashed border-gray-100 rounded-[32px] text-gray-300 hover:text-teal-500 hover:border-teal-200 hover:bg-teal-50/20 transition-all flex flex-col items-center justify-center gap-4 group"
          >
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-teal-100 transition-all">
              <Plus size={32} />
            </div>
            <span className="font-black uppercase tracking-widest text-sm">เพิ่มส่วนการประเมินใหม่</span>
          </button>
        </div>
      </div>
    );
  }

  if (isEvaluating) {
    // Evaluation form view...
    const activeAssign = assignments.find(a => a.id === selectedAssignmentId);
    const teacher = getData<User>(KEYS.USERS).find(u => u.id === activeAssign?.teacherId);
    const subj = getData<Subject>(KEYS.SUBJECTS).find(s => s.id === activeAssign?.subjectId);

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
        <div className="flex justify-between items-center bg-white p-8 rounded-[24px] shadow-xl card-shadow border border-gray-100 relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-teal-600"></div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsEvaluating(false)}
              className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-all"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-black text-gray-800">แบบประเมินการนิเทศ</h2>
              <p className="text-[#26A69A] font-bold text-lg">{teacher?.name} <span className="text-gray-300 mx-2">|</span> {subj?.code} {subj?.name}</p>
            </div>
          </div>
          <button onClick={() => setIsEvaluating(false)} className="text-gray-300 hover:text-gray-500"><X size={28} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {criteria.map((section, sIdx) => (
            <div key={sIdx} className="bg-white rounded-[24px] shadow-xl border border-gray-100 overflow-hidden card-shadow">
              <div className="h-1.5 w-full" style={{ backgroundColor: section.color }}></div>
              <div className="bg-gray-50/50 px-8 py-5 border-b border-gray-100">
                <h3 className="font-black text-gray-700 uppercase tracking-tight" style={{ color: section.color }}>{section.title}</h3>
              </div>
              <div className="p-8 divide-y divide-gray-50">
                {section.items.map((item) => (
                  <div key={item.id} className="py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 group hover:bg-gray-50/30 transition-colors -mx-8 px-8">
                    <span className="text-gray-700 font-bold text-lg group-hover:text-teal-600 transition-colors">{item.label}</span>
                    <div className="flex items-center gap-2 sm:gap-4">
                      {settings.ratingLevels.map((lvl) => (
                        <label key={lvl.value} className="flex flex-col items-center cursor-pointer group/radio">
                          <input type="radio" name={item.id} required className="hidden" onChange={() => handleScoreChange(item.id, lvl.value)} />
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all border-2 ${
                            scores[item.id] === lvl.value 
                            ? 'bg-teal-600 border-teal-600 text-white shadow-xl shadow-teal-600/30 scale-110' 
                            : 'bg-white border-gray-100 text-gray-300 hover:border-teal-200 hover:text-teal-400'
                          }`}>
                            {lvl.value}
                          </div>
                          <span className={`text-[10px] mt-2 font-black uppercase tracking-widest text-center ${scores[item.id] === lvl.value ? 'text-teal-600' : 'text-gray-300 group-hover/radio:text-teal-400 opacity-0 group-hover/radio:opacity-100 transition-all'}`}>
                            {lvl.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Feedback Section */}
          <div className="bg-white rounded-[24px] shadow-xl border border-gray-100 overflow-hidden card-shadow">
            <div className="h-1.5 w-full bg-[#FF8A65]"></div>
            <div className="p-8 space-y-6">
              <h3 className="font-black text-gray-800 text-xl flex items-center gap-3"><FileText className="text-[#FF8A65]" size={28} /> บันทึกข้อแนะนำเพิ่มเติม</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#FF8A65] ml-1">จุดเด่น</label>
                  <textarea className="w-full p-4 vivid-input bg-gray-50 h-32 font-medium" value={comments.strengths} onChange={(e) => setComments({...comments, strengths: e.target.value})}></textarea>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#FF8A65] ml-1">สิ่งที่ควรพัฒนา</label>
                  <textarea className="w-full p-4 vivid-input bg-gray-50 h-32 font-medium" value={comments.improvements} onChange={(e) => setComments({...comments, improvements: e.target.value})}></textarea>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#FF8A65] ml-1">ข้อเสนอแนะ</label>
                  <textarea className="w-full p-4 vivid-input bg-gray-50 h-32 font-medium" value={comments.suggestions} onChange={(e) => setComments({...comments, suggestions: e.target.value})}></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Photos Section */}
          <div className="bg-white rounded-[24px] shadow-xl border border-gray-100 overflow-hidden card-shadow">
            <div className="h-1.5 w-full bg-[#4DB6AC]"></div>
            <div className="p-8">
              <h3 className="font-black text-gray-800 text-xl mb-6 flex items-center gap-3"><Camera className="text-[#4DB6AC]" size={28} /> ภาพถ่ายประกอบการนิเทศ</h3>
              <div className="flex flex-wrap gap-6">
                <label className="w-28 h-28 border-4 border-dashed border-gray-100 rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-all text-gray-300 group">
                  <Camera size={32} />
                  <span className="text-[10px] mt-2 font-black uppercase tracking-widest">อัปโหลด</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
                {photos.map((p, idx) => (
                  <div key={idx} className="relative w-28 h-28 rounded-[20px] overflow-hidden shadow-xl border-4 border-white group transform hover:scale-105 transition-all">
                    <img 
                      src={p} 
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity" 
                      alt="Preview" 
                      onClick={() => showFullImage(p)}
                    />
                    <button type="button" onClick={() => removePhoto(idx)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#26A69A] hover:bg-[#1e857b] text-white font-black py-6 rounded-[24px] shadow-2xl shadow-teal-500/40 transition-all flex items-center justify-center gap-4 text-xl"
          >
            {isSubmitting ? <><Loader2 className="animate-spin" /> กำลังประมวลผล...</> : <><Check size={28} /> บันทึกผลการนิเทศ</>}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-gray-800 tracking-tight mb-2">งานนิเทศของฉัน</h1>
          <p className="text-gray-400 font-bold text-lg">รายการรับผิดชอบปีการศึกษา 2568</p>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="ค้นหาครู หรือ วิชา..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 vivid-input bg-white shadow-sm font-bold"
            />
          </div>
          <button 
            onClick={() => onTabChange('criteria')}
            className="flex items-center gap-3 px-6 py-4 bg-white text-[#26A69A] font-black rounded-2xl shadow-sm border border-teal-50 hover:shadow-xl transition-all active:scale-95"
          >
            <Settings size={22} /> ตั้งค่าเกณฑ์
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200 pb-2">
        <button 
          onClick={() => setAssignmentStatus('PENDING')}
          className={`flex items-center gap-2 px-8 py-3 font-black text-sm uppercase tracking-widest transition-all relative ${
            assignmentStatus === 'PENDING' ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Clock size={18} /> รอนิเทศ ({assignments.filter(a => a.status === 'PENDING').length})
          {assignmentStatus === 'PENDING' && <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-teal-600 rounded-full animate-in slide-in-from-left-4"></div>}
        </button>
        <button 
          onClick={() => setAssignmentStatus('COMPLETED')}
          className={`flex items-center gap-2 px-8 py-3 font-black text-sm uppercase tracking-widest transition-all relative ${
            assignmentStatus === 'COMPLETED' ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <CheckCircle2 size={18} /> นิเทศแล้ว ({assignments.filter(a => a.status === 'COMPLETED').length})
          {assignmentStatus === 'COMPLETED' && <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-teal-600 rounded-full animate-in slide-in-from-left-4"></div>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAssignments.length === 0 ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-gray-200">
            <ClipboardCheck size={80} className="opacity-10 mb-6" />
            <p className="text-2xl font-black uppercase tracking-widest">ไม่พบรายการงานนิเทศ</p>
          </div>
        ) : (
          filteredAssignments.map(a => {
            const teacher = getData<User>(KEYS.USERS).find(u => u.id === a.teacherId);
            const subj = getData<Subject>(KEYS.SUBJECTS).find(s => s.id === a.subjectId);
            const cls = getData<SchoolClass>(KEYS.CLASSES).find(c => c.id === a.classId);
            const isCompleted = a.status === 'COMPLETED';

            return (
              <div 
                key={a.id} 
                className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 card-shadow relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 transition-all group-hover:opacity-40 -mr-12 -mt-12 rounded-full ${isCompleted ? 'bg-teal-500' : 'bg-orange-500'}`}></div>
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6 ${isCompleted ? 'bg-teal-500 text-white' : 'bg-orange-100 text-orange-600'}`}>
                      {isCompleted ? <Check size={28} /> : <Clock size={28} />}
                    </div>
                    <span className="bg-gray-50 text-gray-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{cls?.name}</span>
                  </div>
                  <div className="space-y-1 mb-8">
                    <h3 className="text-2xl font-black text-gray-800 leading-tight">{teacher?.name}</h3>
                    <p className="text-teal-600 font-black text-xs uppercase tracking-widest">{subj?.code}</p>
                    <p className="text-gray-400 font-bold text-sm">{subj?.name}</p>
                  </div>
                </div>
                
                {isCompleted ? (
                  <button 
                    onClick={() => viewEvalDetails(a.id)}
                    className="w-full py-4 bg-gray-50 text-gray-400 hover:bg-teal-50 hover:text-teal-600 font-black rounded-2xl transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <Eye size={18} className="group-hover/btn:scale-110 transition-transform" /> ดูผลการประเมิน
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setSelectedAssignmentId(a.id);
                      setIsEvaluating(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-5 bg-[#FF8A65] hover:bg-[#ff7b52] text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 group/btn"
                  >
                    เริ่มนิเทศการสอน <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SupervisorDashboard;
