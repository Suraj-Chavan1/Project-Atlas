import React, { useState } from 'react'

const ReqTable = () => {
  const [isChecked, setIsChecked] = useState(false)

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked)
  }

  const data = [
    {
      id: '12wsdfews',
      date: '12/12/2023',
      uploadedBy: 'Mr. Kumar',
      tagged: 'Kunal Kamra',
    },
    {
      id: '34abcxyz',
      date: '15/01/2024',
      uploadedBy: 'Ms. Sharma',
      tagged: 'Tanmay Bhat',
    },
  ]

  return (
    <table className="w-full text-sm border-separate border-spacing-0">
      <thead>
        <tr className="flex justify-around bg-blue-200 rounded-tl rounded-tr mt-1 mx-2 p-1 bg-gray-300 border border-gray-300 text-left">
          <th className="text-left">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
            />
          </th>
          <th className="text-left">ID</th>
          <th className="text-left">Date</th>
          <th className="text-left">Uploaded by</th>
          <th className="text-left">Tagged</th>
          <th className="text-left">Context</th>
        </tr>
      </thead>

      <tbody>
        {data.map((item, index) => (
          <tr
            key={index}
            className="p-1 bg-white border-b border-gray-300 flex justify-around items-center text-sm mx-2 text-left"
          >
            <td className="text-left">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
            </td>
            <td className="text-left">{item.id}</td>
            <td className="text-left">{item.date}</td>
            <td className="text-left">{item.uploadedBy}</td>
            <td className="text-left">{item.tagged}</td>
            <td className="text-left">
              <button>View Context</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ReqTable
