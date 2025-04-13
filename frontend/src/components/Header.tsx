
import React from 'react';
import logo from '../assets/logo.svg';

const Header = () => {
  return (
    <header className="border-b border-border bg-background py-3 px-4 flex items-center justify-center relative">
      <div className="absolute left-4">
        <img src={logo} alt="Kubeboom Logo" className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-kubernetes-purple">Kubeboom</h1>
    </header>
  );
};

export default Header;
