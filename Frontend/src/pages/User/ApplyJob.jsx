import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Upload, CheckCircle, FileText, ArrowRight, Loader, AlertCircle } from 'lucide-react';

const ApplyJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Steps: 0 = Upload, 1 = Analyzing(Loading), 2 = Skill Selection, 3 = Submitting
    const [step, setStep] = useState(0);
    const [file, setFile] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [selectedSkills, setSelectedSkills] = useState([]);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const startAnalysis = async () => {
        if (!file) return;
        setStep(1);

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobId', id);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/applications/analyze', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 300000 // 5 minutes frontend timeout
            });

            setAnalysis(res.data.analysis);
            // Pre-select highly relevant skills
            const autoSelected = res.data.analysis.skill_suggestions
                .filter(s => s.importance === 'high' || s.reason.includes('resume'))
                .map(s => s.skill);
            setSelectedSkills(autoSelected);

            setStep(2);
        } catch (error) {
            console.error(error);
            alert('Analysis failed (Timeout or Error). Please try again.');
            setStep(0);
        }
    };

    const toggleSkill = (skill) => {
        if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter(s => s !== skill));
        } else {
            setSelectedSkills([...selectedSkills, skill]);
        }
    };

    const submitApplication = async () => {
        setStep(3);
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobId', id);
        formData.append('selectedSkills', JSON.stringify(selectedSkills));

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/applications/apply', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            // Success
            navigate('/dashboard'); // Or a success page
            alert('Application Submitted Successfully!');
        } catch (error) {
            console.error(error);
            alert('Submission failed.');
            setStep(2);
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Apply for this Position</h1>
                    <div className="flex justify-center gap-2 items-center text-sm text-slate-500">
                        <span className={`px-3 py-1 rounded-full ${step >= 0 ? 'bg-primary text-white' : 'bg-slate-200'}`}>1. Upload</span>
                        <div className="w-8 h-px bg-slate-300"></div>
                        <span className={`px-3 py-1 rounded-full ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-200'}`}>2. Verify Skills</span>
                        <div className="w-8 h-px bg-slate-300"></div>
                        <span className={`px-3 py-1 rounded-full ${step >= 3 ? 'bg-primary text-white' : 'bg-slate-200'}`}>3. Submit</span>
                    </div>
                </div>

                <div className="card p-8">
                    {step === 0 && (
                        <div className="text-center py-12">
                            <div className="mx-auto w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                                <Upload className="text-primary" size={40} />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Upload your Resume</h2>
                            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                We accept PDF files. Our AI will analyze your resume to find the best match with the job description.
                            </p>

                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                                id="resume-upload"
                            />
                            <label htmlFor="resume-upload" className="btn btn-outline border-dashed border-2 px-8 py-4 w-full max-w-sm mx-auto mb-4 cursor-pointer text-slate-600 hover:text-primary hover:border-primary">
                                {file ? file.name : 'Click to Upload PDF'}
                            </label>

                            {file && (
                                <button onClick={startAnalysis} className="btn btn-primary w-full max-w-sm mx-auto mt-4 block">
                                    Analyze & Continue <ArrowRight size={16} />
                                </button>
                            )}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="text-center py-16">
                            <Loader className="animate-spin text-primary mx-auto mb-4" size={48} />
                            <h2 className="text-lg font-semibold text-slate-900">Analyzing your resume...</h2>
                            <p className="text-slate-500">Our AI is extracting skills and matching experience.</p>
                            <p className="text-xs text-slate-400 mt-2">This may take 1-2 minutes for deep reasoning analysis.</p>
                        </div>
                    )}

                    {step === 2 && analysis && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-xl font-bold mb-2">Verify Your Skills</h2>
                                <p className="text-slate-500 text-sm">
                                    Our AI identified these skills relevant to the job. Please uncheck any you don't possess or add missed ones.
                                    <br />
                                    <span className="font-medium text-emerald-600">Initial Match Score: {analysis.match_score}%</span>
                                </p>
                            </div>

                            {/* Missing Skills Section */}
                            {analysis.missing_skills && analysis.missing_skills.length > 0 && (
                                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                                        <AlertCircle size={18} /> Missing Skills
                                    </h3>
                                    <p className="text-sm text-red-700 mb-3">
                                        The following skills are required for this job but were not found in your resume.
                                        Consider highlighting them if you have them, or learning them.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.missing_skills.map((skill, i) => (
                                            <span key={i} className="px-2 py-1 bg-white border border-red-200 text-red-700 text-sm rounded font-medium">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4 mb-8">
                                {analysis.skill_suggestions.map((item, i) => (
                                    <label key={i} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${selectedSkills.includes(item.skill) ? 'border-primary bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                        <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center ${selectedSkills.includes(item.skill) ? 'bg-primary border-primary' : 'bg-white border-slate-300'}`}>
                                            {selectedSkills.includes(item.skill) && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={selectedSkills.includes(item.skill)}
                                            onChange={() => toggleSkill(item.skill)}
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900">{item.skill}</div>
                                            <div className="text-xs text-slate-500 mt-1">{item.reason}</div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded font-medium uppercase ${item.importance === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {item.importance}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <div className="flex justify-end gap-4">
                                <button onClick={() => setStep(0)} className="btn btn-outline">Back</button>
                                <button onClick={submitApplication} className="btn btn-primary px-8">
                                    Submit Application
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-16">
                            <Loader className="animate-spin text-primary mx-auto mb-4" size={48} />
                            <h2 className="text-lg font-semibold text-slate-900">Submitting Application...</h2>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ApplyJob;
