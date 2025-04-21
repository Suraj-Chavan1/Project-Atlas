import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ name, url, role, projectKey }) => {
  const navigate = useNavigate();

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-blue-100 text-blue-800';
      case 'manager':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 ease-in-out w-full">
      
      {/* Cover Image */}
      

      <div className="p-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeStyle(role)}`}>
            {role}
          </span>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <span className="font-medium text-gray-600">Key:</span> {projectKey}
        </div>

        <button
          onClick={() => navigate(url)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200 text-sm"
        >
          Go to Project
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
