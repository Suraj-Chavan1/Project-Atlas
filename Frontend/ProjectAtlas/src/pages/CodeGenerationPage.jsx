import NavbarDB from '../components/NavbarDB'
import Sidebar from '../components/Sidebar'
import React, { useState } from 'react'
import { FaGithub, FaSave, FaCode } from 'react-icons/fa'

const CodeGenerationPage = () => {
  const [selectedTest, setSelectedTest] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatingCodeMap, setGeneratingCodeMap] = useState({});
  const [savingCodeMap, setSavingCodeMap] = useState({});
  const [pushingMap, setPushingMap] = useState({});
  const [pushedMap, setPushedMap] = useState({});

  // Mock test cases - replace with your actual data
  const testCases = [
    { id: 1, name: 'Test Case 1', description: 'Validates user authentication flow' },
    { id: 2, name: 'Test Case 2', description: 'Checks data processing pipeline' },
    { id: 3, name: 'Test Case 3', description: 'Verifies API response handling' },
  ];

  const handleSelectTest = (test) => {
    setSelectedTest(test);
    setGeneratedCode('');
  };

  const generateCode = () => {
    if (!selectedTest) return;
    
    // Update generating state for this test
    setGeneratingCodeMap(prev => ({
      ...prev,
      [selectedTest.id]: true
    }));
    
    // Mock API call to generate code
    setTimeout(() => {
      setGeneratedCode(`// Generated code for ${selectedTest.name}
function process${selectedTest.id}() {
  // This is auto-generated code based on test case
  console.log("Processing ${selectedTest.name}");
  // Add implementation here
  return true;
}

export default process${selectedTest.id};`);
      
      // Update generating state after completion
      setGeneratingCodeMap(prev => ({
        ...prev,
        [selectedTest.id]: false
      }));
      
      console.alert(`Code generated for test case ${selectedTest.id}`);
    }, 1500);
  };

  const handleCodeChange = (e) => {
    setGeneratedCode(e.target.value);
    
    // Reset saved state when code is modified
    if (selectedTest && savingCodeMap[selectedTest.id]) {
      setSavingCodeMap(prev => ({
        ...prev,
        [selectedTest.id]: false
      }));
    }
  };

  const saveCode = () => {
    if (!selectedTest || !generatedCode) return;
    
    // Update saving state for this test
    setSavingCodeMap(prev => ({
      ...prev,
      [selectedTest.id]: true
    }));
    
    // Mock save operation
    setTimeout(() => {
      console.alert(`Code saved for test case ${selectedTest.id}`);
      
      // Reset pushing state if previously pushed
      if (pushedMap[selectedTest.id]) {
        setPushedMap(prev => ({
          ...prev,
          [selectedTest.id]: false
        }));
      }
    }, 800);
  };

  const pushToGithub = () => {
    if (!selectedTest || !savingCodeMap[selectedTest.id]) return;
    
    // Update pushing state for this test
    setPushingMap(prev => ({
      ...prev,
      [selectedTest.id]: true
    }));
    
    // Mock GitHub push operation
    setTimeout(() => {
      setPushingMap(prev => ({
        ...prev,
        [selectedTest.id]: false
      }));
      
      setPushedMap(prev => ({
        ...prev,
        [selectedTest.id]: true
      }));
      
      console.alert(`Code pushed to GitHub for test case ${selectedTest.id}`);
    }, 1500);
  };

  const isGeneratingCode = selectedTest ? generatingCodeMap[selectedTest.id] : false;
  const isCodeSaved = selectedTest ? savingCodeMap[selectedTest.id] : false;
  const isPushing = selectedTest ? pushingMap[selectedTest.id] : false;
  const isPushed = selectedTest ? pushedMap[selectedTest.id] : false;

  return (
    <div className='w-full flex justify-center'>
      <Sidebar />
      <div className='w-4/5 h-screen ml-[20%] overflow-auto'>
        <NavbarDB title="Code Generation" byline="Generate Code by Test Cases"/>
        
        <div className='flex h-[calc(100vh-64px)]'>
          {/* Test Cases Panel */}
          <div className='w-1/3 border-r border-gray-300 p-4 overflow-auto'>
            <h2 className='text-xl font-semibold mb-4'>Test Cases</h2>
            <div className='space-y-2'>
              {testCases.map(test => (
                <div 
                  key={test.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-100 
                    ${selectedTest?.id === test.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  onClick={() => handleSelectTest(test)}
                >
                  <h3 className='font-medium'>{test.name}</h3>
                  <p className='text-sm text-gray-600'>{test.description}</p>
                  {savingCodeMap[test.id] && (
                    <span className='inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full'>
                      Saved
                    </span>
                  )}
                  {pushedMap[test.id] && (
                    <span className='inline-block mt-1 ml-1 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full'>
                      Pushed to GitHub
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Code Editor Panel */}
          <div className='w-2/3 p-4 flex flex-col'>
            <div className='flex justify-between mb-4'>
              <h2 className='text-xl font-semibold'>
                {selectedTest ? `Code for ${selectedTest.name}` : 'Select a test case'}
              </h2>
              <div className='space-x-2'>
                <button 
                  onClick={generateCode}
                  disabled={!selectedTest || isGeneratingCode}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2
                    ${!selectedTest || isGeneratingCode ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                  <FaCode />
                  <span>{isGeneratingCode ? 'Generating...' : 'Generate Code'}</span>
                </button>
                
                <button 
                  onClick={saveCode}
                  disabled={!generatedCode || isGeneratingCode}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2
                    ${!generatedCode || isGeneratingCode ? 'bg-gray-300 cursor-not-allowed' : isCodeSaved ? 'bg-green-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                >
                  <FaSave />
                  <span>{isCodeSaved ? 'Saved' : 'Save'}</span>
                </button>
                
                <button 
                  onClick={pushToGithub}
                  disabled={!isCodeSaved || isPushing}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2
                    ${!isCodeSaved || isPushing ? 'bg-gray-300 cursor-not-allowed' : isPushed ? 'bg-purple-600 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
                >
                  <FaGithub />
                  <span>{isPushing ? 'Pushing...' : isPushed ? 'Pushed' : 'Push to GitHub'}</span>
                </button>
              </div>
            </div>
            
            {selectedTest && (
              <>
                <div className='mb-2'>
                  <span className='text-sm font-medium'>Test Description:</span>
                  <span className='text-sm ml-2 text-gray-700'>{selectedTest.description}</span>
                </div>
                <textarea
                  value={generatedCode}
                  onChange={handleCodeChange}
                  className='flex-grow p-4 font-mono text-sm border rounded-lg bg-gray-50'
                  placeholder={isGeneratingCode ? 'Generating code...' : 'Select a test case and click "Generate Code"'}
                  disabled={isGeneratingCode}
                />
                {isCodeSaved && !isPushed && (
                  <div className='mt-2 text-sm text-green-600'>
                    Code saved successfully! You can now push to GitHub.
                  </div>
                )}
                {isPushed && (
                  <div className='mt-2 text-sm text-purple-600'>
                    Code successfully pushed to GitHub repository.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeGenerationPage