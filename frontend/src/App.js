import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

const LANGUAGE_OPTIONS = [
  { key: 'pseudocode', name: 'Pseudocode', ext: 'txt' },
  { key: 'python', name: 'Python', ext: 'py' },
  { key: 'javascript', name: 'JavaScript', ext: 'js' },
  { key: 'java', name: 'Java', ext: 'java' },
  { key: 'cpp', name: 'C++', ext: 'cpp' },
  { key: 'csharp', name: 'C#', ext: 'cs' },
  { key: 'go', name: 'Go', ext: 'go' },
  { key: 'rust', name: 'Rust', ext: 'rs' },
  { key: 'php', name: 'PHP', ext: 'php' },
  { key: 'swift', name: 'Swift', ext: 'swift' },
  { key: 'kotlin', name: 'Kotlin', ext: 'kt' },
  { key: 'flowchart', name: 'Flowchart', ext: 'md' }
];

function App() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [activeTab, setActiveTab] = useState('translate');
  
  // Input states
  const [inputCode, setInputCode] = useState('');
  const [selectedInputLanguage, setSelectedInputLanguage] = useState('auto');
  const [selectedOutputLanguage, setSelectedOutputLanguage] = useState('javascript');
  
  // Output states
  const [outputCode, setOutputCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // Analysis states
  const [analysisCode, setAnalysisCode] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // Learning states
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState([]);
  
  // Local storage management
  const LOCAL_STORAGE_KEYS = {
    ACCOUNTS: 'codeSwitch_accounts',
    CURRENT_USER: 'codeSwitch_current_user',
    USER_DATA_PREFIX: 'codeSwitch_user_'
  };

  useEffect(() => {
    try {
      const currentUserData = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
      if (currentUserData) {
        const user = JSON.parse(currentUserData);
        setCurrentUser(user);
        loadUserData(user.username);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  const loadUserData = (username) => {
    try {
      const userData = localStorage.getItem(`${LOCAL_STORAGE_KEYS.USER_DATA_PREFIX}${username}`);
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUserProfile(parsedData.profile || null);
        setChatHistory(parsedData.chatHistory || []);
        setPersonalizedSuggestions(parsedData.personalizedSuggestions || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const translateCode = async () => {
    if (!inputCode.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API}/process`, {
        session_id: sessionId,
        input_type: 'code',
        content: inputCode,
        target_language: selectedOutputLanguage
      });
      
      const targetCode = response.data.code_outputs[selectedOutputLanguage] || 
                        response.data.pseudocode || // Fallback for direct translation
                        'Translation failed';
      setOutputCode(targetCode);
      
    } catch (err) {
      console.error('Translation error:', err);
      setError('Failed to translate code');
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeCode = async () => {
    if (!analysisCode.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API}/analyze-code`, {
        session_id: sessionId,
        input_type: 'code_analysis',
        content: analysisCode
      });
      
      setAnalysisResult(response.data);
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze code');
    } finally {
      setIsProcessing(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !currentUser) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);
    
    try {
      const response = await axios.post(`${API}/chat`, {
        session_id: sessionId,
        message: userMessage,
        context: {}
      });
      
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        message: response.data.response,
        skill_level: response.data.skill_level 
      }]);
      
    } catch (err) {
      console.error('Chat error:', err);
      setChatHistory(prev => [...prev, { 
        type: 'error', 
        message: 'Sorry, I had trouble responding.' 
      }]);
    }
  };

  const copyToRefactor = () => {
    setAnalysisCode(outputCode);
    setActiveTab('analyze');
  };

  return (
    <div className="min-h-screen text-white font-mono" style={{backgroundColor: '#09090b'}}>
      <div className="max-w-7xl mx-auto p-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-light tracking-[0.3em] mb-4">
            CODE SWITCH
          </h1>
          
          {/* Tab Navigation */}
          <div className="flex justify-center items-center space-x-12 mt-12 mb-16">
            {[
              { id: 'translate', label: 'translate' },
              { id: 'analyze', label: 'analyze' },
              { id: 'learn', label: 'learn' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xl font-light tracking-wide transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'border-b-2 border-zinc-50 pb-1'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Translate Tab */}
        {activeTab === 'translate' && (
          <div className="grid grid-cols-2 gap-16">
            
            {/* Input Side */}
            <div className="space-y-6">
              <div className="text-zinc-400 text-sm font-light tracking-wider">
                INPUT
              </div>
              
              <textarea
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="paste code here"
                className="w-full h-96 bg-transparent border border-zinc-800 focus:border-zinc-600 outline-none p-6 text-sm leading-relaxed resize-none"
              />
              
              <div className="space-y-3">
                <select
                  value={selectedOutputLanguage}
                  onChange={(e) => setSelectedOutputLanguage(e.target.value)}
                  className="w-full bg-transparent border border-zinc-800 focus:border-zinc-600 outline-none p-3 text-sm"
                >
                  {LANGUAGE_OPTIONS.map(lang => (
                    <option key={lang.key} value={lang.key} className="bg-zinc-950">
                      {lang.name}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={translateCode}
                  disabled={isProcessing || !inputCode.trim()}
                  className="w-full py-3 border border-zinc-800 hover:border-zinc-600 disabled:border-zinc-900 disabled:text-zinc-600 transition-colors text-sm font-light tracking-wider"
                >
                  {isProcessing ? 'translating...' : 'translate'}
                </button>
              </div>
            </div>

            {/* Output Side */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-zinc-400 text-sm font-light tracking-wider">
                  OUTPUT
                </div>
                {outputCode && (
                  <button
                    onClick={copyToRefactor}
                    className="text-xs text-zinc-500 hover:text-zinc-300 tracking-wide"
                  >
                    → refactor tab
                  </button>
                )}
              </div>
              
              <div className="relative">
                <textarea
                  value={outputCode}
                  onChange={(e) => setOutputCode(e.target.value)}
                  placeholder="translated code appears here"
                  className="w-full h-96 bg-transparent border border-zinc-800 focus:border-zinc-600 outline-none p-6 text-sm leading-relaxed resize-none"
                />
                {outputCode && (
                  <div className="absolute bottom-4 right-4 text-xs text-zinc-600">
                    ✎ edit
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <div className="grid grid-cols-2 gap-16">
            
            {/* Code Side */}
            <div className="space-y-6">
              <div className="text-zinc-400 text-sm font-light tracking-wider">
                CODE
              </div>
              
              <textarea
                value={analysisCode}
                onChange={(e) => setAnalysisCode(e.target.value)}
                placeholder="paste code to analyze"
                className="w-full h-96 bg-transparent border border-zinc-800 focus:border-zinc-600 outline-none p-6 text-sm leading-relaxed resize-none"
              />
              
              <button
                onClick={analyzeCode}
                disabled={isProcessing || !analysisCode.trim()}
                className="w-full py-3 border border-zinc-800 hover:border-zinc-600 disabled:border-zinc-900 disabled:text-zinc-600 transition-colors text-sm font-light tracking-wider"
              >
                {isProcessing ? 'analyzing...' : 'analyze'}
              </button>
            </div>

            {/* Analysis Side */}
            <div className="space-y-8">
              <div className="text-zinc-400 text-sm font-light tracking-wider">
                ANALYSIS
              </div>
              
              {analysisResult ? (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                      <span className="text-zinc-400 text-sm">complexity</span>
                      <span className="text-zinc-50 font-light">{analysisResult.code_analysis?.time_complexity || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                      <span className="text-zinc-400 text-sm">quality</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-1 bg-zinc-800">
                          <div 
                            className="h-full bg-zinc-50" 
                            style={{width: `${(analysisResult.code_analysis?.quality_score || 0) * 10}%`}}
                          ></div>
                        </div>
                        <span className="text-zinc-50 text-sm">{analysisResult.code_analysis?.quality_score || 0}/10</span>
                      </div>
                    </div>
                  </div>
                  
                  {analysisResult.code_analysis?.optimizations && (
                    <div className="space-y-3">
                      <div className="text-zinc-400 text-sm">suggestions:</div>
                      <div className="space-y-2">
                        {analysisResult.code_analysis.optimizations.map((opt, i) => (
                          <div key={i} className="text-sm text-zinc-300">
                            • {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button className="text-xs text-zinc-500 hover:text-zinc-300 tracking-wide">
                    ✎ refactor
                  </button>
                </div>
              ) : (
                <div className="text-zinc-600 text-sm font-light">
                  analysis will appear here
                </div>
              )}
            </div>
          </div>
        )}

        {/* Learn Tab */}
        {activeTab === 'learn' && (
          <div className="grid grid-cols-2 gap-16">
            
            {/* Journey Side */}
            <div className="space-y-8">
              <div className="text-zinc-400 text-sm font-light tracking-wider">
                YOUR JOURNEY
              </div>
              
              {currentUser ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                      <span className="text-zinc-400 text-sm">skill level</span>
                      <span className="text-zinc-50 font-light capitalize">
                        {userProfile?.skill_level || 'beginner'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                      <span className="text-zinc-400 text-sm">progress</span>
                      <div className="w-20 h-1 bg-zinc-800">
                        <div className="w-3/4 h-full bg-zinc-50"></div>
                      </div>
                    </div>
                  </div>
                  
                  {personalizedSuggestions.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-zinc-400 text-sm">next:</div>
                      <div className="space-y-2">
                        {personalizedSuggestions.slice(0, 3).map((suggestion, i) => (
                          <div key={i} className="text-sm text-zinc-300">
                            • {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-zinc-600 text-sm font-light">
                    create account to track progress
                  </div>
                  <button 
                    onClick={() => {/* show auth modal */}}
                    className="py-2 px-6 border border-zinc-800 hover:border-zinc-600 transition-colors text-sm font-light tracking-wider"
                  >
                    sign up
                  </button>
                </div>
              )}
            </div>

            {/* Tutor Side */}
            <div className="space-y-6">
              <div className="text-zinc-400 text-sm font-light tracking-wider">
                AI TUTOR
              </div>
              
              <div className="border border-zinc-800 h-80 p-4 space-y-4 overflow-y-auto">
                {chatHistory.length === 0 ? (
                  <div className="text-zinc-600 text-sm font-light">
                    ask anything about coding
                  </div>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div key={i} className={`text-sm ${
                      msg.type === 'user' ? 'text-zinc-50' : 
                      msg.type === 'error' ? 'text-zinc-500' : 'text-zinc-300'
                    }`}>
                      {msg.type === 'user' ? '> ' : ''}
                      {msg.message}
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="ask anything"
                  className="flex-1 bg-transparent border border-zinc-800 focus:border-zinc-600 outline-none p-3 text-sm"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || !currentUser}
                  className="px-6 py-3 border border-zinc-800 hover:border-zinc-600 disabled:border-zinc-900 disabled:text-zinc-600 transition-colors text-sm"
                >
                  send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-8 right-8 bg-zinc-900 border border-zinc-700 p-4 text-sm text-zinc-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;