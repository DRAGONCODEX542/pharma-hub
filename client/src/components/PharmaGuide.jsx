import React, { useState, useEffect } from 'react';
import { Sparkles, X, ChevronRight, ChevronLeft, Check, HelpCircle, ArrowRight } from 'lucide-react';

export default function PharmaGuide({ currentStep = 1, onStepChange, isSolo = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [hasCompletedBefore, setHasCompletedBefore] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('pharmahub_guide_seen');
    if (!seen) {
      // Auto open guide for first-time visitors after a gentle 800ms delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setHasCompletedBefore(true);
    }
  }, []);

  const steps = [
    {
      step: 1,
      title: "1. Pick or Search Medicine",
      description: "Tap any medicine card or type in the big search box. You can search by brand name, generic formula, or barcode.",
      targetHint: "Notice the clean medicine cards with big, clear prices.",
      icon: "💊"
    },
    {
      step: 2,
      title: "2. Adjust Quantity in Cart",
      description: "Selected medicines land instantly in your Smart Cart. Use the simple (+) and (-) buttons to pick how many boxes, strips, or tablets.",
      targetHint: "On a phone, tap the bottom green bar anytime to open your cart.",
      icon: "🛒"
    },
    {
      step: 3,
      title: "3. Choose Payment & Done!",
      description: "Tap Cash, M-Pesa, or Patient Loan. The receipt is generated instantly, stock updates in real time, and you're ready for the next customer!",
      targetHint: "Loans automatically track who owes you with 1-click WhatsApp reminders.",
      icon: "✨"
    }
  ];

  const currentStepData = steps.find(s => s.step === activeStep) || steps[0];

  const handleNext = () => {
    if (activeStep < steps.length) {
      setActiveStep(activeStep + 1);
      if (onStepChange) onStepChange(activeStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      if (onStepChange) onStepChange(activeStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('pharmahub_guide_seen', 'true');
    setHasCompletedBefore(true);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Summon Pill (Always available in bottom-right so it never covers the desktop sidebar) */}
      <button
        onClick={() => {
          setActiveStep(1);
          setIsOpen(true);
        }}
        className={`fixed z-40 bottom-20 md:bottom-6 right-4 sm:right-6 flex items-center gap-2.5 px-3.5 py-2 rounded-full 
          bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/15 
          shadow-[0_8px_24px_rgba(0,0,0,0.12)] text-slate-800 dark:text-slate-200 
          hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer`}
        title="Interactive 3-Step Guide"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-semibold tracking-tight">How it works</span>
        <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 opacity-80 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Guide Dialog / Mascot Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className={`w-full max-w-md rounded-3xl p-6 sm:p-7 relative overflow-hidden
              bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl
              border border-white/80 dark:border-white/15
              shadow-[0_24px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8)]
              transform transition-all duration-300 animate-slide-up`}
          >
            {/* Ambient liquid glow behind mascot */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-teal-500/10 dark:bg-teal-500/15 blur-3xl pointer-events-none" />

            {/* Header: Mascot Avatar + Close Button */}
            <div className="flex items-start justify-between relative z-10 mb-5">
              <div className="flex items-center gap-3.5">
                {/* Animated Pharmacist Avatar */}
                <div className="relative">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-md shadow-emerald-500/25 flex items-center justify-center">
                    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center text-2xl select-none animate-bounce-subtle">
                      👩‍⚕️
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[9px] font-black text-white shadow-xs">
                    GUIDE
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    PharmaGuide
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Step {activeStep} of {steps.length} — Easy 3-Step Flow
                  </p>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                aria-label="Close guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Indicators */}
            <div className="grid grid-cols-3 gap-2 mb-5 relative z-10">
              {steps.map((s) => (
                <div
                  key={s.step}
                  onClick={() => setActiveStep(s.step)}
                  className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                    s.step === activeStep
                      ? 'bg-emerald-600 dark:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                      : s.step < activeStep
                      ? 'bg-emerald-300 dark:bg-emerald-700'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Speech Bubble Content */}
            <div className="relative z-10 bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl p-4.5 border border-slate-200/60 dark:border-slate-700/60 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{currentStepData.icon}</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {currentStepData.title}
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 mb-3">
                {currentStepData.description}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
                <span className="font-bold">💡 Tip:</span>
                <span>{currentStepData.targetHint}</span>
              </div>
            </div>

            {/* Footer Navigation Buttons */}
            <div className="flex items-center justify-between relative z-10 pt-1">
              {activeStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  className="text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
                >
                  Skip Tour
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white
                  bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500
                  shadow-md shadow-emerald-600/25 active:scale-95 transition-all duration-150"
              >
                {activeStep === steps.length ? (
                  <>
                    <span>Start Dispensing</span>
                    <Check className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
