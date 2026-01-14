// import React from 'react';
// import Navbar from './Navbar';

// const Layout = ({ children }) => {
//     return (
//         <div className="min-h-screen flex flex-col bg-slate-50">
//             <Navbar />
//             <main className="flex-grow container mx-auto px-4 py-8">
//                 {children}
//             </main>
//             <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
//                 <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
//                     © {new Date().getFullYear()} AI Resume Screener. All rights reserved.
//                 </div>
//             </footer>
//         </div>
//     );
// };

// export default Layout;



import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()}{' '}
            <span className="font-semibold text-indigo-600">
              AI Resume Screener
            </span>
            . All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default Layout;
