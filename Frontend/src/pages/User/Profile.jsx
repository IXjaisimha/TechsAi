import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { User, Save, Loader } from 'lucide-react';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            // Assuming we'll create this endpoint
            const res = await axios.get('http://localhost:5000/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData({
                name: res.data.name || '',
                email: res.data.email || '',
                phone: res.data.phone || '',
                bio: res.data.bio || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/auth/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Layout><div className="p-12 text-center">Loading...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>

                <div className="card p-8">
                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-primary">
                            <User size={48} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                disabled
                                value={formData.email}
                                className="w-full bg-slate-50 text-slate-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Bio / Summary</label>
                            <textarea
                                rows={4}
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full"
                                placeholder="Brief professional summary..."
                            />
                        </div>

                        <div className="pt-4">
                            <button type="submit" disabled={saving} className="btn btn-primary w-full flex justify-center items-center gap-2">
                                {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
