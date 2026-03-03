import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpCircle, ArrowDownCircle, CheckCircle2, RotateCcw, Trophy } from 'lucide-react';

type GuessResult = 'up' | 'down' | 'correct';

interface GuessHistory {
  value: number;
  result: GuessResult;
}

export default function App() {
  const [target, setTarget] = useState<number>(0);
  const [guess, setGuess] = useState<string>('');
  const [history, setHistory] = useState<GuessHistory[]>([]);
  const [status, setStatus] = useState<'playing' | 'won'>('playing');
  const [error, setError] = useState<string>('');
  const [shake, setShake] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    setTarget(Math.floor(Math.random() * 1001));
    setGuess('');
    setHistory([]);
    setStatus('playing');
    setError('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'playing') return;

    const numGuess = parseInt(guess, 10);
    
    if (isNaN(numGuess) || numGuess < 0 || numGuess > 1000) {
      setError('0에서 1000 사이의 숫자를 입력해주세요.');
      return;
    }

    setError('');
    let result: GuessResult;

    if (numGuess === target) {
      result = 'correct';
      setStatus('won');
    } else if (numGuess < target) {
      result = 'up';
    } else {
      result = 'down';
    }

    setHistory((prev) => [{ value: numGuess, result }, ...prev]);
    setGuess('');
    
    if (result !== 'correct') {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 font-sans text-stone-900">
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
        className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-stone-200"
      >
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold tracking-tight">숫자 맞추기 게임</h1>
          <p className="text-indigo-200 mt-1 text-sm">0부터 1000 사이의 숫자를 맞춰보세요!</p>
        </div>

        <div className="p-6">
          {/* Game Status / Input */}
          <AnimatePresence mode="wait">
            {status === 'won' ? (
              <motion.div
                key="won"
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="text-center py-8"
              >
                <motion.div 
                  animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-4"
                >
                  <Trophy size={40} />
                </motion.div>
                <h2 className="text-3xl font-bold text-emerald-600 mb-2">정답입니다!</h2>
                <p className="text-stone-600 mb-6">
                  <span className="font-bold text-stone-900">{history.length}</span>번 만에 맞추셨습니다. (정답: {target})
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startNewGame}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} />
                  다시 하기
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="playing" className="py-2">
                <form onSubmit={handleGuess} className="space-y-4">
                  <motion.div animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
                    <input
                      ref={inputRef}
                      type="number"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      placeholder="숫자 입력 (0~1000)"
                      className="w-full text-center text-4xl py-4 bg-stone-50 border-2 border-stone-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all"
                      min="0"
                      max="1000"
                      autoFocus
                    />
                    {error && (
                      <p className="text-red-500 text-sm text-center mt-2 font-medium">{error}</p>
                    )}
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: guess ? 1.02 : 1 }}
                    whileTap={{ scale: guess ? 0.95 : 1 }}
                    type="submit"
                    disabled={!guess}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg transition-colors shadow-sm"
                  >
                    확인
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History */}
          {history.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">시도 기록</h3>
                <span className="text-xs font-medium bg-stone-100 text-stone-600 px-2 py-1 rounded-full">
                  총 {history.length}회
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {history.map((h, i) => (
                    <motion.div
                      key={`${history.length - i}`}
                      initial={{ opacity: 0, x: -50, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto', marginBottom: 8 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className={`flex items-center justify-between p-4 rounded-xl border ${
                        h.result === 'correct' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : h.result === 'up'
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-blue-50 border-blue-200 text-blue-700'
                      }`}
                    >
                      <span className="text-xl font-bold w-16 text-center">{h.value}</span>
                      <div className="flex items-center gap-2 font-medium">
                        {h.result === 'correct' && <><CheckCircle2 size={20} /> 정답!</>}
                        {h.result === 'up' && <><ArrowUpCircle size={20} /> UP</>}
                        {h.result === 'down' && <><ArrowDownCircle size={20} /> DOWN</>}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
