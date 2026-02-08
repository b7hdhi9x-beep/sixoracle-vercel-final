import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, Square, Wand2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { addToVoiceHistory } from "./VoiceHistory";

// Web Speech API types
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEventType extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEventType extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionType extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventType) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventType) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
}

export function VoiceInput({ onTranscript, disabled, className, showPreview = true }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [realtimePreview, setRealtimePreview] = useState<string>("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  const transcribeMutation = trpc.voice.transcribe.useMutation({
    onSuccess: (data) => {
      onTranscript(data.text);
      // Save to voice history
      addToVoiceHistory(data.text);
      setIsProcessing(false);
      setError(null);
      setRealtimePreview("");
    },
    onError: (err) => {
      console.error("Transcription error:", err);
      setError("音声の変換に失敗しました。もう一度お試しください。");
      setIsProcessing(false);
      setRealtimePreview("");
    },
  });

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Initialize Web Speech API for real-time preview
  const startRealtimePreview = useCallback(() => {
    if (!showPreview) return;
    
    // Check if Web Speech API is available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log("Web Speech API not supported for real-time preview");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.lang = 'ja-JP';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEventType) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Show interim results as preview
        setRealtimePreview(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventType) => {
        // Ignore no-speech and aborted errors
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.log("Speech recognition error:", event.error);
        }
      };

      recognition.onend = () => {
        // Recognition ended, but we keep the preview until Whisper result comes
      };

      recognition.start();
    } catch (err) {
      console.log("Failed to start real-time preview:", err);
    }
  }, [showPreview]);

  const stopRealtimePreview = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setRealtimePreview("");
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      streamRef.current = stream;
      
      // Start real-time preview
      startRealtimePreview();
      
      // Determine supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        // Stop real-time preview
        stopRealtimePreview();
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Process the recorded audio
        if (chunksRef.current.length > 0) {
          setIsProcessing(true);
          
          const audioBlob = new Blob(chunksRef.current, { type: mimeType });
          
          // Convert to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            
            // Get simple mime type for API
            const simpleMimeType = mimeType.split(';')[0] as 
              | 'audio/webm' 
              | 'audio/mp3' 
              | 'audio/mpeg' 
              | 'audio/wav' 
              | 'audio/ogg' 
              | 'audio/m4a' 
              | 'audio/mp4';
            
            transcribeMutation.mutate({
              audioBase64: base64,
              mimeType: simpleMimeType,
              language: 'ja',
            });
          };
          reader.readAsDataURL(audioBlob);
        }
        
        setRecordingTime(0);
      };
      
      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          // Auto-stop after 60 seconds to prevent very long recordings
          if (prev >= 60) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error("Failed to start recording:", err);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError("マイクへのアクセスが拒否されました。ブラウザの設定でマイクを許可してください。");
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setError("マイクが見つかりません。マイクが接続されているか確認してください。");
      } else {
        setError("録音を開始できませんでした。");
      }
    }
  }, [transcribeMutation, startRealtimePreview, stopRealtimePreview]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        {isRecording ? (
          <>
            {/* Recording indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-red-400 font-mono">{formatTime(recordingTime)}</span>
            </div>
            
            {/* Stop button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={stopRecording}
              className="rounded-full bg-red-500/20 border-red-500/30 hover:bg-red-500/30 text-red-400"
            >
              <Square className="w-4 h-4 fill-current" />
            </Button>
          </>
        ) : isProcessing ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled
              className="rounded-full"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
            </Button>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Wand2 className="w-3 h-3" />
              高精度変換中...
            </span>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={startRecording}
            disabled={disabled}
            className={cn(
              "rounded-full transition-all",
              "hover:bg-primary/20 hover:border-primary/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            title="音声入力"
          >
            <Mic className="w-4 h-4" />
          </Button>
        )}
        
        {error && (
          <span className="text-xs text-red-400 max-w-[200px] truncate" title={error}>
            {error}
          </span>
        )}
      </div>
      
      {/* Real-time preview */}
      {showPreview && (isRecording || isProcessing) && realtimePreview && (
        <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-sm">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>リアルタイムプレビュー</span>
          </div>
          <p className="text-foreground/80 italic">{realtimePreview}</p>
        </div>
      )}
    </div>
  );
}
