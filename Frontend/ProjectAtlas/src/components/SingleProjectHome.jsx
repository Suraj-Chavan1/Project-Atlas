import React, { useState, useEffect } from 'react'
import { DiJira } from "react-icons/di";
import axios from 'axios';
import KanbanBoard from './KanbanBoard';

const SingleProjectHome = ({ projectId }) => {
  const [stakeholders, setStakeholders] = useState([]);
  const [filteredStakeholders, setFilteredStakeholders] = useState([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Project ID:", projectId); // Log the projectId to check if it's being passed correctly
    const fetchStakeholders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/projects/stakeholders/${projectId}`);
        setStakeholders(response.data.stakeholders);
        setFilteredStakeholders(response.data.stakeholders);
      } catch (err) {
        setError('Failed to fetch stakeholders');
        console.error('Error fetching stakeholders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchStakeholders();
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedRole === 'all') {
      setFilteredStakeholders(stakeholders);
    } else {
      setFilteredStakeholders(stakeholders.filter(s => s.role === selectedRole));
    }
  }, [selectedRole, stakeholders]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="h-screen flex flex-col mx-3 my-0">
      <div className='grid grid-cols-6 gap-4 mt-2'>
        {/* Integrations */}
        <div className='col-span-2 row-span-1 border border-gray-400 p-3 flex flex-col rounded-md bg-white'>
          <div className="flex items-center space-x-2">
            <DiJira className="text-blue-600 text-2xl" />
            <span className="text-lg font-semibold">Integrations</span>
          </div>
          <ul className="mt-3 space-y-2">
            {[
              { name: 'JIRA ', apiKey: 'abcde12345xyz23a12' },
              { name: 'GitHub ', apiKey: 'sdcxsdfw123edaxs' },
            ].map((integration, index) => (
              <li key={index} className="flex justify-between items-center border-b py-2">
                <span className="text-gray-700">{integration.name}</span>
                <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-md">
                  {integration.apiKey.slice(0, 5) + '••••••' + integration.apiKey.slice(-4)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Requirement Engineering Graph + List */}
        <div className='col-span-2 row-span-1 border border-gray-400 bg-white p-3 flex flex-col rounded-md'>
          <div>Today's Schedule</div>
        </div>

        <div className='col-span-2 row-span-1 border border-gray-400 bg-white p-3 flex flex-col rounded-md'>
          <div>Recent Activity</div>
        </div>

        <div className='col-span-3 border border-gray-400 bg-white p-3 flex flex-col rounded-md'>
          <div className='flex justify-between'>
            <div className='text-lg font-bold mb-2'>Stakeholders</div>
            <div className='flex justify-center gap-2'>
              <div className="mb-2">
                <select
                  id="teamSelect"
                  className="border border-gray-300 rounded p-2 w-full"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="Client">Client</option>
                  <option value="SDE">SDE</option>
                  <option value="BA">Business Analyst</option>
                  <option value="DevOps">DevOps</option>
                </select>
              </div>
            </div>
          </div>
          <table className='w-full border-collapse border border-gray-300'>
            <thead>
              <tr className='bg-gray-200 text-sm'>
                <th className='border border-gray-300 px-4 py-2'>Name</th>
                <th className='border border-gray-300 px-4 py-2'>Email</th>
                <th className='border border-gray-300 px-4 py-2'>Role</th>
                <th className='border border-gray-300 px-4 py-2'>Position</th>
                <th className='border border-gray-300 px-4 py-2'>Attached Documents</th>
              </tr>
            </thead>
            <tbody>
              {filteredStakeholders.map((stakeholder, index) => (
                <tr key={stakeholder.id} className='text-md'>
                  <td className='border border-gray-300 px-4 py-2'>{stakeholder.name}</td>
                  <td className='border border-gray-300 px-4 py-2'>{stakeholder.email}</td>
                  <td className='border border-gray-300 px-4 py-2'>{stakeholder.role}</td>
                  <td className='border border-gray-300 px-4 py-2'>{stakeholder.position}</td>
                  <td className='border border-gray-300 px-4 py-2 text-center'>
                    <a href="/docs/project123.pdf" className="text-blue-500 underline">View</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='col-span-3 border border-gray-400 bg-white p-3 flex flex-col rounded-md'>
          <KanbanBoard projectId={projectId} />
        </div>


      </div>
    </div>
  );
};

export default SingleProjectHome;