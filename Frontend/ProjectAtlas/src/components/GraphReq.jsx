import React from 'react'

const GraphReq = () => {
  return (
    <>
    <div className='text-lg font-bold mb-2'>Requirement Engineering</div>
                    
                    {/* Bar Chart for Requirements */}
                    <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={requirementsData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="Iterations" fill="#3182ce" />
                        </BarChart>
                    </ResponsiveContainer>

                    {/* List of Requirements */}
                    </>
  )
}

export default GraphReq