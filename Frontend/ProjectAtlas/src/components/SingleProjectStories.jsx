import React, { useState, useEffect } from 'react'
import { CiBookmark } from "react-icons/ci";
import { PiSparkleFill } from "react-icons/pi";
import { MdModeEdit } from "react-icons/md";
import { SiJira } from "react-icons/si";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaTrashAlt } from "react-icons/fa";


const SingleProjectStories = () => {
  const { id: projectId } = useParams();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocTypes, setSelectedDocTypes] = useState(['BOTH']);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedStories, setSelectedStories] = useState(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    user_role: '',
    goal: '',
    benefit: '',
    acceptance_criteria: ''
  });

  // Add new state for categorization
  const [pushedStories, setPushedStories] = useState([]);
  const [notPushedStories, setNotPushedStories] = useState([]);

  const fetchStories = async () => {
    try {
      console.log('Fetching stories for project:', projectId);
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/srs_brd_to_stories/stories/${projectId}`);
      console.log('Stories fetched successfully:', response.data);
      
      const allStories = response.data.stories;
      const pushed = allStories.filter(story => story.jira_issue_id);
      const notPushed = allStories.filter(story => !story.jira_issue_id);
      
      setPushedStories(pushed);
      setNotPushedStories(notPushed);
      setStories(allStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch stories');
    } finally {
      setLoading(false);
    }
  };

  const generateStories = async () => {
    try {
      if (!projectId) {
        toast.error('Project ID is required');
        return;
      }

      if (!selectedDocTypes.length) {
        toast.error('Please select at least one document type');
        return;
      }

      setLoading(true);
      const response = await axios.post(
        'http://localhost:5000/srs_brd_to_stories/generate-stories',
        {
          project_id: projectId,
          doc_types: selectedDocTypes
        }
      );

      if (response.data.success) {
        toast.success(`Successfully generated ${response.data.count} stories`);
        fetchStories(); // Refresh the stories list
      }
    } catch (error) {
      console.error('Error generating stories:', error);
      if (error.response?.status === 404 && error.response?.data?.error?.includes('No final documents found')) {
        toast.error('No final documents found. Please ensure you have marked SRS/BRD documents as final.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to generate stories');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (selectedStory) {
      setEditForm({
        title: selectedStory.title,
        user_role: selectedStory.user_role,
        goal: selectedStory.goal,
        benefit: selectedStory.benefit,
        acceptance_criteria: selectedStory.acceptance_criteria
      });
      setIsEditing(true);
    }
  };

  const handleManualEdit = async () => {
    try {
      console.log('Starting manual edit for story:', selectedStory.id);
      console.log('Edit form data:', editForm);
      
      setLoading(true);
      const response = await axios.post(
        'http://localhost:5000/srs_brd_to_stories/edit-story',
        {
          story_id: selectedStory.id,
          edit_type: 'manual',
          story_data: editForm
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Edit response:', response.data);

      if (response.data.success) {
        toast.success('Story updated successfully');
        setSelectedStory(response.data.story);
        setIsEditing(false);
        fetchStories(); // Refresh the stories list
      }
    } catch (error) {
      console.error('Error updating story:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      toast.error(error.response?.data?.error || 'Failed to update story');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      title: '',
      user_role: '',
      goal: '',
      benefit: '',
      acceptance_criteria: ''
    });
  };

  const handleDeleteStory = async (storyId) => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `http://localhost:5000/srs_brd_to_stories/stories/${storyId}`
      );

      if (response.data.success) {
        toast.success('Story deleted successfully');
        fetchStories(); // Refresh the stories list
        if (selectedStory?.id === storyId) {
          setSelectedStory(null);
        }
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error(error.response?.data?.error || 'Failed to delete story');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (storyId, newStatus) => {
    try {
      console.log('Updating status for story:', storyId);
      console.log('New status:', newStatus);
      
      setLoading(true);
      const response = await axios.put(
        `http://localhost:5000/srs_brd_to_stories/stories/${storyId}/status`,
        { status: newStatus }
      );

      console.log('Status update response:', response.data);

      if (response.data.success) {
        toast.success('Story status updated successfully');
        fetchStories(); // Refresh the stories list
        if (selectedStory?.id === storyId) {
          setSelectedStory(response.data.story);
        }
      }
    } catch (error) {
      console.error('Error updating story status:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      toast.error(error.response?.data?.error || 'Failed to update story status');
    } finally {
      setLoading(false);
    }
  };

  const handleStorySelect = (storyId) => {
    setSelectedStories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storyId)) {
        newSet.delete(storyId);
      } else {
        newSet.add(storyId);
      }
      return newSet;
    });
  };

  const handleBulkPushToJira = async () => {
    try {
      if (selectedStories.size === 0) {
        toast.error('Please select at least one story');
        return;
      }
  
      setLoading(true);
      const results = [];
  
      // Iterate through the selected stories and push them individually to Jira
      for (const storyId of selectedStories) {
        try {
          const response = await axios.post(
            `http://localhost:5000/srs_brd_to_stories/push-to-jira/${storyId}`
          );
          if (response.data.success) {
            results.push({ storyId, success: true, jiraId: response.data.jira_issue_id });
            toast.success(`Story ID ${storyId} pushed to Jira successfully`);
          } else {
            results.push({ storyId, success: false, error: response.data.error });
            toast.error(`Failed to push Story ID ${storyId}: ${response.data.error}`);
          }
        } catch (error) {
          results.push({
            storyId,
            success: false,
            error: error.response?.data?.error || 'Failed to push to Jira',
          });
          toast.error(`Error pushing Story ID ${storyId} to Jira`);
        }
      }
  
      // Update stories with Jira IDs in the state without needing to reload
      const updatedStories = stories.map((story) => {
        const result = results.find((r) => r.storyId === story.id);
        if (result?.success) {
          return { ...story, jira_issue_id: result.jiraId }; // Update the Jira issue ID for successful pushes
        }
        return story;
      });
  
      // Update the state with the newly updated stories
      setStories(updatedStories);
      
      // IMPORTANT: Also update the pushedStories and notPushedStories arrays
      const pushed = updatedStories.filter(story => story.jira_issue_id);
      const notPushed = updatedStories.filter(story => !story.jira_issue_id);
      
      setPushedStories(pushed);
      setNotPushedStories(notPushed);
  
      // Clear the selection after push
      setSelectedStories(new Set());
  
      // Show a summary toast
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;
  
      if (successCount > 0) {
        toast.success(`Successfully pushed ${successCount} stories to Jira`);
      }
      if (failCount > 0) {
        toast.error(`Failed to push ${failCount} stories to Jira`);
      }
  
    } catch (error) {
      console.error('Error in bulk push to Jira:', error);
      toast.error('Error during bulk push to Jira');
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleBulkDelete = async () => {
    try {
      if (selectedStories.size === 0) {
        toast.error('Please select at least one story');
        return;
      }
  
      setLoading(true);
      const results = [];
      
      for (const storyId of selectedStories) {
        try {
          const response = await axios.delete(
            `http://localhost:5000/srs_brd_to_stories/stories/${storyId}`
          );
          if (response.data.success) {
            results.push({ storyId, success: true });
          } else {
            results.push({ storyId, success: false, error: response.data.error });
          }
        } catch (error) {
          results.push({ storyId, success: false, error: error.response?.data?.error || 'Failed to delete' });
        }
      }
  
      // Show summary of results
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} stories`);
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} stories`);
      }
  
      // Get IDs of successfully deleted stories
      const successfullyDeleted = results
        .filter(r => r.success)
        .map(r => r.storyId);
  
      // Update all story states
      const updatedStories = stories.filter(story => !successfullyDeleted.includes(story.id));
      setStories(updatedStories);
      
      // Update pushed/not pushed story arrays
      const pushed = updatedStories.filter(story => story.jira_issue_id);
      const notPushed = updatedStories.filter(story => !story.jira_issue_id);
      setPushedStories(pushed);
      setNotPushedStories(notPushed);
      
      // If currently selected story was deleted, clear selection
      if (selectedStory && successfullyDeleted.includes(selectedStory.id)) {
        setSelectedStory(null);
      }
      
      // Clear selection
      setSelectedStories(new Set());
      
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error('Error during bulk delete');
    } finally {
      setLoading(false);
    }
  };

  const handleSinglePushToJira = async (storyId) => {
    try {
      setLoading(true);
      console.log('Pushing story to Jira:', storyId);
      
      const response = await axios.post(
        `http://localhost:5000/srs_brd_to_stories/push-to-jira/${storyId}`
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Update the selected story with the Jira issue ID
        setSelectedStory(prev => ({
          ...prev,
          jira_issue_id: response.data.jira_issue_id
        }));
        // Refresh the stories list
        fetchStories();
      }
    } catch (error) {
      console.error('Error pushing to Jira:', error);
      toast.error(error.response?.data?.error || 'Failed to push to Jira');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      console.log('Component mounted with projectId:', projectId);
      fetchStories();
    }
  }, [projectId]);

  return (
    <div className="flex flex-col mx-3 my-0 h-screen">
      <div className='grid grid-cols-5   gap-4 mt-2 h-full'>
        {/* Left Panel */}
        <div className='col-span-2 row-span-1 border border-gray-400 p-3 flex flex-col rounded-md bg-white h-full h-[150px] overflow-auto'>
          <div className='flex justify-between items-center mb-4'>
            <div className='text-lg font-semibold'>All Stories</div>
            <div className='flex gap-2'>
              <select
                className='text-xs border border-gray-300 rounded-md p-1'
                value={selectedDocTypes[0]}
                onChange={(e) => {
                  console.log('Document type changed to:', e.target.value);
                  setSelectedDocTypes([e.target.value]);
                }}
              >
                <option value="BOTH">Both SRS & BRD</option>
                <option value="SRS">SRS Only</option>
                <option value="BRD">BRD Only</option>
              </select>
              <button
                className='text-xs bg-blue-500 px-2 rounded-md text-white flex justify-center items-center gap-2'
                onClick={generateStories}
                disabled={loading}
              >
                {loading ? 'Generating...' : (
                  <>
                    <PiSparkleFill /> Generate Stories
                  </>
                )}
              </button>
            </div>
          </div>

          {selectedStories.size > 0 && (
            <div className='flex gap-2 mb-4'>
              <button
                className='text-xs bg-green-500 px-2 rounded-md text-white flex justify-center items-center gap-2'
                onClick={handleBulkPushToJira}
                disabled={loading}
              >
                {loading ? 'Pushing...' : (
                  <>
                    <SiJira /> Push {selectedStories.size} to Jira
                  </>
                )}
              </button>
              <button
                className='text-xs bg-red-500 px-2 rounded-md text-white flex justify-center items-center gap-2 py-2'
                onClick={handleBulkDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : (
                  <>
                    <FaTrashAlt />
                    Delete {selectedStories.size}
                  </>
                )}
              </button>
            </div>
          )}
          
          <div className='overflow-y-auto'>
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : stories.length === 0 ? (
              <div className="text-center text-gray-500 mt-4">
                No stories found. Generate some stories to get started.
              </div>
            ) : (
              <>
                {/* Not Pushed Stories Section */}
                {notPushedStories.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-600 mb-2">Not Pushed to Jira</div>
                    {notPushedStories.map((story) => (
                      <div
                      key={story.id}
                      className={`flex justify-start w-full items-center mt-2 p-1 rounded-md border bg-${
                        selectedStory?.id == story.id ? 
                        (story.priority === 'Must Have' ? 'red-200' :
                        story.priority === 'Should Have' ? 'yellow-100' : 'green-200') :
                        'bg-white'
                      } ${
                        story.priority === 'Must Have' ? 'border-red-40' :
                        story.priority === 'Should Have' ? 'border-yellow-400' :
                        'border-green-400'
                      } cursor-pointer`}
                      onClick={() => {
                        console.log('Story selected:', story);
                        setSelectedStory(story);
                      }}
                    >
                        <div className='flex justify-center items-center'>
                          
                        <input
                          type="checkbox"
                          checked={selectedStories.has(story.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStorySelect(story.id);
                          }}
                          className='mr-2 h-4 w-4'
                        />
                        

                        <div className='h-10 w-10 rounded-md border border-gray-400 flex flex-col justify-center items-center text-green-700 bg-white'>
                          <CiBookmark />
                        </div>

                        </div>
                        <div className='flex flex-col w-full '>
                          <div className='w-full flex justify-between items-center'>
                            <div className='flex justify-center items-center'>
                            <div className='text-sm text-gray-500 mx-2 text-left mr-2'>{story.source_doc_type.toUpperCase()}</div>
                            <div className='font-semibold text-sm py-1 px-2 bg-blue-300 border border-blue-500 rounded-full ml-2'>{story.status}</div>
                            </div>
                            <div className={`text-sm font-bold ${
                              story.priority === 'Must Have' ? 'text-red-600' :
                              story.priority === 'Should Have' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {story.priority}
                            </div>
                          </div>
                          <div className='font-semibold text-md ml-2'>{story.title}</div>
            
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pushed Stories Section */}
                {pushedStories.length > 0 && (
  <div>
    <div className="text-sm font-semibold text-gray-600 mb-2">Pushed to Jira</div>
    {pushedStories.map((story) => (
      <div
        key={story.id}
        className={` flex justify-start items-center mt-2 px-1 py-2 rounded-md border ${
          story.priority === 'Must Have' ? 'border-red-600' :
          story.priority === 'Should Have' ? 'border-yellow-400' :
          'border-green-400'
        } ${
          selectedStory?.id === story.id ?
            (story.priority === 'Must Have' ? 'bg-red-200' :
            story.priority === 'Should Have' ? 'bg-yellow-100' : 'bg-green-200') :
            ('bg-white')
        } cursor-pointer`}
        onClick={() => {
          console.log('Story selected:', story);
          setSelectedStory(story);
        }}
      >
        <input
          type="checkbox"
          checked={selectedStories.has(story.id)}
          onChange={(e) => {
            e.stopPropagation();
            handleStorySelect(story.id);
          }}
          className="mr-2 h-4 w-4"
        />
        <div className="h-10 w-10 rounded-md border border-gray-400 flex flex-col justify-center items-center text-green-700 bg-white">
          <CiBookmark />
        </div>
        <div className=" flex flex-col ml-2 w-full">
          <div className="flex justify-between items-center w-full">
          <div className='flex justify-start items-center'>
            <div className="text-sm text-gray-500">{story.source_doc_type.toUpperCase()}</div>
            
            <div className={`font-semibold text-sm py-1 px-2 rounded-full ml-2 
  ${story.status === 'In Progress' ? 'bg-green-300 border-green-500' : ''} 
  ${story.status === 'Complete' ? 'bg-red-300 border-red-500' : ''} 
  ${story.status === 'Backlog' ? 'bg-yellow-300 border-yellow-500' : ''}`}>
  {story.status}
</div>
            </div>
            <div
              className={`text-sm font-bold ${
                story.priority === 'Must Have' ? 'text-red-600' :
                story.priority === 'Should Have' ? 'text-yellow-600' :
                'text-green-600'
              }`}
            >
              {story.priority}
            </div>
          </div>
          <div className="font-semibold text-md">
            {story.title.length > 70 ? story.title.slice(0, 70) + "..." : story.title}
          </div>
          <div className="text-xs text-blue-600">Jira: {story.jira_issue_id}</div>
        </div>
      </div>
    ))}
  </div>
)}

              </>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className='col-span-3 row-span-1 border border-gray-400 bg-white p-3 flex flex-col rounded-md h-full'>
          {selectedStory ? (
            <>
              <div className='flex w-full justify-between items-center '>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className='text-xl font-bold border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                ) : (
                  <>
                    <div className='text-xl font-bold'>{selectedStory.title}</div>
                    <div className={`font-semibold text-sm py-1 px-2 rounded-full ml-2 
  ${selectedStory.status === 'In Progress' ? 'bg-green-300 border-green-500' : ''} 
  ${selectedStory.status === 'Complete' ? 'bg-red-300 border-red-500' : ''} 
  ${selectedStory.status === 'Backlog' ? 'bg-blue-300 border-blue-500' : ''}`}>
  
                      {selectedStory.status}
                    </div>
                  </>
                )}
                <div className='w-full flex justify-end items-center gap-2'>
                  <button 
                    className={`border ${
                      selectedStory.jira_issue_id 
                        ? 'border-green-500 text-green-500' 
                        : 'border-blue-500 text-blue-500'
                    } text-sm p-1 ml-1 rounded-md flex justify-center gap-1 items-center w-1/2`}
                    onClick={() => handleSinglePushToJira(selectedStory.id)}
                    disabled={loading || !!selectedStory.jira_issue_id}
                  >
                    <SiJira /> 
                    {selectedStory.jira_issue_id ? 'Pushed to Jira' : 'Push to Jira'}
                  </button>
                  {selectedStory.jira_issue_id && (
                    <button 
                      className={`border ${
                        selectedStory.status === 'Complete'
                          ? 'border-green-500 text-green-500 bg-green-100'
                          : 'border-blue-500 text-blue-500'
                      } text-sm p-1 ml-1 rounded-md flex justify-center gap-1 items-center w-1/2`}
                      onClick={() => handleUpdateStatus(selectedStory.id, 'Complete')}
                      disabled={loading || selectedStory.status === 'Complete'}
                    >
                      {selectedStory.status === 'Complete' ? 'Completed' : 'Mark Complete'}
                    </button>
                  )}
                  <button 
                    className='w-10 h-10 rounded-full bg-blue-500 items-center text-white p-3'
                    onClick={handleEditClick}
                  >
                    <MdModeEdit />
                  </button>
                </div>
              </div>

              <div className='mt-4'>
                <div className={`p-1 text-sm rounded-full w-1/6 text-center ${
                  selectedStory.priority === 'Must Have' ? 'bg-red-300 border-red-500' :
                  selectedStory.priority === 'Should Have' ? 'bg-yellow-300 border-yellow-500' :
                  'bg-green-300 border-green-500'
                }`}>
                  {selectedStory.priority}
                </div>

                {isEditing ? (
                  <div className='mt-5 space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700'>User Role</label>
                      <input
                        type="text"
                        value={editForm.user_role}
                        onChange={(e) => setEditForm({...editForm, user_role: e.target.value})}
                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700'>Goal</label>
                      <input
                        type="text"
                        value={editForm.goal}
                        onChange={(e) => setEditForm({...editForm, goal: e.target.value})}
                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700'>Benefit</label>
                      <input
                        type="text"
                        value={editForm.benefit}
                        onChange={(e) => setEditForm({...editForm, benefit: e.target.value})}
                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700'>Acceptance Criteria</label>
                      <textarea
                        value={editForm.acceptance_criteria}
                        onChange={(e) => setEditForm({...editForm, acceptance_criteria: e.target.value})}
                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                        rows={4}
                      />
                    </div>
                    <div className='flex justify-end space-x-2'>
                      <button
                        onClick={handleCancelEdit}
                        className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleManualEdit}
                        className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700'
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='mt-5'>
                    <p className='text-sm'>
                      <strong>As</strong> {selectedStory.user_role},<br />
                      <strong>I want</strong> {selectedStory.goal},<br />
                      <strong>so that</strong> {selectedStory.benefit}
                    </p>
                    <div className='mt-4'>
                      <h3 className='font-semibold'>Acceptance Criteria:</h3>
                      <p className='text-sm mt-2'>{selectedStory.acceptance_criteria}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className='flex items-center justify-center h-full text-gray-500'>
              Select a story to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleProjectStories;