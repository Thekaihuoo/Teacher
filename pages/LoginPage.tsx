import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { KEYS, getData } from '../storage';
import { LogIn, User as UserIcon, Key } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'STAFF' | 'TEACHER'>('STAFF');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [error, setError] = useState('');

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getData<User>(KEYS.USERS);
    const user = users.find(u => u.username === username && u.password === password && (u.role === UserRole.ADMIN || u.role === UserRole.SUPERVISOR));
    
    if (user) {
      onLogin(user);
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getData<User>(KEYS.USERS);
    const user = users.find(u => u.teacherId === teacherId && u.role === UserRole.TEACHER);
    
    if (user) {
      onLogin(user);
    } else {
      setError('รหัสประจำตัวครูไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-transparent px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-[24px] shadow-2xl overflow-hidden card-shadow">
        <div className="h-2 w-full bg-[#26A69A]"></div>
        <div className="p-10 text-center bg-gradient-to-br from-teal-600 to-teal-500 text-white flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-[20px] p-3 mb-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <img 
              src="https://img5.pic.in.th/file/secure-sv1/-668e94e3b2fda05e3.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">ระบบนิเทศการสอน</h1>
          <p className="opacity-90 text-sm font-medium tracking-wide uppercase">Digital Supervision 2025</p>
        </div>

        <div className="flex p-2 bg-gray-50/50 mx-4 mt-6 rounded-[16px] border border-gray-100">
          <button
            onClick={() => { setActiveTab('STAFF'); setError(''); }}
            className={`flex-1 py-3 px-4 text-sm font-bold rounded-[12px] transition-all duration-300 ${activeTab === 'STAFF' ? 'bg-white text-teal-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ผู้ดูแล / ผู้นิเทศ
          </button>
          <button
            onClick={() => { setActiveTab('TEACHER'); setError(''); }}
            className={`flex-1 py-3 px-4 text-sm font-bold rounded-[12px] transition-all duration-300 ${activeTab === 'TEACHER' ? 'bg-white text-teal-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ครูผู้รับการนิเทศ
          </button>
        </div>

        <div className="p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-[12px] border border-red-100 flex items-center gap-3 animate-pulse">
              <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center flex-shrink-0">!</span> 
              {error}
            </div>
          )}

          {activeTab === 'STAFF' ? (
            <form onSubmit={handleStaffLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-teal-700 ml-1">ชื่อผู้ใช้</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <UserIcon size={20} />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 vivid-input bg-gray-50 focus:bg-white text-gray-700 font-medium"
                    placeholder="Username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-teal-700 ml-1">รหัสผ่าน</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Key size={20} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 vivid-input bg-gray-50 focus:bg-white text-gray-700 font-medium"
                    placeholder="Password"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#FF8A65] hover:bg-[#ff7b52] text-white font-black py-4 px-8 rounded-[16px] shadow-xl shadow-orange-500/30 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 mt-4"
              >
                <LogIn size={22} />
                เข้าสู่ระบบ
              </button>
            </form>
          ) : (
            <form onSubmit={handleTeacherLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-teal-700 ml-1">รหัสประจำตัวครู</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <UserIcon size={20} />
                  </span>
                  <input
                    type="text"
                    required
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 vivid-input bg-gray-50 focus:bg-white text-gray-700 font-medium"
                    placeholder="เช่น T001"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#FF8A65] hover:bg-[#ff7b52] text-white font-black py-4 px-8 rounded-[16px] shadow-xl shadow-orange-500/30 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 mt-4"
              >
                <LogIn size={22} />
                เข้าสู่ระบบสำหรับครู
              </button>
            </form>
          )}
        </div>
      </div>
      
      <div className="mt-10 text-center text-gray-400 text-xs font-bold tracking-widest uppercase">
        <p>Freeman @ Cpoy Right Krukai ฝากแชร์ ฝากติดตามด้วยนะครับ</p>
      </div>
    </div>
  );
};

export default LoginPage;