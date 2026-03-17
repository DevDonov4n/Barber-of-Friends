import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { ClientPage } from './pages/ClientPage';
import { AdminPage } from './pages/AdminPage';

const App = (): JSX.Element => {
  return (
    <>
      <nav className="flex justify-center gap-3 bg-zinc-950 p-3 text-sm text-zinc-200">
        <Link to="/" className="rounded bg-zinc-800 px-3 py-1 hover:bg-urban-blue hover:text-zinc-950">
          Cliente
        </Link>
        <Link to="/admin" className="rounded bg-zinc-800 px-3 py-1 hover:bg-urban-red hover:text-white">
          Administrador
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<ClientPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
