import React from 'react';
import Logo from '../assets/Logo-dark.png';
import BarclaysLogo from '../assets/barclays-logo.png';
import HomeBg from '../assets/homepage.png';

const HomePage = () => {
  return (
    <div
      className="w-full min-h-screen flex flex-col bg-cover bg-center"
      style={{ backgroundImage: `url(${HomeBg})`,
      backgroundSize: '100%', backgroundPosition: 'center top -150px', }}
    >
      <div className="flex justify-between p-3 bg-white bg-opacity-80 rounded-lg m-2">
        <div className="flex gap-2 items-center">
          <img src={Logo} alt="Logo" className="w-10 h-10" />
          <div className="text-2xl font-bold">Project Atlas</div>
        </div>

        <div className="bg-[#00AEEF] rounded-full p-2 flex px-4 text-white justify-center gap-8 items-center cursor-pointer">
          <div>About Team</div>
        </div>

        <div className="bg-[#607D8B] rounded-full p-2 flex px-4 text-white justify-center gap-4 cursor-pointer">
          <div>Signup</div>
          <div>Login</div>
        </div>
      </div>

      <div className="flex justify-center w-full mt-5">
        <img src={BarclaysLogo} alt="Logo" className="w-40 h-auto mr-3" />
      </div>

      <div className="w-full flex justify-center">
        <div className="bg-[#1A365D] p-2 rounded-md text-white bg-opacity-80">
          Team Cyber Wardens | Automated Requirement Engineering
        </div>
      </div>

      <div className="w-full flex justify-center mt-4">
        <div className="text-5xl text-center font-bold">
          Requirement Engineering <br />
          <span className="text-[#00AEEF]">re imagined</span>
        </div>
      </div>

      <div className="w-full flex justify-center mt-4">
        <div className="text-sm text-center text-black bg-opacity-60 p-2 rounded-lg">
          Project Atlas helps you document, delegate, discuss and automate tasks while gathering requirements and co-engineering processes
        </div>
      </div>
    </div>
  );
};

export default HomePage;
