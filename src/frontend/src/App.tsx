import { Routes, Route } from 'react-router-dom';
import { Nav } from './components/Nav';
import { ToastContainer } from './components/Toast';
import { HomePage } from './pages/HomePage';
import { AssetsPage } from './pages/AssetsPage';
import { ConvertPage } from './pages/ConvertPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { YouTubePage } from './pages/YouTubePage';
import { useStore } from './stores/useStore';

function App() {
  const { toasts, removeToast } = useStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/youtube" element={<YouTubePage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/convert" element={<ConvertPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
        </Routes>
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;