import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, CheckSquare, Image, MessageCircle, BarChart2 } from 'lucide-react';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="top-nav">
      <div className="nav-header">
        <h1 className="logo-title">
          <span className="logo-icon">🏠</span> HouseWith
        </h1>
        <div className="user-profile-mini">👧</div>
      </div>
      <div className="nav-tabs">
        {/* NavLink는 현재 접속한 주소와 일치하면 자동으로 'active' 클래스를 붙여줍니다. */}
        <NavLink to="/calendar" className="nav-item">
          <Calendar size={20} />
          <span>캘린더</span>
        </NavLink>
        <NavLink to="/todo" className="nav-item">
          <CheckSquare size={20} />
          <span>할 일</span>
          <span className="notification-dot"></span>
        </NavLink>
        <NavLink to="/gallery" className="nav-item">
          <Image size={20} />
          <span>사진첩</span>
          <span className="notification-dot"></span>
        </NavLink>
        <NavLink to="/qna" className="nav-item">
          <MessageCircle size={20} />
          <span>질의응답</span>
          <span className="notification-dot"></span>
        </NavLink>
        <NavLink to="/analysis" className="nav-item">
          <BarChart2 size={20} />
          <span>주간 분석</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;