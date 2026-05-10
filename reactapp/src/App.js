import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import EditPlace from './GuideComponents/EditPlace'
import HomePage from './Components/HomePage';
import ViewPlace from './GuideComponents/ViewPlace';
import PlaceForm from './GuideComponents/PlaceForm';
import LoginPage from './GuideComponents/LoginPage';
import ErrorPage from './Components/ErrorPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import Favorite from './GuideComponents/Favorite';

function App() {
 
const [role, setRole] = useState(null);
const signIn = (nextRole) => setRole(nextRole);
const signOut = () => setRole(null);

return (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<ErrorPage />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/viewplace" element={<ViewPlace />} />
          <Route element={<RoleRoute allow={["GUIDE"]} />}>
            <Route path="/newplace" element={<PlaceForm />} />
            <Route path="/places/:id/edit" element={<EditPlace/>}/>
          </Route>
          <Route element={<RoleRoute allow={["USER"]} />}>
            <Route path="/favorites" element={<Favorite/>}/>
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/error" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

}

export default App;
