import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';
import { ArrowLeft, User, Download, Check, X, AlertCircle } from 'lucide-react';

const ApplicantDetail = () => {
    const { appId } = useParams();
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApp = async () => {
            try {
                const token = localStorage.getItem('token');
                // Use Admin Match Details Endpoint
                const res = await axios.get(`http://localhost:5000/api/admin/match/${appId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setApp(res.data);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || err.message || "Failed to load application");
            } finally {
                setLoading(false);
            }
        };
        fetchApp();
    }, [appId]);

    if (loading) return <Layout><div className="p-12 text-center">Loading...</div></Layout>;
    if (error) return (
        <Layout>
            <div className="max-w-4xl mx-auto mt-8">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <div className="flex items-center">
                        <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
                        <div>
                            <h3 className="text-red-800 font-bold">Error Loading Application</h3>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                    <button onClick={() => navigate(-1)} className="mt-4 text-sm font-medium text-red-700 hover:text-red-900 underline">
                        Go Back
                    </button>
                </div>
            </div>
        </Layout>
    );
    if (!app) return <Layout><div className="p-12 text-center">Application not found</div></Layout>;

    // Data is already separate objects from Admin API, no parsing needed
    const candidate = app.candidate || {};
    const insights = app.ai_insights || {};
    const breakdown = app.scoring_breakdown || {};
    const skills = app.matched_skills || [];

    return (
        <Layout>
            <div className="max-w-5xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-900 mb-6">
                    <ArrowLeft size={18} className="mr-2" /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Profile */}
                    <div className="space-y-6">
                        <div className="card p-6 text-center">
                            <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto flex items-center justify-center mb-4">
                                <User size={40} className="text-slate-500" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">{candidate.name || 'Unknown Candidate'}</h2>
                            <p className="text-slate-500 mb-4">Applied on {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : 'Date N/A'}</p>

                            <div className="flex justify-center gap-2 mb-6">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${app.application_status === 'SHORTLISTED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {app.application_status || 'Applied'}
                                </span>
                            </div>

                            <a href={`http://localhost:5000/uploads/${candidate.resume_file}`} target="_blank" rel="noreferrer" className="btn btn-outline w-full flex justify-center items-center gap-2">
                                <Download size={16} /> Download Resume
                            </a>
                        </div>

                        <div className="card p-6">
                            <h3 className="font-bold mb-4">Contact Info</h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="text-slate-500 block">Email</span> {candidate.email || 'N/A'}</p>
                                <p><span className="text-slate-500 block">Phone</span> {candidate.phone || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: AI Analysis */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card p-6 border-l-4 border-indigo-500">
                            <h2 className="text-xl font-bold mb-4">AI Evaluation Report</h2>

                            <div className="flex gap-4 mb-6">
                                <div className="text-center p-4 bg-slate-50 rounded-lg flex-1">
                                    <div className="text-3xl font-bold text-primary">{app.overall_score || 0}%</div>
                                    <div className="text-xs text-slate-500 uppercase font-semibold">Overall Match</div>
                                </div>
                                <div className="text-center p-4 bg-slate-50 rounded-lg flex-1">
                                    <div className="text-xl font-bold text-slate-700">{app.match_grade || 'Pending'}</div>
                                    <div className="text-xs text-slate-500 uppercase font-semibold">Verdict</div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                        JD Match Analysis (70%)
                                        <span className="text-sm font-normal text-slate-500">
                                            Score: {Math.round(
                                                ((breakdown.technical_skills_score || 0) * 0.6) +
                                                ((breakdown.education_score || 0) * 0.1)
                                            )}/70 pts
                                        </span>
                                    </h3>
                                    <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700">
                                        {insights.technical_analysis || "Analysis not available"}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2 text-amber-700">
                                        Hidden Criteria Check (20%)
                                        <span className="text-sm font-normal text-slate-500">
                                            Score: {Math.round((breakdown.hidden_criteria_score || 0) * 0.2)}/20 pts
                                        </span>
                                    </h3>
                                    <div className="bg-amber-50 p-4 rounded-lg text-sm text-amber-800 border border-amber-100">
                                        <p className="mb-2">{app.hidden_match_analysis?.reasoning || "Hidden criteria analysis pending."}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card p-6">
                            <h3 className="font-bold mb-4">Matched Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.length > 0 ? skills.map((skill, i) => (
                                    <span key={i} className="px-3 py-1 bg-indigo-50 text-primary text-sm rounded-full font-medium">
                                        {skill}
                                    </span>
                                )) : <span className="text-slate-400">No skills matched yet.</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ApplicantDetail;
