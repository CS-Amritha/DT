
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out ${
          collapsed ? 'ml-16' : 'ml-56'
        } pt-4 px-6 overflow-auto`}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
