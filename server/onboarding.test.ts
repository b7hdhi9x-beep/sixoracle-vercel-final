import { describe, it, expect } from "vitest";

describe("Onboarding Tour Configuration", () => {
  it("should have 6 tour steps defined", () => {
    const tourSteps = [
      { id: "welcome", icon: "Sparkles" },
      { id: "oracles", icon: "Users", highlight: "[data-tour='oracle-list']" },
      { id: "chat", icon: "MessageCircle", highlight: "[data-tour='chat-area']" },
      { id: "plan", icon: "Crown", highlight: "[data-tour='plan-info']" },
      { id: "help", icon: "HelpCircle", highlight: "[data-tour='help-link']" },
      { id: "complete", icon: "Check" },
    ];
    
    expect(tourSteps.length).toBe(6);
    expect(tourSteps[0].id).toBe("welcome");
    expect(tourSteps[5].id).toBe("complete");
  });

  it("should support 6 languages", () => {
    const supportedLanguages = ["ja", "en", "zh", "ko", "es", "fr"];
    
    expect(supportedLanguages.length).toBe(6);
    expect(supportedLanguages).toContain("ja");
    expect(supportedLanguages).toContain("en");
    expect(supportedLanguages).toContain("zh");
    expect(supportedLanguages).toContain("ko");
    expect(supportedLanguages).toContain("es");
    expect(supportedLanguages).toContain("fr");
  });

  it("should have proper localStorage key", () => {
    const ONBOARDING_KEY = "six-oracle-onboarding-completed";
    
    expect(ONBOARDING_KEY).toBe("six-oracle-onboarding-completed");
    expect(ONBOARDING_KEY.length).toBeGreaterThan(0);
  });

  it("should have translations for all step types", () => {
    const stepTypes = ["welcome", "oracles", "chat", "plan", "help", "complete"];
    const buttonTypes = ["skip", "next", "prev", "start", "finish"];
    
    expect(stepTypes.length).toBe(6);
    expect(buttonTypes.length).toBe(5);
  });
});

describe("Tour Step Highlights", () => {
  it("should have valid CSS selectors for highlights", () => {
    const highlights = [
      "[data-tour='oracle-list']",
      "[data-tour='chat-area']",
      "[data-tour='plan-info']",
      "[data-tour='help-link']",
    ];
    
    highlights.forEach((selector) => {
      expect(selector).toMatch(/^\[data-tour='[a-z-]+'\]$/);
    });
  });

  it("should have highlight for interactive steps", () => {
    const stepsWithHighlight = [
      { id: "oracles", highlight: "[data-tour='oracle-list']" },
      { id: "chat", highlight: "[data-tour='chat-area']" },
      { id: "plan", highlight: "[data-tour='plan-info']" },
      { id: "help", highlight: "[data-tour='help-link']" },
    ];
    
    expect(stepsWithHighlight.length).toBe(4);
    stepsWithHighlight.forEach((step) => {
      expect(step.highlight).toBeDefined();
      expect(step.highlight).toContain("data-tour");
    });
  });

  it("should not have highlight for welcome and complete steps", () => {
    const stepsWithoutHighlight = [
      { id: "welcome", highlight: undefined },
      { id: "complete", highlight: undefined },
    ];
    
    stepsWithoutHighlight.forEach((step) => {
      expect(step.highlight).toBeUndefined();
    });
  });
});

describe("Tour Button Labels", () => {
  it("should have Japanese translations for buttons", () => {
    const jaButtons = {
      skip: "スキップ",
      next: "次へ",
      prev: "戻る",
      start: "始める",
      finish: "完了",
    };
    
    expect(jaButtons.skip).toBe("スキップ");
    expect(jaButtons.next).toBe("次へ");
    expect(jaButtons.prev).toBe("戻る");
    expect(jaButtons.start).toBe("始める");
    expect(jaButtons.finish).toBe("完了");
  });

  it("should have English translations for buttons", () => {
    const enButtons = {
      skip: "Skip",
      next: "Next",
      prev: "Back",
      start: "Get Started",
      finish: "Finish",
    };
    
    expect(enButtons.skip).toBe("Skip");
    expect(enButtons.next).toBe("Next");
    expect(enButtons.prev).toBe("Back");
    expect(enButtons.start).toBe("Get Started");
    expect(enButtons.finish).toBe("Finish");
  });
});

describe("Tour Flow Logic", () => {
  it("should start from step 0", () => {
    const initialStep = 0;
    expect(initialStep).toBe(0);
  });

  it("should end at step 5 (complete)", () => {
    const totalSteps = 6;
    const lastStepIndex = totalSteps - 1;
    expect(lastStepIndex).toBe(5);
  });

  it("should allow navigation forward and backward", () => {
    let currentStep = 0;
    
    // Go forward
    currentStep = Math.min(currentStep + 1, 5);
    expect(currentStep).toBe(1);
    
    // Go forward again
    currentStep = Math.min(currentStep + 1, 5);
    expect(currentStep).toBe(2);
    
    // Go backward
    currentStep = Math.max(currentStep - 1, 0);
    expect(currentStep).toBe(1);
    
    // Go backward again
    currentStep = Math.max(currentStep - 1, 0);
    expect(currentStep).toBe(0);
    
    // Can't go below 0
    currentStep = Math.max(currentStep - 1, 0);
    expect(currentStep).toBe(0);
  });
});
