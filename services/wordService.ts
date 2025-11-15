
import { SIGHT_WORDS as defaultWords } from '../constants';

const STORAGE_KEY = 'sightWords';

// Function to get the current list of sight words
export const getSightWords = (): string[] => {
    const storedWords = localStorage.getItem(STORAGE_KEY);
    if (storedWords) {
        return JSON.parse(storedWords);
    }
    // If no words are in storage, initialize with defaults
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWords));
    return defaultWords;
};

// Function to save the list of sight words
const saveSightWords = (words: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
};

// Function to add a new sight word
export const addSightWord = (word: string): string[] => {
    const lowerCaseWord = word.toLowerCase().trim();
    if (!lowerCaseWord) return getSightWords();

    const currentWords = getSightWords();
    if (!currentWords.includes(lowerCaseWord)) {
        const newWords = [...currentWords, lowerCaseWord];
        saveSightWords(newWords);
        return newWords;
    }
    return currentWords;
};

// Function to remove a sight word
export const removeSightWord = (wordToRemove: string): string[] => {
    const currentWords = getSightWords();
    const newWords = currentWords.filter(word => word !== wordToRemove);
    saveSightWords(newWords);
    return newWords;
};

// Function to reset words to the default list
export const resetSightWords = (): string[] => {
    saveSightWords(defaultWords);
    return defaultWords;
};
