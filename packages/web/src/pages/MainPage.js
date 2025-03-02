// src/pages/MainPage.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

function MainPage() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {user ? (
        <>
          <h1>Welcome, {user.email}!</h1>
          <button onClick={handleLogout} style={{ padding: '10px 20px', marginTop: '20px' }}>
            Logout
          </button>
        </>
      ) : (
        <h1>You are not logged in.</h1>
      )}
    </div>
  );
}

export default MainPage;
