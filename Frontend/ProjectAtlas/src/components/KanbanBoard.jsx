import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import { toast } from 'react-toastify';

const KanbanBoard = ({ projectId }) => {
  const [columns, setColumns] = useState({
    Backlog: [],
    'In Progress': [],
    Complete: [],
  });

  const [loading, setLoading] = useState(false);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/srs_brd_to_stories/stories/${projectId}`);
      const allStories = response.data.stories;

      const statusMap = {
        Backlog: [],
        'In Progress': [],
        Complete: [],
      };

      allStories.forEach((story) => {
        if (statusMap[story.status]) {
          statusMap[story.status].push({
            id: story.id.toString(),
            content: story.title,
          });
        }
      });

      setColumns(statusMap);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch stories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchStories();
    }
  }, [projectId]);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColumn = [...columns[source.droppableId]];
    const destColumn = [...columns[destination.droppableId]];
    const [movedItem] = sourceColumn.splice(source.index, 1);

    destColumn.splice(destination.index, 0, movedItem);

    setColumns({
      ...columns,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    });
  };

  // Function to get title color based on column
  const getTitleColor = (columnId) => {
    switch (columnId) {
      case 'Backlog':
        return 'text-yellow-500';
      case 'In Progress':
        return 'text-green-500';
      case 'Complete':
        return 'text-red-500';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="p-2">
      {loading ? (
        <div className="text-center">Loading stories...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-1">
            {Object.entries(columns).map(([columnId, tasks]) => (
              <Droppable droppableId={columnId} key={columnId}>
                {(provided) => (
                  <div
                    className="p-4 rounded w-1/3 min-h-[500px] bg-gray-100"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <h2 className={`text-2xl font-bold mb-4 capitalize ${getTitleColor(columnId)}`}>
                      {columnId}
                    </h2>
                    {tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 mb-3 bg-white rounded shadow ${
                              snapshot.isDragging ? 'bg-blue-100' : ''
                            }`}
                          >
                            {task.content}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default KanbanBoard;
