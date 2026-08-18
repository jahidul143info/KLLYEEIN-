'use client';

import React, { useState } from 'react';
import { Cpu, Send, Sparkles, Bot, Zap, MessageSquare } from 'lucide-react';

export default function AIAdvisorWidget() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    'Which phone has the best battery & camera for BD travel?',
    'What is the difference between CyberPhone 16 Pro Max and CyberFold Z?',
    'Recommend headphones with active ANC under ৳40,000 BDT'
  ];

  const handleAsk = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setAnswer(null);

    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });
      const data = await res.json();
      setAnswer(data.answer || 'Thank you for consulting KLLYEEIN AI Advisor.');
    } catch (e) {
      console.error(e);
      setAnswer('KLLYEEIN Neural AI Advisor is operating smoothly. All flagship devices feature 1-year brand warranty and aerospace titanium alloy.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ai-advisor" className="py-12 border-t border-b border-white/10 bg-gradient-to-b from-[#090a0f] via-[#0d0f1a] to-[#090a0f]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-6 sm:p-8 bg-surface/90 border border-purple-500/30 backdrop-blur-2xl shadow-[0_0_50px_rgba(157,78,221,0.15)] space-y-6 relative overflow-hidden">
          
          {/* Neon Glow accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/30">
              <div className="w-full h-full bg-[#090a0f] rounded-[15px] flex items-center justify-center">
                <Bot className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-lg font-bold text-white font-mono">KLLYEEIN NEURAL AI ADVISOR</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] sm:text-[10px] font-bold border border-purple-500/30">
                  Powered by Gemini
                </span>
              </div>
              <p className="text-xs text-gray-400">Ask any tech question, spec comparison, or buying advice.</p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Suggested Questions:</p>
            <div className="flex flex-wrap gap-2">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(q);
                    handleAsk(q);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-surface/80 border border-white/10 hover:border-cyan-400/50 text-gray-300 hover:text-cyan-300 text-xs text-left transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Question Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(question);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask KLLYEEIN AI about specs, battery life, camera comparison..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl bg-surface border border-white/15 text-white placeholder-gray-500 text-xs font-medium focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>Ask AI</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* AI Response Output */}
          {answer && (
            <div className="p-5 rounded-2xl bg-black/60 border border-cyan-500/30 text-xs text-gray-200 leading-relaxed space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono">
                <Sparkles className="w-4 h-4" />
                <span>KLLYEEIN AI Insight:</span>
              </div>
              <p className="whitespace-pre-line text-gray-300">{answer}</p>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
