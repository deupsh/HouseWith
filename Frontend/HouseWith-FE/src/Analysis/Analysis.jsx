import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  // 0%일 경우 에러 방지
  if (percent <= 0) return '';
  const startAngle = offset * 2 * Math.PI - Math.PI / 2;
  const endAngle = (offset + percent) * 2 * Math.PI - Math.PI / 2;
  const x1 = 100 + radius * Math.cos(startAngle);
  const y1 = 100 + radius * Math.sin(startAngle);
  const x2 = 100 + radius * Math.cos(endAngle);
  const y2 = 100 + radius * Math.sin(endAngle);
  const largeArcFlag = percent > 0.5 ? 1 : 0;
  // 100%일 경우 원 전체를 그리는 예외 처리
  if (percent >= 1) {
    return `M 100 100 m -${radius}, 0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`;
  }
  return `M 100 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
};

const getLabelCoords = (percent, offset, radius) => {
  const midAngle = (offset + percent / 2) * 2 * Math.PI - Math.PI / 2;
  const x = 100 + radius * Math.cos(midAngle);
  const y = 100 + radius * Math.sin(midAngle);
  return { x, y };
};

const Analysis = () => {
  const [data, setData] = useState(DEFAULT_EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(true);

  const [showCharts, setShowCharts] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredMember, setHoveredMember] = useState(null);

  const fetchWeeklyAnalysis = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/api/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("통계 데이터 도착 완료!", response.data);
      setData(response.data);
    } catch (error) {
      console.error("통계 조회 실패:", error);
      // 🚨 무한 로딩처럼 보이지 않도록 텍스트만 덮어씌움!
      setData({
        ...DEFAULT_EMPTY_DATA,
        weekLabel: "조회 실패",
        participationComment: "통계 데이터를 불러오지 못했습니다. 잠시 후 새로고침 해주세요.",
        recommendComment: "데이터를 불러오는 중 문제가 발생했습니다."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyAnalysis();
    setTimeout(() => setShowCharts(true), 300);
  }, []);

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>데이터를 분석하는 중입니다... 🔄</div>;
  }

  // 1. 카테고리 원형 그래프 데이터 계산
  let currentCatOffset = 0;
  const pieSlices = data.categoryStats.map((cat, index) => {
    const percentDec = cat.percentage / 100;
    const radius = 90; 
    const pathData = getPieSlice(percentDec, currentCatOffset, radius);
    const labelCoords = getLabelCoords(percentDec, currentCatOffset, radius * 0.65); 
    
    const sliceData = { ...cat, color: getCategoryColor(index), pathData, labelCoords, index };
    currentCatOffset += percentDec;
    return sliceData;
  });

  // 🚨 2. 구성원별 원형 그래프 데이터 계산 (새로 추가됨!)
  let currentMemOffset = 0;
  // 전체 집계된 횟수 (총 집안일 수와 다를 수 있으므로 구성원 count의 합을 구함)
  const totalMemberCount = data.memberStats.reduce((sum, member) => sum + member.count, 0);
  const memberPieSlices = data.memberStats.map((member, index) => {
    // 0 나누기 방지
    const percentage = totalMemberCount === 0 ? 0 : (member.count / totalMemberCount) * 100;
    const percentDec = percentage / 100;
    const radius = 90;
    const pathData = getPieSlice(percentDec, currentMemOffset, radius);
    const labelCoords = getLabelCoords(percentDec, currentMemOffset, radius * 0.65);

    const sliceData = { ...member, percentage, color: getMemberColor(index), pathData, labelCoords, index };
    currentMemOffset += percentDec;
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

      {/* 🚨 순서 변경 1: 요약 통계(총 집안일, 일평균, 완료율)가 가장 먼저 배치됨 */}
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
          <p className="stat-title">완료율</p>
          <p className="stat-value">{Math.round(data.participationRate)}<span>%</span></p>
        </div>
      </div>

      {/* 🚨 순서 변경 2: 구성원별 참여도를 원형 그래프(Pie Chart)로 변경하여 배치 */}
      <div className="chart-card">
        <h3>구성원별 참여도</h3>
        {totalMemberCount === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>아직 완료된 집안일이 없습니다.</p>
        ) : (
          <div className="pie-chart-wrapper">
            <svg viewBox="0 0 200 200" className={`interactive-pie ${showCharts ? 'animate' : ''}`}>
              {memberPieSlices.map((slice) => (
                <g
                  key={slice.nickname}
                  className={`pie-slice-group ${hoveredMember === slice.nickname ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredMember(slice.nickname)}
                  onMouseLeave={() => setHoveredMember(null)}
                >
                  <path d={slice.pathData} fill={slice.color} className="pie-path" />
                  {/* 조각이 너무 작으면 텍스트를 숨기거나 표시하는 로직 (선택적) */}
                  {slice.percentage > 5 && (
                    <>
                      <text x={slice.labelCoords.x} y={slice.labelCoords.y - 4} className="pie-label-text">
                        {slice.nickname}
                      </text>
                      <text x={slice.labelCoords.x} y={slice.labelCoords.y + 12} className="pie-label-percent">
                        {Math.round(slice.percentage)}%
                      </text>
                    </>
                  )}
                </g>
              ))}
            </svg>
            
            <div className="pie-legend">
              {memberPieSlices.map((slice, idx) => (
                <div 
                  key={idx} 
                  className={`legend-item ${hoveredMember === slice.nickname ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredMember(slice.nickname)}
                  onMouseLeave={() => setHoveredMember(null)}
                  // 🚨 전체를 가로 정렬하되, 간격을 살짝 줍니다.
                  style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}
                >
                  {/* 왼쪽 색상 동그라미 */}
                  <span className="legend-color" style={{ backgroundColor: slice.color, width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, marginRight: '10px' }}></span>
                  
                  {/* 🚨 닉네임과 횟수를 세로(column)로 배치하는 영역 */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="legend-name" style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                      {slice.nickname}
                    </span>
                    <span className="legend-percent" style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                      {Math.round(slice.percentage)}% ({slice.count}회)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🚨 순서 변경 3: 카테고리별 분포 그래프를 가장 아래로 이동 */}
      <div className="chart-card">
        <h3>카테고리별 분포</h3>
        {data.totalCount === 0 ? (
           <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>아직 완료된 집안일이 없습니다.</p>
        ) : (
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
                  {slice.percentage > 5 && (
                    <>
                      <text x={slice.labelCoords.x} y={slice.labelCoords.y - 4} className="pie-label-text">
                        {slice.categoryName}
                      </text>
                      <text x={slice.labelCoords.x} y={slice.labelCoords.y + 12} className="pie-label-percent">
                        {Math.round(slice.percentage)}%
                      </text>
                    </>
                  )}
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
                  <span className="legend-percent">{Math.round(slice.percentage)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;