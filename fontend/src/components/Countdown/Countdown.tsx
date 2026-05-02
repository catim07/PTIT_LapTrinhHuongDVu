import React, { useState, useEffect } from 'react';

interface CountdownProps {
  endDate?: string | null;
  onExpire?: () => void;
  className?: string;
}

export const Countdown: React.FC<CountdownProps> = ({ endDate, onExpire, className = '' }) => {
  const calculateTimeLeft = () => {
    if (!endDate) return null;
    const difference = new Date(endDate).getTime() - new Date().getTime();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return null;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (!endDate) return;

    if (!timeLeft) {
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (!newTimeLeft) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onExpire, timeLeft]);

  // Handle prefers-reduced-motion for animations if required 
  // (In React usually handled via CSS, here we keep JS clean and light)

  if (!timeLeft) {
    return <span className={`font-mono font-bold ${className}`}>Hết hạn</span>;
  }

  return (
    <span className={`font-mono font-bold ${className}`}>
      {String(timeLeft.days).padStart(2, '0')}:
      {String(timeLeft.hours).padStart(2, '0')}:
      {String(timeLeft.minutes).padStart(2, '0')}:
      {String(timeLeft.seconds).padStart(2, '0')}
    </span>
  );
};
