import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import NavbarDB from './NavbarDB'

import SingleProjectHome from './SingleProjectHome';
import SingleProjectReqs from './SingleProjectReqs';
import SingleProjectDocs from './SingleProjectDocs';
import SingleProjectStories from './SingleProjectStories';
import SingleProjectTestCases from './SingleProjectTestCases';

const requirementsData = [
    { name: "Stakeholders ", Iterations: 4 },
    { name: "Documents", Iterations: 3 },
    { name: "User Stories", Iterations: 0 },
    { name: "Iterations", Iterations: 0 },
];

const SingleProjectMain = () => {
    const { id: projectId } = useParams();
    const [category, setCategory] = useState('Home')
    return (
        <div className="flex flex-col">
            <NavbarDB title="Finance Application" byline="Manage all your projects with ease on a single page" />
            <div className='text-sm mx-2 my-1  border-b p-2 flex justify-between gap-2'>
                <div className='flex items-center gap-2 bg-white p-2 border border-gray-400 rounded-md'>Finance Project / {category}</div>

                <div className='flex items-center gap-2'>
                    <button className={category=== 'Home' ? "bg-[#00072D] text-white p-1 rounded" : ""} 
                    onClick={()=> setCategory('Home')}>Project</button>
                    
                    <button className={category=== 'Requirements' ? "bg-[#00072D] text-white p-1 rounded" : ""} 
                    onClick={()=> setCategory('Requirements')}>Requirements</button>

                    <button className={category=== 'Documents' ? "bg-[#00072D] text-white p-1 rounded" : ""} 
                    onClick={()=> setCategory('Documents')}>Documents</button>

                    <button className={category=== 'User Stories' ? "bg-[#00072D] text-white p-1 rounded" : ""} 
                    onClick={()=> setCategory('User Stories')}>User Stories</button>

                    <button className={category=== 'Test Cases' ? "bg-[#00072D] text-white p-1 rounded" : ""} onClick={()=> setCategory('Test Cases')}>Test Cases</button>
                </div>

            </div>
            
            {category === 'Home'? <SingleProjectHome projectId={projectId} /> : <></>}
            {category === 'Requirements' ? <SingleProjectReqs projectId={projectId} /> : <></>}
            {category === 'Documents' ? <SingleProjectDocs projectId={projectId} /> : <></>}
            {category === 'User Stories' ? <SingleProjectStories projectId={projectId} /> : <></>}
            {category === 'Test Cases' ? <SingleProjectTestCases projectId={projectId} /> : <></>}
        </div>
    )
}

export default SingleProjectMain
