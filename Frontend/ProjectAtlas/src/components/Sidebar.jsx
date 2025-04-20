import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../assets/Logo-dark.png';
import { MdDashboard, MdViewKanban } from "react-icons/md";
import { PiSparkleFill, PiAsteriskFill } from "react-icons/pi";
import { IoDocumentsSharp } from "react-icons/io5";
import { FaRegCheckSquare } from "react-icons/fa";
import { FaFileExcel } from "react-icons/fa";
import { BsRobot } from "react-icons/bs";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();  // 🔹 Get the current URL path

  const menuItems = [
    { label: 'Dashboard', path: '/projects', icon: <MdDashboard /> },
    { label: 'Requirements Monitoring', path: '/requirements', icon: <MdDashboard /> },
    { label: 'Documentation Manager', path: '/version-control', icon: <IoDocumentsSharp /> },
    { label: 'Integration Manager', path: '/integrations', icon: <MdViewKanban /> },
  ];

  const downloadItems = [
    { label: 'Product Backlog and JIRA', path: '/user-stories', icon: <FaFileExcel /> },
    { label: 'Requirement Documents', path: '/required-documents', icon: <PiAsteriskFill /> },
    { label: 'Test Cases', path: '/test-cases', icon: <FaRegCheckSquare /> },
  ];

  return (
    <div className='border-r border-[#989898] bg-white w-1/5 h-screen flex flex-col'>
      {/* Logo Section */}
      <div className='p-3 flex items-center border-b border-[#989898]'>
        <img src={Logo} alt='Logo' className='w-10 h-10 mr-3'/>
        <div className='flex flex-col'>
          <div className='text-xl font-bold text-[#00AEEF]'>Project Atlas</div>
          <div className='text-sm font-semibold text-[#4D4D4D]'>Team Dashboard</div>
        </div>
      </div>

      {/* General Section */}
      <div className='mt-2 ml-4 flex flex-col text-sm'>
        <div className='text-[#4D4D4D] text-sm'>GENERAL</div>
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`mt-1 font-semibold rounded-md p-2 text-left mr-5 flex items-center gap-2 
              ${location.pathname === item.path ? 'bg-[#00AEEF] text-white' : 'text-[#4D4D4D] hover:bg-gray-200'}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* Downloads Section */}
      <div className='mt-4 ml-4 flex flex-col text-sm'>
        <div className='text-[#4D4D4D] text-sm'>DOWNLOADS</div>
        {downloadItems.map((item) => (
          <button
            key={item.path}
            className={`mt-1 font-semibold rounded-md p-2 text-left mr-5 flex items-center gap-2 
              ${location.pathname === item.path ? 'bg-[#00AEEF] text-white' : 'text-[#4D4D4D] hover:bg-gray-200'}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
