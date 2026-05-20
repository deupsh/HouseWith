import React, { useState, useEffect } from 'react';
import './Analysis.css';

const WEEK_DATA = {
  totalChores: 35,
  completedChores: 35,
  memberStats: [
    { name: '엄마', count: 18, color: '#7A9D8C' },
    { name: '아빠', count: 8, color: '#D4A373' },
    { name: '딸', count: 5, color: '#E5C0A0' },
    { name: '아들', count: 4, color: '#A3C9A8' },
  ],
  categoryStats: [
    { name: '청소', percent: 45, color: '#7A9D8C' },
    { name: '요리', percent: 30, color: '#D4A373' },
    { name: '세탁', percent: 15, color: '#E5C0A0' },
    { name: '기타', percent: 10, color: '#A3C9A8' },
  ],
  patternStats: {
    weekday: 75,
    weekend: 25
  }
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
  const generateAIAnalysis = () => {
    const total = WEEK_DATA.totalChores;
    let burdenMember = null;

    WEEK_DATA.memberStats.forEach(member => {
      const percent = (member.count / total) * 100;
      if (percent >= 40) {
        burdenMember = { ...member, percent: percent.toFixed(1) };
      }
    });

    return {
      participation: "이번 주 모든 가족 구성원이 집안일에 참여했어요! 함께 만드는 집이 더 따뜻합니다.",
      burden: burdenMember 
        ? `${burdenMember.name}님이 전체 집안일의 ${burdenMember.percent}%를 담당하고 계십니다. 조금 더 균등하게 분담하면 어떨까요?` 
        : null,
      recommendation: burdenMember
        ? `주중 저녁 설거지를 돌아가며 하면 부담이 줄어들 것 같아요. 요일별로 담당자를 정해보세요!`
        : `지금처럼 아주 균형 잡힌 분담이 이루어지고 있어요! 다음 주도 파이팅!`
    };
  };

  const aiResult = generateAIAnalysis();
  const dailyAverage = (WEEK_DATA.totalChores / 7).toFixed(1);
  const participationRate = Math.round((WEEK_DATA.completedChores / WEEK_DATA.totalChores) * 100);

  const [showCharts, setShowCharts] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null); // 원형 차트 호버 상태
  const [hoveredMember, setHoveredMember] = useState(null);     // 🌟 막대 차트 호버 상태 추가

  useEffect(() => {
    setTimeout(() => setShowCharts(true), 100);
  }, []);

  let currentOffset = 0;
  const pieSlices = WEEK_DATA.categoryStats.map((cat, index) => {
    const percentDec = cat.percent / 100;
    const radius = 90; 
    const pathData = getPieSlice(percentDec, currentOffset, radius);
    const labelCoords = getLabelCoords(percentDec, currentOffset, radius * 0.65); 
    
    const sliceData = { ...cat, pathData, labelCoords, index };
    currentOffset += percentDec;
    return sliceData;
  });

  return (
    <div className="analysis-page">
      <div className="analysis-header">
        <h2>2026년 5월 2주차 분석</h2>
        <p className="analysis-date">5월 5일 - 5월 11일</p>
      </div>

      <div className="ai-analysis-section">
        <div className="ai-card success-card">
          <div className="ai-icon-wrapper"><span className="ai-icon">🤍</span></div>
          <div className="ai-text">
            <h4>가족 참여도</h4>
            <p>{aiResult.participation}</p>
          </div>
        </div>

        {aiResult.burden && (
          <div className="ai-card warning-card">
            <div className="ai-icon-wrapper"><span className="ai-icon">❗</span></div>
            <div className="ai-text">
              <h4>부담 집중</h4>
              <p>{aiResult.burden}</p>
            </div>
          </div>
        )}

        <div className="ai-card tip-card">
          <div className="ai-icon-wrapper"><span className="ai-icon">✨</span></div>
          <div className="ai-text">
            <h4>추천 사항</h4>
            <p>{aiResult.recommendation}</p>
          </div>
        </div>
      </div>

      {/* 🌟 인터랙티브 막대 그래프 */}
      <div className="chart-card">
        <h3>구성원별 참여도</h3>
        <div className="bar-chart-container">
          <div className="y-axis">
            <span>20</span>
            <span>15</span>
            <span>10</span>
            <span>5</span>
          </div>
          <div 
            className="chart-area"
            onMouseLeave={() => setHoveredMember(null)} // 차트 영역을 벗어나면 호버 해제
          >
            {WEEK_DATA.memberStats.map((member, idx) => (
              <div 
                key={idx} 
                className={`bar-column ${hoveredMember === member.name ? 'hovered' : ''} ${hoveredMember && hoveredMember !== member.name ? 'dimmed' : ''}`}
                onMouseEnter={() => setHoveredMember(member.name)}
              >
                <div 
                  className="bar" 
                  style={{ 
                    height: showCharts ? `${(member.count / 20) * 100}%` : '0%', 
                    backgroundColor: member.color 
                  }}
                >
                  <span className="bar-tooltip">{member.count}회</span>
                </div>
                <span className="bar-label">{member.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <p className="stat-title">총 집안일</p>
          <p className="stat-value">{WEEK_DATA.totalChores}<span>회</span></p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <p className="stat-title">일평균</p>
          <p className="stat-value">{dailyAverage}<span>회</span></p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤍</div>
          <p className="stat-title">참여율</p>
          <p className="stat-value">{participationRate}<span>%</span></p>
        </div>
      </div>

      <div className="chart-card">
        <h3>주간 활동 패턴</h3>
        <div className="pattern-bars">
          <div className="pattern-row">
            <span className="pattern-label">평일</span>
            <div className="pattern-track">
              <div className="pattern-fill" style={{ width: showCharts ? `${WEEK_DATA.patternStats.weekday}%` : '0%', backgroundColor: '#7A9D8C' }}></div>
            </div>
            <span className="pattern-percent">{WEEK_DATA.patternStats.weekday}%</span>
          </div>
          <div className="pattern-row">
            <span className="pattern-label">주말</span>
            <div className="pattern-track">
              <div className="pattern-fill" style={{ width: showCharts ? `${WEEK_DATA.patternStats.weekend}%` : '0%', backgroundColor: '#D4A373' }}></div>
            </div>
            <span className="pattern-percent">{WEEK_DATA.patternStats.weekend}%</span>
          </div>
        </div>
        <p className="pattern-desc">
          평일에 집안일이 집중되어 있네요. 주말에도 조금씩 나누어서 하면 평일 부담이 줄어들 거예요!
        </p>
      </div>

      {/* 인터랙티브 SVG 원형 차트 */}
      <div className="chart-card">
        <h3>카테고리별 분포</h3>
        <div className="pie-chart-wrapper">
          <svg viewBox="0 0 200 200" className={`interactive-pie ${showCharts ? 'animate' : ''}`}>
            {pieSlices.map((slice) => (
              <g
                key={slice.name}
                className={`pie-slice-group ${hoveredCategory === slice.name ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCategory(slice.name)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <path d={slice.pathData} fill={slice.color} className="pie-path" />
                <text x={slice.labelCoords.x} y={slice.labelCoords.y - 4} className="pie-label-text">
                  {slice.name}
                </text>
                <text x={slice.labelCoords.x} y={slice.labelCoords.y + 12} className="pie-label-percent">
                  {slice.percent}%
                </text>
              </g>
            ))}
          </svg>
          
          <div className="pie-legend">
            {WEEK_DATA.categoryStats.map((cat, idx) => (
              <div 
                key={idx} 
                className={`legend-item ${hoveredCategory === cat.name ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCategory(cat.name)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <span className="legend-color" style={{ backgroundColor: cat.color }}></span>
                <span className="legend-name">{cat.name}</span>
                <span className="legend-percent">{cat.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Analysis;