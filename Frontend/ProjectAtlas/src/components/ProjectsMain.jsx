import React, { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import NavbarDB from './NavbarDB';
import NewProjectModal from './NewProjectModal';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import { CircularProgress, Alert } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart, Tooltip, Legend } from 'recharts';

import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

const documentsData = [
  { date: '2025-04-01', documents: 3 },
  { date: '2025-04-04', documents: 5 },
  { date: '2025-04-07', documents: 7 },
  { date: '2025-04-10', documents: 4 },
  { date: '2025-04-13', documents: 8 },
  { date: '2025-04-16', documents: 10 },
  { date: '2025-04-19', documents: 12 },
];

const activityData = [
  { name: 'Stories Pushed', value: 7 },
  { name: 'Requirements Extracted', value: 12 },
  { name: 'Test Cases Pushed', value: 8 },
  { name: 'Documents Written', value: 2 },
];

const data = [
  { name: 'Mon', value: 200 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 250 },
  { name: 'Thu', value: 400 },
  { name: 'Fri', value: 350 },
];

const data2 = [
  { name: 'Mon', value: 450 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 230 },
  { name: 'Thu', value: 400 },
  { name: 'Fri', value: 100 },
];

const data3 = [
  { name: 'Mon', value: 700 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 300 },
  { name: 'Thu', value: 400 },
  { name: 'Fri', value: 120 },
];

const tasks = {
  delayed: [
    { id: 1, title: "Risk Profile Summary", storiesInProgress: 12, storiesCompleted: 23 },
    { id: 2, title: "Validate Beneficiary Details", storiesInProgress: 5, storiesCompleted: 10 },
  ],
  removed: [
    { id: 3, title: "Scheduling Periodic Account Review", storiesInProgress: 2, storiesCompleted: 7 },
  ],
  onTime: [
    { id: 4, title: "Pending Alert Tracking", storiesInProgress: 8, storiesCompleted: 20 },
  ],
};

const createChartData = (inProgress, completed) => {
  const total = inProgress + completed;
  const completedPercent = total === 0 ? 0 : (completed / total) * 100;

  return {
    data: [
      { name: 'Completed', value: completed },
      { name: 'Remaining', value: inProgress },
    ],
    percentage: Math.round(completedPercent),
  };
};

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

import { subDays, format } from 'date-fns'; // Add this

const today = new Date();
const startDate = subDays(today, 150);

// Generate dummy activity values for the heatmap
const values = Array.from({ length: 150 }, (_, i) => {
  const date = subDays(today, i);
  return {
    date: format(date, 'yyyy-MM-dd'),
    count: Math.floor(Math.random() * 5), // 0 to 4 activities
  };
});


const ProjectsMain = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStories, setUserStories] = useState({});
  const { user } = useUser();

  // Fetch user's projects when component mounts or when user changes
  useEffect(() => {
    fetchUserProjects();
  }, [user]);

  const fetchUserProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user ID from context or localStorage
      const userId = user?.id || localStorage.getItem('userId');
      
      if (!userId) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:5000/projects/user/${userId}`, {
        headers: {
          'X-User-ID': userId
        }
      });

      if (response.data.success) {
        setProjects(response.data.projects);
        // Fetch stories for each project
        await fetchStoriesForProjects(response.data.projects);
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.message || 'Error fetching projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoriesForProjects = async (projects) => {
    try {
      const storiesByProject = {};
      
      for (const project of projects) {
        const response = await axios.get(`http://localhost:5000/srs_brd_to_stories/stories/${project.id}`);
        if (response.data.success) {
          storiesByProject[project.id] = response.data.stories;
        }
      }
      
      setUserStories(storiesByProject);
    } catch (err) {
      console.error('Error fetching stories:', err);
    }
  };

  const getStoryStats = (projectId) => {
    const stories = userStories[projectId] || [];
    const completed = stories.filter(story => story.status === 'Complete').length;
    const inProgress = stories.filter(story => story.status === 'In Progress').length;
    const backlog = stories.filter(story => story.status === 'Backlog').length;
    
    return {
      completed,
      inProgress,
      backlog,
      total: stories.length
    };
  };
  
  const handleAddProject = (newProject) => {
    setProjects(prevProjects => [...prevProjects, newProject]);
  };

  return (
    <div className="flex flex-col bg-[#fceeea]">
      <NavbarDB title="Your Projects" byline="Manage all your projects with ease on a single page" />
      <div className='grid grid-cols-3 w-full'>

        {/*Today's Insights*/}
        <div className="my-1 mx-2 border border-[#989898] p-3 bg-white rounded-md flex flex-col justify-between">
        <div>Today's Insights</div>
          <div className='flex justify-between items-start rounded-md bg-[#F3DFBF] my-1 text p-2'>
            <div className='font-bold text-sm'>Stories Pushed</div>
              <div className='text-green-600 text-sm font-bold'>7</div>
          </div>

          <div className='flex justify-between items-start rounded-md bg-[#F3DFBF] my-1 text p-2'>
            <div className='font-bold text-sm'>Requirements Extracted</div>
              <div className='text-red-600 text-sm font-bold'>12</div>
          </div>

          <div className='flex justify-between items-start rounded-md bg-[#F3DFBF] my-1 text p-2'>
            <div className='font-bold text-sm'>Test Cases Pushed</div>
              <div className='text-green-600 text-sm font-bold'>8</div>
          </div>
         

          <div className='flex justify-between items-start rounded-md bg-[#F3DFBF] my-1 text p-2'>
            <div className='font-bold text-sm'>Standard Documents Written</div>
              <div className='text-green-600 text-sm font-bold'>2</div>
          </div>


          
    </div>
         {/*Today's Insights Ends*/}
 
       
        <div className=' col-span-2 my-1 mx-2 border border-[#989898] p-3 bg-white rounded-md flex flex-col'>
          <div className='mb-2'> Documents Generated</div>
          <div className='h-40'>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={documentsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="documents"
                stroke="#3b82f6" // Tailwind's blue-500
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-2 mx-2 my-1 bg-gray-200 border border-[#989898] rounded-md flex flex-col p-3 h-100">
          <div className='flex justify-between items-center'>
            <div className='text-xl font-bold'>Your Projects</div>
          <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#00AEEF] p-1 rounded-md w-1/3 text-white text-center"
        >
          + Create New Project
        </button>
          </div>
        

        {error && (
          <Alert severity="error" className="mt-4">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center mt-8">
            <CircularProgress />
          </div>
        ) : (
          <div className=" grid grid-cols-2 gap-4 p-2 mt-4">
      {projects.length === 0 ? (
        <div className="col-span-3 text-center text-gray-500">
          No projects found. Create a new project to get started!
        </div>
      ) : (
        projects.map((project) => {
          const stats = getStoryStats(project.id);
          const percentage = stats.total > 0 ? Math.floor((stats.completed / stats.total) * 100) : 0;
  
          // Prepare data for the donut chart
          const donutData = [
            { name: 'Completed', value: stats.completed },
            { name: 'In Progress', value: stats.inProgress },
            { name: 'Backlog', value: stats.backlog },
          ];
  
          // Define colors for each section
          const COLORS = ['#4caf50', '#ffa500', '#f44336'];
  
          return (
            <div key={project.id} className="bg-white p-2 border border-gray-400 flex flex-col my-1 text-center">
              <div className="text-left text-md font-bold">{project.name}</div>
  
              <div className="text-sm text-left text-gray-600 mt-1">
                Project Key: {project.projectKey}
              </div>
  
              <div className="mt-2">
                <div className="flex justify-between text-sm">
                  <span>Completed: {stats.completed}</span>
                  <span>In Progress: {stats.inProgress}</span>
                  <span>Backlog: {stats.backlog}</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
  
                {/* Donut Chart */}
                <div className="mt-4 flex justify-center items-center">
                  <PieChart width={100} height={100}>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      innerRadius={30}
                      outerRadius={40}
                      fill="#8884d8"
                      paddingAngle={5}
                      
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
  
                {/* Progress bar */}
                
  
                <div className="text-xs text-gray-500 mt-1">
                  {percentage}% Complete
                </div>
              </div>
  
              {/* Link to project */}
              <a
                href={`/project/${project.id}`}
                className="mt-3 bg-blue-500 p-1 text-white rounded-md hover:underline text-sm"
              >
                View Project
              </a>
            </div>
          );
        })
      )}
    </div>
        )}
      </div>

      <div className='bg-white border border-[#989898] rounded-md m-1 p-3 h-full'>
      <div>Today's Insights</div>
          <div className='flex justify-between items-start rounded-md bg-[#fceeea] my-1 text p-2'>
            <div className='font-bold text-sm'>Stories Pushed</div>
              <div className='text-green-600 text-sm font-bold'>7</div>
          </div>

          <div className='flex justify-between items-start rounded-md bg-[#fceeea] my-1 text p-2'>
            <div className='font-bold text-sm'>Requirements Extracted</div>
              <div className='text-red-600 text-sm font-bold'>12</div>
          </div>

          <div className='flex justify-between items-start rounded-md bg-[#fceeea] my-1 text p-2'>
            <div className='font-bold text-sm'>Test Cases Pushed</div>
              <div className='text-green-600 text-sm font-bold'>8</div>
          </div>
         

          <div className='flex justify-between items-start rounded-md bg-[#fceeea] my-1 text p-2'>
            <div className='font-bold text-sm'>Standard Documents Written</div>
              <div className='text-green-600 text-sm font-bold'>2</div>
          </div>

          
      </div>


        
      </div>

      

      {/* Modal */}
      {isModalOpen && (
        <NewProjectModal
          isModalOpen={isModalOpen}
          setter={setIsModalOpen}
          onAddProject={handleAddProject}
          onProjectCreated={fetchUserProjects} // Add this to refresh the list after creation
        />
      )}
    </div>
  );
};

export default ProjectsMain;
