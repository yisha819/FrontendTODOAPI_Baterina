'use client';

import { useEffect, useState } from 'react';

interface Todo {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed';
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/todos`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setTodos(data);
      } else if (data && Array.isArray(data.data)) {
        setTodos(data.data);
      } else if (data && Array.isArray(data.todos)) {
        setTodos(data.todos);
      } else {
        setTodos([]);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
      setTodos([]);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      const res = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        fetchTodos();
      }
    } catch (error) {
      console.error('Error adding todo:', error);       
    }
  };

  const handleToggleStatus = async (todo: Todo) => {
    const newStatus = todo.status === 'active' ? 'completed' : 'active';

    try {
      const res = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: todo.title,
          description: todo.description,
          status: newStatus,
        }),
      });
      if (res.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  // Separate active vs completed workflows
  const activeTodos = Array.isArray(todos) ? todos.filter(t => t.status === 'active') : [];
  const completedTodos = Array.isArray(todos) ? todos.filter(t => t.status === 'completed') : [];

  // Active To Do task circulating background styles
  const activeColors = [
    'bg-teal-100 border-teal-200 text-teal-900',
    'bg-blue-100 border-blue-200 text-blue-900',
    'bg-orange-100 border-orange-200 text-orange-900'
  ];

  return (
    <div className="min-h-screen w-full bg-white text-gray-800 font-sans antialiased py-12 px-4">
      <div className="max-w-xl mx-auto space-y-10"> 
        
        <h1 className="text-4xl font-black tracking-tight text-gray-900 text-center">To Do List</h1>

        {/* --- 1. ADD TASK CONTAINER --- */} 
        <form 
          onSubmit={handleSubmit} 
          className="p-6 bg-zinc-50 border border-zinc-100 rounded-3xl shadow-sm space-y-4"
        >
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Create New Task</h2>
          
          <div className="flex flex-col gap-1">
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="What needs to be done?"
              className="w-full px-5 py-3 border border-zinc-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300 text-black bg-white transition shadow-inner placeholder:text-zinc-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <input 
              type="text" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Add some details..."
              className="w-full px-5 py-3 border border-zinc-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300 text-black bg-white transition shadow-inner placeholder:text-zinc-400"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-4 py-3 rounded-full transition duration-150 shadow-md"
          >
            Add Task
          </button>
        </form>

        {/* --- 2. ACTIVE TO DO CONTAINER --- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-gray-900">To Do</h2>
            <span className="text-sm font-bold text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">
              {activeTodos.length} remaining
            </span>
          </div>
          
          <div className="space-y-3">
            {activeTodos.length === 0 ? (
              <p className="text-zinc-400 italic text-center py-8 border border-dashed border-zinc-200 rounded-[2.5rem]">
                All caught up! Create a new task above.
              </p>
            ) : (
              activeTodos.map((todo, index) => {
                const colorClass = activeColors[index % activeColors.length];
                return (
                  <div 
                    key={todo.id} 
                    className={`p-5 px-8 border rounded-[2.5rem] flex justify-between items-center shadow-sm hover:shadow-md transition-all duration-300 ${colorClass}`}
                  >
                    <div className="max-w-[70%]">
                      <strong className="text-lg font-bold block leading-tight">
                        {todo.title}
                      </strong>
                      <p className="text-sm opacity-80 mt-1 font-medium">{todo.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => handleToggleStatus(todo)} 
                        className="h-10 w-10 bg-white/70 hover:bg-white rounded-full flex items-center justify-center transition shadow-sm text-lg font-bold"
                        title="Complete Task"
                      >
                        ✓
                      </button>
                      <button 
                        onClick={() => handleDelete(todo.id)} 
                        className="h-10 w-10 bg-white/20 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition text-sm font-bold"
                        title="Delete Task"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* --- 3. COMPLETED LIST CONTAINER --- */}
        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-emerald-900">Completed</h2>
            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              {completedTodos.length} done
            </span>
          </div>

          <div className="space-y-3">
            {completedTodos.length === 0 ? (
              <p className="text-zinc-400 italic text-center py-8 border border-dashed border-zinc-200 rounded-[2.5rem]">
                No completed tasks yet. Finish a task to see it here!
              </p>
            ) : (
              completedTodos.map((todo) => (
                <div 
                  key={todo.id} 
                  className="p-5 px-8 bg-emerald-50 border border-emerald-100 text-emerald-950 rounded-[2.5rem] flex justify-between items-center shadow-sm transition-all duration-300"
                >
                  <div className="max-w-[70%]">
                    <strong className="text-lg font-bold block line-through opacity-50 decoration-emerald-800 decoration-2">
                      {todo.title}
                    </strong>
                    <p className="text-sm opacity-50 mt-0.5 line-through">{todo.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => handleToggleStatus(todo)} 
                      className="px-4 py-2 bg-white hover:bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold shadow-sm transition-all"
                    >
                      Reopen
                    </button>
                    <button 
                      onClick={() => handleDelete(todo.id)} 
                      className="h-9 w-9 bg-emerald-200/40 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition text-xs font-bold text-emerald-900"
                      title="Delete Permanently"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}