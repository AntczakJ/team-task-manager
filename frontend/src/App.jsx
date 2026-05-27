import React, { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm';
import ProjectsList from './components/ProjectsList'; // <-- NOWOŚĆ

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {user ? (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Header profilu */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Witaj, {user.name}! 👋</h1>
              <p className="text-sm text-gray-500">Zalogowany: {user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-md transition-colors self-start sm:self-center"
            >
              Wyloguj się
            </button>
          </div>

          {/* NOWOŚĆ: Lista Projektów */}
          <ProjectsList />
        </div>
      ) : (
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}

export default App;