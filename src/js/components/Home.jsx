import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const username = 'alesanchezr'; // You can change this to any username
  const baseUrl = 'https://playground.4geeks.com/todo';

  // Create user if doesn't exist
  const createUser = async () => {
    try {
      const response = await fetch(`${baseUrl}/users/${username}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        console.log('User created successfully');
      } else if (response.status === 400) {
        console.log('User already exists');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Load tasks from API
  const loadTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${baseUrl}/users/${username}`);
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data.todos || []);
      } else if (response.status === 404) {
        // User doesn't exist, create it
        await createUser();
        setTasks([]);
      } else {
        throw new Error('Failed to load tasks');
      }
    } catch (error) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async () => {
    if (inputValue.trim() !== '') {
      setLoading(true);
      setError('');
      
      const newTask = {
        label: inputValue.trim(),
        is_done: false
      };

      try {
        const response = await fetch(`${baseUrl}/todos/${username}`, {
          method: "POST",
          body: JSON.stringify(newTask),
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Task added:', data);
          setInputValue('');
          // Reload tasks to get updated list
          await loadTasks();
        } else {
          throw new Error('Failed to add task');
        }
      } catch (error) {
        setError('Failed to add task');
        console.error('Error adding task:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteTask = async (id) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${baseUrl}/todos/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        console.log('Task deleted successfully');
        // Reload tasks to get updated list
        await loadTasks();
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      setError('Failed to delete task');
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllTasks = async () => {
    if (tasks.length === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Delete all tasks one by one
      const deletePromises = tasks.map(task => 
        fetch(`${baseUrl}/todos/${task.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          }
        })
      );

      await Promise.all(deletePromises);
      console.log('All tasks cleared');
      // Reload tasks to get updated (empty) list
      await loadTasks();
    } catch (error) {
      setError('Failed to clear all tasks');
      console.error('Error clearing tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-6xl font-thin text-gray-300 text-center mb-8 tracking-wider">
          todos
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg text-gray-600 mb-4 font-light">
              What needs to be done?
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a new task..."
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={addTask}
                disabled={loading || !inputValue.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
            
            {tasks.length > 0 && (
              <button
                onClick={clearAllTasks}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 size={14} />
                Clear All Tasks
              </button>
            )}
            
            {error && (
              <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
          </div>
          
          <div className="min-h-[200px]">
            {loading && tasks.length === 0 ? (
              <div className="p-6 text-center text-gray-500 font-light">
                Loading tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-6 text-center text-gray-500 font-light">
                No tasks, add a task
              </div>
            ) : (
              <div>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-700 font-light">
                      {task.label}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      disabled={loading}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={16} className="text-red-500" />
                    </button>
                  </div>
                ))}
                
                <div className="p-4 text-sm text-gray-500 font-light flex items-center justify-between">
                  <span>
                    {tasks.length} item{tasks.length !== 1 ? 's' : ''} left
                  </span>
                  {loading && (
                    <span className="text-blue-500">Syncing...</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}