import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Pause, Play, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { OracleVoiceSettings } from "@/lib/oracles";
import { analyzeEmotion, getEmotionVoiceModifier, EmotionType } from "@/lib/emotionAnalysis";

interface TextToSpeechProps {
  text: string;
  className?: string;
  autoPlay?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  voiceSettings?: OracleVoiceSettings;
  oracleName?: string;
  enableEmotionAnalysis?: boolean; // 感情分析を有効にするかどうか
}

// 読み仮名変換テーブル（難読漢字の読み方を正しく設定）
const READING_MAP: Record<string, string> = {
  '蒼真': 'そうま',
  '玲蘭': 'れいら',
  '朔夜': 'さくや',
  '灯': 'あかり',
  '結衣': 'ゆい',
  '玄': 'げん',
  '紫苑': 'しおん',
  '星蘭': 'せいらん',
};

// テキストの読み仮名を変換
function convertToReadableText(text: string): string {
  let result = text;
  for (const [kanji, reading] of Object.entries(READING_MAP)) {
    result = result.replace(new RegExp(kanji, 'g'), reading);
  }
  return result;
}

// 感情タイプに応じたアイコンの色を取得
function getEmotionColor(emotion: EmotionType): string {
  switch (emotion) {
    case 'positive':
      return 'text-yellow-400';
    case 'negative':
      return 'text-blue-400';
    case 'mystical':
      return 'text-purple-400';
    case 'warning':
      return 'text-orange-400';
    default:
      return 'text-gray-400';
  }
}

export function TextToSpeech({ 
  text, 
  className, 
  autoPlay = false,
  onStart,
  onEnd,
  voiceSettings,
  oracleName,
  enableEmotionAnalysis = true
}: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('neutral');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-play if enabled
  useEffect(() => {
    if (autoPlay && text && !isPlaying) {
      speak();
    }
  }, [autoPlay, text]);

  // Find the best matching voice based on voice type preference
  const findBestVoice = useCallback((voices: SpeechSynthesisVoice[], voiceType?: 'female' | 'male' | 'neutral') => {
    // Filter Japanese voices
    const japaneseVoices = voices.filter(voice => 
      voice.lang.startsWith('ja') || voice.lang.includes('JP')
    );

    if (japaneseVoices.length === 0) return null;

    // If no preference, return first Japanese voice
    if (!voiceType || voiceType === 'neutral') {
      return japaneseVoices[0];
    }

    // Try to find voice matching the type based on common naming patterns
    const femalePatterns = ['female', 'woman', 'kyoko', 'haruka', 'nanami', 'mei', 'ayumi', 'misaki', 'sayaka', 'keiko', 'mizuki'];
    const malePatterns = ['male', 'man', 'ichiro', 'takumi', 'otoya', 'kenta', 'show', 'takeshi'];

    const patterns = voiceType === 'female' ? femalePatterns : malePatterns;
    
    // Search for matching voice
    for (const voice of japaneseVoices) {
      const voiceName = voice.name.toLowerCase();
      if (patterns.some(pattern => voiceName.includes(pattern))) {
        return voice;
      }
    }

    // If no match found, try to guess by voice name characteristics
    // Female names often end with 'a', 'i', 'ko', 'mi'
    // Male names often end with 'o', 'u', 'shi', 'ta'
    if (voiceType === 'female') {
      const femaleVoice = japaneseVoices.find(v => {
        const name = v.name.toLowerCase();
        return name.endsWith('a') || name.endsWith('i') || name.endsWith('ko') || name.endsWith('mi');
      });
      if (femaleVoice) return femaleVoice;
    } else if (voiceType === 'male') {
      const maleVoice = japaneseVoices.find(v => {
        const name = v.name.toLowerCase();
        return name.endsWith('o') || name.endsWith('u') || name.endsWith('shi') || name.endsWith('ta');
      });
      if (maleVoice) return maleVoice;
    }

    // Fallback to first Japanese voice
    return japaneseVoices[0];
  }, []);

  const speak = useCallback(() => {
    if (!text) return;

    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      setError("お使いのブラウザは音声読み上げに対応していません。");
      return;
    }

    setError(null);
    setIsLoading(true);

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Convert text to readable format (handle difficult kanji)
    const readableText = convertToReadableText(text);
    
    const utterance = new SpeechSynthesisUtterance(readableText);
    utteranceRef.current = utterance;

    // Configure voice settings
    utterance.lang = 'ja-JP';
    
    // Base voice settings
    let basePitch = voiceSettings?.pitch ?? 1.0;
    let baseRate = voiceSettings?.rate ?? 0.9;
    let baseVolume = voiceSettings?.volume ?? 1.0;
    
    // Apply emotion analysis if enabled
    if (enableEmotionAnalysis) {
      const emotionAnalysis = analyzeEmotion(text);
      const modifier = getEmotionVoiceModifier(emotionAnalysis.emotion, emotionAnalysis.confidence);
      
      // Apply modifiers
      basePitch = Math.max(0.5, Math.min(2.0, basePitch + modifier.pitchModifier));
      baseRate = Math.max(0.5, Math.min(2.0, baseRate + modifier.rateModifier));
      baseVolume = Math.max(0, Math.min(1.0, baseVolume + modifier.volumeModifier));
      
      setCurrentEmotion(emotionAnalysis.emotion);
    }
    
    utterance.pitch = basePitch;
    utterance.rate = baseRate;
    utterance.volume = baseVolume;

    // Get voices and find the best match
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = findBestVoice(voices, voiceSettings?.voiceType);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setIsPaused(false);
      onStart?.();
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsLoading(false);
      setIsPlaying(false);
      setIsPaused(false);
      if (event.error !== 'canceled') {
        setError("音声の再生中にエラーが発生しました。");
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [text, onStart, onEnd, voiceSettings, findBestVoice, enableEmotionAnalysis]);

  const pause = useCallback(() => {
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused]);

  const resume = useCallback(() => {
    if (isPlaying && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPlaying, isPaused]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      speak();
    }
  }, [isPlaying, isPaused, speak, pause, resume]);

  if (!text) return null;

  // Generate tooltip with oracle name if available
  const playTooltip = oracleName ? `${oracleName}の声で読み上げ` : "読み上げ";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {isLoading ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled
          className="h-7 w-7 rounded-full"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
        </Button>
      ) : isPlaying ? (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={togglePlayPause}
            className="h-7 w-7 rounded-full hover:bg-primary/20"
            title={isPaused ? "再開" : "一時停止"}
          >
            {isPaused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={stop}
            className="h-7 w-7 rounded-full hover:bg-destructive/20 text-destructive"
            title="停止"
          >
            <VolumeX className="w-4 h-4" />
          </Button>
          {/* 感情インジケーター */}
          {enableEmotionAnalysis && currentEmotion !== 'neutral' && (
            <Sparkles className={cn("w-3 h-3 animate-pulse", getEmotionColor(currentEmotion))} />
          )}
        </>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={speak}
          className="h-7 w-7 rounded-full hover:bg-primary/20"
          title={playTooltip}
        >
          <Volume2 className="w-4 h-4" />
        </Button>
      )}
      
      {error && (
        <span className="text-xs text-red-400 max-w-[150px] truncate" title={error}>
          {error}
        </span>
      )}
    </div>
  );
}

// Hook for programmatic control with oracle voice settings
export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Find the best matching voice based on voice type preference
  const findBestVoice = useCallback((voices: SpeechSynthesisVoice[], voiceType?: 'female' | 'male' | 'neutral', lang: string = 'ja') => {
    // Filter voices by language
    const langVoices = voices.filter(voice => 
      voice.lang.startsWith(lang)
    );

    if (langVoices.length === 0) return null;

    // If no preference, return first matching voice
    if (!voiceType || voiceType === 'neutral') {
      return langVoices[0];
    }

    // Try to find voice matching the type
    const femalePatterns = ['female', 'woman', 'kyoko', 'haruka', 'nanami', 'mei', 'ayumi', 'misaki', 'sayaka', 'keiko', 'mizuki'];
    const malePatterns = ['male', 'man', 'ichiro', 'takumi', 'otoya', 'kenta', 'show', 'takeshi'];

    const patterns = voiceType === 'female' ? femalePatterns : malePatterns;
    
    for (const voice of langVoices) {
      const voiceName = voice.name.toLowerCase();
      if (patterns.some(pattern => voiceName.includes(pattern))) {
        return voice;
      }
    }

    return langVoices[0];
  }, []);

  const speak = useCallback((text: string, options?: {
    lang?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    voiceType?: 'female' | 'male' | 'neutral';
    enableEmotionAnalysis?: boolean;
    onEnd?: () => void;
  }) => {
    if (!text || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Convert text to readable format
    let readableText = text;
    const READING_MAP: Record<string, string> = {
      '蒼真': 'そうま',
      '玲蘭': 'れいら',
      '朔夜': 'さくや',
      '灯': 'あかり',
      '結衣': 'ゆい',
      '玄': 'げん',
      '紫苑': 'しおん',
      '星蘭': 'せいらん',
    };
    for (const [kanji, reading] of Object.entries(READING_MAP)) {
      readableText = readableText.replace(new RegExp(kanji, 'g'), reading);
    }

    const utterance = new SpeechSynthesisUtterance(readableText);
    utteranceRef.current = utterance;

    utterance.lang = options?.lang || 'ja-JP';
    
    // Base settings
    let rate = options?.rate || 0.9;
    let pitch = options?.pitch || 1.0;
    let volume = options?.volume || 1.0;
    
    // Apply emotion analysis if enabled
    if (options?.enableEmotionAnalysis !== false) {
      const emotionAnalysis = analyzeEmotion(text);
      const modifier = getEmotionVoiceModifier(emotionAnalysis.emotion, emotionAnalysis.confidence);
      
      pitch = Math.max(0.5, Math.min(2.0, pitch + modifier.pitchModifier));
      rate = Math.max(0.5, Math.min(2.0, rate + modifier.rateModifier));
      volume = Math.max(0, Math.min(1.0, volume + modifier.volumeModifier));
    }
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Find appropriate voice
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = findBestVoice(voices, options?.voiceType, utterance.lang.split('-')[0]);
    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      options?.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }, [findBestVoice]);

  const pause = useCallback(() => {
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused]);

  const resume = useCallback(() => {
    if (isPlaying && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPlaying, isPaused]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return { speak, pause, resume, stop, isPlaying, isPaused };
}
