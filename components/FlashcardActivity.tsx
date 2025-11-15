import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { getSightWords } from '../services/wordService';
import { generateSpeech, playBase64Audio } from '../services/geminiService';
import { CheckIcon, XIcon, NextIcon } from './icons';

const HIGH_SCORE_KEY = 'flashcardHighScore';

// A simple utility to shuffle an array
const shuffleArray = (array: string[]) => {
    return [...array].sort(() => Math.random() - 0.5);
};

const FlashcardActivity: React.FC = () => {
    const [words, setWords] = useState<string[]>([]);
    const [wordIndex, setWordIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [answeredWords, setAnsweredWords] = useState<Set<string>>(new Set());
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [needsHelp, setNeedsHelp] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);

    const loadGame = useCallback(() => {
        const sightWords = getSightWords();
        setWords(shuffleArray(sightWords));
        setWordIndex(0);
        setScore(0);
        setAnsweredWords(new Set());
        setNeedsHelp(false);
        setShowCelebration(false);
        const savedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
        setHighScore(savedHighScore ? parseInt(savedHighScore, 10) : 0);
    }, []);

    useEffect(() => {
        loadGame();
    }, [loadGame]);

    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem(HIGH_SCORE_KEY, score.toString());
        }
    }, [score, highScore]);

    const currentWord = words[wordIndex];
    const isGameOver = answeredWords.size === words.length && words.length > 0;

    useEffect(() => {
        if (isGameOver && score === words.length) {
            setShowCelebration(true);
        }
    }, [isGameOver, score, words.length]);

    const advanceToNextWord = useCallback(() => {
        setNeedsHelp(false);
        setAnsweredWords(prev => new Set(prev).add(currentWord));

        // Find the next unanswered word
        let nextIndex = (wordIndex + 1) % words.length;
        while (answeredWords.has(words[nextIndex]) && answeredWords.size < words.length -1) {
             nextIndex = (nextIndex + 1) % words.length;
        }
       
        setWordIndex(nextIndex);
    }, [wordIndex, words, currentWord, answeredWords]);


    const handleCorrect = useCallback(() => {
        if (isSpeaking || isGameOver) return;
        setScore(s => s + 1);
        advanceToNextWord();
    }, [isSpeaking, isGameOver, advanceToNextWord]);

    const handleIncorrect = useCallback(async () => {
        if (isSpeaking || isGameOver) return;
        setNeedsHelp(true);
        setIsSpeaking(true);
        const audioData = await generateSpeech(currentWord);
        if (audioData) {
            playBase64Audio(audioData, () => setIsSpeaking(false));
        } else {
            setIsSpeaking(false);
        }
    }, [isSpeaking, isGameOver, currentWord]);
    
    if (words.length === 0) {
        return <div className="font-display text-2xl">Loading words...</div>
    }
    
    if (showCelebration) {
        return (
            <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col items-center text-center">
                 <h2 className="font-display text-5xl text-yellow-500 animate-bounce">CONGRATULATIONS!</h2>
                 <p className="text-2xl mt-4 text-green-600 font-bold">You got a perfect score!</p>
                 <p className="text-6xl mt-4">🎉🏆🥳</p>
                 <button onClick={loadGame} className="mt-8 px-8 py-4 bg-blue-500 text-white font-display text-2xl rounded-lg shadow-lg hover:bg-blue-600 transition">Play Again</button>
            </div>
        )
    }

    if (isGameOver) {
         return (
            <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col items-center text-center">
                 <h2 className="font-display text-5xl text-blue-600">Great Job!</h2>
                 <p className="text-2xl mt-4">You finished the round!</p>
                 <p className="text-3xl font-bold mt-4">Your Score: <span className="text-pink-500">{score} / {words.length}</span></p>
                 <button onClick={loadGame} className="mt-8 px-8 py-4 bg-blue-500 text-white font-display text-2xl rounded-lg shadow-lg hover:bg-blue-600 transition">Play Again</button>
            </div>
        )
    }

    const progress = (answeredWords.size / words.length) * 100;

    return (
        <div className="w-full max-w-2xl bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col items-center">
            <div className="w-full mb-4">
                <div className="flex justify-between font-bold text-lg mb-1">
                    <span className="text-blue-600">Score: {score}</span>
                    <span className="text-purple-600">High Score: {highScore}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                    <div className="bg-green-400 h-6 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-center mt-1 text-gray-600">{answeredWords.size} of {words.length} words</p>
            </div>

            <div className="font-display text-6xl md:text-8xl p-8 md:p-12 my-6 rounded-2xl bg-white shadow-inner w-64 h-48 flex items-center justify-center">
                {currentWord}
            </div>
            
            <div className="flex items-center justify-center w-full space-x-6">
                {!needsHelp ? (
                    <>
                    <button
                        onClick={handleIncorrect}
                        disabled={isSpeaking}
                        className="p-4 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-transform transform hover:scale-110 disabled:opacity-50"
                        aria-label="I don't know this word"
                    >
                        <XIcon />
                    </button>
                    <button
                        onClick={handleCorrect}
                        disabled={isSpeaking}
                        className="p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-transform transform hover:scale-110 disabled:opacity-50"
                        aria-label="I know this word"
                    >
                        <CheckIcon />
                    </button>
                    </>
                ) : (
                    <button
                        onClick={advanceToNextWord}
                        disabled={isSpeaking}
                        className="p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-110 disabled:opacity-50 flex items-center gap-2 px-6"
                        aria-label="Next Word"
                    >
                        <span className="font-bold">Next</span>
                        <NextIcon />
                    </button>
                )}
            </div>
        </div>
    );
};

export default FlashcardActivity;