import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, ChevronDown, ChevronUp, MessageCircle, Calendar } from "lucide-react";
import { oracles } from "@/lib/oracles";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface MemoryDisplayProps {
  oracleId: string;
  onContinueConversation?: (topic: string) => void;
}

export function MemoryDisplay({ oracleId, onContinueConversation }: MemoryDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const oracle = oracles.find(o => o.id === oracleId);
  
  // @ts-ignore - API exists but type not generated yet
  const { data: summaries, isLoading } = (trpc.chat as any).getConversationSummaries?.useQuery?.({ 
    oracleId, 
    limit: 5 
  }) || { data: [], isLoading: false };
  
  // @ts-ignore
  const { data: topics } = (trpc.chat as any).getUserTopics?.useQuery?.({ oracleId }) || { data: [] };
  
  if (isLoading || (!summaries?.length && !topics?.length)) {
    return null;
  }
  
  const latestSummary = summaries?.[0];
  const recentTopics = topics?.slice(0, 5) || [];
  
  return (
    <Card className="glass-card border-white/10 mb-4">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span>{oracle?.name}があなたのことを覚えています</span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {!expanded && latestSummary && (
        <CardContent className="pt-0 pb-3">
          <div className="text-sm text-muted-foreground line-clamp-2">
            前回: {latestSummary.summary}
          </div>
          <div className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(latestSummary.createdAt), { addSuffix: true, locale: ja })}
          </div>
        </CardContent>
      )}
      
      {expanded && (
        <CardContent className="space-y-4">
          {/* Recent Topics */}
          {recentTopics.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-400" />
                よく相談するテーマ
              </div>
              <div className="flex flex-wrap gap-2">
                {recentTopics.map((topic: any, index: number) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => onContinueConversation?.(topic.topic)}
                  >
                    {topic.topic}
                    <span className="ml-1 text-xs text-muted-foreground">({topic.count}回)</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Conversation History */}
          {summaries?.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-400" />
                過去の相談履歴
              </div>
              <div className="space-y-2">
                {summaries.map((summary: any) => (
                  <div 
                    key={summary.id} 
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => onContinueConversation?.(summary.mainTopics?.[0] || "")}
                  >
                    <div className="text-sm line-clamp-2">{summary.summary}</div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(summary.createdAt), { addSuffix: true, locale: ja })}
                      </div>
                      {summary.emotionalState && (
                        <Badge variant="outline" className="text-xs">
                          {summary.emotionalState}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Memory Message */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
            <div className="text-sm italic text-muted-foreground">
              「{oracle?.name}は、あなたとの{summaries?.length || 0}回の会話を覚えています。
              いつでも前回の続きから話せますよ。」
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Compact version for showing in chat header
 */
export function MemoryBadge({ oracleId }: { oracleId: string }) {
  // @ts-ignore
  const { data: summaries } = (trpc.chat as any).getConversationSummaries?.useQuery?.({ 
    oracleId, 
    limit: 1 
  }) || { data: [] };
  
  if (!summaries?.length) {
    return null;
  }
  
  return (
    <Badge variant="outline" className="text-xs flex items-center gap-1">
      <Brain className="w-3 h-3 text-purple-400" />
      記憶あり
    </Badge>
  );
}
