import { GoogleGenAI, Modality } from "@google/genai";

// Gracefully handle the absence of `process` in a browser environment,
// which is common in production deployments like Vercel.
const API_KEY = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI, AI features will be disabled:", error);
    ai = null;
  }
} else {
  console.warn("Gemini API key not found. AI features will be disabled. Make sure to set the API_KEY environment variable in your deployment settings (e.g., Vercel).");
}

export const generateSpeech = async (text: string): Promise<string | null> => {
  if (!ai) {
      console.error("Gemini service is not initialized. Cannot generate speech.");
      alert("The text-to-speech feature is currently unavailable. Please ensure the API key is configured correctly.");
      return null;
  }
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say cheerfully: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

// Helper to decode and play audio
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const playBase64Audio = async (base64: string, onEnded?: () => void) => {
    try {
        const audioBytes = decode(base64);
        const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
        if (onEnded) {
            source.onended = onEnded;
        }
    } catch (e) {
        console.error("Failed to play audio", e);
    }
};
