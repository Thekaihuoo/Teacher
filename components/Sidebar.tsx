
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
    <div className="h-full bg-white text-gray-900 flex flex-col border-right border-gray-100 shadow-sm transition-all">
      <div className={`p-6 flex items-center gap-4 border-b border-gray-50 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
          <img 
            src="https://img5.pic.in.th/file/secure-sv1/-668e94e3b2fda05e3.png" 
            alt="Logo" 
            className="w-full h-full object-contain p-1 invert"
          />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-black text-lg tracking-tight leading-none text-black">DSS 2025</h1>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">PLATFORM</p>
          </div>
        )}
      </div>

      <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto">
        {currentItems.map((item) => {
          const isActive = activeTab === item.id || (item.id === 'assignments' && activeTab === 'assignment');
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive 
                ? 'bg-gray-100 text-black font-bold shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-black'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <item.icon size={18} className={`${isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 space-y-3 border-t border-gray-50">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm font-bold">ออกจากระบบ</span>}
        </button>
        
        {!collapsed && (
          <div className="text-[10px] text-center font-medium text-gray-400 px-2 leading-relaxed bg-gray-50 py-3 rounded-lg border border-gray-100">
            Freeman @ Cpoy Right Krukai<br/>ฝากแชร์ ฝากติดตามด้วยนะครับ
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
