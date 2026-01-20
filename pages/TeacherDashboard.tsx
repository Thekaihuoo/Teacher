
import React, { useState, useEffect } from 'react';
import { User, Evaluation, Assignment, Subject } from '../types';
import { getData, KEYS } from '../storage';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { History, Eye, Award, TrendingUp, Calendar, Printer } from 'lucide-react';

declare const Swal: any;

interface TeacherDashboardProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, activeTab, onTabChange }) => {
  const [evaluations, setEvaluations] = useState<(Evaluation & { subject: Subject; supervisor: User; assign: Assignment })[]>([]);
  const [stats, setStats] = useState<{ name: string; value: number; color: string }[]>([]);

  useEffect(() => {
    const allEvals = getData<Evaluation>(KEYS.EVALUATIONS);
    const allAssigns = getData<Assignment>(KEYS.ASSIGNMENTS);
    const allSubjs = getData<Subject>(KEYS.SUBJECTS);
    const allUsers = getData<User>(KEYS.USERS);

    const teacherEvals = allEvals.filter(e => {
      const assign = allAssigns.find(a => a.id === e.assignmentId);
      return assign?.teacherId === user.id;
    }).map(e => {
      const assign = allAssigns.find(a => a.id === e.assignmentId)!;
      return {
        ...e,
        assign,
        subject: allSubjs.find(s => s.id === assign.subjectId)!,
        supervisor: allUsers.find(u => u.id === assign.supervisorId)!
      };
    });

    setEvaluations(teacherEvals);

    const counts: Record<string, { count: number; color: string }> = {
      'ดีมาก': { count: 0, color: '#26A69A' },
      'ดี': { count: 0, color: '#AED581' },
      'พอใช้': { count: 0, color: '#FFCA28' },
      'ควรปรับปรุง': { count: 0, color: '#FF8A65' },
      'ไม่ผ่าน': { count: 0, color: '#EF5350' }
    };

    teacherEvals.forEach(e => { if (counts[e.grade]) counts[e.grade].count++; });
    setStats(Object.keys(counts).map(key => ({ name: key, value: counts[key].count, color: counts[key].color })).filter(s => s.value > 0));
  }, [user.id]);

  const handlePrint = (ev: Evaluation & { subject: Subject; supervisor: User; assign: Assignment }) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>รายงานการนิเทศ - ${ev.subject.name}</title>
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
              <div><strong>ชื่อผู้รับการนิเทศ:</strong> ${user.name}</div>
              <div><strong>ชื่อผู้นิเทศ:</strong> ${ev.supervisor.name}</div>
              <div><strong>รหัสและชื่อวิชา:</strong> ${ev.subject.code} ${ev.subject.name}</div>
              <div><strong>ปีการศึกษา/เทอม:</strong> ${ev.assign.year} / ${ev.assign.semester}</div>
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
              <p style="margin-right: 40px;">(${ev.supervisor.name})</p>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const viewDetails = (ev: Evaluation & { subject: Subject; supervisor: User; assign: Assignment }) => {
    Swal.fire({
      title: `<span class="text-3xl font-black text-gray-800 tracking-tight">รายละเอียดการนิเทศ</span>`,
      width: '900px',
      html: `
        <div class="text-left space-y-8 mt-6 max-h-[70vh] overflow-y-auto px-6 custom-scrollbar">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-8 rounded-[24px] border border-gray-100 relative card-shadow">
            <div class="absolute top-0 left-0 w-full h-2 bg-[#26A69A]"></div>
            <div>
                <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">ผู้นิเทศ</p>
                <p class="font-black text-gray-800 text-lg">${ev.supervisor.name}</p>
            </div>
            <div>
                <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">ปีการศึกษา</p>
                <p class="font-black text-gray-800 text-lg">${ev.assign.year} / ${ev.assign.semester}</p>
            </div>
            <div class="col-span-1 md:col-span-2 pt-6 border-t border-gray-200">
                <div class="flex items-end justify-between">
                    <div>
                        <p class="text-[10px] text-teal-600 font-black uppercase tracking-widest mb-1">ผลการประเมินรวม</p>
                        <p class="text-4xl font-black text-[#26A69A]">${ev.percentage}%</p>
                    </div>
                    <div class="text-right">
                        <span class="px-6 py-2 bg-teal-100 text-teal-700 rounded-full font-black text-sm uppercase tracking-wider">${ev.grade}</span>
                    </div>
                </div>
            </div>
          </div>
          
          <div class="space-y-6">
            <div class="bg-teal-50/50 p-6 rounded-[20px] border-l-8 border-[#26A69A] shadow-sm">
                <p class="text-xs font-black text-[#26A69A] uppercase tracking-widest mb-2">จุดเด่นที่พบ</p>
                <p class="text-gray-700 font-medium leading-relaxed">${ev.strengths || 'ไม่ระบุ'}</p>
            </div>
            <div class="bg-orange-50/50 p-6 rounded-[20px] border-l-8 border-[#FF8A65] shadow-sm">
                <p class="text-xs font-black text-[#FF8A65] uppercase tracking-widest mb-2">สิ่งที่ควรพัฒนา</p>
                <p class="text-gray-700 font-medium leading-relaxed">${ev.improvements || 'ไม่ระบุ'}</p>
            </div>
            <div class="bg-blue-50/50 p-6 rounded-[20px] border-l-8 border-blue-400 shadow-sm">
                <p class="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">ข้อเสนอแนะ</p>
                <p class="text-gray-700 font-medium leading-relaxed">${ev.suggestions || 'ไม่ระบุ'}</p>
            </div>
          </div>
          
          <div>
            <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">ภาพบรรยากาศการเรียนการสอน</p>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              ${ev.photos.map(p => `<div class="aspect-square rounded-[16px] overflow-hidden shadow-md border-4 border-white"><img src="${p}" class="w-full h-full object-cover"></div>`).join('')}
              ${ev.photos.length === 0 ? '<div class="col-span-full py-10 bg-gray-50 rounded-[16px] border-2 border-dashed border-gray-200 text-center font-bold text-gray-300 uppercase tracking-widest text-xs">ไม่มีรูปภาพประกอบ</div>' : ''}
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
      if (result.isConfirmed) handlePrint(ev);
    });
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto animate-in fade-in duration-700 pb-20">
      {/* Dashboard Overview */}
      {(activeTab === 'dashboard' || activeTab === '') && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { label: 'นิเทศแล้ว', value: evaluations.length, unit: 'ครั้ง', icon: History, color: '#26A69A' },
                { label: 'คะแนนเฉลี่ย', value: evaluations.length > 0 ? (evaluations.reduce((a, b) => a + b.percentage, 0) / evaluations.length).toFixed(1) : '0', unit: '%', icon: TrendingUp, color: '#FF8A65' },
                { label: 'เทอมล่าสุด', value: evaluations.length > 0 ? `${evaluations[0].assign.semester}/${evaluations[0].assign.year}` : '-', unit: '', icon: Award, color: '#AED581' },
            ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-[28px] shadow-sm border border-gray-100 flex items-center gap-6 card-shadow overflow-hidden relative group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 left-0 h-full w-2" style={{ backgroundColor: item.color }}></div>
                    <div className="w-16 h-16 rounded-[20px] flex items-center justify-center group-hover:scale-110 transition-transform duration-500" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                        <item.icon size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-3xl font-black text-gray-800">{item.value} <span className="text-sm text-gray-300 ml-1">{item.unit}</span></p>
                    </div>
                </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-10 card-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#26A69A]"></div>
              <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
                <Award className="text-[#26A69A]" size={28} /> สรุปผลประเมินตามเกณฑ์
              </h2>
              <div className="h-72">
                {stats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none">
                        {stats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }} 
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-200">
                    <Award size={64} className="opacity-10 mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">ยังไม่มีข้อมูลผลการประเมิน</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-10 card-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#AED581]"></div>
              <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
                <Calendar className="text-[#AED581]" size={28} /> รายการนิเทศล่าสุด
              </h2>
              <div className="space-y-5 max-h-[288px] overflow-y-auto pr-2 custom-scrollbar">
                {evaluations.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-gray-200">
                    <Calendar size={64} className="opacity-10 mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">ไม่พบประวัติการนิเทศ</p>
                  </div>
                ) : (
                  evaluations.slice(0, 5).map(ev => (
                    <div key={ev.id} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-[24px] hover:bg-teal-50/50 transition-all border-2 border-transparent hover:border-teal-100 group">
                      <div className="flex gap-5 items-center">
                        <div className="w-14 h-14 bg-white rounded-[18px] flex items-center justify-center text-teal-600 shadow-sm font-black text-xl border-2 border-teal-50 group-hover:border-teal-200 transition-all">
                          {ev.percentage}
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-lg leading-none mb-2">{ev.subject.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ภาคเรียน {ev.assign.semester}/{ev.assign.year}</p>
                        </div>
                      </div>
                      <button onClick={() => viewDetails(ev)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-300 hover:text-teal-600 shadow-sm hover:shadow-md transition-all">
                        <Eye size={22} />
                      </button>
                    </div>
                  ))
                )}
              </div>
              {evaluations.length > 5 && (
                <button 
                  onClick={() => onTabChange('history')}
                  className="w-full mt-4 text-xs font-black text-teal-600 uppercase tracking-widest hover:text-teal-700 transition-colors"
                >
                  ดูทั้งหมด
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Table View */}
      {(activeTab === 'history' || (activeTab === 'dashboard' && evaluations.length > 0)) && (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden card-shadow relative mt-10">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#FF8A65]"></div>
          <div className="p-10">
            <h2 className="text-2xl font-black text-gray-800 mb-8">ตารางประวัติการนิเทศทั้งหมด</h2>
            <div className="overflow-x-auto rounded-[20px] border border-gray-50">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-8 py-5">#</th>
                    <th className="px-8 py-5">วิชา</th>
                    <th className="px-8 py-5">ผู้นิเทศ</th>
                    <th className="px-8 py-5">คะแนน (%)</th>
                    <th className="px-8 py-5">ระดับ</th>
                    <th className="px-8 py-5 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {evaluations.map((ev, idx) => (
                    <tr key={ev.id} className="hover:bg-teal-50/30 transition-all group">
                      <td className="px-8 py-6 text-gray-300 font-black">{idx + 1}</td>
                      <td className="px-8 py-6">
                        <p className="font-black text-gray-800 leading-none mb-1">{ev.subject.code}</p>
                        <p className="text-sm text-gray-500 font-medium">{ev.subject.name}</p>
                      </td>
                      <td className="px-8 py-6 text-gray-700 font-bold">{ev.supervisor.name}</td>
                      <td className="px-8 py-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 text-teal-600 font-black">
                          {ev.percentage}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          ev.percentage >= 90 ? 'bg-teal-100 text-teal-700' : 
                          ev.percentage >= 80 ? 'bg-green-100 text-green-700' : 
                          ev.percentage >= 70 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {ev.grade}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button onClick={() => viewDetails(ev)} className="bg-white hover:bg-teal-600 text-teal-600 hover:text-white px-6 py-3 rounded-[16px] text-xs font-black uppercase tracking-widest shadow-sm border-2 border-teal-50 hover:border-teal-600 transition-all active:scale-95">
                          <div className="flex items-center gap-2">
                              <Eye size={16} /> รายละเอียด
                          </div>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {evaluations.length === 0 && (
                <div className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest text-sm">
                  ไม่พบข้อมูลประวัติการนิเทศ
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
