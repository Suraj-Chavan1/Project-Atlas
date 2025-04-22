import React, { useState, useEffect } from 'react';
import { MdModeEdit } from "react-icons/md";
import { FaInfo } from "react-icons/fa";
import { PiSparkleFill } from "react-icons/pi";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import SectionEvaluations from './SectionEvaluations';
import { FaUser, FaClock  } from "react-icons/fa";


const SingleProjectDocs = () => {
  const { id: projectId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEvaluations, setShowEvaluations] = useState(false);
  const [evaluations, setEvaluations] = useState({});
  const [evaluationsLoading, setEvaluationsLoading] = useState(false);
  const [author, setAuthor] = useState('');
  const [isFinal, setIsFinal] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [testFinal, setTestFinal] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchDocuments();
    }
    // Get current user's name from localStorage or your auth system
    const currentUser = localStorage.getItem('currentUser') || 'System User';
    setAuthor(currentUser);
  }, [projectId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/srs_brd/documents/${projectId}`);
      setDocuments(response.data.documents);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDocument = async (docType) => {
    try {
      setIsGenerating(true);
      const endpoint = docType === 'SRS' ? '/generate-srs' : '/generate-brd';
      const response = await axios.post(`http://localhost:5000/srs_brd${endpoint}`, {
        project_id: projectId
      });

      if (response.data.success) {
        await fetchDocuments();
        setSelectedDoc(response.data.document);
      }
    } catch (err) {
      setError(`Failed to generate ${docType}`);
      console.error(`Error generating ${docType}:`, err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditDocument = async () => {
    if (!selectedDoc) {
      console.error('No document selected for editing');
      toast.error('No document selected');
      return;
    }
    
    console.log('Starting document edit:', {
      documentId: selectedDoc.id,
      contentLength: editedContent.length,
      currentVersion: selectedDoc.version
    });
    
    try {
      console.log('Sending edit request to backend...');
      const response = await axios.post(`http://localhost:5000/srs_brd/edit-document`, {
        document_id: selectedDoc.id,
        content: editedContent,
        additional_context: additionalContext
      });

      console.log('Backend response:', response.data);

      if (response.data.success) {
        console.log('Document update successful:', {
          newVersion: response.data.document.version,
          documentId: response.data.document.id,
          newBlobUrl: response.data.document.blob_url
        });
        
        // Update the selected document with new content, version, and blob URL
        setSelectedDoc({
          ...selectedDoc,
          context: editedContent,
          version: response.data.document.version,
          blob_url: response.data.document.blob_url
        });
        setEditMode(false);
        setAdditionalContext(''); // Clear additional context after successful edit
        // Refresh the documents list to show updated version
        await fetchDocuments();
        toast.success(`Document updated to version ${response.data.document.version}`);
      } else {
        console.error('Backend reported failure:', response.data.error);
        toast.error(response.data.error || 'Failed to update document');
      }
    } catch (error) {
      console.error('Error editing document:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.error || 'Failed to update document');
    }
  };

  const handleAIAssist = async () => {
    if (!selectedDoc) return;
    
    try {
      const response = await axios.post(`http://localhost:5000/srs_brd/ai-assist`, {
        document_id: selectedDoc.id,
        content: editedContent,
        additional_context: additionalContext
      });

      if (response.data.success) {
        setEditedContent(response.data.content);
        toast.success('AI suggestions applied');
      }
    } catch (error) {
      console.error('Error getting AI assistance:', error);
      toast.error('Failed to get AI assistance');
    }
  };

  const fetchEvaluations = async () => {
    if (!selectedDoc) return;
    
    try {
      setEvaluationsLoading(true);
      const response = await axios.post('http://localhost:5000/srs_brd/get-section-evaluations', {
        document_id: selectedDoc.id
      });

      if (response.data.success) {
        setEvaluations(response.data.evaluations);
      } else {
        toast.error(response.data.message || 'Failed to fetch evaluations');
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      toast.error('Failed to fetch section evaluations');
    } finally {
      setEvaluationsLoading(false);
    }
  };

  useEffect(() => {
    if (showEvaluations && selectedDoc) {
      fetchEvaluations();
    }
  }, [showEvaluations, selectedDoc]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSetFinal = async (documentId) => {
    try {
      setLoadingStates(prev => ({ ...prev, [documentId]: true }));
      const docToFinalize = documents.find(doc => doc.id === documentId);
      
      // Check if there's already a final document of the same type
      const existingFinalDoc = documents.find(doc => 
        doc.is_final && 
        doc.template_type === docToFinalize.template_type && 
        doc.id !== documentId
      );

      if (existingFinalDoc) {
        toast.error(`There is already a final ${docToFinalize.template_type.toUpperCase()} document. Please unset it first.`);
        return;
      }

      const response = await fetch('http://localhost:5000/srs_brd/set-document-final', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: documentId,
          author: author
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDocuments(docs => docs.map(doc => 
          doc.id === documentId 
            ? { ...doc, is_final: true, finalized_by: author, finalized_at: data.document.finalized_at }
            : doc
        ));
        toast.success('Document marked as final successfully!');
      } else {
        toast.error(data.error || 'Failed to mark document as final');
      }
    } catch (err) {
      toast.error('Error marking document as final');
      console.error('Error:', err);
    } finally {
      setLoadingStates(prev => ({ ...prev, [documentId]: false }));
    }
  };

  const handleUnsetFinal = async (documentId) => {
    try {
      setLoadingStates(prev => ({ ...prev, [documentId]: true }));
      const response = await fetch('http://localhost:5000/srs_brd/set-document-final', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: documentId,
          is_final: false
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDocuments(docs => docs.map(doc => 
          doc.id === documentId 
            ? { ...doc, is_final: false, finalized_by: null, finalized_at: null }
            : doc
        ));
        toast.success('Document unset as final successfully!');
      } else {
        toast.error(data.error || 'Failed to unset document as final');
      }
    } catch (err) {
      toast.error('Error unsetting document as final');
      console.error('Error:', err);
    } finally {
      setLoadingStates(prev => ({ ...prev, [documentId]: false }));
    }
  };

  return (
    <div className="flex flex-col mx-3 my-0 h-screen">
      <div className="grid grid-cols-5 grid-rows-2 gap-4 mt-2 h-full">
        {/* Left Panel - Documents List */}
        <div className="col-span-2 row-span-2 border border-gray-400 flex flex-col rounded-md bg-white">
          <span className="text-md text-xl p-3">Documents</span>
          <div className="flex justify-center gap-2 text-sm">
            <button 
              onClick={() => handleGenerateDocument('SRS')}
              disabled={isGenerating}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isGenerating ? 'Generating...' : 'Generate SRS'}
            </button>
            <button 
              onClick={() => handleGenerateDocument('BRD')}
              disabled={isGenerating}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isGenerating ? 'Generating...' : 'Generate BRD'}
            </button>
          </div>

          <div className='flex flex-col mt-2 overflow-y-auto'>
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                className={`flex flex-col border-y p-2 cursor-pointer 
                  ${selectedDoc?.id === doc.id ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-gray-50'}
                `}
                onClick={() => setSelectedDoc(doc)}
              >
                <div className='flex justify-between items-center'>
                  <div className='text-md font-bold'>
                    {doc.template_type === 'srs' ? 'Software Requirement Specification' : 'Business Requirement Document'}
                  </div>
                  
                </div>
                
                {doc.is_final && (
                  <div className='flex flex-col h-full'>
                    {/*<div className='mt-1 text-green-600'>Final Version</div>*/}
                    <div className='flex justify-start items-center gap-2'>
                      <div><FaUser /></div>
                      <div>{doc.finalized_by}</div>
                    </div>

                    <div className='flex justify-start items-center gap-2'>
                      <div><FaClock /></div>
                      <div>{new Date(doc.timestamp).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                )}
                

                <div className='text-sm'>Author: System Generated</div>

                

                
                <div className="w-full items-center flex justify-between mt-2">
                <div className={`w-1/4 text-sm p-2 font-bold `}>
                    Version: {doc.version}
                  </div>
                
                  <div className='w-3/4'>
                  {loadingStates[doc.id] ? <div className=' text-sm px-4 w-56 py-1 rounded-md text-center border'>Setting..</div> :
                <div className="w-full flex justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnsetFinal(doc.id);
                    }}
                    className={`text-sm px-4 w-28 rounded-l-md border ${
                      !doc.is_final
                        ? 'bg-red-500 text-white border-red-400'
                        : 'bg-white text-red-500 border-red-400 hover:bg-red-50'
                    }`}
                    disabled={loadingStates[doc.id]}
                  >Not Final
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetFinal(doc.id);
                    }}
                    className={`text-sm py-1 px-4 w-28 rounded-r-md border ${
                      doc.is_final
                    ? 'bg-green-500 text-white border-green-400'
                    : 'bg-white text-green-500 border-green-400 hover:bg-green-50'
                    }`}
                    disabled={loadingStates[doc.id]}>Final
                  </button>
                </div>}
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Document Details */}
        <div className="col-span-3 row-span-2 border border-gray-400 bg-white p-3 flex flex-col rounded-md">
          {selectedDoc ? (
            <>
              <div className='flex justify-between'>
                <div className='text-lg font-bold'>
                  {selectedDoc.template_type === 'srs' ? 'Software Requirement Specification' : 'Business Requirement Document'}
                </div>
                <div className='flex gap-2'>
                  <button 
                    onClick={() => {
                      setEditedContent(selectedDoc.context);
                      setEditMode(true);
                    }}
                    className='w-10 h-10 rounded-full bg-blue-500 mx-1 items-center text-white p-3'
                  >
                    <MdModeEdit />
                  </button>
                  <button 
                    onClick={() => setShowEvaluations(!showEvaluations)}
                    className={`w-10 h-10 rounded-full mx-1 items-center text-white p-3 ${showEvaluations ? 'bg-blue-500' : 'bg-[#00072D]'}`}
                  >
                    <FaInfo />
                  </button>
                  <button className='w-10 h-10 rounded-full mx-1 items-center text-white p-3 bg-[#00072D]'>
                    <PiSparkleFill />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Main Content Area */}
                <div className={`flex-1 ${showEvaluations ? 'w-2/3' : 'w-full'} pr-4 overflow-y-auto`}>
                  <div className="mt-3 text-sm leading-relaxed text-gray-800 bg-white p-4 rounded-md">
                    <h2 className="text-lg font-semibold mb-2">Document Summary</h2>
                    <p className="mb-2">
                      <strong>Version:</strong> {selectedDoc.version}
                    </p>
                    <p className="mb-2">
                      <strong>Generated On:</strong> {new Date(selectedDoc.timestamp).toLocaleString()}
                    </p>
                    <p className="mb-2">
                      <strong>Last Modified:</strong> {new Date(selectedDoc.last_modified).toLocaleString()}
                    </p>
                    <p className="mb-2">
                      <strong>Document URL:</strong> <a href={selectedDoc.blob_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View PDF (Version {selectedDoc.version})</a>
                    </p>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    {editMode ? (
                      <div className="mt-2">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Context</label>
                          <textarea
                            value={additionalContext}
                            onChange={(e) => setAdditionalContext(e.target.value)}
                            className="w-full h-20 p-2 border rounded-md"
                            placeholder="Enter any additional context or instructions for the AI..."
                          />
                        </div>
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="w-full h-64 p-2 border rounded-md"
                          placeholder="Enter document content..."
                        />
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={handleEditDocument}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={handleAIAssist}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            AI Assist
                          </button>
                          <button
                            onClick={() => {
                              setEditMode(false);
                              setAdditionalContext('');
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                          {selectedDoc.context}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Evaluations Panel */}
                {showEvaluations && (
                  <div className="w-1/3 border-l pl-4 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Section Evaluations</h2>
                      <button
                        onClick={() => setShowEvaluations(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {evaluationsLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    ) : Object.keys(evaluations).length === 0 ? (
                      <p className="text-gray-500 text-center">No evaluations available</p>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(evaluations).map(([section, data]) => (
                          <div key={section} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium">{section}</h3>
                              <span className={`font-bold ${getScoreColor(data.completeness_score)}`}>
                                {data.completeness_score}%
                              </span>
                            </div>
                            
                            {data.missing_elements && data.missing_elements.length > 0 && (
                              <div className="mt-2">
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Missing Elements:</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600">
                                  {data.missing_elements.map((item, index) => (
                                    <li key={index}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select a document to view details</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default SingleProjectDocs;
