import React, { useState } from 'react';
import styled from 'styled-components';

const SettingsContainer = styled.div`
  padding: 40px;
  color: white;
  background-color: #0a0b1e;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 40px;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 10px;
  }
  
  p {
    color: #6c7293;
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
`;

const SettingsCard = styled.div`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  border-radius: 15px;
  padding: 25px;
`;

const SettingsTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    color: #4a7dff;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    color: #6c7293;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background-color: #1a1b38;
  border: 1px solid #2a2c4e;
  border-radius: 8px;
  color: white;
  outline: none;

  &:focus {
    border-color: #4a7dff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  background-color: #1a1b38;
  border: 1px solid #2a2c4e;
  border-radius: 8px;
  color: white;
  outline: none;

  &:focus {
    border-color: #4a7dff;
  }
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #2a2c4e;
    transition: .4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: #4a7dff;
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const SaveButton = styled.button`
  background-color: #4a7dff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 20px;

  &:hover {
    background-color: #3d6ae8;
  }
`;

function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    language: 'tr',
    theme: 'dark',
    email: 'user@example.com',
    username: 'User123'
  });

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ayarları kaydet
    console.log('Settings saved:', settings);
  };

  return (
    <SettingsContainer>
      <Header>
        <h1>Ayarlar</h1>
        <p>Hesap ve uygulama ayarlarınızı özelleştirin</p>
      </Header>

      <form onSubmit={handleSubmit}>
        <SettingsGrid>
          <SettingsCard>
            <SettingsTitle>
              <span>👤</span> Hesap Ayarları
            </SettingsTitle>
            <FormGroup>
              <label>E-posta</label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <label>Kullanıcı Adı</label>
              <Input
                type="text"
                value={settings.username}
                onChange={(e) => handleChange('username', e.target.value)}
              />
            </FormGroup>
          </SettingsCard>

          <SettingsCard>
            <SettingsTitle>
              <span>🎮</span> Oyun Ayarları
            </SettingsTitle>
            <FormGroup>
              <label>Ses</label>
              <Switch>
                <input
                  type="checkbox"
                  checked={settings.sound}
                  onChange={(e) => handleChange('sound', e.target.checked)}
                />
                <span></span>
              </Switch>
            </FormGroup>
            <FormGroup>
              <label>Bildirimler</label>
              <Switch>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleChange('notifications', e.target.checked)}
                />
                <span></span>
              </Switch>
            </FormGroup>
          </SettingsCard>

          <SettingsCard>
            <SettingsTitle>
              <span>🌍</span> Tercihler
            </SettingsTitle>
            <FormGroup>
              <label>Dil</label>
              <Select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <label>Tema</label>
              <Select
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
              >
                <option value="dark">Koyu</option>
                <option value="light">Açık</option>
              </Select>
            </FormGroup>
          </SettingsCard>
        </SettingsGrid>

        <SaveButton type="submit">
          Değişiklikleri Kaydet
        </SaveButton>
      </form>
    </SettingsContainer>
  );
}

export default SettingsPage; 