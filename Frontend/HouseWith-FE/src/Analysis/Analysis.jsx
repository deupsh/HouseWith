import React, { useState, useEffect } from 'react';
import './Analysis.css';

const MOCK_API_RESPONSE = {
  weekLabel: "2026년 5월 2주차",
  weekRange: "5월 5일 - 5월 11일",
  participationComment: "이번 주 모든 가족 구성원이 집안일에 참여했어요! 함께 만드는 집이 더 따뜻합니다.",
  isOverloaded: true, // 백엔드 응답
  overloadComment: "엄마님이 전체 집안일의 51.4%를 담당하고 계십니다. 조금 더 균등하게 분담하면 어떨까요?",
  recommendComment: "주중 저녁 설거지를 돌아가며 하면 부담이 줄어들 것 같아요. 요일별로 담당자를 정해보세요!",
  totalCount: 35,
  dailyAverage: 5.0,
  participationRate: 100.0,
  memberStats: [
    { nickname: '엄마', count: 18, profileEmoji: 1, profileBackground: 1, customProfileImage: null },
    { nickname: '아빠', count: 8, profileEmoji: 2, profileBackground: 2, customProfileImage: null },
    { nickname: '딸', count: 5, profileEmoji: 3, profileBackground: 3, customProfileImage: null },
    { nickname: '아들', count: 4, profileEmoji: 4, profileBackground: 4, customProfileImage: null },
  ],
  categoryStats: [
    { categoryName: '청소', count: 16, percentage: 45.7 },
    { categoryName: '요리/설거지', count: 10, percentage: 28.6 },
    { categoryName: '빨래', count: 5, percentage: 14.3 },
    { categoryName: '기타', count: 4, percentage: 11.4 },
  ]
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
  // 실제 연동 시 axios.get('/api/statistics') 결과를 data 상태에 담습니다.
  const data = MOCK_API_RESPONSE;

  const [showCharts, setShowCharts] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredMember, setHoveredMember] = useState(null);

  useEffect(() => {
    setTimeout(() => setShowCharts(true), 100);
  }, []);

  // API 데이터 기반 원형 차트 조각 계산
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