import React from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ name, url, role, projectKey }) => {
  return (
    <Link to={url}>
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <div className="text-sm text-gray-600 mb-2">
          Key: {projectKey}
        </div>
        <div className="flex items-center">
          <span className={`
            px-2 py-1 rounded-full text-xs
            ${role === 'owner' ? 'bg-blue-100 text-blue-800' : 
              role === 'manager' ? 'bg-green-100 text-green-800' : 
              'bg-gray-100 text-gray-800'}
          `}>
            {role}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;