import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { initializeData, KEYS, getData } from './storage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Sidebar from './components/Sidebar';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    initializeData();
    const storedUser = sessionStorage.getItem('loggedUser');
    if (storedUser) {
      const user = JSON.parse(storedUser) as User;
      setCurrentUser(user);
      // Set default tab based on role
      if (user.role === UserRole.ADMIN) setActiveTab('users');
      else if (user.role === UserRole.SUPERVISOR) setActiveTab('my-assignments');
      else if (user.role === UserRole.TEACHER) setActiveTab('dashboard');
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('loggedUser', JSON.stringify(user));
    // Set default tab based on role
    if (user.role === UserRole.ADMIN) setActiveTab('users');
    else if (user.role === UserRole.SUPERVISOR) setActiveTab('my-assignments');
    else if (user.role === UserRole.TEACHER) setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('loggedUser');
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderDashboard = () => {
    switch (currentUser.role) {
      case UserRole.ADMIN:
        return <AdminDashboard activeTab={activeTab} onTabChange={setActiveTab} />;
      case UserRole.SUPERVISOR:
        return <SupervisorDashboard user={currentUser} activeTab={activeTab} onTabChange={setActiveTab} />;
      case UserRole.TEACHER:
        return <TeacherDashboard user={currentUser} activeTab={activeTab} onTabChange={setActiveTab} />;
      default:
        return <div>Unauthorized</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-transparent overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:block transition-all duration-300 ease-in-out`}>
        <Sidebar 
          role={currentUser.role} 
          name={currentUser.name} 
          collapsed={!isSidebarOpen} 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout} 
        />
      </div>

      {/* Sidebar - Mobile */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-white shadow-xl">
             <Sidebar 
                role={currentUser.role} 
                name={currentUser.name} 
                collapsed={false} 
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  setIsSidebarOpen(false);
                }}
                onLogout={handleLogout} 
              />
          </div>
          <div 
            className="flex-1 bg-black/50" 
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b h-16 flex items-center justify-between px-4 sticky top-0 z-10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100/50 rounded-md transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-gray-600 font-medium hidden sm:inline">{currentUser.name}</span>
            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
              {currentUser.name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col">
          <div className="flex-1">
            {renderDashboard()}
          </div>
          
          <footer className="mt-12 py-6 border-t border-gray-200/50 text-center text-gray-400 text-xs">
            <p>Freeman @ Cpoy Right Krukai ฝากแชร์ ฝากติดตามด้วยนะครับ</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;