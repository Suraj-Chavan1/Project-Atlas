import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your login logic here
    navigate('/projects'); // Redirect to projects page after login
    console.log('Login form submitted:', formData);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side with background image */}
      <div 
        className="hidden md:flex md:w-1/2 flex-col bg-[#00AEEF] justify-start p-12 relative bg-cover bg-center" 
      >
        {/* Semi-transparent overlay to ensure text remains readable */}
        <div className="absolute inset-0 bg-opacity-50"></div>
        
        <div className="text-white relative z-10">
          <h2 className="text-2xl font-bold mb-20">Project Atlas</h2>
          <div className="mt-20">
            <h1 className="text-6xl font-bold mb-4">Welcome Back!</h1>
            <p className="text-xl">
              Access your projects, track versions, and collaborate effortlessly
            </p>
          </div>
        </div>
        {/* Curved edge */}
        <div className="absolute top-0 right-0 h-full w-24 overflow-hidden z-10">
          <div className="absolute top-0 left-0 h-full w-full bg-white transform translate-x-1/2 skew-x-6"></div>
        </div>
      </div>

      {/* Right side with form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Log In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 border p-4 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 border p-4 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link to="/forgot-password" className="hover:underline" style={{ color: '#00AEEF' }}>
                  Forgot Password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ backgroundColor: '#00AEEF' }}
              >
                Log In
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Not having an account?{' '}
              <Link to="/signup" className="font-medium hover:underline" style={{ color: '#00AEEF' }}>
                [Sign up now]
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;