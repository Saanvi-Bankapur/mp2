import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import DetailView from './pages/DetailView'
import GalleryView from './pages/GalleryView'
import ListView from './pages/ListView'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ListView />} />
        <Route path="gallery" element={<GalleryView />} />
        <Route path="pokemon/:id" element={<DetailView />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
