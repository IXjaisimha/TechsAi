import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';
import { ArrowLeft, Save, Eye, EyeOff, Loader } from 'lucide-react';

const EditJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        job_title: '',
        job_description: '',
        hidden_requirements: '',
        job_location: '',
        employment_type: 'FULL_TIME',
        work_mode: 'ONSITE',
        experience_min: '',
        experience_max: '',
        salary_range: ''
    });

    useEffect(() => {
        fetchJob();
    }, [id]);

    const fetchJob = async () => {
        try {
            const token = localStorage.getItem('token');
            // Use Admin Endpoint to get full details including hidden requirements
            const res = await axios.get(`http://localhost:5000/api/admin/jobs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const job = res.data.data; // adminController returns { success: true, data: job }

            setFormData({
                job_title: job.job_title,
                job_description: job.job_description,
                hidden_requirements: job.hidden_requirements || '',
                job_location: job.job_location || '',
                employment_type: job.employment_type || 'Full-time',
                work_mode: job.work_mode || 'On-site',
                experience_min: job.experience_min || '',
                experience_max: job.experience_max || '',
                salary_range: job.salary_range || ''
            });

        } catch (error) {
            console.error('Error fetching job:', error);
            alert('Failed to load job details');
            navigate('/company/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            // Update using Admin Endpoint
            await axios.put(`http://localhost:5000/api/admin/jobs/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Job updated successfully');
            navigate('/company/dashboard');
        } catch (error) {
            console.error('Error updating job:', error);
            alert('Failed to update job');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Layout><div className="p-12 text-center">Loading...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/company/dashboard')} className="flex items-center text-slate-500 hover:text-slate-900 mb-6">
                    <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
                </button>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">Edit Job</h1>
                    <button onClick={handleSubmit} disabled={saving} className="btn btn-primary px-6 flex items-center gap-2">
                        {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? 'Saving...' : 'Update Job'}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Public Section */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="card p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Eye className="text-emerald-500" size={20} />
                                Public Job Posting
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label>Job Title <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        value={formData.job_title}
                                        onChange={e => setFormData({ ...formData, job_title: e.target.value })}
                                        placeholder="e.g. Senior React Developer"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label>Job Type</label>
                                        <select value={formData.employment_type} onChange={e => setFormData({ ...formData, employment_type: e.target.value })}>
                                            <option value="FULL_TIME">Full-time</option>
                                            <option value="PART_TIME">Part-time</option>
                                            <option value="CONTRACT">Contract</option>
                                            <option value="INTERNSHIP">Internship</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Work Mode</label>
                                        <select value={formData.work_mode} onChange={e => setFormData({ ...formData, work_mode: e.target.value })}>
                                            <option value="ONSITE">On-site</option>
                                            <option value="REMOTE">Remote</option>
                                            <option value="HYBRID">Hybrid</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label>Location</label>
                                        <input value={formData.job_location} onChange={e => setFormData({ ...formData, job_location: e.target.value })} placeholder="e.g. New York, NY" />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label>Min Exp (Yrs)</label>
                                            <input type="number" value={formData.experience_min} onChange={e => setFormData({ ...formData, experience_min: e.target.value })} />
                                        </div>
                                        <div className="flex-1">
                                            <label>Max Exp</label>
                                            <input type="number" value={formData.experience_max} onChange={e => setFormData({ ...formData, experience_max: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label>Job Description & Overview</label>
                                    <textarea
                                        rows={15}
                                        value={formData.job_description}
                                        onChange={e => setFormData({ ...formData, job_description: e.target.value })}
                                        placeholder="Detailed overview of the role..."
                                        className="font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hidden Section */}
                    <div className="space-y-6">
                        <div className="card p-6 bg-slate-50 border-slate-200">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-700">
                                <EyeOff className="text-amber-500" size={20} />
                                Internal Criteria (Hidden)
                            </h2>
                            <p className="text-xs text-slate-500 mb-4">
                                These requirements are NOT visible to applicants but are used by the AI to score candidates.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label>Hidden Requirements / Soft Skills</label>
                                    <textarea
                                        rows={8}
                                        value={formData.hidden_requirements}
                                        onChange={e => setFormData({ ...formData, hidden_requirements: e.target.value })}
                                        placeholder="e.g. Must have leadership experience, willing to travel, specific cultural fit notes..."
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default EditJob;
