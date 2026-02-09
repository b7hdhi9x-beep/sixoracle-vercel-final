import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/lib/i18n/translations";

interface LanguageSwitcherProps {
  variant?: "default" | "compact";
  className?: string;
}

export function LanguageSwitcher({ variant = "default", className = "" }: LanguageSwitcherProps) {
  const { language, setLanguage, languageNames, availableLanguages } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size={variant === "compact" ? "sm" : "default"}
          className={`border-white/20 hover:bg-white/10 ${className}`}
        >
          <Globe className="w-4 h-4 mr-2" />
          {variant === "compact" ? language.toUpperCase() : languageNames[language]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border-white/10">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`cursor-pointer ${language === lang ? "bg-white/10" : ""}`}
          >
            <span className="mr-2">{getFlagEmoji(lang)}</span>
            {languageNames[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getFlagEmoji(lang: Language): string {
  const flags: Record<Language, string> = {
    ja: "🇯🇵",
    en: "🇺🇸",
    zh: "🇨🇳",
    ko: "🇰🇷",
    es: "🇪🇸",
    fr: "🇫🇷",
  };
  return flags[lang];
}
