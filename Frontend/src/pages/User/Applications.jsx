import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { Briefcase, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

const Applications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/applications/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(res.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Shortlisted': return <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-medium"><CheckCircle size={12} /> Shortlisted</span>;
            case 'Rejected': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-medium"><XCircle size={12} /> Rejected</span>;
            default: return <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-medium"><Clock size={12} /> {status}</span>;
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">My Applications</h1>

                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading applications...</div>
                ) : applications.length === 0 ? (
                    <div className="card p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-4">
                            <Briefcase className="text-slate-400" size={32} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">No applications yet</h2>
                        <p className="text-slate-500 mb-6">Start exploring jobs and find your match!</p>
                        <Link to="/dashboard" className="btn btn-primary">Find Jobs</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map(app => (
                            <div key={app.application_id} className="card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                                <div>
                                    <h3 className="font-bold text-slate-900 group-hover:text-primary">
                                        <Link to={`/jobs/${app.job_id}`} className="hover:underline">{app.title}</Link>
                                    </h3>
                                    <div className="text-sm text-slate-500 mb-2">{app.company_name}</div>
                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> Applied: {new Date(app.application_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider">AI Score</div>
                                        <div className="font-bold text-slate-900 text-lg">{app.total_score}%</div>
                                    </div>
                                    {getStatusBadge(app.status)}
                                    <Link to={`/jobs/${app.job_id}`} className="btn btn-outline text-xs">View Job</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Applications;
