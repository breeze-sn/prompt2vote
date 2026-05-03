import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthProvider'
import { JourneyProvider } from './context/JourneyProvider'
import { initSecurity } from './utils/security'
import { initializeGoogleServices, trackGoogleEvent } from './services/googleServices'

initSecurity();
void initializeGoogleServices();
void trackGoogleEvent('app_open', { surface: 'prompt2vote' });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <JourneyProvider>
        <App />
      </JourneyProvider>
    </AuthProvider>
  </StrictMode>,
)
