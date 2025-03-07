// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { registerUser } from '../api/auth';
import { FaEnvelope, FaLock } from 'react-icons/fa'; // İkonlar eklendi

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
    <Container>
      {/* Sol taraf - Görsel */}
      <LeftSide>
        <LeftImage
          src="https://cdn.dribbble.com/userupload/16528532/file/original-d7f5a5167a2bf86f6710665cf6d8b72b.png?resize=752x&vertical=center"
          alt="Register Visual"
        />
      </LeftSide>

      {/* Sağ taraf - Form */}
      <RightSide>
        <FormContainer>
          <Title>Sign Up</Title>
          <Form onSubmit={handleSubmit}>
            {/* Email Alanı */}
            <InputWrapper>
              <InputLabel>Email</InputLabel>
              <InputContainer>
                <IconWrapper>
                  <FaEnvelope />
                </IconWrapper>
                <TextInput
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputContainer>
            </InputWrapper>

            {/* Password Alanı */}
            <InputWrapper>
              <InputLabel>Password</InputLabel>
              <InputContainer>
                <IconWrapper>
                  <FaLock />
                </IconWrapper>
                <TextInput
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputContainer>
            </InputWrapper>

            {/* Confirm Password Alanı */}
            <InputWrapper>
              <InputLabel>Confirm Password</InputLabel>
              <InputContainer>
                <IconWrapper>
                  <FaLock />
                </IconWrapper>
                <TextInput
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </InputContainer>
            </InputWrapper>

            <SubmitButton type="submit">Register</SubmitButton>
          </Form>

          <BottomText>
            Already have an account?
            <StyledLink to="/login">Login here</StyledLink>
          </BottomText>
        </FormContainer>
      </RightSide>
    </Container>
  );
}

export default RegisterPage;

/* ========== Styled Components ========== */

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: #eaeff1;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

/* Sol Taraf (Görsel) */
const LeftSide = styled.div`
  flex: 1.2;
  position: relative;
`;

const LeftImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

/* Sağ Taraf (Form Alanı) */
const RightSide = styled.div`
  flex: 1;
  background-color: #1d2034;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormContainer = styled.div`
  width: 85%;
  max-width: 400px;
  color: #fff;
`;

const Title = styled.h1`
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const InputWrapper = styled.div`
  margin-bottom: 1rem;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
`;

/* Input + Icon gruplaması */
const InputContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #2a2e4f;
  border-radius: 12px;
  padding: 10px;
`;

const IconWrapper = styled.div`
  margin-right: 8px;
  color: #bbb;
  font-size: 1.2rem;
`;

const TextInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  color: #fff;
  font-size: 0.95rem;
  outline: none;

  &::placeholder {
    color: #bbb;
  }

  &:focus {
    border: none;
  }
`;

const SubmitButton = styled.button`
  margin-top: 0.5rem;
  padding: 14px;
  background-color: #2ecc71;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #27ae60;
  }
`;

const BottomText = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
`;

const StyledLink = styled(Link)`
  color: #2ecc71;
  font-weight: bold;
  text-decoration: none;
  margin-left: 5px;

  &:hover {
    text-decoration: underline;
  }
`;
