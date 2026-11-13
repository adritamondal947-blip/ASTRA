import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MeasurementProvider } from './data/measurementStore'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MeasurementProvider>
      <App />
    </MeasurementProvider>
  </StrictMode>,
)
