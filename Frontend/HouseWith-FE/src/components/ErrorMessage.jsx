import React from 'react';

const ErrorMessage = ({ message, style }) => {
  // 에러 메시지가 없으면 아무것도 렌더링하지 않음
  if (!message) return null; 

  return (
    <span className="error-text" style={style}>
      {message}
    </span>
  );
};

export default ErrorMessage;