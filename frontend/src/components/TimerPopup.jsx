import { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

function TimerPopup({ setIsVisible }) {
  const { user, getUser } = useContext(AuthContext);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('timerPosition') || JSON.stringify({ x: 20, y: 20 });
    return JSON.parse(saved);
  });
  const timerRef = useRef(null);
  const draggableRef = useRef(null);
  const lastRewardedTime = useRef(0);
  const REWARD_INTERVAL_SECONDS = 30;
  const POINTS_PER_INTERVAL = 10; // Match backend constant

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setTime(0);
    setIsRunning(false);
    lastRewardedTime.current = 0;
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (!user || !isRunning || time === 0 || time < REWARD_INTERVAL_SECONDS) return;

    if (time % REWARD_INTERVAL_SECONDS === 0 && time !== lastRewardedTime.current) {
      const updateTimeSpent = async () => {
        try {
          // Debug: Log the userId being sent
          console.log('Sending userId:', user.id);
          if (typeof user.id !== 'string' || !user.id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error('Invalid userId format');
          }

          const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/update-time`, {
            userId: user.id,
          });

          const { points, message } = response.data;
          if (response.data.success) {
            setRewardPoints(POINTS_PER_INTERVAL);
            setShowReward(true);
            setTimeout(() => setShowReward(false), 3000);
            toast.success(message);
            await getUser(user.id);
            lastRewardedTime.current = time;
          }
        } catch (error) {
          console.error('Error updating time spent:', error.message, error.stack);
          toast.error('Failed to update study time. Please try again later.', {
            id: 'update-time-error',
          });
        }
      };

      updateTimeSpent();
    }
  }, [time, user, isRunning, getUser]);

  const handleStop = (e, data) => {
    const newPosition = { x: data.x, y: data.y };
    setPosition(newPosition);
    localStorage.setItem('timerPosition', JSON.stringify(newPosition));
  };

  return (
    <Draggable handle=".timer-handle" position={position} onStop={handleStop} nodeRef={draggableRef}>
      <div ref={draggableRef} className="card fixed w-64 z-[1000]">
        <div className="timer-handle cursor-move bg-[var(--primary)] text-[var(--surface)] p-2 rounded-t-lg flex justify-between items-center">
          <span>Study Timer</span>
          <button
            onClick={() => {
              setIsVisible(false);
            }}
            className="text-[var(--surface)] hover:text-[var(--text)]"
            aria-label="Hide timer"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        <div className="p-4 text-center relative">
          <div className="text-3xl font-bold text-[var(--text)] mb-4">{formatTime(time)}</div>
          <div className="flex space-x-2 justify-center">
            <button
              onClick={toggleTimer}
              className="btn-primary px-4 py-2"
              aria-label={isRunning ? 'Pause timer' : 'Start timer'}
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={resetTimer}
              className="btn-secondary px-4 py-2"
              aria-label="Reset timer"
            >
              Reset
            </button>
          </div>
          {showReward && (
            <div className="absolute Faberate-bottom-16 left-1/2 transform -translate-x-1/2 bg-[var(--success)] text-[var(--surface)] px-4 py-2 rounded-lg shadow-lg animate-bounce-in">
              +{rewardPoints} Points Awarded!
            </div>
          )}
          {user && (
            <div className="text-[var(--muted)] text-sm mt-2">Points: {user.bonusPoints || 0}</div>
          )}
        </div>
      </div>
    </Draggable>
  );
}

export default TimerPopup;