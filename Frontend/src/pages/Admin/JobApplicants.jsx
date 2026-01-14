import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';
import { ArrowLeft, User, Mail, Phone, Calendar, Download, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const JobApplicants = () => {
    const { id } = useParams(); // JobId
    const navigate = useNavigate();
    const [applicants, setApplicants] = useState([]);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [jobRes, appsRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/admin/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`http://localhost:5000/api/admin/jobs/${id}/matches`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setJob(jobRes.data.data); // Admin API returns { data: job }
            setApplicants(appsRes.data.data); // Admin API returns { data: [matches] }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const handleStatusUpdate = async (applicationId, status) => {
        if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this applicant?`)) return;

        try {
            const token = localStorage.getItem('token');
            const endpoint = status === 'SHORTLISTED' ? 'shortlist' : 'reject';

            await axios.post(
                `http://localhost:5000/api/admin/applications/${applicationId}/${endpoint}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state
            setApplicants(prev => prev.map(app =>
                app.application_id === applicationId ? { ...app, application_status: status } : app
            ));

            alert(`Applicant ${status.toLowerCase()} successfully! Email sent.`);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status.');
        }
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate('/company/dashboard')} className="flex items-center text-slate-500 hover:text-slate-900 mb-6">
                    <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
                </button>

                {job && (
                    <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{job.job_title}</h1>
                            <p className="text-slate-500">Posted on {new Date(job.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-primary">{applicants.length}</div>
                            <div className="text-sm text-slate-500 uppercase font-medium tracking-wide">Applicants</div>
                        </div>
                    </div>
                )}

                <div className="card">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Ranked Candidates</h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-slate-500">Loading applicants...</div>
                    ) : applicants.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">No applicants yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="p-4">Rank</th>
                                        <th className="p-4">Candidate</th>
                                        <th className="p-4 text-center">AI Score</th>
                                        <th className="p-4">Match Breakdown</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applicants.map((app, index) => (
                                        <tr key={app.application_id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="p-4 align-top">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className="font-bold text-slate-900">{app.candidate.name}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Mail size={10} /> {app.candidate.email}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Phone size={10} /> {app.candidate.phone}</div>
                                            </td>
                                            <td className="p-4 align-top text-center">
                                                <div className={`inline-block px-3 py-1 rounded-full border font-bold text-lg ${getScoreColor(app.overall_score)}`}>
                                                    {app.overall_score}%
                                                </div>
                                            </td>
                                            <td className="p-4 align-top text-sm">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between w-48">
                                                        <span className="text-slate-500">JD Match</span>
                                                        <span className="font-medium">
                                                            {Math.round(
                                                                ((app.scoring_breakdown?.technical_skills_score || 0) * 0.6) +
                                                                ((app.scoring_breakdown?.education_score || 0) * 0.1)
                                                            )}/70 pts
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between w-48">
                                                        <span className="text-slate-500">Hidden</span>
                                                        <span className="font-medium">
                                                            {Math.round((app.scoring_breakdown?.hidden_criteria_score || 0) * 0.2)}/20 pts
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between w-48">
                                                        <span className="text-slate-500">Experience</span>
                                                        <span className="font-medium">
                                                            {Math.round((app.scoring_breakdown?.experience_score || 0) * 0.1)}/10 pts
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                                                    {app.application_status}
                                                </span>
                                            </td>
                                            <td className="p-4 align-top text-right">
                                                <div className="flex justify-end gap-2 items-center">
                                                    {app.application_status === 'APPLIED' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(app.application_id, 'SHORTLISTED')}
                                                                className="p-1.5 rounded text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors"
                                                                title="Shortlist"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(app.application_id, 'REJECTED')}
                                                                className="p-1.5 rounded text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                                                                title="Reject"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <Link to={`/company/applicants/${app.application_id}`} className="btn btn-outline text-xs py-1 px-3">
                                                        Details
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default JobApplicants;
