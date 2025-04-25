import React, { useState, useEffect } from 'react';
import { MdModeEdit, MdHistory } from "react-icons/md";
import { FaInfo } from "react-icons/fa";
import { PiSparkleFill } from "react-icons/pi";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import SectionEvaluations from './SectionEvaluations';
import { FaUser, FaClock, FaChevronDown, FaChevronUp } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

const SingleProjectDocs = () => {
  const { id: projectId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isGeneratingSRS, setIsGeneratingSRS] = useState(false);
  const [isGeneratingBRD, setIsGeneratingBRD] = useState(false);
  const [showEvaluations, setShowEvaluations] = useState(false);
  const [evaluations, setEvaluations] = useState({});
  const [evaluationsLoading, setEvaluationsLoading] = useState(false);
  const [author, setAuthor] = useState('');
  const [loadingStates, setLoadingStates] = useState({});
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versionHistory, setVersionHistory] = useState([]);
  const [versionHistoryLoading, setVersionHistoryLoading] = useState(false);
  const [changeSummary, setChangeSummary] = useState('');
  const [expandedDocs, setExpandedDocs] = useState({});

  useEffect(() => {
    if (projectId) {
      fetchDocuments();
    }
    const currentUser = localStorage.getItem('currentUser') || 'System User';
    setAuthor(currentUser);
  }, [projectId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/srs_brd/documents/${projectId}`);
      const docs = response.data.documents;
      const groupedDocs = {};

      docs.forEach(doc => {
        const type = doc.template_type;
        if (!groupedDocs[type]) {
          groupedDocs[type] = [];
        }
        groupedDocs[type].push(doc);
      });

      Object.keys(groupedDocs).forEach(type => {
        groupedDocs[type].sort((a, b) => b.version - a.version);
      });

      const sortedDocs = [];

      Object.keys(groupedDocs).forEach(type => {
        if (groupedDocs[type].length > 0) {
          const latestDoc = groupedDocs[type][0];
          latestDoc.is_latest_version = true;
          sortedDocs.push(latestDoc);
        }
      });

      Object.keys(groupedDocs).forEach(type => {
        for (let i = 1; i < groupedDocs[type].length; i++) {
          const doc = groupedDocs[type][i];
          doc.is_latest_version = false;
          sortedDocs.push(doc);
        }
      });

      setDocuments(sortedDocs);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersionHistory = async (documentId) => {
    try {
      setVersionHistoryLoading(true);
      const doc = documents.find(d => d.id === documentId);
      if (!doc) return;

      const templateType = doc.template_type;
      const response = await axios.get(`http://localhost:5000/srs_brd/document-versions/${projectId}/${templateType}`);

      if (response.data.success) {
        const history = response.data.versions.sort((a, b) => b.version - a.version);
        setVersionHistory(history);
        setShowVersionHistory(true);
      } else {
        toast.error('Failed to fetch version history');
      }
    } catch (err) {
      console.error('Error fetching version history:', err);
      toast.error('Failed to fetch version history');
    } finally {
      setVersionHistoryLoading(false);
    }
  };

  const handleGenerateDocument = async (docType) => {
    const endpoint = docType === 'SRS' ? '/generate-srs' : '/generate-brd';

    try {
      if (docType === 'SRS') {
        setIsGeneratingSRS(true);
      } else {
        setIsGeneratingBRD(true);
      }

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
      if (docType === 'SRS') {
        setIsGeneratingSRS(false);
      } else {
        setIsGeneratingBRD(false);
      }
    }
  };

  const toggleExpandDoc = (docId) => {
    setExpandedDocs(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const handleEditDocument = async () => {
    if (!selectedDoc) {
      toast.error('No document selected');
      return;
    }

    if (selectedDoc.context === editedContent && !additionalContext && !changeSummary) {
      toast.info('No changes detected to save');
      setEditMode(false);
      return;
    }

    let summary = changeSummary;
    if (!summary) {
      summary = prompt('Please enter a brief summary of your changes:', '');
      if (summary === null) return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/srs_brd/edit-document`, {
        document_id: selectedDoc.id,
        content: editedContent,
        additional_context: additionalContext,
        author: author,
        change_summary: summary || 'Document updated'
      });

      if (response.data.success) {
        setSelectedDoc({
          ...selectedDoc,
          context: editedContent,
          version: response.data.document.version,
          blob_url: response.data.document.blob_url,
          last_modified: new Date().toISOString(),
          modified_by: author,
          change_summary: summary || 'Document updated'
        });
        setEditMode(false);
        setAdditionalContext('');
        setChangeSummary('');
        await fetchDocuments();
        toast.success(`Document updated to version ${response.data.document.version}`);
      } else {
        toast.error(response.data.error || 'Failed to update document');
      }
    } catch (error) {
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

      const existingFinalDoc = documents.find(doc =>
        doc.is_final &&
        doc.template_type === docToFinalize.template_type &&
        doc.id !== documentId
      );

      if (existingFinalDoc) {
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
      }
    } catch (err) {
      toast.error('Error marking document as final');
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
      }
    } catch (err) {
      toast.error('Error unsetting document as final');
    } finally {
      setLoadingStates(prev => ({ ...prev, [documentId]: false }));
    }
  };

  return (
    <div className="flex flex-col mx-3 my-0 h-screen">
      <div className="grid grid-cols-5 grid-rows-2 gap-4 mt-2 h-full">
        <div className="col-span-2 row-span-2 border border-gray-400 flex flex-col rounded-md bg-white">
          <span className="text-md text-xl p-3">Documents</span>
          <div className="flex justify-center gap-2 text-sm">
            <button
              onClick={() => handleGenerateDocument('SRS')}
              disabled={isGeneratingSRS}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isGeneratingSRS ? 'Generating...' : 'Generate SRS'}
            </button>
            <button
              onClick={() => handleGenerateDocument('BRD')}
              disabled={isGeneratingBRD}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isGeneratingBRD ? 'Generating...' : 'Generate BRD'}
            </button>
          </div>

          <div className='flex flex-col mt-2 overflow-y-auto'>
            {documents.map((doc) => (
              <button
                key={doc.id}
                className={`flex flex-col text-left border-y p-2 
                  ${selectedDoc?.id === doc.id ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-gray-50 cursor-pointer'}
                `} onClick={() => setSelectedDoc(doc)}
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className='text-md font-bold'>
                    {doc.template_type === 'srs' ? 'Software Requirement Specification' : 'Business Requirement Document'}
                    {doc.is_latest_version === false && <span className="ml-2 text-xs text-gray-500">(Older Version)</span>}
                  </div>
                  <div className="flex items-center">
                    {doc.is_final && <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full mr-2">Final</span>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpandDoc(doc.id);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {expandedDocs[doc.id] ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <div className='flex items-center'>
                    <div className='text-sm font-semibold mr-2'>Version: {doc.version}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchVersionHistory(doc.id);
                      }}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center"
                      title="View version history"
                    >
                      <MdHistory className="mr-1" /> History
                    </button>
                  </div>
                  <div className='text-xs text-gray-500'>{new Date(doc.timestamp).toLocaleDateString()}</div>
                </div>

                {(expandedDocs[doc.id] || selectedDoc?.id === doc.id) && (
                  <>
                    {doc.change_summary && (
                      <div className="text-xs text-gray-600 mt-1 italic">
                        "{doc.change_summary}"
                      </div>
                    )}

                    <div className='text-sm mt-1'>
                      {doc.modified_by ?
                        <div className='flex items-center gap-1'>
                          <FaUser size={12} />
                          <span>{doc.modified_by}</span>
                        </div> :
                        <div>Author: System Generated</div>
                      }
                    </div>

                    {doc.is_final && (
                      <div className='flex flex-col h-full mt-1'>
                        <div className='flex justify-start items-center gap-2'>
                          <div><FaUser /></div>
                          <div>{doc.finalized_by}</div>
                        </div>

                        <div className='flex justify-start items-center gap-2'>
                          <div><FaClock /></div>
                          <div>{new Date(doc.finalized_at || doc.timestamp).toLocaleDateString()}</div>
                        </div>
                      </div>
                    )}

                    <div className="w-full items-center flex justify-between mt-2">
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
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-3 row-span-2 border border-gray-400 bg-white p-3 flex flex-col rounded-md">
          {selectedDoc ? (
            <>
              <div className='flex justify-between'>
                <div className='text-lg font-bold'>
                  {selectedDoc.template_type === 'srs' ? 'Software Requirement Specification' : 'Business Requirement Document'}
                  {selectedDoc.is_latest_version === false && <span className="ml-2 text-sm text-gray-500">(Older Version {selectedDoc.version})</span>}
                  {selectedDoc.is_latest_version && <span className="ml-2 text-sm text-blue-500">(Latest Version {selectedDoc.version})</span>}
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => {
                      setEditedContent(selectedDoc.context);
                      setEditMode(true);
                    }}
                    className='w-10 h-10 rounded-full bg-blue-500 mx-1 items-center text-white p-3'
                    title="Edit document"
                    disabled={selectedDoc.is_final}
                  >
                    <MdModeEdit />
                  </button>
                  <button
                    onClick={() => setShowEvaluations(!showEvaluations)}
                    className={`w-10 h-10 rounded-full mx-1 items-center text-white p-3 ${showEvaluations ? 'bg-blue-500' : 'bg-[#00072D]'}`}
                    title="View section evaluations"
                  >
                    <FaInfo />
                  </button>
                  <button
                    onClick={() => fetchVersionHistory(selectedDoc.id)}
                    className='w-10 h-10 rounded-full mx-1 items-center text-white p-3 bg-[#00072D]'
                    title="View version history"
                  >
                    <MdHistory />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {showVersionHistory && (
                  <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Version History</h2>
                        <button
                          onClick={() => setShowVersionHistory(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {versionHistoryLoading ? (
                        <div className="flex justify-center items-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                      ) : (
                        <>
                        asas
                          <div className="mb-4">
                            <h3 className="font-medium text-gray-700">
                              {selectedDoc.template_type === 'srs' ? 'Software Requirement Specification' : 'Business Requirement Document'} Versions
                            </h3>
                          </div>

                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change Summary</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {versionHistory.map((version, index) => (
                                <tr key={version.id} className={index === 0 ? 'bg-blue-50' : ''}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-medium">{version.version}</span>
                                    {index === 0 && <span className="ml-2 text-xs text-blue-500">(Latest)</span>}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(version.timestamp).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {version.modified_by || "System Generated"}
                                  </td>
                                  <td className="px-6 py-4">
                                    {version.change_summary || "-"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {version.is_final ? (
                                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                        Final
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                        Draft
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                      onClick={() => {
                                        const doc = versionHistory.find(d => d.id === version.id);
                                        if (doc) {
                                          setSelectedDoc(doc);
                                          setShowVersionHistory(false);
                                        }
                                      }}
                                      className="text-blue-500 hover:text-blue-700 mr-3"
                                    >
                                      View
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className={`flex-1 ${showEvaluations ? 'w-2/3' : 'w-full'} pr-4 overflow-y-auto`}>
                  <div className="mt-3 text-sm leading-relaxed text-gray-800 bg-white p-4 rounded-md shadow-sm">
                    <h2 className="text-lg font-semibold mb-2">Document Summary</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <strong>Version:</strong> {selectedDoc.version}
                        {selectedDoc.is_latest_version && <span className="ml-2 text-xs text-blue-500">(Latest)</span>}
                      </div>
                      <div>
                        <strong>Generated On:</strong> {new Date(selectedDoc.timestamp).toLocaleString()}
                      </div>
                      {selectedDoc.last_modified && (
                        <div>
                          <strong>Last Modified:</strong> {new Date(selectedDoc.last_modified).toLocaleString()}
                        </div>
                      )}
                      {selectedDoc.modified_by && (
                        <div>
                          <strong>Modified By:</strong> {selectedDoc.modified_by}
                        </div>
                      )}
                      {selectedDoc.change_summary && (
                        <div className="col-span-2">
                          <strong>Change Summary:</strong> {selectedDoc.change_summary}
                        </div>
                      )}
                      {selectedDoc.is_final && (
                        <>
                          <div>
                            <strong>Status:</strong> <span className="text-green-600 font-semibold">Final</span>
                          </div>
                          <div>
                            <strong>Finalized By:</strong> {selectedDoc.finalized_by}
                          </div>
                          <div>
                            <strong>Finalized On:</strong> {new Date(selectedDoc.finalized_at || selectedDoc.timestamp).toLocaleString()}
                          </div>
                        </>
                      )}
                      <div className="col-span-2 mt-2">
                        <strong>Document URL:</strong> <a href={selectedDoc.blob_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View PDF (Version {selectedDoc.version})</a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    {editMode ? (
                      <div className="mt-2">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Change Summary</label>
                          <input
                            type="text"
                            value={changeSummary}
                            onChange={(e) => setChangeSummary(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            placeholder="Brief description of changes (e.g., 'Added security requirements')"
                          />
                        </div>

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
                            Save as New Version
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
                              setChangeSummary('');
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 border p-4 rounded-md shadow-sm bg-white">
                        <ReactMarkdown>
                          {selectedDoc.context}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>

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
