// import React from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { LogOut, User, Briefcase, PlusCircle, LayoutDashboard } from 'lucide-react';

// const Navbar = () => {
//     const { user, logout } = useAuth();
//     const navigate = useNavigate();
//     const location = useLocation();

//     const handleLogout = () => {
//         logout();
//         navigate('/');
//     };

//     if (!user) return null;

//     const isActive = (path) => location.pathname === path ? 'text-primary font-semibold' : 'text-slate-600 hover:text-primary';

//     return (
//         <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
//             <div className="container mx-auto px-4 h-16 flex items-center justify-between">
//                 <Link to="/" className="text-xl font-bold text-slate-900 flex items-center gap-2">
//                     <Briefcase className="text-primary" size={24} />
//                     ResumeAI
//                 </Link>

//                 <div className="flex items-center gap-6">
//                     {user.role === 'admin' ? (
//                         <>
//                             <Link to="/company/dashboard" className={`flex items-center gap-2 ${isActive('/company/dashboard')}`}>
//                                 <LayoutDashboard size={18} />
//                                 Dashboard
//                             </Link>
//                             <Link to="/company/jobs/new" className={`flex items-center gap-2 ${isActive('/company/jobs/new')}`}>
//                                 <PlusCircle size={18} />
//                                 Post Job
//                             </Link>
//                         </>
//                     ) : (
//                         <>
//                             <Link to="/dashboard" className={`flex items-center gap-2 ${isActive('/dashboard')}`}>
//                                 <LayoutDashboard size={18} />
//                                 Find Jobs
//                             </Link>
//                             <Link to="/applications" className={`flex items-center gap-2 ${isActive('/applications')}`}>
//                                 <Briefcase size={18} />
//                                 My Applications
//                             </Link>
//                             <Link to="/profile" className={`flex items-center gap-2 ${isActive('/profile')}`}>
//                                 <User size={18} />
//                                 Profile
//                             </Link>
//                         </>
//                     )}
//                 </div>

//                 <div className="flex items-center gap-4 border-l pl-4 border-slate-200">
//                     <div className="text-sm text-right hidden sm:block">
//                         <div className="font-medium text-slate-900">{user.name}</div>
//                         <div className="text-slate-500 text-xs capitalize">{user.role === 'admin' ? 'Company Admin' : 'Job Seeker'}</div>
//                     </div>
//                     <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 transition-colors" title="Sign Out">
//                         <LogOut size={20} />
//                     </button>
//                 </div>
//             </div>
//         </nav>
//     );
// };

// export default Navbar;





import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  User,
  Briefcase,
  PlusCircle,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  if (!user) return null;

  const isActive = (path) =>
    location.pathname === path
      ? 'text-indigo-600 bg-indigo-50'
      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100';

  return (
    <nav className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            <Briefcase className="text-indigo-600" size={24} />
            ResumeAI
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {user.role === 'admin' ? (
              <>
                <NavItem
                  to="/company/dashboard"
                  icon={<LayoutDashboard size={18} />}
                  label="Dashboard"
                  active={isActive('/company/dashboard')}
                />
                <NavItem
                  to="/company/jobs/new"
                  icon={<PlusCircle size={18} />}
                  label="Post Job"
                  active={isActive('/company/jobs/new')}
                />
              </>
            ) : (
              <>
                <NavItem
                  to="/dashboard"
                  icon={<LayoutDashboard size={18} />}
                  label="Find Jobs"
                  active={isActive('/dashboard')}
                />
                <NavItem
                  to="/applications"
                  icon={<Briefcase size={18} />}
                  label="My Applications"
                  active={isActive('/applications')}
                />
                <NavItem
                  to="/profile"
                  icon={<User size={18} />}
                  label="Profile"
                  active={isActive('/profile')}
                />
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-4 border-l pl-4 border-slate-200">
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">
                {user.name}
              </div>
              <div className="text-xs text-slate-500">
                {user.role === 'admin' ? 'Company Admin' : 'Job Seeker'}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden py-4 space-y-2 animate-fade-in">
            {user.role === 'admin' ? (
              <>
                <MobileItem
                  to="/company/dashboard"
                  icon={<LayoutDashboard size={18} />}
                  label="Dashboard"
                  active={isActive('/company/dashboard')}
                  close={() => setOpen(false)}
                />
                <MobileItem
                  to="/company/jobs/new"
                  icon={<PlusCircle size={18} />}
                  label="Post Job"
                  active={isActive('/company/jobs/new')}
                  close={() => setOpen(false)}
                />
              </>
            ) : (
              <>
                <MobileItem
                  to="/dashboard"
                  icon={<LayoutDashboard size={18} />}
                  label="Find Jobs"
                  active={isActive('/dashboard')}
                  close={() => setOpen(false)}
                />
                <MobileItem
                  to="/applications"
                  icon={<Briefcase size={18} />}
                  label="My Applications"
                  active={isActive('/applications')}
                  close={() => setOpen(false)}
                />
                <MobileItem
                  to="/profile"
                  icon={<User size={18} />}
                  label="Profile"
                  active={isActive('/profile')}
                  close={() => setOpen(false)}
                />
              </>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

/* ---------- Reusable Components ---------- */

const NavItem = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${active}`}
  >
    {icon}
    {label}
  </Link>
);

const MobileItem = ({ to, icon, label, active, close }) => (
  <Link
    to={to}
    onClick={close}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${active}`}
  >
    {icon}
    {label}
  </Link>
);

export default Navbar;




