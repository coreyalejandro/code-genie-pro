import React, { useState, useEffect, useRef } from 'react';
import { Upload, Mic, Code, FileText, Image, Play, Copy, Download, Loader2, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LANGUAGE_OPTIONS = [
  { key: 'python', name: 'Python', icon: '🐍' },
  { key: 'javascript', name: 'JavaScript', icon: '🟨' },
  { key: 'java', name: 'Java', icon: '☕' },
  { key: 'cpp', name: 'C++', icon: '⚡' },
  { key: 'csharp', name: 'C#', icon: '🔷' },
  { key: 'go', name: 'Go', icon: '🐹' },
  { key: 'rust', name: 'Rust', icon: '🦀' },
  { key: 'typescript', name: 'TypeScript', icon: '🔷' },
  { key: 'swift', name: 'Swift', icon: '🍎' },
  { key: 'kotlin', name: 'Kotlin', icon: '🟣' }
];

// Dynamic examples that rotate
const EXAMPLE_PROMPTS = [
  {
    category: "Sorting Algorithms",
    examples: [
      "Create a function that sorts an array using bubble sort algorithm",
      "Implement quicksort algorithm to sort numbers in ascending order",
      "Build a merge sort function that divides and conquers an array",
      "Design an insertion sort algorithm for small datasets",
      "Create a heap sort implementation for efficient sorting"
    ]
  },
  {
    category: "Search Algorithms", 
    examples: [
      "Implement binary search to find an element in a sorted array",
      "Create a linear search function to find a value in an unsorted list",
      "Build a depth-first search algorithm for tree traversal",
      "Design breadth-first search for finding shortest path in a graph",
      "Implement hash table search with collision handling"
    ]
  },
  {
    category: "Data Structures",
    examples: [
      "Create a stack data structure with push, pop, and peek operations",
      "Implement a queue with enqueue and dequeue functionality",
      "Build a binary tree with insert, delete, and search methods",
      "Design a linked list with add, remove, and traverse operations",
      "Create a hash map with dynamic resizing capabilities"
    ]
  },
  {
    category: "Mathematical Algorithms",
    examples: [
      "Calculate factorial of a number using recursion and iteration",
      "Generate Fibonacci sequence up to n terms using dynamic programming",
      "Find the greatest common divisor (GCD) using Euclidean algorithm",
      "Implement prime number checker using sieve of Eratosthenes",
      "Create a function to calculate power of a number efficiently"
    ]
  },
  {
    category: "String Processing",
    examples: [
      "Check if a string is a palindrome ignoring case and spaces",
      "Find all anagrams of a word in a list of strings",
      "Implement string pattern matching using KMP algorithm",
      "Create a function to reverse words in a sentence",
      "Build a text compression algorithm using character frequency"
    ]
  },
  {
    category: "Web Development",
    examples: [
      "Create a REST API endpoint that handles user authentication",
      "Build a responsive navigation menu with dropdown functionality",
      "Implement form validation with error handling and user feedback",
      "Design a shopping cart system with add, remove, and total calculation",
      "Create a real-time chat application with WebSocket connections"
    ]
  },
  {
    category: "Game Development",
    examples: [
      "Create a tic-tac-toe game with win condition checking",
      "Implement a rock-paper-scissors game with score tracking",
      "Build a number guessing game with hints and attempts counter",
      "Design a simple 2D collision detection system",
      "Create a maze generator using recursive backtracking"
    ]
  }
];

// Function to get a random example
const getRandomExample = () => {
  const allExamples = EXAMPLE_PROMPTS.flatMap(category => 
    category.examples.map(example => ({
      text: example,
      category: category.category
    }))
  );
  return allExamples[Math.floor(Math.random() * allExamples.length)];
};

function App() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [activeTab, setActiveTab] = useState('input');
  const [inputType, setInputType] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imageDescription, setImageDescription] = useState('');
  const [currentExample, setCurrentExample] = useState(() => getRandomExample());
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const flowchartRef = useRef(null);

  // Get a new random example
  const getNewExample = () => {
    setCurrentExample(getRandomExample());
  };

  // Audio recording setup
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
          };
        })
        .catch(err => console.error('Error accessing microphone:', err));
    }
  }, []);

  // Display flowchart content (simplified approach - no Mermaid rendering)
  useEffect(() => {
    if (result && result.flowchart && flowchartRef.current) {
      try {
        // Clear previous content
        flowchartRef.current.innerHTML = '';
        
        // Clean the flowchart content
        let flowchartContent = result.flowchart.trim();
        
        // Remove markdown code blocks
        flowchartContent = flowchartContent
          .replace(/```mermaid\n?/g, '')
          .replace(/```\n?/g, '')
          .replace(/[\u2018\u2019]/g, "'") // Replace smart quotes
          .replace(/[\u201C\u201D]/g, '"') // Replace smart double quotes
          .trim();
        
        console.log('Flowchart content:', flowchartContent);
        
        // Create a clean display
        const displayDiv = document.createElement('div');
        displayDiv.className = 'p-4 bg-slate-900 rounded';
        displayDiv.innerHTML = `
          <div class="mb-3 flex items-center text-blue-400">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V7.618a1 1 0 01.553-.894L9 4l6 3 6-3 6 3v8.764a1 1 0 01-.553.894L21 20l-6-3-6 3z"></path>
            </svg>
            <span class="font-medium">AI-Generated Flowchart</span>
          </div>
          <div class="bg-slate-800 p-3 rounded border-l-4 border-blue-500">
            <pre class="text-sm text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">${flowchartContent}</pre>
          </div>
          <div class="mt-3 text-xs text-slate-400 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Flowchart logic generated by AI - represents your algorithm's flow
          </div>
        `;
        
        flowchartRef.current.appendChild(displayDiv);
        
      } catch (error) {
        console.error('Error displaying flowchart:', error);
        if (flowchartRef.current) {
          flowchartRef.current.innerHTML = `
            <div class="text-slate-400 p-4 text-center bg-slate-900 rounded">
              <p class="font-medium">Flowchart Generated</p>
              <p class="text-sm mt-2">Check browser console for details</p>
            </div>
          `;
        }
      }
    }
  }, [result]);

  // File drop zone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'],
      'video/*': ['.mp4', '.webm', '.mov', '.avi']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedFile(file);
        if (file.type.startsWith('image/')) {
          setInputType('image');
        } else if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
          setInputType('audio');
        }
      }
    }
  });

  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setUploadedFile(audioBlob);
        setInputType('audio');
      };
    }
  };

  const processInput = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      let response;
      
      if (inputType === 'image' && uploadedFile) {
        // Handle image upload
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('session_id', sessionId);
        formData.append('description', imageDescription);
        
        response = await axios.post(`${API}/process-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Handle text, code, or audio input
        let content;
        if (inputType === 'text') {
          content = textInput;
        } else if (inputType === 'code') {
          content = codeInput;
        } else if (inputType === 'audio' && uploadedFile) {
          // For audio, we'll send a placeholder since real speech-to-text would need additional setup
          content = "Audio file uploaded - please implement speech-to-text conversion";
        }
        
        response = await axios.post(`${API}/process`, {
          session_id: sessionId,
          input_type: inputType,
          content: content,
          description: inputType === 'image' ? imageDescription : null
        });
      }
      
      setResult(response.data);
      setActiveTab('results');
    } catch (err) {
      console.error('Processing error:', err);
      setError(err.response?.data?.detail || 'An error occurred while processing your input');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          showCopyFeedback('✅ Copied to clipboard!');
        })
        .catch(() => {
          // Fallback to legacy method
          fallbackCopyToClipboard(text);
        });
    } else {
      // Use fallback method
      fallbackCopyToClipboard(text);
    }
  };

  const fallbackCopyToClipboard = (text) => {
    try {
      // Create a temporary textarea element
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      // Try to copy using execCommand
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        showCopyFeedback('✅ Copied to clipboard!');
      } else {
        showCopyFeedback('❌ Copy failed - please select and copy manually');
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      showCopyFeedback('❌ Copy not supported - please select and copy manually');
    }
  };

  const showCopyFeedback = (message) => {
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1e293b;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-size: 14px;
      border: 1px solid #334155;
    `;
    
    document.body.appendChild(feedback);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 3000);
  };

  const downloadCode = (code, language) => {
    const extensions = {
      python: 'py', javascript: 'js', java: 'java', cpp: 'cpp',
      csharp: 'cs', go: 'go', rust: 'rs', typescript: 'ts',
      swift: 'swift', kotlin: 'kt'
    };
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extensions[language]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            AI <span className="text-blue-400">Multimodal</span> Coding Assistant
          </h1>
          <p className="text-slate-300 text-xl max-w-3xl mx-auto">
            Transform any input into pseudocode, flowcharts, and code in 10 programming languages
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800 rounded-lg p-1 flex space-x-1">
            <button
              onClick={() => setActiveTab('input')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'input'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <FileText className="w-5 h-5 inline mr-2" />
              Input
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'results'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              disabled={!result}
            >
              <Code className="w-5 h-5 inline mr-2" />
              Results
            </button>
          </div>
        </div>

        {/* Input Tab */}
        {activeTab === 'input' && (
          <div className="max-w-4xl mx-auto">
            {/* Input Type Selection */}
            <div className="bg-slate-800 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Choose Input Type</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { type: 'text', icon: FileText, label: 'Text Description' },
                  { type: 'code', icon: Code, label: 'Code Snippet' },
                  { type: 'image', icon: Image, label: 'Image/Diagram' },
                  { type: 'audio', icon: Mic, label: 'Voice/Audio' }
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setInputType(type)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      inputType === type
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-slate-600 hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Content */}
            <div className="bg-slate-800 rounded-lg p-6 mb-6">
              {inputType === 'text' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-white font-medium">
                      Describe your algorithm or logic:
                    </label>
                    <button
                      onClick={getNewExample}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-500/10 transition-all flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      New Example
                    </button>
                  </div>
                  
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-blue-400 text-sm font-medium">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        {currentExample.category} Example
                      </div>
                      <button
                        onClick={() => {
                          setTextInput(currentExample.text);
                          // Small delay to ensure state is updated, then process
                          setTimeout(() => {
                            processInput();
                          }, 100);
                        }}
                        disabled={isProcessing}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        {isProcessing ? (
                          <>
                            <svg className="w-4 h-4 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9 5a9 9 0 1118 0H3z" />
                            </svg>
                            Run Example
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-blue-200 text-sm leading-relaxed">{currentExample.text}</p>
                  </div>
                  
                  <div className="mb-3 p-3 bg-slate-800/50 border border-slate-600/50 rounded-lg">
                    <div className="flex items-center text-slate-400 text-sm font-medium mb-2">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Quick Start Instructions
                    </div>
                    <div className="text-slate-300 text-sm">
                      <span className="font-medium text-green-400">Option 1:</span> Click <span className="font-medium">"Run Example"</span> above to instantly see the AI in action
                      <br />
                      <span className="font-medium text-blue-400">Option 2:</span> Type your own algorithm description in the box below
                    </div>
                  </div>
                  
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={`Enter your own algorithm description here, or click "Run Example" above to try: "${currentExample.text}"`}
                    className="w-full h-32 bg-slate-700 text-white rounded-lg p-4 border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                  />
                  <div className="mt-2 text-xs text-slate-400 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 12v1m9-9h-1M4 12H3m15.364-6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    💡 Describe any algorithm, data structure, or programming concept - the more specific, the better!
                  </div>
                </div>
              )}

              {inputType === 'code' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-white font-medium">
                      Paste your code:
                    </label>
                    <button
                      onClick={() => {
                        const codeExamples = [
                          `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)`,
                          `function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[arr.length - 1];
    const left = [], right = [];
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] < pivot) left.push(arr[i]);
        else right.push(arr[i]);
    }
    return [...quickSort(left), pivot, ...quickSort(right)];
}`,
                          `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node`,
                          `public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`
                        ];
                        const randomCode = codeExamples[Math.floor(Math.random() * codeExamples.length)];
                        setCodeInput(randomCode);
                      }}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-500/10 transition-all flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Sample Code
                    </button>
                  </div>
                  <textarea
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="Paste your code here... (Click 'Sample Code' for examples)"
                    className="w-full h-32 bg-slate-700 text-white rounded-lg p-4 border border-slate-600 focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
                  />
                  <div className="mt-2 text-xs text-slate-400">
                    💡 Paste any code in any language - the AI will analyze and convert it
                  </div>
                </div>
              )}

              {inputType === 'image' && (
                <div>
                  <label className="block text-white font-medium mb-3">
                    Upload an image or diagram:
                  </label>
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center text-green-400 text-sm font-medium mb-2">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      What can you upload?
                    </div>
                    <ul className="text-green-200 text-sm space-y-1">
                      <li>• Flowcharts and diagrams</li>
                      <li>• Handwritten pseudocode or algorithms</li>
                      <li>• Screenshots of code or documentation</li>
                      <li>• Whiteboard drawings of logic flows</li>
                      <li>• UML diagrams or system architecture</li>
                    </ul>
                  </div>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-300 mb-2">
                      {uploadedFile ? uploadedFile.name : 'Drag & drop an image here, or click to select'}
                    </p>
                    <p className="text-sm text-slate-500">
                      Supports PNG, JPG, GIF, and other image formats
                    </p>
                  </div>
                  {uploadedFile && uploadedFile.type.startsWith('image/') && (
                    <div className="mt-4">
                      <label className="block text-white font-medium mb-2">
                        Optional: Describe what's in the image:
                      </label>
                      <input
                        type="text"
                        value={imageDescription}
                        onChange={(e) => setImageDescription(e.target.value)}
                        placeholder="E.g., flowchart showing a sorting algorithm, handwritten pseudocode, UML diagram..."
                        className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {inputType === 'audio' && (
                <div>
                  <label className="block text-white font-medium mb-3">
                    Record or upload audio:
                  </label>
                  <div className="flex flex-col space-y-4">
                    <div className="flex space-x-4">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                          isRecording
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <Mic className="w-5 h-5 mr-2" />
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                      </button>
                    </div>
                    <div className="text-center text-slate-400">or</div>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-slate-300">
                        {uploadedFile ? uploadedFile.name : 'Upload audio file'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Process Button */}
            <div className="text-center">
              <button
                onClick={processInput}
                disabled={isProcessing || (!textInput && !codeInput && !uploadedFile)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 inline mr-2" />
                    Transform with AI
                  </>
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center text-red-400">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Error:</span>
                </div>
                <p className="text-red-300 mt-1">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && result && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Pseudocode */}
              <div className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Pseudocode</h3>
                  <button
                    onClick={() => copyToClipboard(result.pseudocode)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto text-sm whitespace-pre-wrap">
                  {result.pseudocode}
                </pre>
              </div>

              {/* Flowchart */}
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Flowchart</h3>
                <div 
                  ref={flowchartRef}
                  className="bg-slate-900 p-4 rounded-lg overflow-auto min-h-[300px] flex items-center justify-center"
                />
              </div>
            </div>

            {/* Code Output */}
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Generated Code</h3>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                >
                  {LANGUAGE_OPTIONS.map(lang => (
                    <option key={lang.key} value={lang.key}>
                      {lang.icon} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">
                    {LANGUAGE_OPTIONS.find(l => l.key === selectedLanguage)?.name}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(result.code_outputs[selectedLanguage])}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => downloadCode(result.code_outputs[selectedLanguage], selectedLanguage)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg overflow-auto text-sm">
                  <code>{result.code_outputs[selectedLanguage]}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;