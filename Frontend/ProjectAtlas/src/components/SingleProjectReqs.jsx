import React, { useState } from 'react';
import { DiJira } from "react-icons/di";

const sampleUsers = [
  { id: 'u1', name: 'Suraj' },
  { id: 'u2', name: 'Anuj' },
  { id: 'u3', name: 'Sakshi' },
];

const SingleProjectReqs = () => {
  const [showModal, setShowModal] = useState(false);
  const [resourceName, setResourceName] = useState('');
  const [context, setContext] = useState('');
  const [taggedUsers, setTaggedUsers] = useState([]);

  const toggleUserTag = (userId) => {
    setTaggedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleResourceSubmit = () => {
    const resourceData = {
      name: resourceName,
      context,
      taggedUsers,
    };
    console.log("Resource submitted:", resourceData);
    // TODO: Upload logic to backend or blob here

    // Reset modal state
    setShowModal(false);
    setResourceName('');
    setContext('');
    setTaggedUsers([]);
  };

  return (
    <div className="flex flex-col mx-3 my-0">
      <div className='grid grid-cols-3 grid-cols-2 gap-4 mt-2'>
        <div className='col-span-1 row-span-1 border border-gray-400 p-3 flex flex-col rounded-md bg-white'>
          <div className="">
            <span className="text-md ">Current Version</span>
            <div className='text-4xl'>3</div>
          </div>
        </div>

        <div className='col-span-1 row-span-1 border border-gray-400 bg-white p-3 flex flex-col rounded-md'>
          <div>Total Listed Requirements</div>
          <div className='text-4xl'>12</div>
        </div>

        <div className='col-span-1 row-span-1 border-gray-400 bg-white flex flex-col rounded-md'>
          <button
            className='flex flex-col justify-center items-center h-full bg-blue-600 text-white'
            onClick={() => setShowModal(true)}
          >
            + Add a Resource/Requirement
          </button>
          <button className='flex flex-col justify-center items-center h-full bg from-blue-300 to-blue-600 mt-1 bg-[#00072D] text-white'>
            Build Template from given resources
          </button>
        </div>

        <div className='col-span-2 border border-gray-400 bg-white p-3 flex flex-col rounded-md'>
          <div className='flex justify-between'>
            <div className='text-lg font-bold mb-2'>Requirements/Resources </div>
            <div className='flex justify-center gap-2'>
              <button className='mb-2 bg-blue-600 px-3 py-1/2 rounded-md text-white text-sm'>View Team Document</button>
              <div className="mb-2">
                <select id="teamSelect" className="border border-gray-300 rounded p-2 w-full">
                  <option value="Client">Client</option>
                  <option value="SDE">SDE</option>
                  <option value="Business Analyst">Business Analyst</option>
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
                <th className='border border-gray-300 px-4 py-2'>Attached Documents</th>
              </tr>
            </thead>
            <tbody>
              {/* static rows (repeat if needed) */}
              {[
                { name: 'Suraj', email: 'surajchavan11@gmail.com' },
                { name: 'Anuj', email: 'anujt65@outlook.com' },
                { name: 'Sakshi', email: 'sakshiee@gmail.com' },
              ].map((user, index) => (
                <tr className='text-md' key={index}>
                  <td className='border border-gray-300 px-4 py-2'>{user.name}</td>
                  <td className='border border-gray-300 px-4 py-2'>{user.email}</td>
                  <td className='border border-gray-300 px-4 py-2 text-center'>
                    <a href="/docs/project123.pdf" className="text-blue-500 underline">View</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='col-span-1 border border-gray-400 bg-white p-3 flex flex-col rounded-md'>
          <div>Recent Activity here</div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Add Resource</h2>

            <label className="block text-sm font-medium mb-1">Resource Name</label>
            <input
              type="text"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="e.g. Client meeting transcript"
            />

            <label className="block text-sm font-medium mb-1">Context</label>
            <textarea
              rows={4}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Who, what, when, where, why..."
            />

            <label className="block text-sm font-medium mb-1">Tag Users</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {sampleUsers.map(user => (
                <label key={user.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={taggedUsers.includes(user.id)}
                    onChange={() => toggleUserTag(user.id)}
                  />
                  <span>{user.name}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleResourceSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Upload Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleProjectReqs;
