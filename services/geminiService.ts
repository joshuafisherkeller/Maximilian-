import { GoogleGenAI, Modality } from "@google/genai";

let ai: GoogleGenAI | null = null;

// Asynchronously initialize the GoogleGenAI client
const initializeAi = async (): Promise<GoogleGenAI | null> => {
    // If already initialized, return the existing instance
    if (ai) {
        return ai;
    }

    try {
        // Fetch the API key from our secure serverless function
        const response = await fetch('/api/getKey');
        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error || 'Failed to fetch API key from server.');
        }
        const { apiKey } = await response.json();

        if (apiKey) {
            // Create a new instance and store it for reuse
            ai = new GoogleGenAI({ apiKey });
            return ai;
        } else {
            throw new Error('API key was not returned from the server.');
        }
    } catch (error) {
        console.error("Could not initialize Gemini AI:", error);
        alert(`The text-to-speech feature is currently unavailable. Reason: ${error.message}`);
        return null;
    }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  const aiClient = await initializeAi();
  if (!aiClient) {
      console.error("Gemini service is not initialized. Cannot generate speech.");
      return null;
  }
  try {
    const response = await aiClient.models.generateContent({
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
    alert("An error occurred while generating speech. Please check the console for details.");
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
