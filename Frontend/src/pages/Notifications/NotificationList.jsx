import React, { useContext, useState, useEffect, useRef } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../../api/notification';
import { NotificationContext } from '../../Context/notification.context';
import { UserContext } from '../../Context/user.context';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Mail, MailOpen, AlertCircle, Info, Megaphone, Server, BookOpen, Trash, X, User } from 'lucide-react';
import { API_BASE_URL } from '../../config';


const PriorityConfig = {
    LOW: { color: '#10b981', label: 'Low', icon: Info },
    MEDIUM: { color: '#f59e0b', label: 'Medium', icon: AlertCircle },
    HIGH: { color: '#ef4444', label: 'High', icon: AlertCircle },
    URGENT: { color: '#b91c1c', label: 'Urgent', icon: AlertCircle },
};

const CategoryIcons = {
    GENERAL: Info,
    ANNOUNCEMENT: Megaphone,
    ACADEMIC: BookOpen,
    EVENT: Info,
    MAINTENANCE: Server,
};

const NotificationList = () => {
    const navigate = useNavigate();
    const { refreshUnreadCount } = useContext(NotificationContext);
    const { user } = useContext(UserContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Name Maps for IDs
    const [instituteMap, setInstituteMap] = useState({});
    const [departmentMap, setDepartmentMap] = useState({});
    const fetchedInstitutesForDepts = useRef(new Set());
    
    // Modal State
    const [selectedNotification, setSelectedNotification] = useState(null);

    // Filters
    const [filterPriority, setFilterPriority] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterReadStatus, setFilterReadStatus] = useState('');

    const fetchList = async () => {
        setLoading(true);
        try {
            const limit = 10;
            const params = { page, limit };
            if (filterPriority) params.priority = filterPriority;
            if (filterCategory) params.category = filterCategory;
            if (filterReadStatus !== '') params.is_read = filterReadStatus;
            
            const data = await getNotifications(params);
            setNotifications(data.notifications);
            setTotalPages(Math.ceil((data.total || 0) / limit));
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
    }, [page, filterPriority, filterCategory, filterReadStatus]);

    // Fetch all institutes on mount
    useEffect(() => {
        fetch(`${API_BASE_URL}/institute/all`, { credentials: 'include', method: 'GET' })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const map = {};
                    data.forEach(inst => { map[inst.id] = inst.name; });
                    setInstituteMap(map);
                }
            })
            .catch(err => console.error('Failed to fetch institutes', err));
    }, []);

    // Fetch departments for any new institute IDs in the notifications
    useEffect(() => {
        const fetchDepts = async () => {
            const uniqueInstIds = [...new Set(notifications.map(n => n.institute_id).filter(Boolean))];
            let newDeptsObj = null;

            for (const instId of uniqueInstIds) {
                if (fetchedInstitutesForDepts.current.has(instId)) continue;
                
                try {
                    const res = await fetch(`${API_BASE_URL}/department/institute/${instId}`, { credentials: 'include', method: 'GET' });
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        if (!newDeptsObj) newDeptsObj = { ...departmentMap };
                        data.forEach(d => { newDeptsObj[d.id] = d.name; });
                    }
                    fetchedInstitutesForDepts.current.add(instId);
                } catch (e) {
                    console.error('Failed to fetch depts for institute ' + instId, e);
                }
            }

            if (newDeptsObj) {
                setDepartmentMap(newDeptsObj);
            }
        };

        if (notifications.length > 0) {
            fetchDepts();
        }
    }, [notifications]);

    const handleNotificationClick = async (noti) => {
        setSelectedNotification(noti);
        if (!noti.is_read) {
            try {
                await markAsRead(noti.id);
                setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, is_read: true } : n));
                refreshUnreadCount();
            } catch (error) {
                console.error('Failed to mark as read', error);
            }
        }
    };

    const closeModal = () => {
        setSelectedNotification(null);
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            refreshUnreadCount();
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setPage(1); // Reset to first page
    };

    const canSend = user?.role && !['STUDENT', 'student'].includes(user.role);

    return (
        <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Notifications</h2>
                        <p className="text-slate-500 font-medium mt-1">Stay updated with important announcements and alerts</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleMarkAllAsRead} 
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                            Mark all as read
                        </button>
                        {canSend && (
                            <button 
                                onClick={() => navigate('create')} 
                                className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                                Create Notification
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 mb-8">
                    <select 
                        value={filterReadStatus} 
                        onChange={handleFilterChange(setFilterReadStatus)}
                        className="flex-1 min-w-[150px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-700 appearance-none cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="false">Unread</option>
                        <option value="true">Read</option>
                    </select>

                    <select 
                        value={filterPriority} 
                        onChange={handleFilterChange(setFilterPriority)}
                        className="flex-1 min-w-[150px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-700 appearance-none cursor-pointer"
                    >
                        <option value="">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                    </select>

                    <select 
                        value={filterCategory} 
                        onChange={handleFilterChange(setFilterCategory)}
                        className="flex-1 min-w-[150px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-700 appearance-none cursor-pointer"
                    >
                        <option value="">All Categories</option>
                        <option value="GENERAL">General</option>
                        <option value="ANNOUNCEMENT">Announcement</option>
                        <option value="ACADEMIC">Academic</option>
                        <option value="EVENT">Event</option>
                        <option value="MAINTENANCE">Maintenance</option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl shadow-sm border border-slate-100 mt-6">
                        <div className="animate-spin text-indigo-500 mb-4 inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full" />
                        <span className="text-lg font-bold text-slate-700">Loading notifications...</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 flex flex-col items-center justify-center text-center mt-6 min-h-[400px]">
                        <Mail className="w-20 h-20 text-slate-200 mb-6" />
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">You're all caught up!</h3>
                        <p className="text-slate-500 font-medium max-w-md">There are no notifications matching your current filters.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {notifications.map(noti => {
                            const priorityInfo = PriorityConfig[noti.priority] || PriorityConfig.LOW;
                            const CategoryIcon = CategoryIcons[noti.category] || Info;
                            return (
                                <div 
                                    key={noti.id} 
                                    className={`relative bg-white rounded-2xl p-5 border group cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex items-start gap-4 ${noti.is_read ? 'border-slate-200 opacity-75 hover:opacity-100' : 'border-indigo-200 shadow-sm'} ${noti.is_pinned ? 'ring-2 ring-amber-400 border-transparent' : ''}`}
                                    onClick={() => handleNotificationClick(noti)}
                                >
                                    {/* Unread dot indicator */}
                                    {!noti.is_read && (
                                        <div className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                                    )}

                                    <div className="p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: `${priorityInfo.color}15`, color: priorityInfo.color }}>
                                        <CategoryIcon size={24} />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 pr-8">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mb-2">
                                            <h4 className={`text-lg tracking-tight truncate ${noti.is_read ? 'font-bold text-slate-700' : 'font-black text-slate-900'}`}>{noti.title}</h4>
                                            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                                                {format(new Date(noti.created_at), 'MMM dd, yyyy h:mm a')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-3 truncate">
                                            {noti.sender ? (
                                                <span className="flex items-center gap-1.5 truncat">
                                                    <User size={14} className="shrink-0" /> 
                                                    <span className="truncate">{noti.sender.full_name || noti.sender.username}</span>
                                                    {(noti.department_id || noti.institute_id) && <span className="text-slate-300 mx-1">•</span>}
                                                    {noti.department_id ? (departmentMap[noti.department_id] || `Dept ${noti.department_id}`) : ''}
                                                    {noti.institute_id && !noti.department_id ? (instituteMap[noti.institute_id] || `Inst ${noti.institute_id}`) : ''}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5"><Server size={14} className="shrink-0" /> System Notification</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide" style={{ backgroundColor: priorityInfo.color, color: 'white' }}>
                                                {priorityInfo.label}
                                            </span>
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wide border border-slate-200">
                                                {noti.category}
                                            </span>
                                            {noti.is_pinned && <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 uppercase tracking-wide border border-amber-200">Pinned</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100">
                        <button 
                            disabled={page === 1} 
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors disabled:opacity-50 disabled:hover:text-slate-600 disabled:hover:border-slate-200 shadow-sm"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-bold text-slate-500">
                            Page {page} of {totalPages}
                        </span>
                        <button 
                            disabled={page === totalPages} 
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors disabled:opacity-50 disabled:hover:text-slate-600 disabled:hover:border-slate-200 shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Notification Detail Modal */}
                {selectedNotification && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal}>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100" onClick={(e) => e.stopPropagation()}>
                            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/80">
                                <div className="flex gap-4 pr-8">
                                    <div className="p-3 rounded-xl shrink-0 mt-1" style={{ backgroundColor: `${(PriorityConfig[selectedNotification.priority] || PriorityConfig.LOW).color}15`, color: (PriorityConfig[selectedNotification.priority] || PriorityConfig.LOW).color }}>
                                        {React.createElement(CategoryIcons[selectedNotification.category] || Info, { size: 28 })}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">{selectedNotification.title}</h2>
                                        <div className="text-sm font-semibold text-slate-500 mt-2">
                                            {format(new Date(selectedNotification.created_at), 'MMMM do, yyyy • h:mm a')}
                                        </div>
                                    </div>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-2 rounded-xl transition-colors focus:outline-none shrink-0" onClick={closeModal}>
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto bg-slate-50/30 flex-1">
                                <div className="flex items-center gap-3 mb-6 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                        <User size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <strong className="text-slate-800 font-bold truncate">{selectedNotification.sender ? (selectedNotification.sender.full_name || selectedNotification.sender.username) : 'System'}</strong>
                                            {selectedNotification.sender && <span className="text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100 uppercase tracking-wide">{selectedNotification.sender.role}</span>}
                                        </div>
                                        <div className="text-sm font-medium text-slate-500 mt-0.5 truncate">
                                            {[
                                                selectedNotification.institute_id && `${instituteMap[selectedNotification.institute_id] || selectedNotification.institute_id}`,
                                                selectedNotification.department_id && `${departmentMap[selectedNotification.department_id] || selectedNotification.department_id}`
                                            ].filter(Boolean).join(' • ')}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium bg-white p-5 rounded-xl border border-slate-100 shadow-sm whitespace-pre-wrap">
                                    {selectedNotification.message}
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2 mt-6">
                                    <span className="text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider" style={{ backgroundColor: (PriorityConfig[selectedNotification.priority] || PriorityConfig.LOW).color, color: 'white' }}>
                                        {(PriorityConfig[selectedNotification.priority] || PriorityConfig.LOW).label} Priority
                                    </span>
                                    <span className="text-xs font-bold px-3 py-1 rounded-md bg-slate-200 text-slate-700 uppercase tracking-wider">
                                        {selectedNotification.category}
                                    </span>
                                    {selectedNotification.target_audience && (
                                        <span className="text-xs font-bold px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                                            Audience: {selectedNotification.target_audience.replace('_', ' ')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationList;
