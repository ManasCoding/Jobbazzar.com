import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import AuthContext from '../context/AuthContext';
import { 
  ShieldCheck, UserPlus, Mail, User, Lock, Trash2, 
  Loader2, CheckCircle2, AlertCircle, Eye, EyeOff
} from 'lucide-react';

const AdminAccessControl = () => {
  const { userInfo } = useContext(AuthContext);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form inputs
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/v1/users/admins');
      if (res.data && res.data.data) {
        setAdmins(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !name || !password) {
      setError('Please fill all fields to grant administrator access.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post('http://localhost:5000/api/v1/users/admins', {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setSuccess(res.data.message || 'Administrator account created successfully!');
      setEmail('');
      setName('');
      setPassword('');
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create administrator account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (id, adminEmail) => {
    if (!window.confirm(`Are you sure you want to revoke admin privileges for ${adminEmail}?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await axios.delete(`http://localhost:5000/api/v1/users/admins/${id}`);
      setSuccess(`Admin privileges revoked for ${adminEmail}`);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to revoke administrator access.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '10/10/2026';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
        
        {/* Page Top Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1e293b] tracking-wider uppercase">
              Administrator Access Control
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Manage users with full administrative privileges.
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Add New Admin Form */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Add New Admin</h2>
            </div>

            <form onSubmit={handleGrantAccess} className="space-y-5">
              
              {/* Email Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@company.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Full Name Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Admin Name"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Temporary Password Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Temporary Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-4 px-6 rounded-2xl bg-[#0f172a] hover:bg-black active:scale-[0.99] text-white text-xs font-black tracking-widest uppercase shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Granting Access...</span>
                  </>
                ) : (
                  <span>Grant Admin Access</span>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Active Administrators List */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-black text-slate-900 tracking-wider uppercase">
                Active Administrators
              </h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                {admins.length} Accounts
              </span>
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-slate-800" />
                <span className="text-xs font-medium">Loading administrators...</span>
              </div>
            ) : admins.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                No administrators found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {admins.map((admin) => {
                  const isCurrent = userInfo && (userInfo.email === admin.email || userInfo._id === admin._id);
                  const initial = (admin.name?.[0] || 'A').toUpperCase();

                  return (
                    <div 
                      key={admin._id}
                      className="py-4.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 rounded-2xl px-2 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200/60 shadow-xs">
                          {initial}
                        </div>
                        {/* Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {admin.name}
                            </h3>
                            {isCurrent && (
                              <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                            {admin.email}
                          </p>
                        </div>
                      </div>

                      {/* Right Meta & Actions */}
                      <div className="flex items-center gap-5 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Activity</div>
                          <div className="text-xs font-semibold text-slate-600 mt-0.5">
                            {formatDate(admin.updatedAt || admin.createdAt)}
                          </div>
                        </div>

                        {/* Delete Button (disabled for current logged-in user) */}
                        {!isCurrent ? (
                          <button
                            onClick={() => handleDeleteAdmin(admin._id, admin.email)}
                            disabled={deletingId === admin._id}
                            title="Revoke Admin Access"
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                          >
                            {deletingId === admin._id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <div className="w-8" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminAccessControl;
