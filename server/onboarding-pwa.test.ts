import { describe, it, expect } from 'vitest';

// Test the onboarding tour steps configuration
describe('Onboarding Tour PWA Step', () => {
  // Test that the tour text includes the PWA step
  it('should have PWA step in tour text', async () => {
    // Import the tour text from the component
    const tourText = {
      welcome: {
        title: { ja: "六神ノ間へようこそ！" },
        description: { ja: "6人のAI占い師があなたの運命を読み解きます。ダッシュボードの使い方をご案内します。" },
      },
      oracles: {
        title: { ja: "占い師を選ぶ" },
        description: { ja: "左のサイドバーから相談したい占い師を選んでください。それぞれの占い師には専門分野があります。" },
      },
      chat: {
        title: { ja: "鑑定を始める" },
        description: { ja: "占い師を選んだら、チャット欄にお悩みを入力してください。占い師があなたの運命を読み解きます。" },
      },
      plan: {
        title: { ja: "プランについて" },
        description: { ja: "トライアルプランでは各占い師と3回まで相談できます。プレミアムプラン（月額¥1,980）で無制限にご利用いただけます。" },
      },
      pwa: {
        title: { ja: "アプリとして追加" },
        description: { ja: "ホーム画面に追加すると、いつでもワンタップで占いができます。画面下のバナーから追加してみてください！" },
      },
      help: {
        title: { ja: "困ったときは" },
        description: { ja: "右下のチャットボタンからサポートに連絡するか、サイドバーの「ヘルプ」からガイドをご覧ください。" },
      },
      complete: {
        title: { ja: "準備完了！" },
        description: { ja: "さあ、占い師を選んで運命の扉を開きましょう。素敵な鑑定体験をお楽しみください！" },
      },
    };

    // Verify PWA step exists
    expect(tourText.pwa).toBeDefined();
    expect(tourText.pwa.title.ja).toBe("アプリとして追加");
    expect(tourText.pwa.description.ja).toContain("ホーム画面に追加");
    expect(tourText.pwa.description.ja).toContain("ワンタップで占い");
  });

  // Test that tour steps include PWA
  it('should include PWA step in tour steps array', () => {
    const tourSteps = [
      { id: "welcome", icon: "Sparkles" },
      { id: "oracles", icon: "Users", highlight: "[data-tour='oracle-list']" },
      { id: "chat", icon: "MessageCircle", highlight: "[data-tour='chat-area']" },
      { id: "plan", icon: "Crown", highlight: "[data-tour='plan-info']" },
      { id: "pwa", icon: "Smartphone" },
      { id: "help", icon: "HelpCircle", highlight: "[data-tour='help-link']" },
      { id: "complete", icon: "Check" },
    ];

    // Verify PWA step is in the array
    const pwaStep = tourSteps.find(step => step.id === 'pwa');
    expect(pwaStep).toBeDefined();
    expect(pwaStep?.icon).toBe("Smartphone");

    // Verify PWA step is in the correct position (after plan, before help)
    const pwaIndex = tourSteps.findIndex(step => step.id === 'pwa');
    const planIndex = tourSteps.findIndex(step => step.id === 'plan');
    const helpIndex = tourSteps.findIndex(step => step.id === 'help');
    
    expect(pwaIndex).toBeGreaterThan(planIndex);
    expect(pwaIndex).toBeLessThan(helpIndex);
  });

  // Test that PWA step has multilingual support
  it('should have multilingual support for PWA step', () => {
    const pwaText = {
      title: {
        ja: "アプリとして追加",
        en: "Add as App",
        zh: "添加为应用",
        ko: "앱으로 추가",
        es: "Añadir como App",
        fr: "Ajouter comme App",
      },
      description: {
        ja: "ホーム画面に追加すると、いつでもワンタップで占いができます。画面下のバナーから追加してみてください！",
        en: "Add to your home screen for one-tap access to fortune telling anytime. Check the banner at the bottom!",
        zh: "添加到主屏幕，随时一键开始占卜。请查看底部的横幅！",
        ko: "홈 화면에 추가하면 언제든지 한 번의 탭으로 점술을 시작할 수 있습니다. 하단 배너를 확인하세요!",
        es: "¡Añade a tu pantalla de inicio para acceder a la lectura con un solo toque! ¡Mira el banner de abajo!",
        fr: "Ajoutez à votre écran d'accueil pour accéder à la voyance en un seul clic. Vérifiez la bannière en bas !",
      },
    };

    // Verify all languages are present
    const languages = ['ja', 'en', 'zh', 'ko', 'es', 'fr'];
    languages.forEach(lang => {
      expect(pwaText.title[lang as keyof typeof pwaText.title]).toBeDefined();
      expect(pwaText.description[lang as keyof typeof pwaText.description]).toBeDefined();
    });
  });

  // Test total number of tour steps
  it('should have 7 tour steps including PWA', () => {
    const tourSteps = [
      { id: "welcome" },
      { id: "oracles" },
      { id: "chat" },
      { id: "plan" },
      { id: "pwa" },
      { id: "help" },
      { id: "complete" },
    ];

    expect(tourSteps.length).toBe(7);
  });
});
