import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Sparkles, Briefcase, ShieldCheck, HeartHandshake, Mail, Phone, ArrowRight, Zap, Users, Target } from 'lucide-react';

const Landing = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (user) {
        if (user.role && user.role.toLowerCase() === 'admin') {
            return <Navigate to="/company/dashboard" />;
        } else {
            return <Navigate to="/dashboard" />;
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-200/50 blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] rounded-full bg-blue-200/40 blur-[100px]" />
                <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[40%] rounded-full bg-purple-200/40 blur-[120px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm transition-all duration-300">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Top Contact Bar */}
                    <div className="flex items-center justify-between py-2.5 border-b border-slate-200/50">
                        <div className="flex items-center gap-6 text-xs sm:text-sm text-slate-600 font-medium">
                            <a href="mailto:hr.ixtechsai@gmail.com" className="flex items-center gap-2 hover:text-indigo-600 transition-colors group">
                                <Mail size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                <span className="hidden sm:inline tracking-wide">hr.ixtechsai@gmail.com</span>
                            </a>
                            <a href="tel:9618690117" className="flex items-center gap-2 hover:text-indigo-600 transition-colors group">
                                <Phone size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                <span className="hidden sm:inline tracking-wide">+91 9618690117</span>
                            </a>
                        </div>
                        <div className="flex items-center gap-5">
                            <Link 
                                to="/login" 
                                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link 
                                to="/signup" 
                                className="text-sm font-semibold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20 transition-all duration-200"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>

                    {/* Main Navigation */}
                    <nav className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3 cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                                <Sparkles className="text-white" size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight text-slate-800">
                                Resume<span className="text-indigo-600">AI</span>
                            </span>
                        </div>
                        
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
                            <a href="#about" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">About Us</a>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
                <div className="max-w-4xl mx-auto text-center">
                    

                    {/* Main Headline */}
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-8 leading-[1.1] tracking-tight">
                        Connecting Talent with <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                            Opportunity through AI
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg sm:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                        Whether you're looking for your dream job or searching for the perfect candidate, 
                        ResumeAI makes the process seamless, intelligent, and highly personalized.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-5 justify-center mb-20">
                        <Link 
                            to="/signup" 
                            className="group px-8 py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-lg hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3"
                        >
                            Find Your Match
                            <ArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" size={20} />
                        </Link>
                        <Link 
                            to="/login" 
                            className="px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-800 rounded-2xl font-semibold text-lg border border-slate-200 hover:border-indigo-300 hover:bg-white hover:text-indigo-700 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                        >
                            Log In
                        </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <div className="px-6 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 flex items-center gap-3 shadow-sm">
                            <Briefcase className="text-indigo-500" size={22} />
                            <span className="font-semibold text-slate-700 text-sm">Smart Role Matching</span>
                        </div>
                        <div className="px-6 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 flex items-center gap-3 shadow-sm">
                            <ShieldCheck className="text-blue-500" size={22} />
                            <span className="font-semibold text-slate-700 text-sm">Secure & Private</span>
                        </div>
                        <div className="px-6 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 flex items-center gap-3 shadow-sm">
                            <Users className="text-emerald-500" size={22} />
                            <span className="font-semibold text-slate-700 text-sm">Community Trusted</span>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div id="features" className="mt-40">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-5">
                            Why Choose ResumeAI?
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
                            We've designed our platform to be as helpful and intuitive as possible, putting the focus back on people.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Feature Card 1 */}
                        <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-sm border border-white/60 hover:shadow-xl hover:bg-white transition-all duration-300 hover:-translate-y-2">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 group-hover:bg-indigo-100">
                                <Target className="text-indigo-600" size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-4">Precision Matching</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                Our AI looks beyond keywords. It understands context, cultural fit, and potential, ensuring matches that truly make sense for both parties.
                            </p>
                        </div>

                        {/* Feature Card 2 */}
                        <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-sm border border-white/60 hover:shadow-xl hover:bg-white transition-all duration-300 hover:-translate-y-2">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-100">
                                <Zap className="text-blue-600" size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-4">Effortless Speed</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                Save hours of manual screening. ResumeAI processes resumes and job descriptions instantly, giving you back your most valuable resource: time.
                            </p>
                        </div>

                        {/* Feature Card 3 */}
                        <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-sm border border-white/60 hover:shadow-xl hover:bg-white transition-all duration-300 hover:-translate-y-2">
                            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 group-hover:bg-purple-100">
                                <Sparkles className="text-purple-600" size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-4">Actionable Insights</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                Get clear, friendly feedback on why a match works. We provide transparent scoring so you always know where you stand.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Friendly Call to Action Area */}
                <div id="how-it-works" className="mt-40 bg-white rounded-[3rem] p-12 lg:p-20 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden max-w-5xl mx-auto text-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 pointer-events-none" />
                    <div className="relative z-10">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">Ready to get started?</h2>
                        <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto font-medium">
                            Join ResumeAI today and experience a recruitment process that actually feels human.
                        </p>
                        <Link 
                            to="/signup" 
                            className="inline-flex items-center justify-center px-10 py-4 bg-slate-900 text-white rounded-2xl font-semibold text-lg hover:bg-indigo-600 transition-colors duration-300 shadow-lg"
                        >
                            Create Your Free Account
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer id="about" className="relative z-10 bg-slate-50 border-t border-slate-200/60 pt-16 pb-8 mt-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                                <Sparkles className="text-white" size={16} strokeWidth={2.5} />
                            </div>
                            <span className="text-xl font-bold text-slate-800">
                                Resume<span className="text-indigo-600">AI</span>
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 text-sm font-medium text-slate-500">
                            <a href="mailto:hr.ixtechsai@gmail.com" className="hover:text-indigo-600 transition-colors flex items-center gap-2">
                                <Mail size={16} /> hr.ixtechsai@gmail.com
                            </a>
                            <a href="tel:9618690117" className="hover:text-indigo-600 transition-colors flex items-center gap-2">
                                <Phone size={16} /> 9618690117
                            </a>
                        </div>
                    </div>
                    <div className="text-center border-t border-slate-200/60 pt-8">
                        <p className="text-sm font-medium text-slate-400">
                            © {new Date().getFullYear()} ResumeAI. All rights reserved. Designed to help you succeed.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;

