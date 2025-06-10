import React, { useContext, useState } from 'react';
import AuthContext from '../contexts/AuthContext'; // Adjust path as needed
import { useNavigate } from 'react-router-dom'; // For redirecting to login
import TimerPopup from '../components/TimerPopup'; 

const Profile = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isTimerVisible, setIsTimerVisible] = useState(false);

  // Handle logout and redirect to login page
  const handleLogout = () => {
    logout();
    navigate('/login'); // Adjust route as per your app's routing
  };

  // Toggle timer visibility
  const toggleTimer = () => {
    setIsTimerVisible((prev) => !prev);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[var(--text)] text-xl">Loading...</div>
      </div>
    );
  }

  // Show message if not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[var(--text)] text-xl">
          Please log in to view your profile.
          <button
            onClick={() => navigate('/login')}
            className="btn-primary ml-4 px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-[var(--surface)] shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-6 text-center">Profile</h1>
        <div className="space-y-4">
          <div className="flex flex-col">
            <span className="text-[var(--muted)] text-sm">Username</span>
            <span className="text-[var(--text)] text-lg">{user.username || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[var(--muted)] text-sm">Email</span>
            <span className="text-[var(--text)] text-lg">{user.email || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[var(--muted)] text-sm">Bonus Points</span>
            <span className="text-[var(--text)] text-lg">{user.bonusPoints || 0}</span>
          </div>
        </div>
        <div className="mt-6 flex space-x-4 justify-center">
          <button
            onClick={toggleTimer}
            className="btn-primary px-4 py-2 rounded"
            aria-label={isTimerVisible ? 'Hide Study Timer' : 'Show Study Timer'}
          >
            {isTimerVisible ? 'Hide Timer' : 'Show Timer'}
          </button>
          <button
            onClick={handleLogout}
            className="btn-secondary px-4 py-2 rounded"
            aria-label="Log out"
          >
            Log Out
          </button>
        </div>
      </div>
      {isTimerVisible && <TimerPopup setIsVisible={setIsTimerVisible} />}
    </div>
  );
};

export default Profile;