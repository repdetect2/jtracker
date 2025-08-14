'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, BookOpen, BarChart, TrendingUp, Target } from 'lucide-react';

const JapaneseTracker = () => {
  // State for different tracking data
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dailyStats, setDailyStats] = useState([]);
  const [readingLog, setReadingLog] = useState([]);
  const [currentStats, setCurrentStats] = useState({
    totalSentences: 0,
    totalWords: 0,
    totalAnki: 0,
    totalReading: 0,
    totalListening: 0
  });
  
  // Goals and targets
  const [goals, setGoals] = useState({
    sentenceGoal: 10000,
    listeningGoal: 1100,
    readingGoal: 1000,
    immersionTimeGoal: 0.125, // hours per day
    ankiTimeGoal: 0.042, // hours per day
    durationYears: 2,
    startDate: new Date().toISOString().split('T')[0]
  });
  
  // EXP system
  const [expData, setExpData] = useState({
    currentLevel: 0,
    currentExp: 0,
    expToNextLevel: 100
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('japaneseTrackerData');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setDailyStats(data.dailyStats || []);
          setReadingLog(data.readingLog || []);
          setGoals(data.goals || goals);
        } catch (error) {
          console.error('Error loading saved data:', error);
        }
      }
    }
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dataToSave = {
        dailyStats,
        readingLog,
        goals,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('japaneseTrackerData', JSON.stringify(dataToSave));
    }
  }, [dailyStats, readingLog, goals]);

  // Initialize with sample data if no data exists
  useEffect(() => {
    if (dailyStats.length === 0) {
      const today = new Date();
      const sampleStats = [
        {
          id: 1,
          date: today.toISOString().split('T')[0],
          sentencesAdded: 2,
          wordsAdded: 2,
          reading: 0,
          listening: 0,
          passiveListening: 0,
          anki: 0.015,
          shadowing: 0,
          unknownWords: 0,
          wildSentences: 0,
          dictionarySentences: 0,
          comments: ''
        }
      ];
      setDailyStats(sampleStats);
    }

    if (readingLog.length === 0) {
      const sampleReading = [
        {
          id: 1,
          book: '',
          readingTime: 0,
          unknownWords: 0,
          pages: 0,
          wordsMarkedKnown: 0
        }
      ];
      setReadingLog(sampleReading);
    }
  }, [dailyStats.length, readingLog.length]);

  // Add new daily entry
  const addDailyEntry = () => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      sentencesAdded: 0,
      wordsAdded: 0,
      reading: 0,
      listening: 0,
      passiveListening: 0,
      anki: 0,
      shadowing: 0,
      unknownWords: 0,
      wildSentences: 0,
      dictionarySentences: 0,
      comments: ''
    };
    setDailyStats([...dailyStats, newEntry]);
  };

  // Update daily entry
  const updateDailyEntry = (id, field, value) => {
    setDailyStats(stats => 
      stats.map(entry => 
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  // Add reading log entry
  const addReadingEntry = () => {
    const newEntry = {
      id: Date.now(),
      book: '',
      readingTime: 0,
      unknownWords: 0,
      pages: 0,
      wordsMarkedKnown: 0
    };
    setReadingLog([...readingLog, newEntry]);
  };

  // Update reading entry
  const updateReadingEntry = (id, field, value) => {
    setReadingLog(log => 
      log.map(entry => 
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  // Update goals
  const updateGoal = (field, value) => {
    setGoals(prev => ({ ...prev, [field]: value }));
  };

  // Calculate cumulative stats and EXP
  const calculateStats = () => {
    const totals = dailyStats.reduce((acc, entry) => ({
      totalSentences: acc.totalSentences + (Number(entry.sentencesAdded) || 0),
      totalWords: acc.totalWords + (Number(entry.wordsAdded) || 0),
      totalAnki: acc.totalAnki + (Number(entry.anki) || 0),
      totalReading: acc.totalReading + (Number(entry.reading) || 0),
      totalListening: acc.totalListening + (Number(entry.listening) || 0)
    }), {
      totalSentences: 0,
      totalWords: 0,
      totalAnki: 0,
      totalReading: 0,
      totalListening: 0
    });
    
    setCurrentStats(totals);
    
    // Calculate EXP based on sentences (main progression metric)
    const sentenceExp = totals.totalSentences;
    const level = Math.floor(sentenceExp / 100); // 100 sentences per level
    const expInCurrentLevel = sentenceExp % 100;
    
    setExpData({
      currentLevel: level,
      currentExp: expInCurrentLevel,
      expToNextLevel: 100
    });
  };

  useEffect(() => {
    calculateStats();
  }, [dailyStats]);

  // Render daily stats table
  const renderStatsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 border text-left">Date</th>
            <th className="px-4 py-2 border text-left">ST Added</th>
            <th className="px-4 py-2 border text-left">Words Added</th>
            <th className="px-4 py-2 border text-left">Reading (h)</th>
            <th className="px-4 py-2 border text-left">Listening (h)</th>
            <th className="px-4 py-2 border text-left">Passive LI (h)</th>
            <th className="px-4 py-2 border text-left">Anki (h)</th>
            <th className="px-4 py-2 border text-left">Shadowing (h)</th>
            <th className="px-4 py-2 border text-left">Unknown Words</th>
            <th className="px-4 py-2 border text-left">Wild ST</th>
            <th className="px-4 py-2 border text-left">Dict ST</th>
            <th className="px-4 py-2 border text-left">Comments</th>
          </tr>
        </thead>
        <tbody>
          {dailyStats.map(entry => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">
                <input
                  type="date"
                  value={entry.date}
                  onChange={(e) => updateDailyEntry(entry.id, 'date', e.target.value)}
                  className="w-full border-none bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  value={entry.sentencesAdded}
                  onChange={(e) => updateDailyEntry(entry.id, 'sentencesAdded', e.target.value)}
                  className="w-full border-none bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  value={entry.wordsAdded}
                  onChange={(e) => updateDailyEntry(entry.id, 'wordsAdded', e.target.value)}
                  className="w-full border-none bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  step="0.1"
                  value={entry.reading}
                  onChange={(e) => updateDailyEntry(entry.id, 'reading', e.target.value)}
                  className="w-full border-none bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  step="0.1"
                  value={entry.listening}
                  onChange={(e) => updateDailyEntry(entry.id, 'listening', e.target.value)}
                  className="w-full border-none bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  step="0.1"
                  value={entry.passiveListening}
                  onChange={(e) => updateDailyEntry(entry.id, 'passiveListening', e.target.value)}
                  className="w-full border-none bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  step="0.01"
                  value={entry.anki}
                  onChange={(e) => updateDailyEntry(entry.id, 'anki', e.target.value)}
                  className="w-full border-none bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  step="0.1"
                  value={entry.shadowing}
                  onChange={(e) => updateDailyEntry(entry.id, 'shadowing', e.target.value)}
                  className="w-full border-none bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  value={entry.unknownWords}
                  onChange={(e) => updateDailyEntry(entry.id, 'unknownWords', e.target.value)}
                  className="w-full border-none bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  value={entry.wildSentences}
                  onChange={(e) => updateDailyEntry(entry.id, 'wildSentences', e.target.value)}
                  className="w-full border-none bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  value={entry.dictionarySentences}
                  onChange={(e) => updateDailyEntry(entry.id, 'dictionarySentences', e.target.value)}
                  className="w-full border-none bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="text"
                  value={entry.comments}
                  onChange={(e) => updateDailyEntry(entry.id, 'comments', e.target.value)}
                  className="w-full border-none bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                  placeholder="Comments..."
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={addDailyEntry}
        className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        <Plus size={16} />
        Add New Day
      </button>
    </div>
  );

  // Render reading log table
  const renderReadingLog = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 border text-left">Book</th>
            <th className="px-4 py-2 border text-left">Total Reading Time (h)</th>
            <th className="px-4 py-2 border text-left">Unknown Words</th>
            <th className="px-4 py-2 border text-left">Pages</th>
            <th className="px-4 py-2 border text-left">Words Marked Known</th>
            <th className="px-4 py-2 border text-left">Avg Unknown/Page</th>
            <th className="px-4 py-2 border text-left">Avg Time/Page</th>
          </tr>
        </thead>
        <tbody>
          {readingLog.map(entry => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">
                <input
                  type="text"
                  value={entry.book}
                  onChange={(e) => updateReadingEntry(entry.id, 'book', e.target.value)}
                  className="w-full border-none bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                  placeholder="Book title..."
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  step="0.1"
                  value={entry.readingTime}
                  onChange={(e) => updateReadingEntry(entry.id, 'readingTime', e.target.value)}
                  className="w-full border-none bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  value={entry.unknownWords}
                  onChange={(e) => updateReadingEntry(entry.id, 'unknownWords', e.target.value)}
                  className="w-full border-none bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  value={entry.pages}
                  onChange={(e) => updateReadingEntry(entry.id, 'pages', e.target.value)}
                  className="w-full border-none bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  value={entry.wordsMarkedKnown}
                  onChange={(e) => updateReadingEntry(entry.id, 'wordsMarkedKnown', e.target.value)}
                  className="w-full border-none bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                />
              </td>
              <td className="px-4 py-2 border text-gray-600">
                {entry.pages > 0 ? (entry.unknownWords / entry.pages).toFixed(2) : '0.00'}
              </td>
              <td className="px-4 py-2 border text-gray-600">
                {entry.pages > 0 ? (entry.readingTime / entry.pages).toFixed(2) : '0.00'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={addReadingEntry}
        className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        <Plus size={16} />
        Add Reading Entry
      </button>
    </div>
  );

  // Render EXP Bar
  const renderExpBar = () => {
    const expPercentage = (expData.currentExp / expData.expToNextLevel) * 100;
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Level {expData.currentLevel}</h2>
          <p className="text-gray-600">Sentence-based progression system</p>
        </div>
        
        {/* EXP Bar */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress to Level {expData.currentLevel + 1}</span>
            <span className="text-sm text-gray-500">{expData.currentExp}/{expData.expToNextLevel} sentences</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500 ease-out progress-bar"
              style={{ width: `${expPercentage}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-600">
            {expData.expToNextLevel - expData.currentExp} sentences until next level
          </p>
        </div>

        {/* Goals Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-800 mb-2">Sentences Goal</h3>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{currentStats.totalSentences}/{goals.sentenceGoal}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full progress-bar"
                style={{ width: `${Math.min((currentStats.totalSentences / goals.sentenceGoal) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-800 mb-2">Listening Goal</h3>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{currentStats.totalListening.toFixed(1)}h/{goals.listeningGoal}h</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full progress-bar"
                style={{ width: `${Math.min((currentStats.totalListening / goals.listeningGoal) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-800 mb-2">Reading Goal</h3>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{currentStats.totalReading.toFixed(1)}h/{goals.readingGoal}h</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full progress-bar"
                style={{ width: `${Math.min((currentStats.totalReading / goals.readingGoal) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Current Stats page
  const renderCurrentStats = () => {
    const daysTracked = dailyStats.length;
    const avgSentencesPerDay = daysTracked > 0 ? (currentStats.totalSentences / daysTracked).toFixed(2) : 0;
    const avgStudyTimePerDay = daysTracked > 0 ? ((currentStats.totalReading + currentStats.totalListening + currentStats.totalAnki) / daysTracked).toFixed(2) : 0;
    
    return (
      <div className="space-y-6">
        {/* Goals Configuration */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Goals & Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sentence Goal</label>
              <input
                type="number"
                value={goals.sentenceGoal}
                onChange={(e) => updateGoal('sentenceGoal', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Listening Goal (hours)</label>
              <input
                type="number"
                value={goals.listeningGoal}
                onChange={(e) => updateGoal('listeningGoal', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reading Goal (hours)</label>
              <input
                type="number"
                value={goals.readingGoal}
                onChange={(e) => updateGoal('readingGoal', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Immersion Time Goal (h/day)</label>
              <input
                type="number"
                step="0.01"
                value={goals.immersionTimeGoal}
                onChange={(e) => updateGoal('immersionTimeGoal', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anki Time Goal (h/day)</label>
              <input
                type="number"
                step="0.01"
                value={goals.ankiTimeGoal}
                onChange={(e) => updateGoal('ankiTimeGoal', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (years)</label>
              <input
                type="number"
                value={goals.durationYears}
                onChange={(e) => updateGoal('durationYears', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />