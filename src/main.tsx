import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'normalize.css'
import './index.css'
import App from './App.tsx'
import PokemonProvider from './context/PokemonProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PokemonProvider>
        <App />
      </PokemonProvider>
    </BrowserRouter>
  </StrictMode>,
)
