import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useDisplaySettings, type FontSize } from "@/contexts/DisplaySettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart, Moon, Settings, Sun, Type } from "lucide-react";

const translations: Record<string, Record<string, string>> = {
  ja: {
    title: "表示設定",
    description: "文字サイズとテーマを設定できます",
    fontSize: "文字サイズ",
    small: "小",
    medium: "中",
    large: "大",
    theme: "テーマ",
    darkMode: "ダークモード",
    lightMode: "ライトモード",
    preview: "プレビュー",
    previewText: "これは表示設定のプレビューテキストです。文字サイズやテーマの変更がリアルタイムで反映されます。",
    autoSave: "自動保存",
    autoSaveFavorites: "鑑定結果を自動でお気に入りに保存",
    autoSaveDescription: "占い師からの鑑定結果を受け取ると、自動的にお気に入りに追加されます",
  },
  en: {
    title: "Display Settings",
    description: "Customize font size and theme",
    fontSize: "Font Size",
    small: "Small",
    medium: "Medium",
    large: "Large",
    theme: "Theme",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    preview: "Preview",
    previewText: "This is a preview text for display settings. Changes to font size and theme are reflected in real-time.",
    autoSave: "Auto Save",
    autoSaveFavorites: "Auto-save fortune results to favorites",
    autoSaveDescription: "Fortune results from oracles will be automatically added to your favorites",
  },
  zh: {
    title: "显示设置",
    description: "自定义字体大小和主题",
    fontSize: "字体大小",
    small: "小",
    medium: "中",
    large: "大",
    theme: "主题",
    darkMode: "深色模式",
    lightMode: "浅色模式",
    preview: "预览",
    previewText: "这是显示设置的预览文本。字体大小和主题的更改会实时反映。",
    autoSave: "自动保存",
    autoSaveFavorites: "自动将占卜结果保存到收藏夹",
    autoSaveDescription: "来自占卜师的占卜结果将自动添加到您的收藏夹",
  },
  ko: {
    title: "표시 설정",
    description: "글꼴 크기와 테마를 설정할 수 있습니다",
    fontSize: "글꼴 크기",
    small: "작게",
    medium: "보통",
    large: "크게",
    theme: "테마",
    darkMode: "다크 모드",
    lightMode: "라이트 모드",
    preview: "미리보기",
    previewText: "이것은 표시 설정 미리보기 텍스트입니다. 글꼴 크기와 테마 변경이 실시간으로 반영됩니다.",
    autoSave: "자동 저장",
    autoSaveFavorites: "점술 결과를 즐겨찾기에 자동 저장",
    autoSaveDescription: "점술사의 점술 결과가 자동으로 즐겨찾기에 추가됩니다",
  },
  es: {
    title: "Configuración de pantalla",
    description: "Personaliza el tamaño de fuente y el tema",
    fontSize: "Tamaño de fuente",
    small: "Pequeño",
    medium: "Mediano",
    large: "Grande",
    theme: "Tema",
    darkMode: "Modo oscuro",
    lightMode: "Modo claro",
    preview: "Vista previa",
    previewText: "Este es un texto de vista previa para la configuración de pantalla. Los cambios en el tamaño de fuente y el tema se reflejan en tiempo real.",
    autoSave: "Guardado automático",
    autoSaveFavorites: "Guardar automáticamente los resultados en favoritos",
    autoSaveDescription: "Los resultados de los oráculos se agregarán automáticamente a sus favoritos",
  },
  fr: {
    title: "Paramètres d'affichage",
    description: "Personnalisez la taille de police et le thème",
    fontSize: "Taille de police",
    small: "Petit",
    medium: "Moyen",
    large: "Grand",
    theme: "Thème",
    darkMode: "Mode sombre",
    lightMode: "Mode clair",
    preview: "Aperçu",
    previewText: "Ceci est un texte d'aperçu pour les paramètres d'affichage. Les modifications de la taille de police et du thème sont reflétées en temps réel.",
    autoSave: "Sauvegarde automatique",
    autoSaveFavorites: "Enregistrer automatiquement les résultats dans les favoris",
    autoSaveDescription: "Les résultats des oracles seront automatiquement ajoutés à vos favoris",
  },
};

interface DisplaySettingsProps {
  variant?: "icon" | "button" | "sidebar";
  className?: string;
}

export function DisplaySettings({ variant = "icon", className = "" }: DisplaySettingsProps) {
  const { fontSize, setFontSize, colorTheme, toggleColorTheme, autoSaveFavorites, setAutoSaveFavorites } = useDisplaySettings();
  const { language } = useLanguage();
  const t = translations[language] || translations.ja;

  const fontSizeOptions: { value: FontSize; label: string }[] = [
    { value: "small", label: t.small },
    { value: "medium", label: t.medium },
    { value: "large", label: t.large },
  ];

  const triggerContent = () => {
    switch (variant) {
      case "button":
        return (
          <Button variant="outline" className={className}>
            <Settings className="w-4 h-4 mr-2" />
            {t.title}
          </Button>
        );
      case "sidebar":
        return (
          <button className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors w-full text-left ${className}`}>
            <Settings className="w-5 h-5" />
            <span>{t.title}</span>
          </button>
        );
      default:
        return (
          <Button variant="ghost" size="icon" className={className}>
            <Settings className="w-5 h-5" />
          </Button>
        );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {triggerContent()}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Font Size Setting */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Type className="w-4 h-4" />
              {t.fontSize}
            </Label>
            <RadioGroup
              value={fontSize}
              onValueChange={(value) => setFontSize(value as FontSize)}
              className="flex gap-4"
            >
              {fontSizeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`font-${option.value}`} />
                  <Label 
                    htmlFor={`font-${option.value}`}
                    className={`cursor-pointer ${
                      option.value === "small" ? "text-sm" : 
                      option.value === "large" ? "text-lg" : "text-base"
                    }`}
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Theme Setting */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              {colorTheme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {t.theme}
            </Label>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-3">
                <Sun className="w-5 h-5 text-yellow-500" />
                <span className="text-sm">{t.lightMode}</span>
              </div>
              <Switch
                checked={colorTheme === "dark"}
                onCheckedChange={toggleColorTheme}
              />
              <div className="flex items-center gap-3">
                <span className="text-sm">{t.darkMode}</span>
                <Moon className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Auto Save Favorites Setting */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Heart className="w-4 h-4 text-pink-500" />
              {t.autoSave}
            </Label>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
              <div className="flex-1 pr-4">
                <p className="text-sm font-medium">{t.autoSaveFavorites}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.autoSaveDescription}</p>
              </div>
              <Switch
                checked={autoSaveFavorites}
                onCheckedChange={setAutoSaveFavorites}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-base font-medium">{t.preview}</Label>
            <div className="p-4 rounded-lg bg-card border">
              <p className="text-foreground leading-relaxed">
                {t.previewText}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DisplaySettings;
