import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';

interface Member {
  name: string;
  type: string;
}

interface MBTIGroupRadarChartProps {
  members: Member[];
}

// 各次元のスコアを計算
function calculateDimensionScores(members: Member[]) {
  const types = members.map(m => m.type);
  const total = types.length;
  
  if (total === 0) return { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  
  return {
    E: (types.filter(t => t[0] === 'E').length / total) * 100,
    I: (types.filter(t => t[0] === 'I').length / total) * 100,
    S: (types.filter(t => t[1] === 'S').length / total) * 100,
    N: (types.filter(t => t[1] === 'N').length / total) * 100,
    T: (types.filter(t => t[2] === 'T').length / total) * 100,
    F: (types.filter(t => t[2] === 'F').length / total) * 100,
    J: (types.filter(t => t[3] === 'J').length / total) * 100,
    P: (types.filter(t => t[3] === 'P').length / total) * 100,
  };
}

export function MBTIGroupRadarChart({ members }: MBTIGroupRadarChartProps) {
  const scores = calculateDimensionScores(members);
  
  // レーダーチャートの頂点（8つの次元）
  const dimensions = [
    { key: 'E', label: '外向 (E)', color: '#f97316' },
    { key: 'N', label: '直感 (N)', color: '#a855f7' },
    { key: 'F', label: '感情 (F)', color: '#ec4899' },
    { key: 'P', label: '柔軟 (P)', color: '#22c55e' },
    { key: 'I', label: '内向 (I)', color: '#3b82f6' },
    { key: 'S', label: '感覚 (S)', color: '#06b6d4' },
    { key: 'T', label: '思考 (T)', color: '#eab308' },
    { key: 'J', label: '計画 (J)', color: '#8b5cf6' },
  ];
  
  const centerX = 150;
  const centerY = 150;
  const maxRadius = 100;
  
  // 各頂点の座標を計算
  const getPoint = (index: number, value: number) => {
    const angle = (2 * Math.PI * index) / dimensions.length - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };
  
  // ポリゴンのパスを生成
  const polygonPoints = dimensions
    .map((dim, i) => {
      const point = getPoint(i, scores[dim.key as keyof typeof scores]);
      return `${point.x},${point.y}`;
    })
    .join(' ');
  
  // グリッド線のパスを生成
  const gridLevels = [25, 50, 75, 100];
  
  if (members.length < 2) {
    return null;
  }

  return (
    <Card className="border-violet-500/20 bg-violet-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <PieChart className="w-4 h-4 text-violet-400" />
          グループ特性レーダー
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <svg width="300" height="300" viewBox="0 0 300 300">
            {/* グリッド線 */}
            {gridLevels.map((level) => {
              const points = dimensions
                .map((_, i) => {
                  const point = getPoint(i, level);
                  return `${point.x},${point.y}`;
                })
                .join(' ');
              return (
                <polygon
                  key={`grid-${level}`}
                  points={points}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeWidth="1"
                />
              );
            })}
            
            {/* 軸線 */}
            {dimensions.map((_, i) => {
              const point = getPoint(i, 100);
              return (
                <line
                  key={`axis-${i}`}
                  x1={centerX}
                  y1={centerY}
                  x2={point.x}
                  y2={point.y}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeWidth="1"
                />
              );
            })}
            
            {/* データポリゴン */}
            <polygon
              points={polygonPoints}
              fill="url(#radarGradient)"
              fillOpacity="0.3"
              stroke="url(#radarGradient)"
              strokeWidth="2"
            />
            
            {/* グラデーション定義 */}
            <defs>
              <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
            
            {/* データポイント */}
            {dimensions.map((dim, i) => {
              const value = scores[dim.key as keyof typeof scores];
              const point = getPoint(i, value);
              return (
                <circle
                  key={`point-${i}`}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={dim.color}
                  stroke="white"
                  strokeWidth="1"
                />
              );
            })}
            
            {/* ラベル */}
            {dimensions.map((dim, i) => {
              const labelPoint = getPoint(i, 120);
              const value = scores[dim.key as keyof typeof scores];
              return (
                <g key={`label-${i}`}>
                  <text
                    x={labelPoint.x}
                    y={labelPoint.y - 6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={dim.color}
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {dim.label}
                  </text>
                  <text
                    x={labelPoint.x}
                    y={labelPoint.y + 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="currentColor"
                    fillOpacity="0.6"
                    fontSize="9"
                  >
                    {Math.round(value)}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* 説明 */}
        <p className="mt-3 text-xs text-center text-muted-foreground">
          グループ全体の性格特性の分布を表示しています。
          バランスが取れているほど多様な視点を持つチームです。
        </p>
      </CardContent>
    </Card>
  );
}
