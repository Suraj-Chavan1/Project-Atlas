import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const StakeholdersForm = () => {
    const [stakeholders, setStakeholders] = useState([
        { name: '', role: '', email: '' }]);
  const handleInputChange = (index, field, value) => {
    const updatedStakeholders = [...stakeholders];
    updatedStakeholders[index][field] = value;
    setStakeholders(updatedStakeholders);
  };

  const handleAddStakeholder = () => {
    setStakeholders([...stakeholders, { name: '', role: '', email: '' }]);
  };

  return (
    <div>
      <h2 className='text-xl font-bold mb-4'>Stakeholders</h2>
      {stakeholders.map((stakeholder, index) => (
        <div key={index} className='mb-4 p-2 border rounded-md'>
          <input
            type='text'
            placeholder='Name'
            className='w-full p-2 border rounded-md mb-2'
            value={stakeholder.name}
            onChange={(e) => handleInputChange(index, 'name', e.target.value)}
          />
          <input
            type='text'
            placeholder='Role'
            className='w-full p-2 border rounded-md mb-2'
            value={stakeholder.role}
            onChange={(e) => handleInputChange(index, 'role', e.target.value)}
          />
          <input
            type='email'
            placeholder='Email'
            className='w-full p-2 border rounded-md mb-2'
            value={stakeholder.email}
            onChange={(e) => handleInputChange(index, 'email', e.target.value)}
          />
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

const NewProjectModal = ({setIsModalOpen, setter}) => {
    const navigate = useNavigate();
    const [projectName, setProjectName] = useState('');

      const handleCreateProject = () => {
        console.log('Creating project:', projectName);
        setIsModalOpen(false);
        setProjectName('');
      };
    
  return (
    
    <div className='backdrop-blur-sm bg-blue bg-opacity-30  fixed inset-0 flex justify-center items-center'>
          <div className='bg-white p-6 rounded-lg shadow-lg w-1/2 flex flex-col max-h-[80vh]'>
            <h2 className='text-xl font-bold mb-4'>Create New Project</h2>
            <div className='overflow-y-auto max-h-[50vh] px-2'>
            <input 
              type='text' 
              placeholder='Enter project name' 
              className='w-full p-2 border rounded-md mb-4'
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <div className=''>Project ID: msharma.barclays.120sd-adax1-adaxa</div>
            <div className='mt-2'>Select Integration<Dropdown /></div>
            <div className='mt-2'>Add Stakeholders<StakeholdersForm /></div>

            
            <div className='flex justify-end space-x-2'>
              <button onClick={() => setter(false)} className='bg-gray-300 px-4 py-2 rounded-md'>Cancel</button>
              <button  className='bg-[#00AEEF] text-white px-4 py-2 rounded-md' onClick={()=>navigate('/project/msharma.barclays.120sd-adax1-adaxa')}>Create</button>
            </div>
            </div>
          </div>
        </div>
  )
}

export default NewProjectModal