import React, { useState } from 'react';
import { HomeIcon, SpeakerIcon, WriteIcon, SentenceIcon, SettingsIcon } from './components/icons';
import FlashcardActivity from './components/FlashcardActivity';
import WritingActivity from './components/WritingActivity';
import SentenceActivity from './components/SentenceActivity';
import ParentSettings from './components/ParentSettings';

type Activity = 'home' | 'flashcards' | 'writing' | 'sentences';

const App: React.FC = () => {
  const [activity, setActivity] = useState<Activity>('home');
  const [showSettings, setShowSettings] = useState(false);

  const renderActivity = () => {
    switch (activity) {
      case 'flashcards':
        return <FlashcardActivity />;
      case 'writing':
        return <WritingActivity />;
      case 'sentences':
        return <SentenceActivity />;
      default:
        return <ActivitySelector setActivity={setActivity} openSettings={() => setShowSettings(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-sky-200 text-gray-800 p-4 sm:p-6 lg:p-8 flex flex-col relative overflow-hidden">
      {showSettings && <ParentSettings onClose={() => setShowSettings(false)} />}
      <div className="absolute top-0 left-0 w-full h-full bg-no-repeat bg-bottom bg-contain" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"}}></div>
      <div className="relative z-10 flex flex-col flex-grow">
        <header className="flex justify-between items-center mb-6">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-yellow-400 text-shadow" style={{textShadow: '3px 3px 0 #4A90E2'}}>
            Maximilian's Sight Word Adventure
          </h1>
          <div className="flex items-center space-x-2">
            {activity !== 'home' && (
              <button
                onClick={() => setActivity('home')}
                className="p-3 bg-white rounded-full shadow-lg hover:bg-yellow-100 transition-transform transform hover:scale-110"
                aria-label="Go Home"
              >
                <HomeIcon />
              </button>
            )}
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center">
          {renderActivity()}
        </main>
      </div>
    </div>
  );
};

interface ActivitySelectorProps {
    setActivity: (activity: Activity) => void;
    openSettings: () => void;
}

const ActivitySelector: React.FC<ActivitySelectorProps> = ({ setActivity, openSettings }) => (
    <div className='w-full flex flex-col items-center'>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            <ActivityCard
                title="Word Flashcards"
                icon={<SpeakerIcon />}
                color="bg-red-400 hover:bg-red-500"
                onClick={() => setActivity('flashcards')}
            />
            <ActivityCard
                title="Writing Practice"
                icon={<WriteIcon />}
                color="bg-green-400 hover:bg-green-500"
                onClick={() => setActivity('writing')}
            />
            <ActivityCard
                title="Sentence Game"
                icon={<SentenceIcon />}
                color="bg-blue-400 hover:bg-blue-500"
                onClick={() => setActivity('sentences')}
            />
        </div>
        <button onClick={openSettings} className="mt-10 flex items-center gap-2 text-gray-600 hover:text-blue-600 bg-white/70 px-4 py-2 rounded-full shadow-md transition-colors">
            <SettingsIcon />
            <span>Parent Settings</span>
        </button>
    </div>
);

interface ActivityCardProps {
    title: string;
    icon: React.ReactNode;
    color: string;
    onClick: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ title, icon, color, onClick }) => (
    <button
        onClick={onClick}
        className={`${color} text-white font-display rounded-2xl shadow-xl p-8 transform transition-transform hover:-translate-y-2 flex flex-col items-center justify-center space-y-4`}
    >
        <div className="w-20 h-20">{icon}</div>
        <span className="text-3xl text-center">{title}</span>
    </button>
);

export default App;