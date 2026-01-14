import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [jobsRes, appsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/jobs', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5000/api/applications/my', { headers: { Authorization: `Bearer ${token}` } })
                ]);

                const jobsData = Array.isArray(jobsRes.data) ? jobsRes.data : [];
                const appsData = Array.isArray(appsRes.data) ? appsRes.data : [];

                const appliedJobIds = new Set(appsData.map(app => app.job_id));
                // Filter out jobs the user has already applied to
                const availableJobs = jobsData.filter(job => !appliedJobIds.has(job.job_id));

                setJobs(availableJobs);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredJobs = jobs.filter(job => {
        const term = searchTerm.toLowerCase();
        const title = job.job_title?.toLowerCase() || '';
        const company = job.User?.full_name?.toLowerCase() || '';
        const description = job.job_description?.toLowerCase() || '';
        const location = job.job_location?.toLowerCase() || '';

        // Check Skills (Note: public jobs list might not return skills yet, handled in controller)
        // If skills are missing, we default to empty array
        const skills = []; // job.skills -> not currently joined in list view for perf
        // If we want search by skills, we need to update controller to include JobSkill

        return (
            title.includes(term) ||
            company.includes(term) ||
            description.includes(term) ||
            location.includes(term)
        );
    });

    return (
        <Layout>
            <div className="mb-8 text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Find Your Next Opportunity</h1>
                <p className="text-slate-500 mb-6">Explore thousands of jobs and get matched with AI.</p>

                <div className="max-w-2xl mx-auto relative">
                    <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                    <input
                        className="pl-12 py-3 rounded-full border-slate-200 shadow-sm focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400 text-base"
                        placeholder="Search by job title, company, or keywords..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="card h-48 animate-pulse bg-slate-100"></div>
                    ))
                ) : filteredJobs.length > 0 ? (
                    filteredJobs.map(job => (
                        <Link to={`/jobs/${job.job_id}`} key={job.job_id} className="card p-6 hover:shadow-lg transition-shadow border-slate-100 hover:border-indigo-100 group block">
                            <div className="flex justify-between items-start mb-4">
                                <span className="inline-flex px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                                    {job.employment_type || 'Full-time'}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {new Date(job.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary mb-1">
                                {job.job_title}
                            </h3>
                            <p className="text-slate-500 text-sm font-medium mb-4">{job.User?.full_name || 'Hiring Company'}</p>

                            <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} /> {job.job_location || 'Remote'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Briefcase size={14} /> {job.experience_min}-{job.experience_max} Years Exp
                                </span>
                            </div>

                            <div className="text-sm font-medium text-primary">View Details &rarr;</div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        No jobs found matching your search.
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default UserDashboard;
