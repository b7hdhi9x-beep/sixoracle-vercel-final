import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network } from 'lucide-react';

interface Member {
  name: string;
  type: string;
}

interface CompatibilityPair {
  member1: string;
  member2: string;
  score: number;
}

interface MBTICompatibilityNetworkProps {
  members: Member[];
  matrix: CompatibilityPair[];
}

// タイプに基づく色を取得
const getTypeColor = (type: string): string => {
  const firstLetter = type[0];
  const secondLetter = type[1];
  
  // 分析家（NT）: 紫
  if (secondLetter === 'N' && type[2] === 'T') return '#a855f7';
  // 外交官（NF）: 緑
  if (secondLetter === 'N' && type[2] === 'F') return '#22c55e';
  // 番人（SJ）: 青
  if (secondLetter === 'S' && type[3] === 'J') return '#3b82f6';
  // 探検家（SP）: 黄
  if (secondLetter === 'S' && type[3] === 'P') return '#eab308';
  
  return '#6b7280';
};

// スコアに基づく線の色を取得
const getLineColor = (score: number): string => {
  if (score >= 5) return '#ec4899'; // ピンク - 最高
  if (score >= 4) return '#22c55e'; // 緑 - 良い
  if (score >= 3) return '#eab308'; // 黄 - 普通
  if (score >= 2) return '#f97316'; // オレンジ - 要努力
  return '#ef4444'; // 赤 - 挑戦的
};

// スコアに基づく線の太さを取得
const getLineWidth = (score: number): number => {
  if (score >= 5) return 4;
  if (score >= 4) return 3;
  if (score >= 3) return 2;
  return 1;
};

export function MBTICompatibilityNetwork({ members, matrix }: MBTICompatibilityNetworkProps) {
  // ノードの位置を計算（円形配置）
  const nodePositions = useMemo(() => {
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    
    return members.map((member, index) => {
      const angle = (2 * Math.PI * index) / members.length - Math.PI / 2;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        member,
      };
    });
  }, [members]);

  // メンバー名からインデックスを取得するマップ
  const memberIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    members.forEach((m, i) => map.set(m.name, i));
    return map;
  }, [members]);

  if (members.length < 2) {
    return null;
  }

  return (
    <Card className="border-cyan-500/20 bg-cyan-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          相性ネットワーク図
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <svg width="300" height="300" viewBox="0 0 300 300">
            {/* 背景の円 */}
            <circle
              cx="150"
              cy="150"
              r="100"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            
            {/* 接続線 */}
            {matrix.map((pair, index) => {
              const idx1 = memberIndexMap.get(pair.member1);
              const idx2 = memberIndexMap.get(pair.member2);
              
              if (idx1 === undefined || idx2 === undefined) return null;
              
              const pos1 = nodePositions[idx1];
              const pos2 = nodePositions[idx2];
              
              return (
                <line
                  key={`line-${index}`}
                  x1={pos1.x}
                  y1={pos1.y}
                  x2={pos2.x}
                  y2={pos2.y}
                  stroke={getLineColor(pair.score)}
                  strokeWidth={getLineWidth(pair.score)}
                  strokeOpacity={0.6}
                  strokeLinecap="round"
                />
              );
            })}
            
            {/* ノード */}
            {nodePositions.map((pos, index) => (
              <g key={`node-${index}`}>
                {/* ノードの背景円 */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="28"
                  fill={getTypeColor(pos.member.type)}
                  fillOpacity="0.2"
                  stroke={getTypeColor(pos.member.type)}
                  strokeWidth="2"
                />
                {/* MBTIタイプ */}
                <text
                  x={pos.x}
                  y={pos.y - 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={getTypeColor(pos.member.type)}
                  fontSize="12"
                  fontWeight="bold"
                >
                  {pos.member.type}
                </text>
                {/* 名前 */}
                <text
                  x={pos.x}
                  y={pos.y + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="currentColor"
                  fillOpacity="0.7"
                  fontSize="9"
                >
                  {pos.member.name.length > 6 ? pos.member.name.slice(0, 6) + '...' : pos.member.name}
                </text>
              </g>
            ))}
          </svg>
        </div>
        
        {/* 凡例 */}
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 rounded" style={{ backgroundColor: '#ec4899' }} />
            <span className="text-muted-foreground">最高</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 rounded" style={{ backgroundColor: '#22c55e' }} />
            <span className="text-muted-foreground">良い</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 rounded" style={{ backgroundColor: '#eab308' }} />
            <span className="text-muted-foreground">普通</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 rounded" style={{ backgroundColor: '#f97316' }} />
            <span className="text-muted-foreground">要努力</span>
          </div>
        </div>
        
        {/* タイプグループ凡例 */}
        <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#a855f7' }} />
            <span className="text-muted-foreground">分析家(NT)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
            <span className="text-muted-foreground">外交官(NF)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
            <span className="text-muted-foreground">番人(SJ)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#eab308' }} />
            <span className="text-muted-foreground">探検家(SP)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
