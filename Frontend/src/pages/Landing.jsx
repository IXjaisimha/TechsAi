import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Shield, Star, Mail, Phone, ArrowRight, CheckCircle, Zap, Users, Target } from 'lucide-react';

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                        <div className="flex items-center gap-6 text-sm text-slate-600">
                            <a href="mailto:hello@airecruitment.com" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                                <Mail size={16} />
                                <span className="hidden sm:inline">hello@airecruitment.com</span>
                            </a>
                            <a href="tel:+11234567890" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                                <Phone size={16} />
                                <span className="hidden sm:inline">+1 (123) 456-7890</span>
                            </a>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link 
                                to="/login" 
                                className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link 
                                to="/signup" 
                                className="text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all hover:shadow-lg"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>

                    {/* Main Navigation */}
                    <nav className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                                <Sparkles className="text-white" size={24} />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                AI Recruit
                            </span>
                        </div>
                        
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-slate-700 hover:text-indigo-600 font-medium transition-colors">Features</a>
                            <a href="#how-it-works" className="text-slate-700 hover:text-indigo-600 font-medium transition-colors">How It Works</a>
                            <a href="#benefits" className="text-slate-700 hover:text-indigo-600 font-medium transition-colors">Benefits</a>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Animated Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-sm font-medium mb-8 animate-pulse">
                        <Zap size={16} className="text-indigo-600" />
                        AI-Powered Recruitment Platform
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-8 leading-tight">
                        Your Trusted Partner in
                        <br />
                        <span className="relative inline-block mt-2">
                            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                AI-Powered Product Innovation
                            </span>
                            <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 400 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 10C80 3 160 1 240 4C320 7 360 9 398 10" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#4F46E5"/>
                                        <stop offset="50%" stopColor="#9333EA"/>
                                        <stop offset="100%" stopColor="#EC4899"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                        </span>
                        <span className="inline-block ml-3 animate-bounce">✨</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl lg:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                        As a trusted partner in AI development services, we combine technological expertise with a passion for 
                        innovation to deliver scalable, secure, and bespoke software solutions tailored to your business needs.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <Link 
                            to="/signup" 
                            className="group px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all hover:shadow-2xl hover:shadow-indigo-500/50 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            Schedule A Discovery Meeting
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                        </Link>
                        <Link 
                            to="/login" 
                            className="px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold text-lg border-2 border-slate-300 hover:border-indigo-600 hover:text-indigo-600 transition-all hover:shadow-xl transform hover:-translate-y-1"
                        >
                            Discover How We Work
                        </Link>
                    </div>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <div className="group px-6 py-3 rounded-full bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 flex items-center gap-2 hover:shadow-lg transition-all cursor-pointer">
                            <TrendingUp className="text-yellow-600" size={20} />
                            <span className="font-medium text-slate-700">Your Vision, Our Expertise</span>
                        </div>
                        <div className="group px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 flex items-center gap-2 hover:shadow-lg transition-all cursor-pointer">
                            <Shield className="text-blue-600" size={20} />
                            <span className="font-medium text-slate-700">Confidential & Secure - NDA Protected</span>
                        </div>
                        <div className="group px-6 py-3 rounded-full bg-gradient-to-r from-green-50 to-green-100 border border-green-200 flex items-center gap-2 hover:shadow-lg transition-all cursor-pointer">
                            <Star className="text-green-600" size={20} />
                            <span className="font-medium text-slate-700">Top Developers at Work</span>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div id="features" className="mt-32">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                            Why Choose Our Platform?
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Experience the future of recruitment with cutting-edge AI technology
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature Card 1 */}
                        <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-slate-100">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Target className="text-white" size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">95% Match Accuracy</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Our advanced AI algorithms analyze skills, experience, and cultural fit to ensure perfect matches between candidates and positions.
                            </p>
                            <div className="mt-4 flex items-center text-indigo-600 font-semibold group-hover:gap-2 transition-all">
                                Learn more <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>

                        {/* Feature Card 2 */}
                        <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-slate-100">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="text-white" size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Lightning Fast</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Screen hundreds of resumes in seconds. What used to take days now happens instantly with AI-powered automation.
                            </p>
                            <div className="mt-4 flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                                Learn more <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>

                        {/* Feature Card 3 */}
                        <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-slate-100">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Users className="text-white" size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Trusted by Thousands</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Join leading companies worldwide who trust our platform to find and hire the best talent for their teams.
                            </p>
                            <div className="mt-4 flex items-center text-green-600 font-semibold group-hover:gap-2 transition-all">
                                Learn more <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="mt-32 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 shadow-2xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                        <div>
                            <div className="text-5xl font-bold mb-2">10K+</div>
                            <div className="text-indigo-100">Active Users</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">95%</div>
                            <div className="text-indigo-100">Match Accuracy</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">50K+</div>
                            <div className="text-indigo-100">Jobs Filled</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">24/7</div>
                            <div className="text-indigo-100">AI Support</div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 mt-32 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm">
                        TRUSTED BY STARTUPS AND ENTERPRISES WORLDWIDE
                    </p>
                    <p className="text-xs mt-4 text-slate-500">
                        © 2026 AI Recruit. All rights reserved. | Powered by Advanced AI Technology
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
