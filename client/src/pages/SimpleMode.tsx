import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { oracles, getOracleById } from "@/lib/oracles";
import { Mic, MicOff, Phone, PhoneOff, Volume2, ArrowLeft, Loader2, HelpCircle, Star, Type, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { VoiceTutorial, useVoiceTutorial } from "@/components/VoiceTutorial";
import { FontSizeProvider, useFontSize, useFontSizeClasses, FontSize } from "@/contexts/FontSizeContext";
import { FontSizeSelectorCompact } from "@/components/FontSizeSelector";
import { useFavoriteOracles } from "@/hooks/useFavoriteOracles";
import { VolumeProvider, useVolume } from "@/contexts/VolumeContext";
import { VolumeSelectorCompact } from "@/components/VolumeSelector";
import { ContrastProvider, useContrast, getContrastClasses } from "@/contexts/ContrastContext";
import { ContrastSelectorCompact } from "@/components/ContrastSelector";
import { SimpleHistory, useSimpleHistory } from "@/components/SimpleHistory";

import { analyzeEmotion, getEmotionVoiceModifier } from "@/lib/emotionAnalysis";

// Inner component that uses font size context
function SimpleModeContent() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Tutorial
  const { showTutorial, openTutorial, closeTutorial, completeTutorial } = useVoiceTutorial();
  
  // Font size
  const { fontSize } = useFontSize();
  
  // Favorites
  const { favorites, isFavorite, toggleFavorite, hasFavorites } = useFavoriteOracles();
  
  // Volume
  const { getVolumeValue } = useVolume();
  
  // Contrast
  const { contrast } = useContrast();
  const contrastClasses = getContrastClasses(contrast);
  
  // History
  const { isOpen: isHistoryOpen, openHistory, closeHistory } = useSimpleHistory();
  

  
  // State
  const [selectedOracle, setSelectedOracle] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [oracleResponse, setOracleResponse] = useState<string>("");
  const [status, setStatus] = useState<string>("占い師を選んでください");
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // API mutations
  const sendMessageMutation = trpc.chat.send.useMutation();
  const transcribeMutation = trpc.voice.transcribe.useMutation();

  // All oracles available in simple mode
  const simpleOracles = oracles;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Auto-read oracle response
  useEffect(() => {
    if (oracleResponse && selectedOracle) {
      speakText(oracleResponse);
    }
  }, [oracleResponse, selectedOracle]);

  // Get oracle voice settings
  const getOracleVoiceSettings = useCallback((oracleId: string) => {
    const oracle = getOracleById(oracleId);
    return oracle?.voiceSettings;
  }, []);

  // Text-to-speech with oracle voice - optimized for easy listening with emotion analysis
  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    // Convert difficult kanji to readable form
    const READING_MAP: Record<string, string> = {
      '蒼真': 'そうま',
      '玖蘭': 'れいら',
      '朔夜': 'さくや',
      '灸': 'あかり',
      '結衣': 'ゆい',
      '玄': 'げん',
      '紫苑': 'しおん',
      '星蘭': 'せいらん',
    };
    let readableText = text;
    for (const [kanji, reading] of Object.entries(READING_MAP)) {
      readableText = readableText.replace(new RegExp(kanji, 'g'), reading);
    }

    const utterance = new SpeechSynthesisUtterance(readableText);
    utteranceRef.current = utterance;

    utterance.lang = 'ja-JP';
    
    // Apply user's volume setting
    const userVolume = getVolumeValue();
    
    // Base rate for easy listening (slower than normal for elderly users)
    const EASY_LISTENING_RATE = 0.75; // 25% slower than normal for clarity
    
    // Analyze emotion in the text
    const emotionAnalysis = analyzeEmotion(text);
    const emotionModifier = getEmotionVoiceModifier(emotionAnalysis.emotion, emotionAnalysis.confidence);
    
    // Apply oracle voice settings with auto-adjusted rate and emotion modifiers
    if (selectedOracle) {
      const voiceSettings = getOracleVoiceSettings(selectedOracle);
      if (voiceSettings) {
        // Apply emotion modifier to pitch
        const basePitch = voiceSettings.pitch + emotionModifier.pitchModifier;
        utterance.pitch = Math.max(0.5, Math.min(2.0, basePitch));
        
        // Auto-adjust rate: use oracle's relative speed but cap for easy listening
        // Also apply emotion modifier (slower for negative, faster for positive)
        const baseRate = voiceSettings.rate * EASY_LISTENING_RATE + emotionModifier.rateModifier * 0.5;
        const adjustedRate = Math.max(0.5, Math.min(0.85, baseRate));
        utterance.rate = adjustedRate;
        
        // Apply volume with emotion modifier
        utterance.volume = Math.max(0, Math.min(1.0, userVolume + emotionModifier.volumeModifier));
      }
    } else {
      utterance.rate = EASY_LISTENING_RATE;
      utterance.pitch = 1.0;
      utterance.volume = userVolume;
    }

    // Find Japanese voice matching oracle's gender
    const voices = window.speechSynthesis.getVoices();
    const japaneseVoices = voices.filter(v => v.lang.startsWith('ja'));
    
    if (japaneseVoices.length > 0) {
      // Try to match voice to oracle's gender
      if (selectedOracle) {
        const voiceSettings = getOracleVoiceSettings(selectedOracle);
        if (voiceSettings) {
          // Find voice matching gender preference
          let matchedVoice = japaneseVoices.find(v => {
            const voiceName = v.name.toLowerCase();
            if (voiceSettings.voiceType === 'female') {
              // Look for female voice indicators
              return voiceName.includes('female') || 
                     voiceName.includes('女') || 
                     voiceName.includes('haruka') ||
                     voiceName.includes('sayaka') ||
                     voiceName.includes('kyoko') ||
                     voiceName.includes('o-ren') ||
                     voiceName.includes('mei-jia');
            } else if (voiceSettings.voiceType === 'male') {
              // Look for male voice indicators
              return voiceName.includes('male') || 
                     voiceName.includes('男') || 
                     voiceName.includes('ichiro') ||
                     voiceName.includes('takeru') ||
                     voiceName.includes('otoya');
            }
            return false;
          });
          
          // If no gender-specific voice found, use first available
          utterance.voice = matchedVoice || japaneseVoices[0];
        } else {
          utterance.voice = japaneseVoices[0];
        }
      } else {
        utterance.voice = japaneseVoices[0];
      }
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setStatus("マイクボタンを押して話してください");
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [selectedOracle, getOracleVoiceSettings, getVolumeValue]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await processAudio(audioBlob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus("話してください...");
    } catch (error) {
      console.error("Recording error:", error);
      setStatus("マイクの使用が許可されていません");
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus("処理中...");
    }
  }, []);

  // Process recorded audio
  const processAudio = useCallback(async (audioBlob: Blob) => {
    if (!selectedOracle) return;

    setIsProcessing(true);
    setStatus("音声を認識中...");

    try {
      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;

      // Transcribe
      const transcription = await transcribeMutation.mutateAsync({
        audioBase64: base64Audio,
        mimeType: 'audio/webm',
        language: 'ja',
      });

      if (!transcription.text || transcription.text.trim() === '') {
        setStatus("音声が認識できませんでした。もう一度お試しください。");
        setIsProcessing(false);
        return;
      }

      setCurrentMessage(transcription.text);
      setStatus("占い師が回答中...");

      // Send to oracle
      const response = await sendMessageMutation.mutateAsync({
        oracleId: selectedOracle,
        message: transcription.text,
      });

      setOracleResponse(response.response);
      setStatus("回答を読み上げ中...");
    } catch (error) {
      console.error("Processing error:", error);
      setStatus("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedOracle, transcribeMutation, sendMessageMutation]);

  // Select oracle
  const handleSelectOracle = useCallback((oracleId: string) => {
    setSelectedOracle(oracleId);
    setOracleResponse("");
    setCurrentMessage("");

    
    const oracle = getOracleById(oracleId);
    if (oracle) {
      const greeting = `${oracle.name}です。何でもお聞きください。`;
      setStatus("占い師と接続しました");
      setTimeout(() => speakText(greeting), 500);
    }
  }, [speakText]);

  // End call
  const handleEndCall = useCallback(() => {
    stopSpeaking();
    setSelectedOracle(null);
    setOracleResponse("");
    setCurrentMessage("");
    setStatus("占い師を選んでください");

  }, [stopSpeaking]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen text-white",
      contrast === "normal" && "bg-gradient-to-b from-indigo-950 to-black",
      contrast === "high-dark" && "bg-black",
      contrast === "high-light" && "bg-white text-black"
    )}>
      {/* Header */}
      <header className={cn(
        "p-4 flex items-center justify-between border-b",
        contrast === "normal" && "border-white/10",
        contrast === "high-dark" && "border-white",
        contrast === "high-light" && "border-black"
      )}>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setLocation("/")}
          className={cn(
            "text-xl p-6",
            contrast === "high-light" ? "text-black hover:bg-black/10" : "text-white hover:bg-white/10"
          )}
        >
          <ArrowLeft className="w-8 h-8 mr-2" />
          戻る
        </Button>
        <h1 className={cn(
          "text-2xl font-bold",
          contrast === "high-light" ? "text-blue-800" : "text-amber-400"
        )}>かんたん占い</h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="lg"
            onClick={openHistory}
            className={cn(
              "text-xl p-6",
              contrast === "high-light" ? "text-black hover:bg-black/10" : "text-white hover:bg-white/10"
            )}
          >
            <History className="w-8 h-8" />
          </Button>
          <ContrastSelectorCompact />
          <VolumeSelectorCompact />
          <FontSizeSelectorCompact />
          <Button
            variant="ghost"
            size="lg"
            onClick={openTutorial}
            className={cn(
              "text-xl p-6",
              contrast === "high-light" ? "text-black hover:bg-black/10" : "text-white hover:bg-white/10"
            )}
          >
            <HelpCircle className="w-8 h-8" />
          </Button>
        </div>
      </header>

      {/* Voice Tutorial */}
      <VoiceTutorial
        isOpen={showTutorial}
        onClose={closeTutorial}
        onComplete={completeTutorial}
      />

      {/* History Modal */}
      <SimpleHistory
        isOpen={isHistoryOpen}
        onClose={closeHistory}
        fontSize={fontSize}
        contrast={contrast}
        onSpeak={speakText}
      />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Status Display */}
        <div className="text-center mb-8">
          <p className="text-2xl md:text-3xl font-medium text-amber-200 min-h-[3rem]">
            {status}
          </p>
        </div>

        {!selectedOracle ? (
          /* Oracle Selection - Phone Style */
          <div className="space-y-6">
            {/* Favorite Oracles Section */}
            {hasFavorites && (
              <div className="mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  <p className="text-xl text-yellow-400 font-medium">お気に入り</p>
                </div>
                <div className="grid gap-4">
                  {favorites.map((favId) => {
                    const favOracle = oracles.find(o => o.id === favId);
                    if (!favOracle) return null;
                    return (
                      <button
                        key={favOracle.id}
                        onClick={() => handleSelectOracle(favOracle.id)}
                        className={cn(
                          "w-full p-6 rounded-2xl border-4 transition-all duration-300",
                          "bg-gradient-to-r hover:scale-[1.02] active:scale-[0.98]",
                          favOracle.color,
                          "border-yellow-400/50 hover:border-yellow-400"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                          </div>
                          <div className="text-left flex-1">
                            <h3 className="text-2xl font-bold text-white">{favOracle.name}</h3>
                            <p className="text-base text-white/80">{favOracle.role}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-center text-xl text-gray-300 mb-8">
              {hasFavorites ? "または他の占い師を選ぶ" : "相談したい占い師を選んでください"}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {simpleOracles.map((oracle) => (
                <div key={oracle.id} className="relative">
                  <button
                    onClick={() => handleSelectOracle(oracle.id)}
                    className={cn(
                      "w-full p-6 rounded-2xl border-4 transition-all duration-300",
                      "bg-gradient-to-r hover:scale-[1.02] active:scale-[0.98]",
                      oracle.color,
                      isFavorite(oracle.id) ? "border-yellow-400/50" : "border-white/20 hover:border-amber-400/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <Phone className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="text-2xl font-bold text-white mb-1">{oracle.name}</h3>
                        <p className="text-sm text-white/80">{oracle.role}</p>
                      </div>
                    </div>
                  </button>
                  {/* Favorite Star Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(oracle.id);
                    }}
                    className={cn(
                      "absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center",
                      "transition-all duration-200 hover:scale-110",
                      isFavorite(oracle.id) 
                        ? "bg-yellow-400 text-yellow-900" 
                        : "bg-white/20 text-white hover:bg-white/30"
                    )}
                  >
                    <Star className={cn(
                      "w-6 h-6",
                      isFavorite(oracle.id) && "fill-current"
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Active Call Interface */
          <div className="space-y-8">
            {/* Oracle Info */}
            <div className="text-center">
              {(() => {
                const oracle = getOracleById(selectedOracle);
                return oracle ? (
                  <div className={cn(
                    "inline-block px-8 py-4 rounded-2xl bg-gradient-to-r",
                    oracle.color
                  )}>
                    <h2 className="text-3xl font-bold text-white">{oracle.name}</h2>
                    <p className="text-lg text-white/80">{oracle.role}</p>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Message Display */}
            {currentMessage && (
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                <p className="text-sm text-amber-400 mb-2">あなた:</p>
                <p className="text-xl text-white">{currentMessage}</p>
              </div>
            )}

            {oracleResponse && (
              <div className="bg-amber-900/30 rounded-2xl p-6 border border-amber-400/30">
                <p className="text-sm text-amber-400 mb-2">占い師:</p>
                <p className="text-xl text-white leading-relaxed">{oracleResponse}</p>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex flex-col items-center gap-6 pt-8">
              {/* Main Mic Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing || isSpeaking}
                className={cn(
                  "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300",
                  "shadow-2xl transform active:scale-95",
                  isRecording
                    ? "bg-red-500 animate-pulse"
                    : isProcessing || isSpeaking
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-400"
                )}
              >
                {isProcessing ? (
                  <Loader2 className="w-16 h-16 text-white animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-16 h-16 text-white" />
                ) : (
                  <Mic className="w-16 h-16 text-white" />
                )}
              </button>
              
              <p className="text-xl text-gray-300">
                {isRecording ? "話し終わったらもう一度押す" : 
                 isProcessing ? "処理中..." :
                 isSpeaking ? "読み上げ中..." :
                 "ボタンを押して話す"}
              </p>

              {/* Speaking indicator and stop button */}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-3 px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-full transition-colors"
                >
                  <Volume2 className="w-6 h-6 animate-pulse" />
                  <span className="text-lg">読み上げを止める</span>
                </button>
              )}

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center",
                  "bg-red-600 hover:bg-red-500 transition-colors shadow-xl",
                  "mt-8"
                )}
              >
                <PhoneOff className="w-12 h-12 text-white" />
              </button>
              <p className="text-lg text-gray-400">終了する</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer with tips */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 border-t border-white/10">
        <p className="text-center text-lg text-gray-400">
          {!selectedOracle 
            ? "占い師の名前をタップして電話をかけましょう" 
            : isRecording 
            ? "話し終わったら緑のボタンを押してください"
            : "緑のボタンを押して話しかけてください"}
        </p>
      </footer>
    </div>
  );
}

// Simple mode - designed for elderly users who are only familiar with phone calls
export default function SimpleMode() {
  return (
    <ContrastProvider>
      <VolumeProvider>
        <FontSizeProvider>
          <SimpleModeContent />
        </FontSizeProvider>
      </VolumeProvider>
    </ContrastProvider>
  );
}
