import React, { useState, useEffect } from 'react';
import axios from 'axios'; // 🌟 Axios 임포트 추가!
import './Analysis.css';

// 깡통 데이터
const DEFAULT_EMPTY_DATA = {
  weekLabel: "로딩 중...",
  weekRange: "-월 -일 - -월 -일",
  participationComment: "데이터를 불러오고 있습니다...",
  isOverloaded: false,
  overloadComment: "",
  recommendComment: "데이터 분석 중입니다...",
  totalCount: 0,
  dailyAverage: 0.0,
  participationRate: 0,
  memberStats: [],
  categoryStats: []
};

const getMemberColor = (index) => {
  const colors = ['#7A9D8C', '#D4A373', '#E5C0A0', '#A3C9A8'];
  return colors[index % colors.length];
};
const getCategoryColor = (index) => {
  const colors = ['#7A9D8C', '#D4A373', '#E5C0A0', '#A3C9A8'];
  return colors[index % colors.length];
};

const getPieSlice = (percent, offset, radius) => {
  const startAngle = offset * 2 * Math.PI - Math.PI / 2;
  const endAngle = (offset + percent) * 2 * Math.PI - Math.PI / 2;
  const x1 = 100 + radius * Math.cos(startAngle);
  const y1 = 100 + radius * Math.sin(startAngle);
  const x2 = 100 + radius * Math.cos(endAngle);
  const y2 = 100 + radius * Math.sin(endAngle);
  const largeArcFlag = percent > 0.5 ? 1 : 0;
  return `M 100 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
};

const getLabelCoords = (percent, offset, radius) => {
  const midAngle = (offset + percent / 2) * 2 * Math.PI - Math.PI / 2;
  const x = 100 + radius * Math.cos(midAngle);
  const y = 100 + radius * Math.sin(midAngle);
  return { x, y };
};

const Analysis = () => {
  // 🌟 1. 진짜 통신 데이터를 담을 상태(State) 생성 (초기값은 빈 깡통)
  const [data, setData] = useState(DEFAULT_EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태

  const [showCharts, setShowCharts] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredMember, setHoveredMember] = useState(null);

  // 🌟 2. 백엔드에서 데이터 가져오는 함수 생성
  const fetchWeeklyAnalysis = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      // 오늘 날짜 구하기 (YYYY-MM-DD 형식)
      const today = new Date().toISOString().split('T')[0]; 

      // 백엔드 주방에 주간 분석 데이터 주문!
      const response = await axios.get('/api/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("통계 데이터 도착 완료!", response.data);
      setData(response.data); // 주방에서 준 진짜 데이터로 덮어쓰기!

    } catch (error) {
      console.error("통계 조회 실패 (서버가 아직 준비 안 됨):", error);
      // 백엔드가 아직 완성 안 되었으니, 에러가 나면 아까 쓰던 MOCK 데이터를 임시로 띄워줍니다.
      // 🚨 (나중에 백엔드 완성되면 아래 두 줄은 지우시면 됩니다!)
      console.log("임시 더미 데이터를 화면에 표시합니다.");
      setData(DEFAULT_EMPTY_DATA);
    } finally {
      setIsLoading(false); // 로딩 끝!
    }
  };

  // 🌟 3. 화면이 맨 처음 켜질 때 딱 한 번 실행 (useEffect)
  useEffect(() => {
    fetchWeeklyAnalysis(); // 데이터 가져오기 실행
    setTimeout(() => setShowCharts(true), 300); // 차트 애니메이션 실행 타이밍 조절
  }, []);

  // ----------------------------------------------------------
  // 로딩 중일 때 보여줄 화면 (선택 사항)
  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>데이터를 분석하는 중입니다... 🔄</div>;
  }
  // ----------------------------------------------------------

  let currentOffset = 0;
  const pieSlices = data.categoryStats.map((cat, index) => {
    const percentDec = cat.percentage / 100;
    const radius = 90; 
    const pathData = getPieSlice(percentDec, currentOffset, radius);
    const labelCoords = getLabelCoords(percentDec, currentOffset, radius * 0.65); 
    
    const sliceData = { ...cat, color: getCategoryColor(index), pathData, labelCoords, index };
    currentOffset += percentDec;
    return sliceData;
  });

  return (
    // ... 이 아래로는 <div>부터 시작하는 return 안쪽 HTML 구조를 원래 코드 그대로 복붙하시면 됩니다! (수정할 내용 없음) ...
    <div className="analysis-page">
      <div className="analysis-header">
        <h2>{data.weekLabel} 분석</h2>
        <p className="analysis-date">{data.weekRange}</p>
      </div>

      <div className="ai-analysis-section">
        <div className="ai-card success-card">
          <div className="ai-icon-wrapper"><span className="ai-icon">🤍</span></div>
          <div className="ai-text">
            <h4>가족 참여도</h4>
            <p>{data.participationComment}</p>
          </div>
        </div>

        {/* API에서 isOverloaded가 true일 때만 경고 노출 */}
        {data.isOverloaded && data.overloadComment && (
          <div className="ai-card warning-card">
            <div className="ai-icon-wrapper"><span className="ai-icon">❗</span></div>
            <div className="ai-text">
              <h4>부담 집중</h4>
              <p>{data.overloadComment}</p>
            </div>
          </div>
        )}

        <div className="ai-card tip-card">
          <div className="ai-icon-wrapper"><span className="ai-icon">✨</span></div>
          <div className="ai-text">
            <h4>추천 사항</h4>
            <p>{data.recommendComment}</p>
          </div>
        </div>
      </div>

      <div className="chart-card">
        <h3>구성원별 참여도</h3>
        <div className="bar-chart-container">
          <div className="y-axis">
            <span>20</span><span>15</span><span>10</span><span>5</span>
          </div>
          <div className="chart-area" onMouseLeave={() => setHoveredMember(null)}>
            {data.memberStats.map((member, idx) => {
              const color = getMemberColor(idx);
              return (
                <div 
                  key={idx} 
                  className={`bar-column ${hoveredMember === member.nickname ? 'hovered' : ''} ${hoveredMember && hoveredMember !== member.nickname ? 'dimmed' : ''}`}
                  onMouseEnter={() => setHoveredMember(member.nickname)}
                >
                  <div className="bar" style={{ height: showCharts ? `${(member.count / 20) * 100}%` : '0%', backgroundColor: color }}>
                    <span className="bar-tooltip">{member.count}회</span>
                  </div>
                  <span className="bar-label">{member.nickname}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <p className="stat-title">총 집안일</p>
          <p className="stat-value">{data.totalCount}<span>회</span></p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <p className="stat-title">일평균</p>
          <p className="stat-value">{data.dailyAverage}<span>회</span></p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤍</div>
          <p className="stat-title">참여율</p>
          <p className="stat-value">{Math.round(data.participationRate)}<span>%</span></p>
        </div>
      </div>

      {/* 주간 패턴 데이터 임시 하드코딩 유지, 필요없으면 지워도 됨 */}
      <div className="chart-card">
        <h3>주간 활동 패턴</h3>
        <div className="pattern-bars">
          <div className="pattern-row">
            <span className="pattern-label">평일</span>
            <div className="pattern-track">
              <div className="pattern-fill" style={{ width: showCharts ? '75%' : '0%', backgroundColor: '#7A9D8C' }}></div>
            </div>
            <span className="pattern-percent">75%</span>
          </div>
          <div className="pattern-row">
            <span className="pattern-label">주말</span>
            <div className="pattern-track">
              <div className="pattern-fill" style={{ width: showCharts ? '25%' : '0%', backgroundColor: '#D4A373' }}></div>
            </div>
            <span className="pattern-percent">25%</span>
          </div>
        </div>
        <p className="pattern-desc">
          평일에 집안일이 집중되어 있네요. 주말에도 조금씩 나누어서 하면 평일 부담이 줄어들 거예요!
        </p>
      </div>

      <div className="chart-card">
        <h3>카테고리별 분포</h3>
        <div className="pie-chart-wrapper">
          <svg viewBox="0 0 200 200" className={`interactive-pie ${showCharts ? 'animate' : ''}`}>
            {pieSlices.map((slice) => (
              <g
                key={slice.categoryName}
                className={`pie-slice-group ${hoveredCategory === slice.categoryName ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCategory(slice.categoryName)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <path d={slice.pathData} fill={slice.color} className="pie-path" />
                <text x={slice.labelCoords.x} y={slice.labelCoords.y - 4} className="pie-label-text">
                  {slice.categoryName}
                </text>
                <text x={slice.labelCoords.x} y={slice.labelCoords.y + 12} className="pie-label-percent">
                  {Math.round(slice.percentage)}%
                </text>
              </g>
            ))}
          </svg>
          
          <div className="pie-legend">
            {pieSlices.map((slice, idx) => (
              <div 
                key={idx} 
                className={`legend-item ${hoveredCategory === slice.categoryName ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCategory(slice.categoryName)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <span className="legend-color" style={{ backgroundColor: slice.color }}></span>
                <span className="legend-name">{slice.categoryName}</span>
                <span className="legend-percent">{slice.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;