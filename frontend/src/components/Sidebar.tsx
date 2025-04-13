
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Server, Home, Users, Star, BookOpen } from 'lucide-react';

const Sidebar = ({ collapsed, setCollapsed }: { collapsed: boolean, setCollapsed: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', icon: <Home />, path: '/' },
    { name: 'Pods', icon: <Layers />, path: '/pods' },
    { name: 'Nodes', icon: <Server />, path: '/nodes' },
    { name: 'About Us', icon: <Users />, path: '/about' },
    { name: 'Rate Us', icon: <Star />, path: '/rate' },
    { name: 'About Project', icon: <BookOpen />, path: '/about-project' },
  ];

  return (
    <aside 
      className={`bg-kubernetes-bg-dark text-white transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-56'
      } h-screen fixed left-0 top-0 z-10 pt-16`}
    >
      <div className="absolute top-3 right-3">
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="text-white/70 hover:text-white transition-colors p-1.5 rounded-full bg-white/10 hover:bg-white/20"
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          )}
        </button>
      </div>

      <nav className="mt-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 ${
                  location.pathname === item.path || 
                  (item.path === '/about-project' && location.pathname.startsWith('/about-project'))
                    ? 'bg-kubernetes-purple text-white font-medium'
                    : 'text-gray-300 hover:bg-kubernetes-dark-purple hover:text-white'
                } transition-colors rounded-lg mx-2`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
