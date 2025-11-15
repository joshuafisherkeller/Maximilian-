
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { SENTENCES } from '../constants';
import { getSightWords } from '../services/wordService';
import { generateSpeech, playBase64Audio } from '../services/geminiService';
import { NextIcon, SpeakerIcon, CheckIcon, XIcon } from './icons';

const SentenceActivity: React.FC = () => {
    const [sentenceIndex, setSentenceIndex] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [score, setScore] = useState(0);
    const [sightWordSet, setSightWordSet] = useState<Set<string>>(new Set());
    const [needsHelp, setNeedsHelp] = useState(false);
    
    useEffect(() => {
        setSightWordSet(new Set(getSightWords()));
    }, []);

    const currentSentence = SENTENCES[sentenceIndex];

    const nextSentence = useCallback(() => {
        setNeedsHelp(false);
        setSentenceIndex((prev) => (prev + 1) % SENTENCES.length);
    }, []);

    const handleCorrect = () => {
        setScore(s => s + 1);
        nextSentence();
    }
    
    const speakSentence = useCallback(async () => {
        if (isSpeaking) return;
        setNeedsHelp(true);
        setIsSpeaking(true);
        const audioData = await generateSpeech(currentSentence);
        if (audioData) {
            playBase64Audio(audioData, () => setIsSpeaking(false));
        } else {
            setIsSpeaking(false);
        }
    }, [isSpeaking, currentSentence]);

    const renderSentence = () => {
        // Split by space or punctuation, but keep the delimiters
        const wordsAndDelimiters = currentSentence.split(/([ .,!?]+)/); 
        return wordsAndDelimiters.map((part, index) => {
            const cleanWord = part.trim().toLowerCase();
            if (sightWordSet.has(cleanWord)) {
                return (
                    <span key={index} className="bg-yellow-300 font-bold px-1 rounded-md">
                        {part}
                    </span>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div className="w-full max-w-4xl bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 text-center flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-6">
                <h2 className="font-display text-4xl text-green-600">Read the Sentence!</h2>
                <div className="font-display text-2xl text-blue-600">Score: {score}</div>
            </div>
            <div className="text-3xl md:text-5xl leading-relaxed md:leading-snug mb-10 p-4 bg-white rounded-lg shadow-inner min-h-[10rem] flex items-center justify-center">
                <p>{renderSentence()}</p>
            </div>
            <div className="flex items-center space-x-6">
                 <button
                    onClick={speakSentence}
                    disabled={isSpeaking}
                    className="p-4 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-transform transform hover:scale-110 disabled:bg-gray-400"
                    aria-label="I need help"
                >
                    <XIcon />
                </button>
                 <button
                    onClick={handleCorrect}
                    disabled={isSpeaking || needsHelp}
                    className="p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-transform transform hover:scale-110 disabled:bg-gray-400"
                    aria-label="I can read it!"
                >
                    <CheckIcon />
                </button>
                <button
                    onClick={nextSentence}
                    className="p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-110"
                    aria-label="Next Sentence"
                >
                    <NextIcon />
                </button>
            </div>
        </div>
    );
};

export default SentenceActivity;
