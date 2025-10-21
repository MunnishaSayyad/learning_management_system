import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './context/AuthContext.tsx';
import { InstructorProvider } from './context/InstructorContext.tsx';
import { StudentProvider } from './context/StudentContext.tsx';
import { SocketProvider } from './context/SocketContext.tsx';
import { GoogleOAuthProvider } from "@react-oauth/google";
const client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={client_id}>
    <BrowserRouter>
      <AuthProvider>
        <InstructorProvider>
          <StudentProvider>
            <SocketProvider>
              <App />
            </SocketProvider>
          </StudentProvider>
        </InstructorProvider>
      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>

)
