'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Database, Terminal } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../lib/supabase';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupabaseSqlScriptModal({ isOpen, onClose }: ModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0e1018] border border-purple-500/30 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Supabase SQL Database Setup
              </h3>
              <p className="text-xs text-gray-400">Run this script in your Supabase SQL Editor to initialize tables.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Block */}
        <div className="relative rounded-2xl bg-black border border-white/10 p-4 font-mono text-xs text-cyan-300 overflow-x-auto max-h-80 scrollbar-thin">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-sans text-xs font-bold transition-all shadow-md"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-300" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SQL</span>
              </>
            )}
          </button>
          <pre>{SUPABASE_SQL_SCHEMA}</pre>
        </div>

        {/* Instructions */}
        <div className="p-3 rounded-2xl bg-surface/50 border border-white/5 space-y-1 text-xs text-gray-300">
          <p className="font-bold text-white flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-cyan-400" />
            How to run in Supabase:
          </p>
          <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] text-gray-400">
            <li>Go to your Supabase Dashboard project</li>
            <li>Click <strong>SQL Editor</strong> on the left navigation panel</li>
            <li>Click <strong>New query</strong>, paste this copied SQL script and click <strong>Run</strong></li>
          </ol>
        </div>
      </div>
    </div>
  );
}
