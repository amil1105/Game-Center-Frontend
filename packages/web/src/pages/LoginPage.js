// src/pages/LoginPage.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { loginUser } from '../api/auth';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email && password) {
      try {
        const data = await loginUser(email, password);
        // API'den gelen veri içinde token ve kullanıcı bilgisi olabilir.
        login(data.user); // context'e kullanıcı bilgisini kaydediyoruz
        navigate('/');
      } catch (error) {
        alert(error.response?.data?.message || 'Login failed');
      }
    } else {
      alert('Please enter both email and password.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Login Page</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ margin: '10px' }}>
          <input 
            type="email"
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '10px', width: '250px' }}
          />
        </div>
        <div style={{ margin: '10px' }}>
          <input 
            type="password"
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '10px', width: '250px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', marginTop: '20px' }}>Login</button>
      </form>
      <p style={{ marginTop: '20px' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default LoginPage;
