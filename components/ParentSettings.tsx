
import React, { useState, useEffect } from 'react';
import { getSightWords, addSightWord, removeSightWord, resetSightWords } from '../services/wordService';

interface ParentSettingsProps {
    onClose: () => void;
}

const ParentSettings: React.FC<ParentSettingsProps> = ({ onClose }) => {
    const [words, setWords] = useState<string[]>([]);
    const [newWord, setNewWord] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        setWords(getSightWords());
    }, []);

    const handleAddWord = (e: React.FormEvent) => {
        e.preventDefault();
        if (newWord.trim()) {
            const updatedWords = addSightWord(newWord);
            setWords(updatedWords);
            setNewWord('');
        }
    };

    const handleRemoveWord = (word: string) => {
        const updatedWords = removeSightWord(word);
        setWords(updatedWords);
    };

    const handleReset = () => {
        const updatedWords = resetSightWords();
        setWords(updatedWords);
        setShowConfirm(false);
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-display text-3xl text-blue-600">Parent Settings</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-bold text-2xl">&times;</button>
                </div>
                
                <form onSubmit={handleAddWord} className="flex gap-4 mb-4">
                    <input
                        type="text"
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        placeholder="Add a new sight word"
                        className="flex-grow p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        aria-label="New sight word"
                    />
                    <button type="submit" className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition">Add</button>
                </form>

                <div className="flex-grow overflow-y-auto border-2 border-gray-200 rounded-lg p-4 bg-gray-50 mb-4">
                    <h3 className="font-bold text-lg mb-2 text-gray-700">Current Word List ({words.length})</h3>
                    <div className="flex flex-wrap gap-2">
                        {words.map(word => (
                            <div key={word} className="flex items-center bg-blue-100 text-blue-800 text-lg font-semibold px-3 py-1 rounded-full">
                                <span>{word}</span>
                                <button onClick={() => handleRemoveWord(word)} className="ml-2 text-blue-500 hover:text-red-500 font-bold">&times;</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    {!showConfirm ? (
                        <button onClick={() => setShowConfirm(true)} className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition">Reset to Defaults</button>
                    ) : (
                        <div className="bg-red-100 p-3 rounded-lg flex items-center gap-4">
                            <p className="text-red-800">Are you sure?</p>
                            <button onClick={handleReset} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Yes, Reset</button>
                            <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400">Cancel</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ParentSettings;
