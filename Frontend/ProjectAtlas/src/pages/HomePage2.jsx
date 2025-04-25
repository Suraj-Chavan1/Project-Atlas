import React from 'react';
import HomeBG from '../assets/HomeBG1.png'; 
import AtomicStructure from '../assets/AtomicStructure.png';  // This is for the rotating outer rings
import Logo from '../assets/logo.png';  // This is for the center logo
import Rings from '../assets/Rings2.png';  // This is for the center logo
import Barclays from '../assets/Barclays.png';  // This is for the center logo

import { useNavigate } from 'react-router-dom';

const HomePage2 = () => {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen bg-cover bg-center text-white relative"
      style={{ backgroundImage: `url(${HomeBG})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-6">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <img src={Logo} alt="Logo" className="w-16 h-16 object-contain" />
          <div className="text-2xl font-bold">Project Atlas</div>
        </div>

        {/* Navigation Links */}
        <div className='flex justify-center gap-5'>
            <button className='text-black hover:underline cursor-pointer' onClick={()=> navigate('/login')}>Login</button>
            <button className='bg-[#002546] py-2 px-4 rounded-full hover:underline cursor-pointer' onClick={()=> navigate('/signup')}>Signup</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col md:flex-row justify-between h-[calc(100vh-96px)]">
        {/* Text Section */}
        <div className="pl-10 w-full md:w-1/2 text-left mt-10 md:mb-0">
          <div className=" mb-4">Team Cyber Wardens, VIT Pune</div>
          <h1 className="text-5xl md:text-5xl mb-4">Bridge the Gap Between Ideas and Execution</h1>
          <p className="text-sm md:text-xl text-gray-200 max-w-xl">
            Project Atlas allows you to move from ideation to requirement gathering, while maintaining document versioning and scaffolding test cases for you!
          </p>
        </div>

        {/* Image Section */}
        {/* Image Section */}
<div className="w-full md:w-1/2 flex justify-center items-center relative">
  {/* Container for both rotating and fixed images */}
  <div className="relative w-[550px] h-[550px] flex justify-center items-center">

    
    {/* Rotating Outer Rings */}
    <img 
      src={Rings} 
      alt="Rotating Rings" 
      className="absolute top-0 left-0 w-full h-full object-contain animate-spin-slow"
    />

    {/* Fixed Center Logo */}
    <img 
      src={Barclays} 
      alt="Center Logo" 
      className="w-16 h-16 object-contain z-10"
    />
  </div>
</div>

      </section>
    </div>
  );
};

export default HomePage2;
