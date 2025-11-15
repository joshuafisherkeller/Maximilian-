
import React, { useState, useCallback, useEffect } from 'react';
import { getSightWords } from '../services/wordService';
import { generateSpeech, playBase64Audio } from '../services/geminiService';
import { NextIcon, PrevIcon, SpeakerIcon } from './icons';

const WritingActivity: React.FC = () => {
    const [words, setWords] = useState<string[]>([]);
    const [wordIndex, setWordIndex] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    useEffect(() => {
        setWords(getSightWords());
    }, []);

    const currentWord = words[wordIndex] || '';

    const nextWord = useCallback(() => {
        if (words.length === 0) return;
        setWordIndex((prev) => (prev + 1) % words.length);
    }, [words.length]);

    const prevWord = useCallback(() => {
        if (words.length === 0) return;
        setWordIndex((prev) => (prev - 1 + words.length) % words.length);
    }, [words.length]);

    const speak = useCallback(async (text: string) => {
        if (isSpeaking) return;
        setIsSpeaking(true);
        const audioData = await generateSpeech(text);
        if (audioData) {
            playBase64Audio(audioData, () => setIsSpeaking(false));
        } else {
            setIsSpeaking(false);
        }
    }, [isSpeaking]);

    const speakInstructions = () => {
        if (currentWord) {
            speak(`Let's practice writing the word: ${currentWord}. Try to copy it!`);
        }
    };

    if (words.length === 0) {
        return <div className="font-display text-2xl">Loading words...</div>
    }

    return (
        <div className="w-full max-w-4xl bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col items-center">
            <button 
                onClick={speakInstructions}
                disabled={isSpeaking}
                className="font-display text-xl mb-4 text-blue-600 bg-blue-100 px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-blue-200 transition"
            >
                <SpeakerIcon />
                <span>Hear Instructions</span>
            </button>
            <div className="flex justify-center items-center my-8 bg-gray-100 p-8 rounded-lg border-4 border-dashed border-gray-300 w-full">
                <span className="font-mono text-8xl md:text-9xl tracking-widest text-gray-700">
                    {currentWord}
                </span>
            </div>
            <div className="flex items-center justify-between w-full mt-4">
                <button
                    onClick={prevWord}
                    className="p-4 bg-green-400 text-white rounded-full shadow-lg hover:bg-green-500 transition-transform transform hover:scale-110"
                    aria-label="Previous Word"
                >
                    <PrevIcon />
                </button>
                <div className="font-display text-5xl md:text-7xl text-purple-600">{currentWord}</div>
                <button
                    onClick={nextWord}
                    className="p-4 bg-green-400 text-white rounded-full shadow-lg hover:bg-green-500 transition-transform transform hover:scale-110"
                    aria-label="Next Word"
                >
                    <NextIcon />
                </button>
            </div>
        </div>
    );
};

export default WritingActivity;
