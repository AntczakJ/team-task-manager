import React, { useState, useEffect } from 'react';
import { taskService } from '../services/api';

const ProjectTasks = ({ projectId, onTaskCountChange }) => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      const data = await taskService.getByProject(projectId);
      setTasks(data);
    } catch (err) {
      setError('Nie udało się pobrać zadań dla tego projektu.');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    setError('');

    try {
      const newTask = await taskService.create(title, description, projectId);
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      setTitle('');
      setDescription('');
      if (onTaskCountChange) onTaskCountChange(updatedTasks.length);
    } catch (err) {
      setError('Błąd podczas dodawania zadania.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await taskService.updateStatus(id, newStatus);
      setTasks(tasks.map((t) => (t.id === id ? { ...t, status: updated.status } : t)));
    } catch (err) {
      setError('Nie udało się zmienić statusu.');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Usunąć to zadanie?')) return;
    try {
      await taskService.delete(id);
      const updatedTasks = tasks.filter((t) => t.id !== id);
      setTasks(updatedTasks);
      if (onTaskCountChange) onTaskCountChange(updatedTasks.length);
    } catch (err) {
      setError('Nie udało się usunąć zadania.');
    }
  };

  const statuses = [
    { key: 'TODO', label: 'Do zrobienia', color: 'bg-gray-100 text-gray-800' },
    { key: 'IN_PROGRESS', label: 'W toku', color: 'bg-amber-100 text-amber-800' },
    { key: 'DONE', label: 'Zrobione', color: 'bg-green-100 text-green-800' },
  ];

  return (
    <div className="mt-6 bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 space-y-6">
      <h5 className="text-md font-bold text-gray-800 uppercase tracking-wider">Zadania w projekcie</h5>

      {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

      {/* Szybki formularz dodawania zadania */}
      <form onSubmit={handleCreateTask} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <input
          type="text"
          required
          placeholder="Tytuł zadania..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
        />
        <input
          type="text"
          placeholder="Opis zadania..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gray-800 text-white font-medium text-sm rounded py-1.5 hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          {loading ? 'Dodawanie...' : 'Dodaj Zadanie'}
        </button>
      </form>

      {/* Podział na 3 kolumny statusów (Responsywny Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statuses.map((statusObj) => (
          <div key={statusObj.key} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-50">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusObj.color}`}>
                {statusObj.label}
              </span>
              <span className="text-gray-400 text-xs font-bold">
                {tasks.filter((t) => t.status === statusObj.key).length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
              {tasks.filter((t) => t.status === statusObj.key).length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4 italic">Brak zadań</p>
              ) : (
                tasks
                  .filter((t) => t.status === statusObj.key)
                  .map((task) => (
                    <div key={task.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors space-y-2">
                      <div>
                        <h6 className="text-sm font-semibold text-gray-900 break-words">{task.title}</h6>
                        {task.description && <p className="text-xs text-gray-500 mt-0.5 break-words">{task.description}</p>}
                      </div>

                      {/* Nawigacja zmiany statusu i usuwanie */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200/60 text-[11px]">
                        <div className="flex gap-1.5">
                          {statusObj.key !== 'TODO' && (
                            <button onClick={() => handleStatusChange(task.id, 'TODO')} className="text-gray-500 hover:text-indigo-600 font-medium">← Do Rejestru</button>
                          )}
                          {statusObj.key === 'TODO' && (
                            <button onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')} className="text-indigo-600 hover:text-indigo-800 font-semibold">Rozpocznij →</button>
                          )}
                          {statusObj.key === 'IN_PROGRESS' && (
                            <button onClick={() => handleStatusChange(task.id, 'DONE')} className="text-green-600 hover:text-green-800 font-semibold">Zakończ →</button>
                          )}
                        </div>
                        <button onClick={() => handleDeleteTask(task.id)} className="text-red-500 hover:text-red-700 font-medium">Usuń</button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTasks;