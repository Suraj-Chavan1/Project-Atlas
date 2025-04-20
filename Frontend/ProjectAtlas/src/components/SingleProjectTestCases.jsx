import React from 'react';

const SingleProjectTestCases = () => {
    const handleInstallClick = () => {
        const appName = "test-cases-for-atlas"; // Replace with your actual GitHub App name
        const redirectUri = encodeURIComponent("http://localhost:5000/github/callback"); // Corrected callback URL
    
        const installUrl = `https://github.com/apps/test-cases-for-atlas/installations/new?redirect_uri=${redirectUri}`;
    
        window.location.href = installUrl;
    };

    return (
        <div className="flex flex-col mx-3 my-0 h-screen">
            sdsdsdsdsd
            <div className='grid grid-cols-3 grid-cols-2 gap-4 mt-2 h-full'>
                <button
                    onClick={handleInstallClick}
                    style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        background: "#24292e",
                        color: "#fff",
                        border: "none",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                >
                    Connect GitHub App
                </button>
            </div>
        </div>
    );
};

export default SingleProjectTestCases;
