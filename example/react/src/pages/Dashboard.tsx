import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/useAuth';

/**
 * Dashboard page component
 */
export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, updatePassword, deleteAccount, error, clearError, isLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'danger'>('profile');
  
  // Profile update form
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  // Password update form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });
  
  // Delete account form
  const [deletePassword, setDeletePassword] = useState('');
  
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Handles logout
   */
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  /**
   * Handles profile update
   */
  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage('');
    
    try {
      await updateProfile(profileData.name, profileData.email);
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      // Error handled by context
      console.log(err)
    }
  };

  /**
   * Handles password update
   */
  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage('');
    
    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccessMessage('Password updated! Please login again.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      // Error handled by context
      console.log(err)
    }
  };

  /**
   * Handles account deletion
   */
  const handleDeleteAccount = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteAccount(deletePassword);
      navigate('/login');
    } catch (err) {
      // Error handled by context
      console.log(err)
    }
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      
      <div className="user-info">
        <h2>Welcome, {user?.name}!</h2>
        <p>Email: {user?.email}</p>
        <p>Account created: {user?.createdAt ? new Date(user?.createdAt).toLocaleDateString() : 'N/A'}</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="tabs">
        <button 
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          Update Profile
        </button>
        <button 
          className={activeTab === 'password' ? 'active' : ''}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
        <button 
          className={activeTab === 'danger' ? 'active' : ''}
          onClick={() => setActiveTab('danger')}
        >
          Danger Zone
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'profile' && (
          <div className="tab-panel">
            <h3>Update Profile</h3>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}
        
        {activeTab === 'password' && (
          <div className="tab-panel">
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordUpdate}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>
              
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
        
        {activeTab === 'danger' && (
          <div className="tab-panel danger-zone">
            <h3>Delete Account</h3>
            <p className="warning">Warning: This action cannot be undone!</p>
            <form onSubmit={handleDeleteAccount}>
              <div className="form-group">
                <label htmlFor="deletePassword">Confirm Password</label>
                <input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Enter your password to confirm"
                />
              </div>
              
              <button type="submit" className="danger-btn" disabled={isLoading}>
                {isLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
