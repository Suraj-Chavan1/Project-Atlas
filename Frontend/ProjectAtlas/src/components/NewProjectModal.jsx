import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

const StakeholdersForm = ({ stakeholders, setStakeholders }) => {
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/projects/list-users');
                if (response.data.success) {
                    setAvailableUsers(response.data.users);
                } else {
                    setError('Failed to fetch users');
                }
            } catch (err) {
                setError('Error fetching users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleInputChange = (index, field, value) => {
        const updatedStakeholders = [...stakeholders];
        updatedStakeholders[index][field] = value;
        setStakeholders(updatedStakeholders);
    };

    const handleAddStakeholder = () => {
        setStakeholders([...stakeholders, { id: '', role: '', email: '' }]);
    };

    if (loading) return <div>Loading users...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2 className='text-xl font-bold mb-4'>Stakeholders</h2>
            {stakeholders.map((stakeholder, index) => (
                <div key={index} className='mb-4 p-2 border rounded-md'>
                    <select
                        className='w-full p-2 border rounded-md mb-2'
                        value={stakeholder.id}
                        onChange={(e) => {
                            const selectedUser = availableUsers.find(u => u.id === e.target.value);
                            handleInputChange(index, 'id', e.target.value);
                            handleInputChange(index, 'email', selectedUser?.email || '');
                            handleInputChange(index, 'name', selectedUser?.name || '');
                        }}
                    >
                        <option value="">Select a user</option>
                        {availableUsers.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.name} ({user.email}) - {user.roles.join(', ')}
                            </option>
                        ))}
                    </select>
                    <select
                        className='w-full p-2 border rounded-md mb-2'
                        value={stakeholder.role}
                        onChange={(e) => handleInputChange(index, 'role', e.target.value)}
                    >
                        <option value="">Select a role</option>
                        <option value="owner">Owner</option>
                        <option value="manager">Manager</option>
                        <option value="member">Member</option>
                    </select>
                </div>
            ))}
            <button
                onClick={handleAddStakeholder}
                className='bg-gray-300 px-4 py-2 rounded-md'
            >
                + Add Stakeholder
            </button>
        </div>
    );
};

const Dropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
  
    const options = ['Jira: API Key: *****231a2', 'Jira: API Key: *****aseXS'];
  
    return (
      <div className="relative w-64">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border rounded-md p-2 flex justify-between items-center"
        >
          {selectedOption || 'Select an option'}
          <span className="ml-2">&#9662;</span>
        </button>
  
        {isOpen && (
          <div className="absolute left-0 right-0 mt-2 bg-white border rounded-md shadow-lg z-10">
            {options.map((option) => (
              <div
                key={option}
                onClick={() => {
                  setSelectedOption(option);
                  setIsOpen(false);
                }}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const NewProjectModal = ({ isModalOpen, setter, onAddProject }) => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [projectName, setProjectName] = useState('');
    const [projectKey, setProjectKey] = useState('');
    const [stakeholders, setStakeholders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const handleCreateProject = async () => {
      if (!projectName.trim() || !projectKey.trim()) {
        setError('Project name and key are required');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const userId = user?.id || localStorage.getItem('userId');
        
        if (!userId) {
          setError('User not logged in');
          navigate('/login');
          return;
        }

        const response = await axios.post('http://localhost:5000/projects/create', {
          name: projectName,
          projectKey: projectKey,
          stakeholders: stakeholders
        }, {
          headers: {
            'X-User-ID': userId
          }
        });

        if (response.data.success) {
          onAddProject(response.data.project);
          setter(false);
        } else {
          setError(response.data.message || 'Failed to create project');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error creating project');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className='backdrop-blur-sm bg-blue bg-opacity-30 fixed inset-0 flex justify-center items-center'>
        <div className='bg-white p-6 rounded-lg w-[500px]'>
          <h2 className='text-xl font-bold mb-4'>Create New Project</h2>
          <div className='overflow-y-auto max-h-[50vh] px-2'>
            <input
              type='text'
              placeholder='Enter project name'
              className='w-full p-2 border rounded-md mb-4'
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <input
              type='text'
              placeholder='Project Key'
              className='w-full p-2 border rounded-md mb-4'
              value={projectKey}
              onChange={(e) => setProjectKey(e.target.value)}
            />
            
            <StakeholdersForm stakeholders={stakeholders} setStakeholders={setStakeholders} />

            {error && (
              <div className="text-red-500 mt-2 mb-4">{error}</div>
            )}

            <div className='flex justify-end space-x-2 mt-4'>
              <button
                onClick={() => setter(false)}
                className='bg-gray-300 px-4 py-2 rounded-md'
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className='bg-[#00AEEF] text-white px-4 py-2 rounded-md'
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default NewProjectModal;