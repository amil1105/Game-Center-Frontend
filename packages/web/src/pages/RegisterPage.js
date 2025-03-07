// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';
import { FaTelegramPlane } from 'react-icons/fa';
import { SiBinance } from 'react-icons/si';
import { registerUser } from '../api/auth';

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: #1A1B23;
`;

const LeftSide = styled.div`
  flex: 1;
  position: relative;
  background: url('https://cdn.dribbble.com/userupload/16528532/file/original-d7f5a5167a2bf86f6710665cf6d8b72b.png?resize=752x&vertical=center') center/cover;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 40px;
  color: white;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(26, 27, 35, 0.4) 0%, rgba(26, 27, 35, 0.8) 100%);
    pointer-events: none;
  }
`;

const RightSide = styled.div`
  flex: 1;
  background: #1A1B23;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px 60px;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
`;

const Logo = styled.div`
  font-size: 3.5rem;
  font-weight: 900;
  color: #fff;
  margin-bottom: 30px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
`;

const WelcomeText = styled.div`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 20px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Subtitle = styled.div`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Form = styled.form`
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 20px;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 20px 20px 20px 50px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #7C4DFF;
    background: rgba(124, 77, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const Icon = styled.div`
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
`;

const RegisterButton = styled.button`
  width: 100%;
  padding: 20px;
  background: #7C4DFF;
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #9669FF;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(124, 77, 255, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 30px 0;
  color: rgba(255, 255, 255, 0.5);

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }

  span {
    padding: 0 15px;
  }
`;

const SocialButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 30px;
`;

const SocialButton = styled.button`
  width: 54px;
  height: 54px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(124, 77, 255, 0.1);
    color: #7C4DFF;
    border-color: #7C4DFF;
    transform: translateY(-2px);
  }
`;

const BottomText = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 20px;

  a {
    color: #7C4DFF;
    text-decoration: none;
    font-weight: bold;
    margin-left: 5px;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Bonus = styled.div`
  background: rgba(124, 77, 255, 0.1);
  border-radius: 24px;
  padding: 30px;
  margin: 40px 0;
  border: 1px solid rgba(124, 77, 255, 0.2);

  h2 {
    font-size: 2.2rem;
    margin-bottom: 15px;
    color: #fff;
    font-weight: 800;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.2rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  padding: 15px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  width: 100%;
`;

const Checkbox = styled.input`
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  cursor: pointer;
  appearance: none;
  position: relative;

  &:checked {
    background: #7C4DFF;
    border-color: #7C4DFF;

    &::after {
      content: '✓';
      position: absolute;
      color: white;
      font-size: 16px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  &:hover {
    border-color: #7C4DFF;
  }
`;

const CheckboxLabel = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  cursor: pointer;
  user-select: none;

  a {
    color: #7C4DFF;
    text-decoration: none;
    font-weight: bold;

    &:hover {
      text-decoration: underline;
    }
  }
`;

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accepted) {
      alert('Lütfen kullanım koşullarını kabul edin.');
      return;
    }
    if (username && email && password) {
      try {
        setIsLoading(true);
        await registerUser(username, email, password);
        navigate('/login');
      } catch (error) {
        alert(error.response?.data?.message || 'Kayıt başarısız');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Container>
      <LeftSide>
        <ContentWrapper>
          <Logo>Game Center</Logo>
          <Bonus>
            <h2>HOŞ GELDİN BONUSU</h2>
            <p>Hemen üye ol ve 1000 jeton kazan!</p>
          </Bonus>
          <WelcomeText>Aramıza Katılın!</WelcomeText>
          <Subtitle>Hemen kayıt olun ve eğlencenin tadını çıkarın.</Subtitle>
        </ContentWrapper>
      </LeftSide>
      <RightSide>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Icon><FaUser /></Icon>
            <Input
              type="text"
              placeholder="Kullanıcı adınız"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup>
            <Icon><FaEnvelope /></Icon>
            <Input
              type="email"
              placeholder="Email adresiniz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup>
            <Icon><FaLock /></Icon>
            <Input
              type="password"
              placeholder="Şifreniz"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>

          <CheckboxContainer>
            <Checkbox
              type="checkbox"
              id="terms"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <CheckboxLabel htmlFor="terms">
              Kullanım koşullarını kabul ediyorum ve 18 yaşından büyüğüm
            </CheckboxLabel>
          </CheckboxContainer>

          <RegisterButton type="submit" disabled={isLoading}>
            {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </RegisterButton>
        </Form>

        <Divider><span>veya</span></Divider>

        <SocialButtons>
          <SocialButton>
            <FaGoogle size={22} />
          </SocialButton>
          <SocialButton>
            <FaTelegramPlane size={22} />
          </SocialButton>
          <SocialButton>
            <SiBinance size={22} />
          </SocialButton>
        </SocialButtons>

        <BottomText>
          Zaten hesabınız var mı?
          <Link to="/login">Giriş Yap</Link>
        </BottomText>
      </RightSide>
    </Container>
  );
}

export default RegisterPage;
