import React, { useState } from 'react'
import Sidebar from './Sidebar'
import SingleProjectMain from './SingleProjectMain'
import NavbarDB from './NavbarDB'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';


const initialCode = `
import pytest
from my_module import add

def test_add_positive_numbers():
    assert add(2, 3) == 5

def test_add_negative_numbers():
    assert add(-1, -1) == -2

def test_add_zero():
    assert add(0, 0) == 0
`;

const stories = [
  {
    id: 'S101',
    title: 'Login Functionality',
    description: 'As a user, I want to login so that I can access my dashboard.'
  },
  {
    id: 'S102',
    title: 'Signup Page',
    description: 'As a new user, I want to register so I can start using the app.'
  }
];

const Test = () => {
  const [showTable, setShowTable] = useState(true);
  const [showOneStory, setShowOneStory] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingWithContext, setIsEditingWithContext] = useState(false);
  const [additionalText, setAdditionalText] = useState('');

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleEditWithContextToggle = () => setIsEditingWithContext(!isEditingWithContext);

  const handlePushToGitHub = () => {
    // Stub: replace with GitHub API logic
    console.log('Pushing to GitHub:\n', code);
    alert('Code pushed to GitHub! (stubbed)');
  };

  const handleGenerateTestCases = () => {
    // Placeholder for generating test cases
    alert('Generating test cases for:\n' + additionalText);
  };


  function handleStoryClick() {
    setShowOneStory(true);
    setShowTable(false);
  }

  function handleStoryClose() {
    setShowOneStory(false);
    setShowTable(true);
  }
  return (
    <div className='w-full flex justify-center'>
      <Sidebar />
      <div className='w-4/5 h-screen bg-gray-200'>
          <NavbarDB title={"[Testing] Test Cases"} byline={"Generating Test Cases from user stories"}/>

          {showTable && 
            <div className='w-full h-full bg-white m-1 rounded-md border border-[#989898]'>

              <div className='flex justify-between'>
                <input type='text' placeholder='search for a story...' className='p-1 bg-white m-1 w-5/6 border border-blue-200 rounded-md' />
                <button className='p-1 bg-blue-500 w-1/6 text-white m-1 rounded-md'>Search</button>
              </div>
            
              <div className="m-1">
            <table className="text-sm min-w-full rounded">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-1 ">Story Title</th>
            <th className="p-1 ">Story Description</th>
            <th className="p-1 ">Story ID</th>
            <th className="p-1 ">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stories.map((story) => (
            <tr key={story.id} className="">
              <td className="p-1 "><button onClick={()=>handleStoryClick()}className='cursor-pointer hover:underline'>{story.title}</button></td>
              <td className="p-1 ">{story.description}</td>
              <td className="p-1 ">{story.id}</td>
              <td className="p-1 ">
                <button
                  onClick={() => handleGenerate(story)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Generate Test Cases
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

            </div>
          }

          {showOneStory &&<div className='flex w-full h-full bg-white m-1 rounded-md border border-[#989898]'>
            <div className='bg-white m-1 border-r border-[#989898] w-1/2 h-full flex flex-col p-1'>
            <button onClick={()=> handleStoryClose()} className='text-left bg-blue-300 text-black p-1 m-1 rounded-md w-1/6'>Back</button>
            <div className='flex justify-between'>
              <div className='text-2xl font-bold'>Story Title</div>
              <button className='bg-blue-500 p-1 m-1 text-white text-sm rounded-md'>Generate Test Cases</button>
              </div>
              <div className='flex justify-start gap-2 items-center'>
                <div className='text-sm text-gray-700'>Story ID: SCRUM 69</div>
                <div className='text-sm text-black bg-green-400 p-1 rounded-md'>Test Cases Generated</div>
              </div>

              <div className='my-2'>
                <strong>User Story:</strong>  
                  As a project manager, I want to generate test cases from user stories, so that I can ensure all scenarios are validated during development.
              </div>
            </div>

            <div className="bg-white m-1 border-r border-[#989898] w-1/2 h-full flex flex-col p-2 space-y-2">
      <div className="flex w-full justify-between items-center">
        <h2 className="text-lg font-semibold">Sample Pytest File</h2>

        <div className='flex justify-center gap-1'>
          <button
            onClick={handleEditToggle}
            className="text-sm bg-yellow-400 hover:bg-yellow-500 text-black px-1 py-1 rounded"
          >
            {isEditing ? 'View' : 'Edit'}
          </button>
          <button
            onClick={handleEditWithContextToggle}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            {isEditingWithContext ? 'Stop Editing with Context' : 'Edit with Context'}
          </button>
          <button
            onClick={handlePushToGitHub}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
          >
            Push GitHub
          </button>
        </div>
      </div>

      {isEditingWithContext ? (
        <>
          <textarea
            className="w-full h-full border border-gray-300 rounded p-2 font-mono text-sm"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <div className="mt-2">
            <textarea
              className="w-full h-16 border border-gray-300 rounded p-2"
              placeholder="Add context for test case generation..."
              value={additionalText}
              onChange={(e) => setAdditionalText(e.target.value)}
            />
            <button
              onClick={handleGenerateTestCases}
              className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Generate
            </button>
          </div>
        </>
      ) : isEditing ? (
        <textarea
          className="w-full h-full border border-gray-300 rounded p-2 font-mono text-sm"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      ) : (
        <SyntaxHighlighter language="python" style={vscDarkPlus}>
          {code}
        </SyntaxHighlighter>
      )}
    </div>
          </div>
          
          }
          
      </div>
    </div>
  )
}

export default Test