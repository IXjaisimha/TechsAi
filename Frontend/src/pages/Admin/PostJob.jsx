import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save, EyeOff, Eye } from 'lucide-react';

const PostJob = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        location: '',
        type: 'Full-time',
        experience: '0-2',
        salary: '',
        deadline: '' // Added deadline
    });

    const [visibleJD, setVisibleJD] = useState({
        responsibilities: [''],
        qualifications: [''],
        skills: ['']
    });

    const [hiddenReqs, setHiddenReqs] = useState({
        // Removed min_experience_years, preferred_companies, education_degree, cultural_fit_keywords
        must_have_skills: [''],
        hidden_requirements_text: '' // New text field for "Leadership potential..."
    });

    // Helpers to handle dynamic lists
    const handleListChange = (setter, state, index, value) => {
        const newState = [...state];
        newState[index] = value;
        setter(newState);
    };

    const addListItem = (setter, state) => setter([...state, '']);
    const removeListItem = (setter, state, index) => setter(state.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Parse experience string "min-max"
        const [minExp, maxExp] = formData.experience.split('-').map(Number);

        // Use the explicit text field for MySQL hidden_requirements
        const hiddenReqsString = hiddenReqs.hidden_requirements_text;

        const payload = {
            job_title: formData.title,
            job_description: formData.description,
            job_location: formData.location,
            employment_type: formData.type.toUpperCase().replace('-', '_'), // FULL_TIME
            work_mode: 'ONSITE',
            experience_min: minExp || 0,
            experience_max: maxExp || 0,

            // Added deadline
            application_deadline: formData.deadline || null,

            // MySQL TEXT field
            hidden_requirements: hiddenReqsString,

            // MongoDB fields for AI Matching
            normal_skills: visibleJD.skills ? visibleJD.skills.filter(s => s && s.trim()) : [],
            hidden_skills: hiddenReqs.must_have_skills.filter(s => s && s.trim()),

            // Other fields
            openings: 1,
            job_status: 'OPEN'
        };

        try {
            const token = localStorage.getItem('token');
            // Using /api/admin/jobs as confirmed backend route
            await axios.post('http://localhost:5000/api/admin/jobs', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/company/dashboard');
        } catch (error) {
            console.error('Error posting job:', error);
            alert(`Failed to post job: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-900 mb-6">
                    <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
                </button>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">Post a New Job</h1>
                    <button onClick={handleSubmit} disabled={loading} className="btn btn-primary px-6">
                        <Save size={18} /> {loading ? 'Publishing...' : 'Publish Job'}
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
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Senior React Developer"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label>Job Type</label>
                                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                            <option>Full-time</option>
                                            <option>Part-time</option>
                                            <option>Contract</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Location</label>
                                        <input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Remote, NY" />
                                    </div>
                                    <div className="col-span-2 grid grid-cols-2 gap-4">
                                        <div>
                                            <label>Experience Range (Years)</label>
                                            <input
                                                value={formData.experience}
                                                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                                placeholder="e.g. 2-5"
                                            />
                                        </div>
                                        <div>
                                            <label>Application Deadline</label>
                                            <input
                                                type="date"
                                                value={formData.deadline}
                                                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label>Job Description & Overview</label>
                                        <textarea
                                            rows={15}
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Detailed overview of the role..."
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Skills Section Removed as per request */}


                        </div>
                    </div>

                    {/* Hidden Section */}
                    <div className="space-y-6">
                        <div className="card p-6 bg-slate-50 border-slate-200">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-700">
                                <EyeOff className="text-amber-500" size={20} />
                                Internal Criteria
                            </h2>
                            <p className="text-xs text-slate-500 mb-4">
                                These requirements are NOT visible to applicants but are used by the AI to score candidates.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label>Hidden Requirements (Soft Skills/Traits)</label>
                                    <textarea
                                        rows={3}
                                        value={hiddenReqs.hidden_requirements_text}
                                        onChange={e => setHiddenReqs({ ...hiddenReqs, hidden_requirements_text: e.target.value })}
                                        placeholder="e.g. Leadership potential, startup mindset"
                                        className="text-sm"
                                    />
                                </div>

                                <div>
                                    <label>Must-Have Technical Skills (Hidden)</label>
                                    <p className="text-xs text-slate-400 mb-1">Specific skills AI should prioritize heavily.</p>
                                    <textarea
                                        rows={3}
                                        value={hiddenReqs.must_have_skills.join(', ')}
                                        onChange={e => setHiddenReqs({ ...hiddenReqs, must_have_skills: e.target.value.split(',').map(s => s.trim()) })}
                                        placeholder="Comma separated (e.g. React, Node.js)"
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

export default PostJob;
