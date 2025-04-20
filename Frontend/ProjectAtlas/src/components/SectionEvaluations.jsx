import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const SectionEvaluations = ({ documentId, isOpen, onClose, content }) => {
    const [evaluations, setEvaluations] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [author, setAuthor] = useState('');
    const [isFinal, setIsFinal] = useState(false);

    useEffect(() => {
        if (documentId && isOpen) {
            fetchEvaluations();
        }
    }, [documentId, isOpen]);

    useEffect(() => {
        if (isOpen) {
            const currentUser = localStorage.getItem('currentUser') || 'System User';
            setAuthor(currentUser);
            
            checkDocumentStatus();
        }
    }, [isOpen]);

    const fetchEvaluations = async () => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:5000/srs_brd/get-section-evaluations', {
                document_id: documentId
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
            setLoading(false);
        }
    };

    const checkDocumentStatus = async () => {
        try {
            const response = await fetch(`http://localhost:5000/srs_brd/documents/${documentId}`);
            const data = await response.json();
            if (data.success) {
                setIsFinal(data.document.is_final || false);
            }
        } catch (err) {
            console.error('Error checking document status:', err);
        }
    };

    const handleSetFinal = async () => {
        try {
            setLoading(true);
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
                setIsFinal(true);
                alert('Document marked as final successfully!');
            } else {
                setError(data.error || 'Failed to mark document as final');
            }
        } catch (err) {
            setError('Error marking document as final');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Section Evaluations</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {!isFinal && (
                    <div className="mb-4">
                        <button
                            onClick={handleSetFinal}
                            disabled={loading}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                        >
                            {loading ? 'Setting as Final...' : 'Set as Final Version'}
                        </button>
                    </div>
                )}

                {isFinal && (
                    <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
                        This document has been marked as final.
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
                        {error}
                    </div>
                )}

                {loading ? (
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
        </div>
    );
};

export default SectionEvaluations; 