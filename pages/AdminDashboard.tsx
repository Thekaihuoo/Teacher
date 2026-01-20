
import React, { useState, useEffect } from 'react';
import { User, SchoolClass, Subject, Assignment, UserRole, Evaluation } from '../types';
import { KEYS, getData, saveData } from '../storage';
import { Plus, Trash2, Edit, ShoppingCart, UserPlus, Book, Layers, BarChart3, PieChart as PieIcon, ArrowRight, Search, ShieldCheck, UserCircle, GraduationCap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Cell } from 'recharts';

declare const Swal: any;

interface AdminDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab, onTabChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const activeMenu = (activeTab === 'assignments' ? 'assignment' : activeTab) as 'users' | 'classes' | 'subjects' | 'assignment' | 'report';
  
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  // Cart for assignments
  const [cartSupervisor, setCartSupervisor] = useState('');
  const [cartTeacher, setCartTeacher] = useState('');
  const [cartClass, setCartClass] = useState('');
  const [cartYear, setCartYear] = useState('2568');
  const [cartSemester, setCartSemester] = useState('1');
  const [cartItems, setCartItems] = useState<Subject[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUsers(getData<User>(KEYS.USERS));
    setClasses(getData<SchoolClass>(KEYS.CLASSES));
    setSubjects(getData<Subject>(KEYS.SUBJECTS));
    setAssignments(getData<Assignment>(KEYS.ASSIGNMENTS));
    setEvaluations(getData<Evaluation>(KEYS.EVALUATIONS));
  };

  const getReportData = () => {
    return subjects.map(s => {
      const relevantAssigns = assignments.filter(a => a.subjectId === s.id && a.status === 'COMPLETED');
      const relevantEvals = evaluations.filter(e => relevantAssigns.some(a => a.id === e.assignmentId));
      const avg = relevantEvals.length > 0 
        ? (relevantEvals.reduce((sum, e) => sum + e.percentage, 0) / relevantEvals.length).toFixed(1)
        : 0;
      return { name: s.code, avg: Number(avg), fullName: s.name };
    }).filter(d => d.avg > 0);
  };

  const handleDelete = (key: string, id: string, label: string) => {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: `คุณกำลังจะลบ "${label}" ออกจากระบบ`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF5350',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก',
      customClass: {
        confirmButton: 'rounded-[12px] font-bold px-6 py-3',
        cancelButton: 'rounded-[12px] font-bold px-6 py-3'
      }
    }).then((result: any) => {
      if (result.isConfirmed) {
        const currentData = getData<any>(key);
        const newData = currentData.filter((item: any) => item.id !== id);
        saveData(key, newData);
        refreshData();
        Swal.fire('ลบสำเร็จ!', 'ข้อมูลถูกลบเรียบร้อยแล้ว', 'success');
      }
    });
  };

  // --- Users CRUD ---
  const handleUserModal = (user?: User) => {
    Swal.fire({
      title: user ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่',
      html: `
        <div class="space-y-4 py-4 text-left">
          <div>
            <label class="text-xs font-bold text-teal-600 block mb-1">ชื่อ-นามสกุล</label>
            <input id="u_name" class="swal2-input vivid-input !m-0 !w-full" value="${user?.name || ''}" placeholder="ระบุชื่อ-นามสกุล">
          </div>
          <div>
            <label class="text-xs font-bold text-teal-600 block mb-1">สิทธิ์การใช้งาน</label>
            <select id="u_role" class="swal2-input vivid-input !m-0 !w-full">
              <option value="${UserRole.ADMIN}" ${user?.role === UserRole.ADMIN ? 'selected' : ''}>Admin (ผู้ดูแลระบบ)</option>
              <option value="${UserRole.SUPERVISOR}" ${user?.role === UserRole.SUPERVISOR ? 'selected' : ''}>Supervisor (ผู้นิเทศ)</option>
              <option value="${UserRole.TEACHER}" ${user?.role === UserRole.TEACHER ? 'selected' : ''}>Teacher (ครูผู้รับนิเทศ)</option>
            </select>
          </div>
          <div id="staff_fields" style="display: ${user?.role === UserRole.TEACHER ? 'none' : 'block'}">
            <label class="text-xs font-bold text-teal-600 block mb-1">Username</label>
            <input id="u_user" class="swal2-input vivid-input !m-0 !w-full" value="${user?.username || ''}" placeholder="ระบุชื่อผู้ใช้">
            <label class="text-xs font-bold text-teal-600 block mb-1 mt-3">Password</label>
            <input id="u_pass" class="swal2-input vivid-input !m-0 !w-full" type="password" value="${user?.password || ''}" placeholder="ระบุรหัสผ่าน">
          </div>
          <div id="teacher_fields" style="display: ${user?.role === UserRole.TEACHER ? 'block' : 'none'}">
            <label class="text-xs font-bold text-teal-600 block mb-1">Teacher ID (รหัสประจำตัวครู)</label>
            <input id="u_tid" class="swal2-input vivid-input !m-0 !w-full" value="${user?.teacherId || ''}" placeholder="เช่น T001">
          </div>
        </div>
      `,
      didOpen: () => {
        const roleSelect = document.getElementById('u_role') as HTMLSelectElement;
        const staffFields = document.getElementById('staff_fields') as HTMLDivElement;
        const teacherFields = document.getElementById('teacher_fields') as HTMLDivElement;
        roleSelect.addEventListener('change', () => {
          if (roleSelect.value === UserRole.TEACHER) {
            staffFields.style.display = 'none';
            teacherFields.style.display = 'block';
          } else {
            staffFields.style.display = 'block';
            teacherFields.style.display = 'none';
          }
        });
      },
      confirmButtonText: 'บันทึกข้อมูล',
      confirmButtonColor: '#26A69A',
      showCancelButton: true,
      cancelButtonText: 'ปิด',
      preConfirm: () => {
        const name = (document.getElementById('u_name') as HTMLInputElement).value;
        const role = (document.getElementById('u_role') as HTMLSelectElement).value as UserRole;
        const username = (document.getElementById('u_user') as HTMLInputElement).value;
        const password = (document.getElementById('u_pass') as HTMLInputElement).value;
        const teacherId = (document.getElementById('u_tid') as HTMLInputElement).value;
        
        if (!name) return Swal.showValidationMessage('กรุณากรอกชื่อ-นามสกุล');
        if (role !== UserRole.TEACHER && (!username || !password)) return Swal.showValidationMessage('กรุณากรอก Username และ Password');
        if (role === UserRole.TEACHER && !teacherId) return Swal.showValidationMessage('กรุณากรอก Teacher ID');
        
        return { name, role, username, password, teacherId };
      }
    }).then((result: any) => {
      if (result.value) {
        const currentUsers = getData<User>(KEYS.USERS);
        if (user) {
          const updated = currentUsers.map(u => u.id === user.id ? { ...u, ...result.value } : u);
          saveData(KEYS.USERS, updated);
        } else {
          const newUser = { id: Date.now().toString(), ...result.value };
          saveData(KEYS.USERS, [...currentUsers, newUser]);
        }
        refreshData();
        Swal.fire('สำเร็จ', 'บันทึกข้อมูลผู้ใช้เรียบร้อย', 'success');
      }
    });
  };

  // --- Classes CRUD ---
  const handleClassModal = (cls?: SchoolClass) => {
    Swal.fire({
      title: cls ? 'แก้ไขชั้นเรียน' : 'เพิ่มชั้นเรียนใหม่',
      input: 'text',
      inputLabel: 'ชื่อชั้นเรียน (เช่น ม.1/1)',
      inputValue: cls?.name || '',
      inputPlaceholder: 'ระบุชื่อชั้นเรียน',
      confirmButtonText: 'บันทึก',
      confirmButtonColor: '#26A69A',
      showCancelButton: true,
      inputValidator: (value: string) => {
        if (!value) return 'กรุณาระบุชื่อชั้นเรียน';
      }
    }).then((result: any) => {
      if (result.value) {
        const currentClasses = getData<SchoolClass>(KEYS.CLASSES);
        if (cls) {
          const updated = currentClasses.map(c => c.id === cls.id ? { ...c, name: result.value } : c);
          saveData(KEYS.CLASSES, updated);
        } else {
          const newCls = { id: Date.now().toString(), name: result.value };
          saveData(KEYS.CLASSES, [...currentClasses, newCls]);
        }
        refreshData();
        Swal.fire('สำเร็จ', 'บันทึกข้อมูลเรียบร้อย', 'success');
      }
    });
  };

  // --- Subjects CRUD ---
  const handleSubjectModal = (subj?: Subject) => {
    Swal.fire({
      title: subj ? 'แก้ไขรายวิชา' : 'เพิ่มรายวิชาใหม่',
      html: `
        <div class="space-y-4 py-4 text-left">
          <div>
            <label class="text-xs font-bold text-teal-600 block mb-1">รหัสวิชา</label>
            <input id="s_code" class="swal2-input vivid-input !m-0 !w-full" value="${subj?.code || ''}" placeholder="เช่น ค21101">
          </div>
          <div>
            <label class="text-xs font-bold text-teal-600 block mb-1">ชื่อวิชา</label>
            <input id="s_name" class="swal2-input vivid-input !m-0 !w-full" value="${subj?.name || ''}" placeholder="ชื่อวิชาภาษาไทย">
          </div>
          <div>
            <label class="text-xs font-bold text-teal-600 block mb-1">หน่วยกิต</label>
            <input id="s_credit" type="number" step="0.5" class="swal2-input vivid-input !m-0 !w-full" value="${subj?.credit || '1.0'}">
          </div>
          <div>
            <label class="text-xs font-bold text-teal-600 block mb-1">ประเภทวิชา</label>
            <select id="s_type" class="swal2-input vivid-input !m-0 !w-full">
              <option value="Fundamental" ${subj?.type === 'Fundamental' ? 'selected' : ''}>พื้นฐาน (Fundamental)</option>
              <option value="Additional" ${subj?.type === 'Additional' ? 'selected' : ''}>เพิ่มเติม (Additional)</option>
            </select>
          </div>
        </div>
      `,
      confirmButtonText: 'บันทึกรายวิชา',
      confirmButtonColor: '#26A69A',
      showCancelButton: true,
      preConfirm: () => {
        const code = (document.getElementById('s_code') as HTMLInputElement).value;
        const name = (document.getElementById('s_name') as HTMLInputElement).value;
        const credit = parseFloat((document.getElementById('s_credit') as HTMLInputElement).value);
        const type = (document.getElementById('s_type') as HTMLSelectElement).value;
        
        if (!code || !name) return Swal.showValidationMessage('กรุณาระบุรหัสวิชาและชื่อวิชา');
        return { code, name, credit, type };
      }
    }).then((result: any) => {
      if (result.value) {
        const currentSubjects = getData<Subject>(KEYS.SUBJECTS);
        if (subj) {
          const updated = currentSubjects.map(s => s.id === subj.id ? { ...s, ...result.value } : s);
          saveData(KEYS.SUBJECTS, updated);
        } else {
          const newSubj = { id: Date.now().toString(), ...result.value };
          saveData(KEYS.SUBJECTS, [...currentSubjects, newSubj]);
        }
        refreshData();
        Swal.fire('สำเร็จ', 'บันทึกข้อมูลรายวิชาเรียบร้อย', 'success');
      }
    });
  };

  const saveAssignments = () => {
    if (!cartSupervisor || !cartTeacher || !cartClass || cartItems.length === 0) {
      Swal.fire('ข้อมูลไม่ครบ', 'กรุณาระบุ ผู้นิเทศ ครู ห้องเรียน และเลือกวิชา', 'error');
      return;
    }
    const newAssignments: Assignment[] = cartItems.map(subject => ({
      id: Math.random().toString(36).substr(2, 9),
      supervisorId: cartSupervisor,
      teacherId: cartTeacher,
      classId: cartClass,
      subjectId: subject.id,
      status: 'PENDING',
      year: cartYear,
      semester: cartSemester
    }));
    const updated = [...assignments, ...newAssignments];
    setAssignments(updated);
    saveData(KEYS.ASSIGNMENTS, updated);
    setCartItems([]);
    Swal.fire('สำเร็จ', `มอบหมายงานเรียบร้อยแล้ว`, 'success');
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.teacherId && u.teacherId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-wrap gap-4 mb-4">
        {[
          { id: 'report', label: 'รายงานสรุป', icon: BarChart3, color: '#4DB6AC' },
          { id: 'users', label: 'ผู้ใช้', icon: UserPlus, color: '#26A69A' },
          { id: 'classes', label: 'ชั้นเรียน', icon: Layers, color: '#AED581' },
          { id: 'subjects', label: 'วิชา', icon: Book, color: '#FFCA28' },
          { id: 'assignment', label: 'มอบหมายงาน', icon: ShoppingCart, color: '#FF8A65' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { onTabChange(tab.id); setSearchTerm(''); }}
            className={`flex items-center gap-3 px-6 py-4 rounded-[16px] font-bold transition-all duration-300 transform ${activeMenu === tab.id ? 'bg-white text-gray-800 shadow-xl -translate-y-1' : 'bg-white/40 text-gray-500 hover:bg-white border border-transparent'}`}
            style={{ borderTop: activeMenu === tab.id ? `4px solid ${tab.color}` : 'none' }}
          >
            <tab.icon size={20} style={{ color: tab.color }} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeMenu === 'report' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden card-shadow">
              <div className="h-2 w-full bg-[#4DB6AC]"></div>
              <div className="p-8">
                <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
                  <BarChart3 className="text-[#4DB6AC]" size={28} /> 
                  คะแนนเฉลี่ยแยกตามรายวิชา
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getReportData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontWeight: 600 }} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                      <ChartTooltip 
                        cursor={{ fill: '#F8FAFC' }}
                        formatter={(value) => [`${value}%`, 'คะแนนเฉลี่ย']}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                      />
                      <Bar dataKey="avg" radius={[8, 8, 0, 0]} barSize={45}>
                        {getReportData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.avg >= 90 ? '#26A69A' : entry.avg >= 80 ? '#AED581' : entry.avg >= 70 ? '#FFCA28' : '#FF8A65'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
           </div>
           <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden card-shadow">
              <div className="h-2 w-full bg-[#FFCA28]"></div>
              <div className="p-8">
                <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
                  <PieIcon className="text-[#FFCA28]" size={28} /> 
                  สถิติภาพรวม
                </h2>
                <div className="space-y-6">
                  <div className="p-6 bg-[#26A69A]/5 rounded-[20px] border-2 border-[#26A69A]/10 group hover:bg-[#26A69A]/10 transition-colors">
                    <p className="text-xs font-black text-[#26A69A] uppercase tracking-widest mb-1">จำนวนการนิเทศทั้งหมด</p>
                    <p className="text-4xl font-black text-gray-800">{assignments.length} <span className="text-lg text-gray-400 font-bold">รายการ</span></p>
                  </div>
                  <div className="p-6 bg-[#FFCA28]/5 rounded-[20px] border-2 border-[#FFCA28]/10 group hover:bg-[#FFCA28]/10 transition-colors">
                    <p className="text-xs font-black text-[#FFCA28] uppercase tracking-widest mb-1">ดำเนินการเสร็จสิ้น</p>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-black text-gray-800">{assignments.filter(a => a.status === 'COMPLETED').length}</p>
                      <p className="text-xl text-gray-400 font-bold mb-1">/ {assignments.length}</p>
                    </div>
                  </div>
                  <div className="p-6 bg-[#FF8A65]/5 rounded-[20px] border-2 border-[#FF8A65]/10 group hover:bg-[#FF8A65]/10 transition-colors">
                    <p className="text-xs font-black text-[#FF8A65] uppercase tracking-widest mb-1">คะแนนเฉลี่ยสะสม</p>
                    <p className="text-4xl font-black text-gray-800">
                      {evaluations.length > 0 ? (evaluations.reduce((s, e) => s + e.percentage, 0) / evaluations.length).toFixed(1) : 0}<span className="text-xl text-gray-400 font-bold ml-1">%</span>
                    </p>
                  </div>
                </div>
              </div>
           </div>
        </div>
      ) : activeMenu === 'assignment' ? (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-0 card-shadow">
            <div className="p-10 space-y-8">
              <div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">มอบหมายงานนิเทศ</h2>
                <p className="text-gray-400 font-medium">ระบุรายละเอียดเพื่อสร้างรายการนิเทศใหม่</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-teal-700 ml-1">ปีการศึกษา</label>
                  <input type="text" value={cartYear} onChange={e => setCartYear(e.target.value)} className="w-full p-4 vivid-input bg-gray-50" placeholder="2568" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-teal-700 ml-1">ภาคเรียน</label>
                  <select value={cartSemester} onChange={e => setCartSemester(e.target.value)} className="w-full p-4 vivid-input bg-gray-50">
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </div>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-teal-700 ml-1">ผู้นิเทศ</label>
                  <select value={cartSupervisor} onChange={(e) => setCartSupervisor(e.target.value)} className="w-full p-4 vivid-input bg-gray-50">
                    <option value="">-- เลือกผู้นิเทศ --</option>
                    {users.filter(u => u.role === UserRole.SUPERVISOR).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-teal-700 ml-1">ครูผู้รับการนิเทศ</label>
                  <select value={cartTeacher} onChange={(e) => setCartTeacher(e.target.value)} className="w-full p-4 vivid-input bg-gray-50">
                    <option value="">-- เลือกครูผู้รับการนิเทศ --</option>
                    {users.filter(u => u.role === UserRole.TEACHER).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-teal-700 ml-1">ห้องเรียน</label>
                  <select value={cartClass} onChange={(e) => setCartClass(e.target.value)} className="w-full p-4 vivid-input bg-gray-50">
                    <option value="">-- เลือกชั้นเรียน --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-teal-700 ml-1">เพิ่มรายวิชา</label>
                  <div className="flex gap-3">
                    <select id="subj-select" className="flex-1 p-4 vivid-input bg-gray-50">
                      <option value="">-- เลือกวิชา --</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                    </select>
                    <button onClick={() => {
                      const id = (document.getElementById('subj-select') as HTMLSelectElement).value;
                      const s = subjects.find(x => x.id === id);
                      if (s && !cartItems.find(i => i.id === id)) setCartItems([...cartItems, s]);
                    }} className="bg-teal-600 hover:bg-teal-700 text-white px-6 font-bold rounded-[16px] shadow-lg transition-all active:scale-95">
                      <Plus size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#F8FAFC] p-10 flex flex-col border-l border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-gray-800">รายการรอมอบหมาย</h3>
                  <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-black">{cartItems.length} รายการ</span>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                  {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4 opacity-50">
                      <ShoppingCart size={64} />
                      <p className="font-bold">ยังไม่มีวิชาในรายการ</p>
                    </div>
                  ) : (
                    cartItems.map(item => (
                      <div key={item.id} className="bg-white p-5 rounded-[20px] flex justify-between items-center shadow-md group animate-in slide-in-from-right-4 transition-all hover:scale-[1.02]">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-black">
                            {item.code.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-gray-800">{item.code}</p>
                            <p className="text-sm text-gray-500 font-medium">{item.name}</p>
                          </div>
                        </div>
                        <button onClick={() => setCartItems(cartItems.filter(i => i.id !== item.id))} className="text-red-300 hover:text-red-500 p-2 transition-colors">
                          <Trash2 size={20}/>
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <button onClick={saveAssignments} className="w-full bg-[#FF8A65] hover:bg-[#ff7b52] text-white font-black py-5 rounded-[20px] mt-8 shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3 transition-all active:scale-95">
                  ยืนยันการมอบหมายงาน <ArrowRight size={22} />
                </button>
            </div>
        </div>
      ) : (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden card-shadow">
          <div className="h-2 w-full" style={{ backgroundColor: 
            activeMenu === 'users' ? '#26A69A' : 
            activeMenu === 'classes' ? '#AED581' : '#FFCA28' 
          }}></div>
          <div className="p-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
              <div>
                <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">จัดการ {
                  activeMenu === 'users' ? 'ผู้ใช้งาน' : 
                  activeMenu === 'classes' ? 'ชั้นเรียน' : 'รายวิชา'
                }</h2>
                <p className="text-gray-400 font-medium">จัดการข้อมูลพื้นฐานในระบบให้เป็นปัจจุบัน</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input 
                    type="text" 
                    placeholder="ค้นหา..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 vivid-input bg-gray-50 text-sm font-bold"
                   />
                </div>
                <button 
                  onClick={() => {
                    if (activeMenu === 'users') handleUserModal();
                    if (activeMenu === 'classes') handleClassModal();
                    if (activeMenu === 'subjects') handleSubjectModal();
                  }} 
                  className="bg-[#26A69A] hover:bg-[#1e857b] text-white px-6 py-3 rounded-[16px] font-black shadow-xl shadow-teal-500/30 flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
                >
                  <Plus size={20}/> เพิ่ม
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-[20px] border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest">
                  {activeMenu === 'users' && (
                    <tr>
                      <th className="px-6 py-5">รายชื่อ</th>
                      <th className="px-6 py-5">สิทธิ์</th>
                      <th className="px-6 py-5">ข้อมูลการเข้าใช้</th>
                      <th className="px-6 py-5 text-center">จัดการ</th>
                    </tr>
                  )}
                  {activeMenu === 'classes' && (
                    <tr>
                      <th className="px-6 py-5">ลำดับ</th>
                      <th className="px-6 py-5">ชื่อชั้นเรียน</th>
                      <th className="px-6 py-5 text-center">จัดการ</th>
                    </tr>
                  )}
                  {activeMenu === 'subjects' && (
                    <tr>
                      <th className="px-6 py-5">รหัส/ชื่อวิชา</th>
                      <th className="px-6 py-5">หน่วยกิต</th>
                      <th className="px-6 py-5">ประเภท</th>
                      <th className="px-6 py-5 text-center">จัดการ</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeMenu === 'users' && filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                             user.role === UserRole.ADMIN ? 'bg-teal-500' : 
                             user.role === UserRole.SUPERVISOR ? 'bg-amber-500' : 'bg-orange-500'
                           }`}>
                             {user.name.charAt(0)}
                           </div>
                           <div>
                             <p className="font-black text-gray-800">{user.name}</p>
                             <p className="text-xs text-gray-400 font-medium">ID: {user.id}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           {user.role === UserRole.ADMIN && <ShieldCheck size={16} className="text-teal-600" />}
                           {user.role === UserRole.SUPERVISOR && <UserCircle size={16} className="text-amber-600" />}
                           {user.role === UserRole.TEACHER && <GraduationCap size={16} className="text-orange-600" />}
                           <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${
                             user.role === UserRole.ADMIN ? 'bg-teal-100 text-teal-700' : 
                             user.role === UserRole.SUPERVISOR ? 'bg-amber-100 text-amber-700' : 'bg-orange-100 text-orange-700'
                           }`}>{user.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.role === UserRole.TEACHER ? (
                          <p className="text-xs font-bold text-gray-500">Teacher ID: <span className="text-orange-600">{user.teacherId}</span></p>
                        ) : (
                          <p className="text-xs font-bold text-gray-500">User: <span className="text-teal-600">{user.username}</span></p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleUserModal(user)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                          {user.id !== '1' && (
                            <button onClick={() => handleDelete(KEYS.USERS, user.id, user.name)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {activeMenu === 'classes' && classes.map((cls, idx) => (
                    <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-black text-gray-300">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <span className="font-black text-gray-800 text-lg">{cls.name}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleClassModal(cls)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                          <button onClick={() => handleDelete(KEYS.CLASSES, cls.id, cls.name)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {activeMenu === 'subjects' && filteredSubjects.map((subj) => (
                    <tr key={subj.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-black text-gray-800">{subj.code}</p>
                        <p className="text-sm text-gray-500 font-medium">{subj.name}</p>
                      </td>
                      <td className="px-6 py-4">
                         <span className="font-black text-teal-600">{subj.credit.toFixed(1)}</span>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${subj.type === 'Fundamental' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                           {subj.type}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleSubjectModal(subj)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                          <button onClick={() => handleDelete(KEYS.SUBJECTS, subj.id, subj.name)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(activeMenu === 'users' && filteredUsers.length === 0) || 
               (activeMenu === 'subjects' && filteredSubjects.length === 0) || 
               (activeMenu === 'classes' && classes.length === 0) ? (
                 <div className="py-20 flex flex-col items-center justify-center text-gray-300 space-y-4">
                    <Layers size={48} className="opacity-10" />
                    <p className="font-black text-sm uppercase tracking-widest">ไม่พบข้อมูลที่คุณค้นหา</p>
                 </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
