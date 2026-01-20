
import React from 'react';
import { UserRole } from '../types';
import { 
  Users, 
  BookOpen, 
  School, 
  ClipboardCheck, 
  LayoutDashboard, 
  LogOut,
  History,
  Settings,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  name: string;
  collapsed: boolean;
  activeTab: string;
  onTabChange: (id: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, name, collapsed, activeTab, onTabChange, onLogout }) => {
  const menuItems = {
    [UserRole.ADMIN]: [
      { icon: BarChart3, label: 'รายงานสรุป', id: 'report' },
      { icon: Users, label: 'จัดการผู้ใช้', id: 'users' },
      { icon: School, label: 'จัดการชั้นเรียน', id: 'classes' },
      { icon: BookOpen, label: 'จัดการวิชา', id: 'subjects' },
      { icon: ClipboardCheck, label: 'มอบหมายงาน', id: 'assignments' },
    ],
    [UserRole.SUPERVISOR]: [
      { icon: ClipboardCheck, label: 'งานนิเทศของฉัน', id: 'my-assignments' },
      { icon: Settings, label: 'ตั้งค่าเกณฑ์ประเมิน', id: 'criteria' },
    ],
    [UserRole.TEACHER]: [
      { icon: LayoutDashboard, label: 'แดชบอร์ด', id: 'dashboard' },
      { icon: History, label: 'ประวัตินิเทศ', id: 'history' },
    ],
  };

  const currentItems = menuItems[role] || [];

  return (
    <div className="h-full sidebar-gradient text-white flex flex-col shadow-2xl">
      <div className={`p-6 flex items-center gap-4 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
          <img 
            src="https://img5.pic.in.th/file/secure-sv1/-668e94e3b2fda05e3.png" 
            alt="Logo" 
            className="w-full h-full object-contain p-1"
          />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-extrabold text-xl tracking-tight leading-none text-white drop-shadow-md">DSS 2025</h1>
            <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest mt-1">SUPERVISION</p>
          </div>
        )}
      </div>

      <nav className="flex-1 mt-8 px-4 space-y-3 overflow-y-auto">
        {currentItems.map((item) => {
          const isActive = activeTab === item.id || (item.id === 'assignments' && activeTab === 'assignment');
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <item.icon size={22} className={`${isActive ? 'text-white' : 'text-teal-50 group-hover:text-white'} transition-colors`} />
              {!collapsed && <span className={`font-medium ${isActive ? 'text-white' : 'text-teal-50 group-hover:text-white'}`}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-5 space-y-5 border-t border-white/10">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#EF5350]/80 hover:bg-[#EF5350] shadow-lg shadow-red-900/20 transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={22} />
          {!collapsed && <span className="font-bold">ออกจากระบบ</span>}
        </button>
        
        {!collapsed && (
          <div className="text-[11px] text-center font-medium text-teal-50/70 px-2 leading-relaxed bg-black/5 py-3 rounded-xl">
            Freeman @ Cpoy Right Krukai<br/>ฝากแชร์ ฝากติดตามด้วยนะครับ
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
