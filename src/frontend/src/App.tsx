import { Routes, Route } from 'react-router-dom';
import { Nav } from './components/Nav';
import { AssetsPage } from './pages/AssetsPage';
import { ConvertPage } from './pages/ConvertPage';
import { ArticlesPage } from './pages/ArticlesPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<AssetsPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/convert" element={<ConvertPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;