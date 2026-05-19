import React, { useEffect } from 'react';
import './css/Toast.css';

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // 3초 뒤에 자동으로 사라짐
    return () => clearTimeout(timer);
  }, [onClose]);

  return <div className="toast-notification">{message}</div>;
};

export default Toast;