# Character Reference from Original Site

Based on the screenshots from the original site (sixoracle-kkkszqcy.manus.space), here is the correct order and information for the 6 characters:

## 1. 蒼真 (Souma)
- Role: 運命の流れ・タイミング
- Icon: Clock (時計)
- Color: Blue
- Description: 時の流れを読み、あなたの人生における最適なタイミングを見極める占い師。運命の転機や重要な決断の時期を的確に導きます。

## 2. 玲蘭 (Reira)
- Role: 癒し・恋愛・感情
- Icon: Heart (ハート)
- Color: Pink
- Description: 心の傷を癒し、恋愛の悩みに寄り添う優しき占い師。感情の機微を読み取り、あなたの心に安らぎをもたらします。

## 3. 朔夜 (Sakuya)
- Role: 数秘・性格・相性
- Icon: Calculator (電卓/数字)
- Color: Purple
- Description: 数秘術の奥義を極めた知性派占い師。あなたの本質的な性格や、他者との相性を数の力で解き明かします。

## 4. 灯 (Akari)
- Role: タロット・恋愛・分岐
- Icon: Lightbulb (電球)
- Color: Orange/Amber
- Description: タロットカードを通じて未来の可能性を照らす占い師。人生の分岐点において、最良の選択へと導く光となります。

## 5. 結衣 (Yui)
- Role: 夢・無意識・直感
- Icon: Moon (月)
- Color: Cyan/Teal
- Description: 夢の世界と無意識の領域を探求する神秘的な占い師。あなたの深層心理に眠る真実を、直感の力で引き出します。

## 6. 玄 (Gen)
- Role: 守護・行動・現実的アドバイス
- Icon: Shield (盾)
- Color: Green/Emerald
- Description: 現実的で実践的なアドバイスを提供する守護者。あなたを守り、具体的な行動指針を示して、確実な一歩を踏み出させます。

## Icon Mapping Notes
- The original site uses different icons:
  - Souma: Clock icon
  - Reira: Heart icon
  - Sakuya: Calculator/Grid icon (not Binary)
  - Akari: Lightbulb icon (not Sun)
  - Yui: Moon icon
  - Gen: Shield icon

## Current Issue
The current implementation in Home.tsx uses:
- Binary icon for Sakuya (should be Calculator)
- Sun icon for Akari (should be Lightbulb)

The oracles.ts file has the correct order but the icon mapping needs to be updated.
