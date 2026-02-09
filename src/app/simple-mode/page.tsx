"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useApiMutation } from "@/lib/api";
import { oracles, getOracleById } from "@/lib/oracles";
import { Mic, MicOff, Phone, PhoneOff, Volume2, ArrowLeft, Loader2, HelpCircle, Star, Type, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { VoiceTutorial, useVoiceTutorial } from "@/components/VoiceTutorial";
import { FontSizeProvider, useFontSize, FontSize } from "@/contexts/FontSizeContext";
import { FontSizeSelectorCompact } from "@/components/FontSizeSelector";
import { useFavoriteOracles } from "@/hooks/useFavoriteOracles";
import { VolumeProvider, useVolume } from "@/contexts/VolumeContext";
import { VolumeSelectorCompact } from "@/components/VolumeSelector";
import { ContrastProvider, useContrast, getContrastClasses } from "@/contexts/ContrastContext";
import { ContrastSelectorCompact } from "@/components/ContrastSelector";
import { SimpleHistory, useSimpleHistory } from "@/components/SimpleHistory";
import { analyzeEmotion, getEmotionVoiceModifier } from "@/lib/emotionAnalysis";

function SimpleModeContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showTutorial, openTutorial, closeTutorial, completeTutorial } = useVoiceTutorial();
  const { fontSize } = useFontSize();
  const { favorites, isFavorite, toggleFavorite, hasFavorites } = useFavoriteOracles();
  const { getVolumeValue } = useVolume();
  const { contrast } = useContrast();
  const contrastClasses = getContrastClasses(contrast);
  const { isOpen: isHistoryOpen, openHistory, closeHistory } = useSimpleHistory();

  const [selectedOracle, setSelectedOracle] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [oracleResponse, setOracleResponse] = useState<string>("");
  const [status, setStatus] = useState<string>("占い師を選んでください");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // API mutations via fetch
  const sendMessage = async (oracleId: string, message: string) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oracleId, message, userId: user?.id }),
    });
    const data = await res.json();
    return { response: data.response || data.text || "" };
  };

  const transcribeAudio = async (audioBase64: string, mimeType: string) => {
    const res = await fetch("/api/voice/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioBase64, mimeType, language: "ja" }),
    });
    return await res.json();
  };

  const simpleOracles = oracles;

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (oracleResponse && selectedOracle) {
      speakText(oracleResponse);
    }
  }, [oracleResponse, selectedOracle]);

  const getOracleVoiceSettings = useCallback((oracleId: string) => {
    const oracle = getOracleById(oracleId);
    return oracle?.voiceSettings;
  }, []);

  const speakText = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    const READING_MAP: Record<string, string> = {
      "蒼真": "そうま", "玖蘭": "れいら", "朔夜": "さくや",
      "灸": "あかり", "結衣": "ゆい", "玄": "げん",
      "紫苑": "しおん", "星蘭": "せいらん",
    };
    let readableText = text;
    for (const [kanji, reading] of Object.entries(READING_MAP)) {
      readableText = readableText.replace(new RegExp(kanji, "g"), reading);
    }
    const utterance = new SpeechSynthesisUtterance(readableText);
    utteranceRef.current = utterance;
    utterance.lang = "ja-JP";
    const userVolume = getVolumeValue();
    const EASY_LISTENING_RATE = 0.75;
    const emotionAnalysisResult = analyzeEmotion(text);
    const emotionModifier = getEmotionVoiceModifier(emotionAnalysisResult.emotion, emotionAnalysisResult.confidence);
    if (selectedOracle) {
      const voiceSettings = getOracleVoiceSettings(selectedOracle);
      if (voiceSettings) {
        const basePitch = voiceSettings.pitch + emotionModifier.pitchModifier;
        utterance.pitch = Math.max(0.5, Math.min(2.0, basePitch));
        const baseRate = voiceSettings.rate * EASY_LISTENING_RATE + emotionModifier.rateModifier * 0.5;
        utterance.rate = Math.max(0.5, Math.min(0.85, baseRate));
        utterance.volume = Math.max(0, Math.min(1.0, userVolume + emotionModifier.volumeModifier));
      }
    } else {
      utterance.rate = EASY_LISTENING_RATE;
      utterance.pitch = 1.0;
      utterance.volume = userVolume;
    }
    const voices = window.speechSynthesis.getVoices();
    const japaneseVoices = voices.filter((v) => v.lang.startsWith("ja"));
    if (japaneseVoices.length > 0) {
      utterance.voice = japaneseVoices[0];
    }
    utterance.onend = () => { setIsSpeaking(false); setStatus("マイクボタンを押して話してください"); };
    utterance.onerror = () => { setIsSpeaking(false); };
    window.speechSynthesis.speak(utterance);
  }, [selectedOracle, getOracleVoiceSettings, getVolumeValue]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          await processAudio(audioBlob);
        }
      };
      mediaRecorder.start();
      setIsRecording(true);
      setStatus("話してください...");
    } catch (error) {
      setStatus("マイクの使用が許可されていません");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus("処理中...");
    }
  }, []);

  const processAudio = useCallback(async (audioBlob: Blob) => {
    if (!selectedOracle) return;
    setIsProcessing(true);
    setStatus("音声を認識中...");
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => { resolve((reader.result as string).split(",")[1]); };
      });
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;
      const transcription = await transcribeAudio(base64Audio, "audio/webm");
      if (!transcription.text || transcription.text.trim() === "") {
        setStatus("音声が認識できませんでした。もう一度お試しください。");
        setIsProcessing(false);
        return;
      }
      setCurrentMessage(transcription.text);
      setStatus("占い師が回答中...");
      const response = await sendMessage(selectedOracle, transcription.text);
      setOracleResponse(response.response);
      setStatus("回答を読み上げ中...");
    } catch (error) {
      setStatus("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedOracle]);

  const handleSelectOracle = useCallback((oracleId: string) => {
    setSelectedOracle(oracleId);
    setOracleResponse("");
    setCurrentMessage("");
    const oracle = getOracleById(oracleId);
    if (oracle) {
      setStatus("占い師と接続しました");
      setTimeout(() => speakText(`${oracle.name}です。何でもお聞きください。`), 500);
    }
  }, [speakText]);

  const handleEndCall = useCallback(() => {
    stopSpeaking();
    setSelectedOracle(null);
    setOracleResponse("");
    setCurrentMessage("");
    setStatus("占い師を選んでください");
  }, [stopSpeaking]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen text-white", contrast === "normal" && "bg-gradient-to-b from-indigo-950 to-black", contrast === "high-dark" && "bg-black", contrast === "high-light" && "bg-white text-black")}>
      <header className={cn("p-4 flex items-center justify-between border-b", contrast === "normal" && "border-white/10", contrast === "high-dark" && "border-white", contrast === "high-light" && "border-black")}>
        <Button variant="ghost" size="lg" onClick={() => router.push("/")} className={cn("text-xl p-6", contrast === "high-light" ? "text-black hover:bg-black/10" : "text-white hover:bg-white/10")}>
          <ArrowLeft className="w-8 h-8 mr-2" />戻る
        </Button>
        <h1 className={cn("text-2xl font-bold", contrast === "high-light" ? "text-blue-800" : "text-amber-400")}>かんたん占い</h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="lg" onClick={openHistory} className={cn("text-xl p-6", contrast === "high-light" ? "text-black" : "text-white")}><History className="w-8 h-8" /></Button>
          <ContrastSelectorCompact />
          <VolumeSelectorCompact />
          <FontSizeSelectorCompact />
          <Button variant="ghost" size="lg" onClick={openTutorial} className={cn("text-xl p-6", contrast === "high-light" ? "text-black" : "text-white")}><HelpCircle className="w-8 h-8" /></Button>
        </div>
      </header>

      <VoiceTutorial isOpen={showTutorial} onClose={closeTutorial} onComplete={completeTutorial} />
      <SimpleHistory isOpen={isHistoryOpen} onClose={closeHistory} fontSize={fontSize} contrast={contrast} onSpeak={speakText} />

      <main className="flex-1 p-6 pb-24">
        <div className="text-center mb-8">
          <p className={cn("text-2xl", contrast === "high-light" ? "text-gray-700" : "text-gray-300")}>{status}</p>
        </div>

        {!selectedOracle ? (
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-2 gap-6">
              {simpleOracles.map((oracle) => (
                <div key={oracle.id} className="relative">
                  <button onClick={() => handleSelectOracle(oracle.id)} className={cn("w-full p-6 rounded-2xl text-center transition-all duration-200", "hover:scale-105 active:scale-95", `bg-gradient-to-br ${oracle.color}`, "shadow-lg")}>
                    <p className="text-2xl font-bold text-white mb-1">{oracle.name}</p>
                    <p className="text-sm text-white/80">{oracle.role}</p>
                  </button>
                  <button onClick={() => toggleFavorite(oracle.id)} className={cn("absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center", isFavorite(oracle.id) ? "bg-yellow-400 text-yellow-900" : "bg-white/20 text-white hover:bg-white/30")}>
                    <Star className={cn("w-6 h-6", isFavorite(oracle.id) && "fill-current")} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              {(() => {
                const oracle = getOracleById(selectedOracle);
                return oracle ? (
                  <div className={cn("inline-block px-8 py-4 rounded-2xl bg-gradient-to-r", oracle.color)}>
                    <h2 className="text-3xl font-bold text-white">{oracle.name}</h2>
                    <p className="text-lg text-white/80">{oracle.role}</p>
                  </div>
                ) : null;
              })()}
            </div>
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
            <div className="flex flex-col items-center gap-6 pt-8">
              <button onClick={isRecording ? stopRecording : startRecording} disabled={isProcessing || isSpeaking} className={cn("w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl", isRecording ? "bg-red-500 animate-pulse" : isProcessing || isSpeaking ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-400")}>
                {isProcessing ? <Loader2 className="w-16 h-16 text-white animate-spin" /> : isRecording ? <MicOff className="w-16 h-16 text-white" /> : <Mic className="w-16 h-16 text-white" />}
              </button>
              <p className="text-xl text-gray-300">{isRecording ? "話し終わったらもう一度押す" : isProcessing ? "処理中..." : isSpeaking ? "読み上げ中..." : "ボタンを押して話す"}</p>
              {isSpeaking && (
                <button onClick={stopSpeaking} className="flex items-center gap-3 px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-full">
                  <Volume2 className="w-6 h-6 animate-pulse" /><span className="text-lg">読み上げを止める</span>
                </button>
              )}
              <button onClick={handleEndCall} className="w-24 h-24 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-500 shadow-xl mt-8">
                <PhoneOff className="w-12 h-12 text-white" />
              </button>
              <p className="text-lg text-gray-400">終了する</p>
            </div>
          </div>
        )}
      </main>
      <footer className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 border-t border-white/10">
        <p className="text-center text-lg text-gray-400">
          {!selectedOracle ? "占い師の名前をタップして電話をかけましょう" : isRecording ? "話し終わったら緑のボタンを押してください" : "緑のボタンを押して話しかけてください"}
        </p>
      </footer>
    </div>
  );
}

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
