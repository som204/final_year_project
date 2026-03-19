import React, { useState, useContext, useEffect } from 'react';
import { createNotification } from '../../api/notification';
import { useNavigate } from 'react-router-dom';

import { Send } from 'lucide-react';
import { UserContext } from '../../Context/user.context';
import { API_BASE_URL } from '../../config';

// ── Role → allowed audience options ──────────────────────────────────
const AUDIENCE_OPTIONS = {
    SUPER_ADMIN: [
        { value: 'ALL_INSTITUTES', label: 'All Institutes' },
        { value: 'SPECIFIC_INSTITUTE', label: 'Specific Institute' },
        { value: 'SUPER_ADMINS', label: 'Other Super Admins' },
    ],
    ADMIN: [
        { value: 'INSTITUTE_ALL', label: 'All Users (Institute)' },
        { value: 'INSTITUTE_FACULTY', label: 'All Faculty (Institute)' },
        { value: 'INSTITUTE_DEPARTMENT', label: 'Specific Department' },
        { value: 'SPECIFIC_USERS', label: 'Specific Users (by ID)' },
    ],
    FACULTY: [
        { value: 'INSTITUTE_DEPARTMENT', label: 'All Students in My Department' },
        { value: 'SPECIFIC_USERS', label: 'Specific Users (by ID)' },
    ],
};

const DEFAULT_AUDIENCE = {
    SUPER_ADMIN: 'ALL_INSTITUTES',
    ADMIN: 'INSTITUTE_ALL',
    FACULTY: 'SPECIFIC_USERS',
};

const NotificationCreate = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Normalise role to uppercase for consistent matching
    const userRole = (user?.role || '').toUpperCase();

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        priority: 'LOW',
        category: 'GENERAL',
        audience: DEFAULT_AUDIENCE[userRole] || 'INSTITUTE_ALL',
        recipientIds: '',        // comma-separated, for SPECIFIC_USERS
        instituteId: '',         // for SPECIFIC_INSTITUTE
        departmentId: '',        // for INSTITUTE_DEPARTMENT
        isPinned: false,
        expiresAt: '',
    });

    // ── Dynamic data for conditional dropdowns ───────────────────────
    const [institutes, setInstitutes] = useState([]);
    const [departments, setDepartments] = useState([]);

    // Fetch institutes when super admin picks SPECIFIC_INSTITUTE
    useEffect(() => {
        if (userRole === 'SUPER_ADMIN' && formData.audience === 'SPECIFIC_INSTITUTE' && institutes.length === 0) {
            fetch(`${API_BASE_URL}/institute/all`, { credentials: 'include', method: 'GET' })
                .then(res => res.json())
                .then(data => setInstitutes(Array.isArray(data) ? data : []))
                .catch(err => console.error('Failed to fetch institutes', err));
        }
    }, [userRole, formData.audience]);

    // Fetch departments when admin picks INSTITUTE_DEPARTMENT
    useEffect(() => {
        if (userRole === 'ADMIN' && formData.audience === 'INSTITUTE_DEPARTMENT' && user?.institute_id && departments.length === 0) {
            fetch(`${API_BASE_URL}/department/institute/${user.institute_id}`, { credentials: 'include', method: 'GET' })
                .then(res => res.json())
                .then(data => setDepartments(Array.isArray(data) ? data : []))
                .catch(err => console.error('Failed to fetch departments', err));
        }
    }, [userRole, formData.audience, user?.institute_id]);

    // ── Handlers ─────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = {
                title: formData.title,
                message: formData.message,
                priority: formData.priority,
                category: formData.category,
                target_audience: formData.audience,
                is_pinned: formData.isPinned,
            };

            // Conditional fields based on target audience
            if (formData.audience === 'SPECIFIC_INSTITUTE' && formData.instituteId) {
                payload.institute_id = parseInt(formData.instituteId, 10);
            }

            if (formData.audience === 'INSTITUTE_DEPARTMENT' && formData.departmentId) {
                payload.department_id = parseInt(formData.departmentId, 10);
            }

            if (formData.audience === 'SPECIFIC_USERS' && formData.recipientIds) {
                payload.recipient_ids = formData.recipientIds
                    .split(',')
                    .map(id => parseInt(id.trim(), 10))
                    .filter(id => !isNaN(id));
            }

            if (formData.expiresAt) {
                payload.expires_at = new Date(formData.expiresAt).toISOString();
            }

            await createNotification(payload);
            navigate('../notifications');
        } catch (err) {
            console.error('Failed to create notification', err);
            setError(err.response?.data?.detail || 'An error occurred while creating the notification.');
        } finally {
            setLoading(false);
        }
    };

    // Get the allowed audience options for the current role
    const audienceOptions = AUDIENCE_OPTIONS[userRole] || [];

    return (
        <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans flex justify-center">
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Create Notification</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">Send an alert or announcement to specific users or groups.</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 bg-rose-50 text-rose-600 px-4 py-3 rounded-xl border border-rose-200 text-sm font-bold flexitems-center gap-2">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-slate-700">Title <span className="text-rose-500">*</span></label>
                            <input 
                                type="text" 
                                name="title" 
                                value={formData.title} 
                                onChange={handleChange} 
                                required 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium placeholder:font-normal placeholder:text-slate-400"
                                placeholder="Brief title of the notification"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-slate-700">Message <span className="text-rose-500">*</span></label>
                            <textarea 
                                name="message" 
                                value={formData.message} 
                                onChange={handleChange} 
                                required 
                                rows="4"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium placeholder:font-normal placeholder:text-slate-400 resize-none"
                                placeholder="Detailed message..."
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-slate-700">Priority</label>
                                <select 
                                    name="priority" 
                                    value={formData.priority} 
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium text-slate-700 appearance-none cursor-pointer"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-slate-700">Category</label>
                                <select 
                                    name="category" 
                                    value={formData.category} 
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium text-slate-700 appearance-none cursor-pointer"
                                >
                                    <option value="GENERAL">General</option>
                                    <option value="ANNOUNCEMENT">Announcement</option>
                                    <option value="ACADEMIC">Academic</option>
                                    <option value="EVENT">Event</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                </select>
                            </div>
                        </div>

                        {/* ── Target Audience (role-filtered) ── */}
                        <div className="space-y-1.5 pt-4 border-t border-slate-100">
                            <label className="block text-sm font-bold text-slate-700">Target Audience</label>
                            <select 
                                name="audience" 
                                value={formData.audience} 
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-indigo-50/50 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-bold text-indigo-900 appearance-none cursor-pointer"
                            >
                                {audienceOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* ── Conditional Selectors ── */}
                        <div className="space-y-4">
                            {formData.audience === 'SPECIFIC_INSTITUTE' && (
                                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-sm font-bold text-slate-700">Select Institute <span className="text-rose-500">*</span></label>
                                    <select 
                                        name="instituteId" 
                                        value={formData.instituteId} 
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium text-slate-700 appearance-none cursor-pointer"
                                    >
                                        <option value="">-- Choose an institute --</option>
                                        {institutes.map(inst => (
                                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {formData.audience === 'INSTITUTE_DEPARTMENT' && userRole === 'ADMIN' && (
                                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-sm font-bold text-slate-700">Select Department <span className="text-rose-500">*</span></label>
                                    <select 
                                        name="departmentId" 
                                        value={formData.departmentId} 
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium text-slate-700 appearance-none cursor-pointer"
                                    >
                                        <option value="">-- Choose a department --</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {formData.audience === 'SPECIFIC_USERS' && (
                                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-sm font-bold text-slate-700">User IDs (comma separated) <span className="text-rose-500">*</span></label>
                                    <input 
                                        type="text" 
                                        name="recipientIds" 
                                        value={formData.recipientIds} 
                                        onChange={handleChange} 
                                        required
                                        placeholder="e.g. 1, 5, 12"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium placeholder:font-normal placeholder:text-slate-400"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-slate-700">Expiration Date (Optional)</label>
                                <input 
                                    type="datetime-local" 
                                    name="expiresAt" 
                                    value={formData.expiresAt} 
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium text-slate-700" 
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input 
                                        type="checkbox" 
                                        name="isPinned" 
                                        checked={formData.isPinned} 
                                        onChange={handleChange} 
                                        className="peer sr-only" 
                                    />
                                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </div>
                                <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Pin this notification at the top of users' inbox</span>
                            </label>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
                            <button 
                                type="button" 
                                onClick={() => navigate('../notifications')}
                                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                                {loading ? 'Sending...' : (
                                    <>
                                        <Send size={18} />
                                        Send Notification
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NotificationCreate;
