// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (email && password) {
      try {
        await registerUser(email, password);
        alert('Registration successful. Please login.');
        navigate('/login');
      } catch (error) {
        alert(error.response?.data?.message || 'Registration failed');
      }
    } else {
      alert('Please fill all the fields.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Register Page</h1>
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
        <div style={{ margin: '10px' }}>
          <input 
            type="password"
            placeholder="Confirm Password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ padding: '10px', width: '250px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', marginTop: '20px' }}>Register</button>
      </form>
      <p style={{ marginTop: '20px' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
