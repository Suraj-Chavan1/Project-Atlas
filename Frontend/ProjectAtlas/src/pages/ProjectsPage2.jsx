import Sidebar from '../components/Sidebar'
import React from 'react'
import { PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#00C49F', '#FF8042'];

const ProjectsPage2 = () => {
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

  // Function to create pie chart data dynamically
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

  return (
    <div className='w-full flex justify-center'>
      <Sidebar />

      <div className='ml-[20%] bg-blue-200 w-screen h-screen grid grid-rows-9 gap-2 grid-cols-3 p-2'> 
        <div className='row-span-2 col-span-1 bg-white rounded-md p-2 border border-gray-300'></div>
        <div className='row-span-2 col-span-1 bg-white rounded-md p-2 border border-gray-300'></div>
        <div className='row-span-2 col-span-1 bg-white rounded-md p-2 border border-gray-300'></div>

        <div className='row-span-7 col-span-3 rounded-md p-2 border border-gray-300 bg-white'>
          <div className='text-xl font-bold mb-4'>All Projects</div>

          <div className="grid grid-cols-3 gap-4 p-2">
            {/* Backlog (Delayed) */}
            <div className="flex flex-col">
              <div className="bg-red-200 border border-red-500 rounded-sm p-1 text-red-700 font-semibold text-center mb-2">
                Backlog
              </div>
              {tasks.delayed.map(task => {
                const { data, percentage } = createChartData(task.storiesInProgress, task.storiesCompleted);
                return (
                  <div key={task.id} className="bg-gray-200 p-2 border border-gray-400 flex flex-col my-1 text-center">
                    <div className='text-left text-md font-bold'>{task.title}</div>
                    <div className='flex justify-between items-center gap-1 mt-2'>
                      <div className='w-1/2 text-sm text-gray-700 flex flex-col'>
                        <div>Stories In Progress: {task.storiesInProgress}</div>
                        <div>Stories Completed: {task.storiesCompleted}</div>
                      </div>

                      <div className='w-1/2 flex justify-center items-center'>
                        <PieChart width={80} height={80}>
                          <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={20}
                            outerRadius={30}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                          >
                            {data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs font-bold fill-black"
                          >
                            {percentage}%
                          </text>
                        </PieChart>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* In Progress (Removed) */}
            <div className="flex flex-col">
              <div className="bg-yellow-200 border border-yellow-500 rounded-sm p-1 text-yellow-700 font-semibold text-center mb-2">
                In Progress
              </div>
              {tasks.removed.map(task => {
                const { data, percentage } = createChartData(task.storiesInProgress, task.storiesCompleted);
                return (
                  <div key={task.id} className="bg-gray-200 p-2 border border-gray-400 flex flex-col my-1 text-center">
                    <div className='text-left text-md font-bold'>{task.title}</div>
                    <div className='flex justify-between items-center gap-1 mt-2'>
                      <div className='w-1/2 text-sm text-gray-700 flex flex-col'>
                        <div>Stories In Progress: {task.storiesInProgress}</div>
                        <div>Stories Completed: {task.storiesCompleted}</div>
                      </div>

                      <div className='w-1/2 flex justify-center items-center'>
                        <PieChart width={80} height={80}>
                          <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={20}
                            outerRadius={30}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                          >
                            {data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs font-bold fill-black"
                          >
                            {percentage}%
                          </text>
                        </PieChart>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Completed (On Time) */}
            <div className="flex flex-col">
              <div className="bg-green-200 border border-green-500 rounded-sm p-1 text-green-700 font-semibold text-center mb-2">
                Completed
              </div>
              {tasks.onTime.map(task => {
                const { data, percentage } = createChartData(task.storiesInProgress, task.storiesCompleted);
                return (
                  <div key={task.id} className="bg-gray-200 p-2 border border-gray-400 flex flex-col my-1 text-center">
                    <div className='text-left text-md font-bold'>{task.title}</div>
                    <div className='flex justify-between items-center gap-1 mt-2'>
                      <div className='w-1/2 text-sm text-gray-700 flex flex-col'>
                        <div>Stories In Progress: {task.storiesInProgress}</div>
                        <div>Stories Completed: {task.storiesCompleted}</div>
                      </div>

                      <div className='w-1/2 flex justify-center items-center'>
                        <PieChart width={80} height={80}>
                          <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={20}
                            outerRadius={30}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                          >
                            {data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs font-bold fill-black"
                          >
                            {percentage}%
                          </text>
                        </PieChart>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

export default ProjectsPage2;