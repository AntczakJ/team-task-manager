import { useState, useEffect } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import { projectService, getApiErrorMessage } from '../services/api';
import ProjectTasks from './ProjectTasks';
import type { Project, Task } from '../types';

const ProjectsList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await projectService.getAll();
        if (active) setProjects(data);
      } catch {
        if (active) setError('Nie udało się pobrać projektów.');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    setError('');

    try {
      const newProject = await projectService.create(name, description);
      setProjects([newProject, ...projects]);
      setName('');
      setDescription('');
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Błąd podczas tworzenia projektu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: number, e: MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Czy na pewno chcesz usunąć ten projekt wraz z zadaniami?')) return;

    try {
      await projectService.delete(id);
      setProjects(projects.filter((p) => p.id !== id));
      if (selectedProjectId === id) setSelectedProjectId(null);
    } catch {
      setError('Nie udało się usunąć projektu.');
    }
  };

  const handleTaskCountChange = (projectId: number, newCount: number) => {
    setProjects(
      projects.map((p) =>
        p.id === projectId ? { ...p, tasks: { length: newCount } as unknown as Task[] } : p
      )
    );
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Utwórz nowy projekt</h3>
        <form onSubmit={handleCreateProject} className="space-y-4 sm:space-y-0 sm:flex sm:gap-4 sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Nazwa projektu</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="np. Sklep internetowy"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Opis (opcjonalnie)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Krótki opis celu projektu..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-md transition-colors disabled:opacity-50 h-[38px]"
          >
            {loading ? 'Dodawanie...' : 'Dodaj'}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Twoje Projekty</h3>
        {projects.length === 0 ? (
          <p className="text-gray-500 bg-white p-6 rounded-2xl border border-dashed border-gray-200 text-center">
            Nie masz jeszcze żadnych projektów. Utwórz pierwszy powyżej!
          </p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => {
                const isSelected = selectedProjectId === project.id;
                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProjectId(isSelected ? null : project.id)}
                    className={`bg-white p-6 rounded-2xl shadow-sm border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-gray-100 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-lg font-bold text-gray-900 break-words max-w-[80%]">
                          {project.name}
                        </h4>
                        <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">
                          Zadania: {project.tasks?.length || 0}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-3 break-words">
                        {project.description || 'Brak opisu projektu.'}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                      <span className="text-xs text-indigo-600 font-semibold">
                        {isSelected ? 'Kliknij, aby zamknąć szczegóły ▲' : 'Kliknij, aby zarządzać zadaniami ▼'}
                      </span>
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedProjectId && (
              <div className="animate-fadeIn">
                <div className="bg-white p-2 rounded-xl inline-block border border-gray-200 text-xs font-semibold text-gray-600 mb-2">
                  Wybrany projekt ID: {selectedProjectId}
                </div>
                <ProjectTasks
                  projectId={selectedProjectId}
                  onTaskCountChange={(count) => handleTaskCountChange(selectedProjectId, count)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;
