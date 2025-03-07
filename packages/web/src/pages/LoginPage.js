// src/pages/LoginPage.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaEnvelope, FaLock, FaGoogle, FaTelegramPlane } from 'react-icons/fa';
import { SiBinance } from 'react-icons/si';
import { UserContext } from '../context/UserContext';
import { loginUser } from '../api/auth';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false); // Terms & Conditions onayı
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accepted) {
      alert('You must agree to the Terms & Conditions.');
      return;
    }
    if (email && password) {
      try {
        const data = await loginUser(email, password);
        localStorage.setItem('token', data.token);
        login(data.user);
        navigate('/profile');
      } catch (error) {
        alert(error.response?.data?.message || 'Login failed');
      }
    } else {
      alert('Please enter both email and password.');
    }
  };

  return (
    <Container>
      {/* Sol Taraf: Görsel */}
      <LeftSide>
        <LeftImage
          src="https://cdn.dribbble.com/userupload/16528532/file/original-d7f5a5167a2bf86f6710665cf6d8b72b.png?resize=752x&vertical=center"
          alt="Login Visual"
        />
      </LeftSide>

      {/* Sağ Taraf: Form */}
      <RightSide>
        <FormContainer>
          <Title>Sign In</Title>
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

            {/* Custom Checkbox for Terms & Conditions */}
            <CheckboxLabel>
              <HiddenCheckbox
                type="checkbox"
                checked={accepted}
                onChange={() => setAccepted(!accepted)}
              />
              <StyledCheckbox checked={accepted} />
              <CheckboxText>
                I agree to all <Highlight>Terms & Conditions</Highlight> and I am over 18 years of age
              </CheckboxText>
            </CheckboxLabel>

            <SubmitButton type="submit">Login</SubmitButton>
          </Form>

          <DividerRow>
            <Divider>OR</Divider>
          </DividerRow>
          <SocialRow>
            <SocialButton>
              <FaGoogle size={20} />
            </SocialButton>
            <SocialButton>
              <FaTelegramPlane size={20} />
            </SocialButton>
            <SocialButton>
              <SiBinance size={20} />
            </SocialButton>
          </SocialRow>

          <BottomRow>
            Do you have an account?
            <StyledLink to="/register">Sign Up</StyledLink>
          </BottomRow>
        </FormContainer>
      </RightSide>
    </Container>
  );
}

export default LoginPage;

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

/* Sağ Taraf (Form) */
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
  text-align: center;
  margin-bottom: 1.5rem;
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
`;

/* Custom Checkbox Setup */
const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  margin: 1rem 0;
  font-size: 0.9rem;
`;

/* Gömülü (hidden) gerçek checkbox */
const HiddenCheckbox = styled.input`
  display: none;
`;

/* Görsel checkbox */
const StyledCheckbox = styled.div`
  width: 18px;
  height: 18px;
  background: ${(props) => (props.checked ? '#2ecc71' : '#2a2e4f')};
  border: 1px solid ${(props) => (props.checked ? '#2ecc71' : '#bbb')};
  border-radius: 4px;
  transition: all 150ms;
  display: inline-block;
  position: relative;
  margin-right: 8px;
  pointer-events: none; /* Label tıklamayı yönetecek */

  &::after {
    content: '';
    position: absolute;
    display: ${(props) => (props.checked ? 'block' : 'none')};
    left: 6px;
    top: 2px;
    width: 3px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;

const CheckboxText = styled.span`
  color: #fff;
`;

const Highlight = styled.span`
  color: #2ecc71;
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

const DividerRow = styled.div`
  text-align: center;
  margin: 1.2rem 0;
`;

const Divider = styled.span`
  color: #999;
  font-size: 0.9rem;
`;

const SocialRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const SocialButton = styled.button`
  width: 48px;
  height: 48px;
  background-color: #2a2e4f;
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #3c4269;
  }
`;

const BottomRow = styled.div`
  margin-top: 1.2rem;
  text-align: center;
  font-size: 0.9rem;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #2ecc71;
  font-weight: bold;
  margin-left: 4px;

  &:hover {
    text-decoration: underline;
  }
`;
