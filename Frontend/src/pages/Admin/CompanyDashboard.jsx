import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { Plus, Users, Eye, Briefcase, MoreVertical } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CompanyDashboard = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/jobs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(res.data.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/jobs/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(jobs.filter(j => j.job_id !== jobId));
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Failed to delete job');
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="card p-6 flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
            </div>
            <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
        </div>
    );

    const totalViews = jobs.reduce((acc, job) => acc + (job.views_count || 0), 0);
    // Assuming we'll fetch applicant counts later, for now mock or 0
    const totalApplicants = 0;

    return (
        <Layout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Company Dashboard</h1>
                    <p className="text-slate-500">Welcome back, {user?.name}</p>
                </div>
                <Link to="/company/jobs/new" className="btn btn-primary">
                    <Plus size={18} /> Post New Job
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Active Jobs" value={jobs.length} icon={Briefcase} color="bg-indigo-500 text-indigo-600" />
                <StatCard title="Total Views" value={totalViews} icon={Eye} color="bg-blue-500 text-blue-600" />
                <StatCard title="Total Applicants" value={totalApplicants} icon={Users} color="bg-emerald-500 text-emerald-600" />
            </div>

            <div className="card">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900">Recent Job Postings</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading jobs...</div>
                ) : jobs.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="inline-flex p-4 rounded-full bg-slate-100 mb-4 text-slate-400">
                            <Briefcase size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs posted yet</h3>
                        <p className="text-slate-500 mb-6">Create your first job posting to start finding candidates.</p>
                        <Link to="/company/jobs/new" className="btn btn-primary">Create Job</Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto pb-32">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 font-medium text-slate-500 text-sm">Job Title</th>
                                    <th className="p-4 font-medium text-slate-500 text-sm">Posted Date</th>
                                    <th className="p-4 font-medium text-slate-500 text-sm text-center">Views</th>
                                    <th className="p-4 font-medium text-slate-500 text-sm text-center">Applicants</th>
                                    <th className="p-4 font-medium text-slate-500 text-sm text-center">Status</th>
                                    <th className="p-4 font-medium text-slate-500 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map(job => (
                                    <tr key={job.job_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-primary">{job.job_title}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-xs">{(job.job_description || '').substring(0, 50)}...</div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {new Date(job.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-center text-sm text-slate-600">{job.views_count || 0}</td>
                                        <td className="p-4 text-center text-sm text-slate-600">{job.application_count || 0}</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {job.status || 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="relative inline-block text-left">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Close other dropdowns
                                                        setOpenMenuId(openMenuId === job.job_id ? null : job.job_id);
                                                    }}
                                                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {openMenuId === job.job_id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setOpenMenuId(null)}
                                                        ></div>
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-slate-100 py-1">
                                                            <Link
                                                                to={`/company/jobs/${job.job_id}`}
                                                                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary"
                                                                onClick={() => setOpenMenuId(null)}
                                                            >
                                                                View Applicants
                                                            </Link>
                                                            <Link
                                                                to={`/company/jobs/${job.job_id}/edit`}
                                                                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary"
                                                                onClick={() => setOpenMenuId(null)}
                                                            >
                                                                Edit Job
                                                            </Link>
                                                            <button
                                                                onClick={() => {
                                                                    handleDelete(job.job_id);
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                            >
                                                                Delete Job
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout >
    );
};

export default CompanyDashboard;
