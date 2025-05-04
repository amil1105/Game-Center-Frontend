import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaArrowLeft, FaUsers, FaTrophy, FaInfoCircle, FaComments, FaChartLine, FaCoins, FaClock, FaLock, FaCalendarAlt, FaCopy, FaCheck, FaPaperPlane } from 'react-icons/fa';
import { Box, Typography, Button, List, ListItem, TextField, FormControl, FormLabel, InputLabel, IconButton, InputAdornment } from '@mui/material';
import axiosInstance, { API_BASE_URL } from '../api/axios';
import { UserContext } from '../context/UserContext';
import MainLayout from '../components/Layout/MainLayout';

// Animasyonlar
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const PageContainer = styled(Box)`
  background: linear-gradient(135deg, #0f1033 0%, #0a0b1e 100%);
  min-height: 100vh;
  color: white;
  padding: 0;
  font-family: 'Poppins', sans-serif;
`;

const Banner = styled(Box)`
  width: 100%;
  height: 350px;
  position: relative;
  background: linear-gradient(145deg, #7C4DFF 0%, #6236FF 100%);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.7;
    transition: transform 0.7s ease-in-out;
  }

  &:hover img {
    transform: scale(1.05);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8));
  }
`;

const BannerContent = styled(Box)`
  position: absolute;
  bottom: 50px;
  left: 50px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: ${fadeIn} 0.8s ease-out;

  @media (max-width: 768px) {
    left: 20px;
    bottom: 30px;
  }
`;

const GameTitle = styled(Typography)`
  font-size: 52px;
  font-weight: 800;
  margin: 0;
  color: white;
  text-shadow: 0 3px 6px rgba(0,0,0,0.4);
  letter-spacing: -0.5px;
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const GameStats = styled(Box)`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;

  .stat {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(124, 77, 255, 0.2);
    backdrop-filter: blur(10px);
    padding: 10px 18px;
    border-radius: 50px;
    font-weight: 500;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover {
      background: rgba(124, 77, 255, 0.3);
      transform: translateY(-3px);
    }

    svg {
      color: #7C4DFF;
    }
  }
`;

const Content = styled(Box)`
  max-width: 1200px;
  margin: -80px auto 0;
  padding: 0 40px 60px;
  position: relative;
  z-index: 3;
  animation: ${fadeIn} 0.8s ease-out;
  
  @media (max-width: 768px) {
    padding: 0 20px 40px;
    margin-top: -60px;
  }
`;

const Header = styled(Box)`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  width: 100%;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    margin-bottom: 30px;
  }
`;

const BackButton = styled(Button)`
  background: rgba(124, 77, 255, 0.1);
  border: none;
  color: #7C4DFF;
  font-size: 20px;
  cursor: pointer;
  padding: 15px;
  border-radius: 15px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);

  &:hover {
    background: rgba(124, 77, 255, 0.2);
    transform: translateX(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const GameInfo = styled(Box)`
  h1 {
    font-size: 2.2rem;
    margin: 0;
    background: linear-gradient(90deg, #7C4DFF, #4A7DFF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
  }

  p {
    color: #8B90B3;
    margin: 8px 0 0;
    font-size: 1.1rem;
  }
`;

const MainContent = styled(Box)`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  margin-top: -10px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const GameDetails = styled(Box)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 25px;
  padding: 35px;
  margin-top: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  animation: ${slideInLeft} 0.8s ease-out;
  
  @media (max-width: 768px) {
    padding: 25px;
  }
`;

const Section = styled(Box)`
  margin-bottom: 40px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const SectionTitle = styled(Typography)`
  font-size: 1.7rem;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: #7C4DFF;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(124, 77, 255, 0.15);
  font-weight: 700;
`;

const SectionText = styled(Typography)`
  color: #a4a6b3;
  line-height: 1.9;
  font-size: 1.1rem;
`;

const RulesList = styled(List)`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const StyledListItem = styled(ListItem)`
  color: #a4a6b3;
  margin-bottom: 18px;
  padding-left: 25px;
  position: relative;
  line-height: 1.6;
  font-size: 1.05rem;

  &::before {
    content: "•";
    color: #7C4DFF;
    position: absolute;
    left: 0;
    font-size: 1.5rem;
  }

  &:hover {
    color: white;
  }
`;

const Sidebar = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 30px;
  animation: ${slideInRight} 0.8s ease-out;
`;

const SidebarCard = styled(Box)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 25px;
  padding: 30px;
  margin-top: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
`;

const SidebarTitle = styled(Typography)`
  font-size: 1.7rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: #7C4DFF;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(124, 77, 255, 0.15);
  font-weight: 700;
`;

const LobbyList = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const LobbyItem = styled(Box)`
  background: rgba(124, 77, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(124, 77, 255, 0.1);

  &:hover {
    background: rgba(124, 77, 255, 0.15);
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  .lobby-info {
    h3 {
      font-size: 1.1rem;
      margin: 0;
      font-weight: 600;
    }

    p {
      color: #8B90B3;
      font-size: 0.95rem;
      margin: 8px 0 0;
    }
  }
`;

const JoinButton = styled(Button)`
  background: linear-gradient(135deg, #7C4DFF, #4A7DFF);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 5px 15px rgba(124, 77, 255, 0.3);

  &:hover {
    background: linear-gradient(135deg, #6236FF, #3A6DFF);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(124, 77, 255, 0.4);
  }
`;

const ChatSection = styled(Box)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 25px;
  padding: 25px 20px 20px;
  height: 350px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const ChatMessages = styled(Box)`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 15px;
  padding: 0 5px;
  display: flex;
  flex-direction: column;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(124, 77, 255, 0.3);
    border-radius: 10px;
  }
`;

const MessageContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  width: 100%;
  align-items: ${props => props.isOwnMessage ? 'flex-end' : 'flex-start'};
`;

const Message = styled(Box)`
  background: ${props => props.isOwnMessage ? 'rgba(124, 77, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  padding: 10px 15px;
  border-radius: ${props => props.isOwnMessage ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  align-self: ${props => props.isOwnMessage ? 'flex-end' : 'flex-start'};
  max-width: 85%;
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: inline-block;
`;

const MessageSender = styled(Typography)`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.isOwnMessage ? '#a67dff' : '#7C4DFF'};
  margin-bottom: 3px;
`;

const MessageText = styled(Typography)`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
`;

const MessageTime = styled(Typography)`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  text-align: right;
  margin-top: 2px;
`;

const ChatInput = styled(TextField)`
  width: 100%;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  margin-top: 10px;

  & .MuiInputBase-root {
    color: white;
    padding: 8px 15px;
    border-radius: 50px;
    background: rgba(20, 20, 60, 0.3);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  & .MuiOutlinedInput-root {
    & fieldset {
      border-color: rgba(124, 77, 255, 0.2);
      border-radius: 50px;
    }
    &:hover fieldset {
      border-color: rgba(124, 77, 255, 0.5);
    }
    &.Mui-focused fieldset {
      border-color: rgba(124, 77, 255, 0.5);
      box-shadow: 0 0 0 2px rgba(124, 77, 255, 0.1);
    }
  }

  & .MuiInputBase-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
    opacity: 1;
  }
`;

const CreateLobbyButton = styled(Button)`
  background: linear-gradient(135deg, #4a7dff 0%, #7C4DFF 60%, #ff53f0 110%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
  margin-left: auto;
  box-shadow: 0 8px 20px rgba(74, 125, 255, 0.3);
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: all 0.6s ease;
  }

  svg {
    font-size: 18px;
  }

  &:hover {
    background: linear-gradient(135deg, #4a7dff 0%, #7C4DFF 60%, #ff53f0 110%);
    transform: translateY(-3px);
    box-shadow: 0 12px 25px rgba(74, 125, 255, 0.4);
    
    &:before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 5px 15px rgba(74, 125, 255, 0.4);
  }
`;

const Modal = styled(Box)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 11, 30, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContent = styled(Box)`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  border-radius: 25px;
  padding: 40px;
  width: 90%;
  max-width: 550px;
  position: relative;
  border: 1px solid rgba(124, 77, 255, 0.2);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  transform: translateY(0);
  transition: transform 0.3s ease;
  max-height: 90vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 30px;
    width: 95%;
  }
`;

const ModalHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const ModalTitle = styled(Typography)`
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(90deg, #7C4DFF, #4A7DFF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const FormGroup = styled(FormControl)`
  margin-bottom: 25px;

  label {
    display: block;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 10px;
    font-size: 1rem;
    font-weight: 500;
  }

  input, select {
    width: 100%;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 15px;
    color: white;
    font-size: 1rem;
    transition: all 0.3s;

    &:focus {
      outline: none;
      border-color: #4a7dff;
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.1);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
`;

const LobbyTypeSelector = styled(Box)`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;

  button {
    flex: 1;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 16px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    &.active {
      background: rgba(74, 125, 255, 0.15);
      border-color: rgba(74, 125, 255, 0.5);
      color: white;
      box-shadow: 0 5px 15px rgba(74, 125, 255, 0.2);
    }

    &:hover:not(.active) {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }
    
    svg {
      font-size: 18px;
    }
  }
`;

const SubmitButton = styled(Button)`
  width: 100%;
  background: linear-gradient(135deg, #4a7dff 0%, #7C4DFF 60%, #ff53f0 110%);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 20px rgba(74, 125, 255, 0.3);
  position: relative;
  overflow: hidden;
  margin-top: 20px;
  display: block;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: all 0.6s ease;
  }

  &:hover {
    background: linear-gradient(135deg, #4a7dff 0%, #7C4DFF 60%, #ff53f0 110%);
    transform: translateY(-3px);
    box-shadow: 0 12px 25px rgba(74, 125, 255, 0.4);
    
    &:before {
      left: 100%;
    }
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: translateY(0);
    box-shadow: 0 8px 20px rgba(74, 125, 255, 0.15);
  }
`;

const SuccessModal = styled(Modal)``;

const SuccessContent = styled(ModalContent)`
  text-align: center;
  animation: ${pulse} 0.6s ease-out;
`;

const LobbyCode = styled(Box)`
  background: rgba(124, 77, 255, 0.1);
  border: 1px solid rgba(124, 77, 255, 0.3);
  border-radius: 15px;
  padding: 20px;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 6px;
  color: #7C4DFF;
  margin: 25px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(124, 77, 255, 0.15) inset;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const CopyButton = styled(Button)`
  background: rgba(124, 77, 255, 0.1);
  border: 1px solid rgba(124, 77, 255, 0.2);
  color: #7C4DFF;
  border-radius: 50px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  font-size: 1rem;

  &:hover {
    background: rgba(124, 77, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(124, 77, 255, 0.15);
  }
  
  svg {
    font-size: 18px;
  }
`;

const ShareButtons = styled(Box)`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
`;

function GameDetailPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [game, setGame] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [activeLobbies, setActiveLobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateLobbyModal, setShowCreateLobbyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lobbyType, setLobbyType] = useState('normal'); // 'normal' veya 'event'
  const [lobbyData, setLobbyData] = useState({
    name: '',
    password: '',
    startDate: '',
    endDate: '',
    betAmount: '',
  });
  const [createdLobby, setCreatedLobby] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Örnek oyun verileri
  const gameData = {
    mines: {
      title: 'Mines',
      description: 'Heyecan verici bir mayın tarlası oyunu! Her adımda kazancınızı artırın veya her şeyi kaybetme riskini alın.',
      image: '/img/game/mines.svg',
      rules: [
        'Oyun 5x5 bir ızgara üzerinde oynanır',
        'Her turda güvenli kareleri seçerek ilerleyin',
        'Mayına denk gelmeden önce "Çek" butonuna basarak kazancınızı alın',
        'Mayına denk gelirseniz tüm kazancınızı kaybedersiniz',
        'Ne kadar çok güvenli kare açarsanız, o kadar çok kazanırsınız'
      ],
      tips: [
        'Köşelerden başlamak daha güvenlidir',
        'Kazancınız yükseldikçe riski değerlendirin',
        'Patternleri takip edin ve stratejinizi ona göre belirleyin'
      ],
      stats: {
        totalGames: 1234,
        activePlayers: 128,
        winRate: 54,
        maxWin: 15000
      }
    },
    dice: {
      title: 'Dice',
      description: 'Klasik zar atma oyununun modern bir yorumu. Şansınızı test edin ve kazancınızı katlayın!',
      image: '/img/game/dice.svg',
      rules: [
        'Her turda 1-6 arasında bir sayı seçin',
        'Zar atılır ve seçtiğiniz sayı çıkarsa kazanırsınız',
        'Doğru tahmin ederseniz bahsiniz 6 katına çıkar',
        'Yanlış tahmin ederseniz bahsinizi kaybedersiniz'
      ],
      tips: [
        'İstatistikleri takip edin',
        'Bahislerinizi akıllıca yönetin',
        'Kaybetme seriniz varsa mola verin'
      ],
      stats: {
        totalGames: 2345,
        activePlayers: 156,
        winRate: 48,
        maxWin: 12000
      }
    },
    crash: {
      title: 'Crash',
      description: 'Çarpanın ne zaman düşeceğini tahmin edin ve doğru zamanda çekin!',
      image: '/img/game/crash.png',
      rules: [
        'Bahsinizi yatırın ve çarpan yükselmeye başlar',
        'Çarpan düşmeden önce paranızı çekin',
        'Ne kadar geç çekerseniz o kadar çok kazanırsınız',
        'Çarpan düştüğünde çekmezseniz tüm bahsinizi kaybedersiniz'
      ],
      tips: [
        'Erken çekmek daha güvenlidir',
        'Grafikleri analiz edin',
        'Sabit bir strateji belirleyin'
      ],
      stats: {
        totalGames: 3456,
        activePlayers: 234,
        winRate: 62,
        maxWin: 25000
      }
    },
    wheel: {
      title: 'Wheel',
      description: 'Şans çarkını çevirin ve kazanma şansınızı artırın!',
      image: '/img/game/wheel.svg',
      rules: [
        'Bahis yapmak istediğiniz rengi veya sayıyı seçin',
        'Çark döndüğünde seçtiğiniz alan gelirse kazanırsınız',
        'Farklı alanların farklı çarpanları vardır',
        'Birden fazla alana bahis yapabilirsiniz'
      ],
      tips: [
        'Risk dağıtın',
        'İstatistikleri takip edin',
        'Bütçenizi iyi yönetin'
      ],
      stats: {
        totalGames: 4567,
        activePlayers: 189,
        winRate: 45,
        maxWin: 18000
      }
    },
    coinflip: {
      title: 'Coinflip',
      description: 'Klasik yazı tura oyununun heyecan verici versiyonu!',
      image: '/img/game/coinflip.svg',
      rules: [
        'Yazı veya tura seçin',
        'Para havaya atılır',
        'Doğru tahmin ederseniz 2 katı kazanırsınız',
        'Yanlış tahmin ederseniz bahsinizi kaybedersiniz'
      ],
      tips: [
        'Sabit bahis stratejisi uygulayın',
        'Seri kayıplardan sonra mola verin',
        'Bütçenizi kontrol edin'
      ],
      stats: {
        totalGames: 5678,
        activePlayers: 145,
        winRate: 50,
        maxWin: 10000
      }
    },
    hilo: {
      title: 'HiLo',
      description: 'Bir sonraki kartın yüksek mi alçak mı olacağını tahmin edin!',
      image: '/img/game/hilo.svg',
      rules: [
        'Mevcut kartı görürsünüz',
        'Bir sonraki kartın daha yüksek veya alçak olacağını tahmin edin',
        'Doğru tahmin ederseniz kazanırsınız',
        'Her doğru tahminde çarpan artar'
      ],
      tips: [
        'Kart sayımı yapın',
        'Yüksek çarpanlarda riski azaltın',
        'Seri kazançlarda çekilin'
      ],
      stats: {
        totalGames: 6789,
        activePlayers: 167,
        winRate: 52,
        maxWin: 20000
      }
    },
    bingo: {
      title: 'Tombala',
      description: 'Klasik Türk Tombalası modern bir yorumla!',
      image: '/img/game/bingo.jpg',
      rules: [
        'Her oyuncu bir tombala kartı alır',
        'Numaralar çekilir ve kartınızdaki sayıları işaretlersiniz',
        'Çinko ve tombala yaparak kazanırsınız',
        'İlk tombala yapan oyunu kazanır'
      ],
      tips: [
        'Birden fazla kart alarak şansınızı artırın',
        'Çinko fırsatlarını kaçırmayın',
        'Rakiplerinizin kartlarını takip edin'
      ],
      stats: {
        totalGames: 7890,
        activePlayers: 178,
        winRate: 47,
        maxWin: 15000
      }
    },
    blackjack: {
      title: 'Blackjack',
      description: 'Klasik 21 kart oyununun modern versiyonu!',
      image: '/img/game/blackjack.svg',
      rules: [
        'Kartlarınızın toplamı 21\'e en yakın olmalı',
        'As 1 veya 11 olarak sayılabilir',
        'Krupiyeyi geçerseniz kazanırsınız',
        '21\'i geçerseniz kaybedersiniz'
      ],
      tips: [
        'Temel strateji tablosunu öğrenin',
        'Kartları sayın',
        'Sigorta almaktan kaçının'
      ],
      stats: {
        totalGames: 8901,
        activePlayers: 190,
        winRate: 49,
        maxWin: 22000
      }
    },
    tower: {
      title: 'Tower',
      description: 'Kule tırmanma oyunu! Her katta doğru seçimi yaparak zirveye ulaşın.',
      image: '/img/game/tower.svg',
      rules: [
        'Her katta 3 kapı arasından seçim yapın',
        'Doğru kapıyı seçerek üst kata çıkın',
        'Yanlış kapıyı seçerseniz oyun biter',
        'Ne kadar yükseğe çıkarsanız o kadar çok kazanırsınız'
      ],
      tips: [
        'Risk/ödül oranını iyi değerlendirin',
        'Yüksek katlarda çekilmeyi düşünün',
        'İstatistikleri takip edin'
      ],
      stats: {
        totalGames: 4321,
        activePlayers: 145,
        winRate: 42,
        maxWin: 30000
      }
    },
    roulette: {
      title: 'Roulette',
      description: 'Klasik rulet oyununun modern versiyonu! Şansınızı deneyin.',
      image: '/img/game/roulette.svg',
      rules: [
        'Sayı, renk veya grup seçimi yapın',
        'Top nereye düşerse o alan kazanır',
        'Farklı bahis türleri farklı oranlar sunar',
        'Birden fazla bahis yapabilirsiniz'
      ],
      tips: [
        'Düşük riskli bahislerle başlayın',
        'Bütçenizi iyi yönetin',
        'Sistematik oynayın'
      ],
      stats: {
        totalGames: 6543,
        activePlayers: 234,
        winRate: 47,
        maxWin: 35000
      }
    },
    stairs: {
      title: 'Stairs',
      description: 'Merdiven tırmanma oyunu! Her adımda risk ve ödül artar.',
      image: '/img/game/stairs.svg',
      rules: [
        'Her adımda sağ veya sol merdiveni seçin',
        'Doğru seçimle yukarı çıkın',
        'Yanlış adımda düşersiniz',
        'İstediğiniz zaman çekilebilirsiniz'
      ],
      tips: [
        'Kazancınızı garantiye almak için erken çekilin',
        'Pattern analizi yapın',
        'Kayıp serisinde mola verin'
      ],
      stats: {
        totalGames: 5432,
        activePlayers: 167,
        winRate: 44,
        maxWin: 25000
      }
    },
    keno: {
      title: 'Keno',
      description: 'Sayısal tahmin oyunu! Doğru sayıları tahmin ederek kazanın.',
      image: '/img/game/keno.svg',
      rules: [
        '1-80 arası 10 sayı seçin',
        '20 sayı çekilir',
        'Ne kadar çok sayı tutturursanız o kadar çok kazanırsınız',
        'Minimum 2 sayı tutturmanız gerekir'
      ],
      tips: [
        'Önceki çekilişleri analiz edin',
        'Sayı gruplarını dengeli dağıtın',
        'Sabit sayılarla oynamayı deneyin'
      ],
      stats: {
        totalGames: 7654,
        activePlayers: 189,
        winRate: 51,
        maxWin: 40000
      }
    }
  };

  // Lobileri yükle
  const loadActiveLobbies = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/lobbies?game=${gameId}`);
      console.log('Gelen lobi yanıtı:', response.data);
      // API yanıtı { lobbies: [...], total, hasMore } formatında
      const lobbiesData = response.data.lobbies || [];
      setActiveLobbies(lobbiesData);
    } catch (error) {
      console.error('Lobileri yüklerken hata:', error);
      setActiveLobbies([]); // Hata durumunda boş array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Oyun verilerini yükle
    if (gameId && gameData[gameId]) {
      setGame(gameData[gameId]);
      
      // Gerçek lobileri API'den yükle
      loadActiveLobbies();
      
      // Örnek oyun geçmişi
      setGameHistory([
        { id: 1, result: 'Kazandı', amount: '+500', date: '2 dk önce' },
        { id: 2, result: 'Kaybetti', amount: '-200', date: '5 dk önce' },
        { id: 3, result: 'Kazandı', amount: '+1000', date: '10 dk önce' }
      ]);
    }
  }, [gameId]); // gameId değiştiğinde yeniden yükle

  const handleCreateLobby = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Bahis miktarını sayıya çevir
      const betAmount = parseInt(lobbyData.betAmount) || 0;
      
      const payload = {
        name: lobbyData.name,
        game: gameId,
        isPrivate: !!lobbyData.password,
        password: lobbyData.password || undefined,
        isEventLobby: lobbyType === 'event',
        betAmount: betAmount,
        eventDetails: lobbyType === 'event' ? {
          title: lobbyData.name,
          description: '',
          startDate: lobbyData.startDate,
          endDate: lobbyData.endDate
        } : undefined
      };
      
      console.log('Lobi oluşturma isteği:', payload);
      const response = await axiosInstance.post('/lobbies', payload);
      console.log('Lobi oluşturma yanıtı:', response.data);
      
      setCreatedLobby(response.data);
      setShowCreateLobbyModal(false);
      setShowSuccessModal(true);
      
      // Lobi listesini güncelle
      loadActiveLobbies();
      
    } catch (error) {
      console.error('Lobi oluşturma hatası:', error);
      alert(error.response?.data?.error || 'Lobi oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (!createdLobby?.lobbyCode) return;
    
    navigator.clipboard.writeText(createdLobby.lobbyCode);
    setCopySuccess(true);
    
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };
  
  const resetForm = () => {
    setLobbyData({
      name: '',
      password: '',
      startDate: '',
      endDate: '',
      betAmount: '',
    });
    setLobbyType('normal');
  };

  if (!game) {
    return (
      <PageContainer>
        <Content>
          <Header>
            <BackButton onClick={() => navigate('/home')}>
              <FaArrowLeft />
            </BackButton>
            <GameInfo>
              <Typography 
                variant="h1" 
                sx={{ 
                  fontSize: '2.2rem',
                  margin: 0,
                  background: 'linear-gradient(90deg, #7C4DFF, #4A7DFF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700 
                }}
              >
                Oyun Bulunamadı
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#8B90B3',
                  margin: '8px 0 0',
                  fontSize: '1.1rem' 
                }}
              >
                Böyle bir oyun bulunmamaktadır.
              </Typography>
            </GameInfo>
          </Header>
        </Content>
      </PageContainer>
    );
  }

  return (
    <MainLayout>
      <PageContainer>
        <Banner>
          <Box component="img" src={game.image} alt={game.title} />
          <BannerContent>
            <GameTitle variant="h1">{game.title}</GameTitle>
            <GameStats>
              <Box className="stat">
                <FaUsers size={20} />
                <Typography variant="span">{game.stats.activePlayers} Aktif Oyuncu</Typography>
              </Box>
              <Box className="stat">
                <FaClock />
                <Typography variant="span">{game.stats.totalGames} Toplam Oyun</Typography>
              </Box>
              <Box className="stat">
                <FaTrophy />
                <Typography variant="span">{game.stats.winRate}% Kazanma Oranı</Typography>
              </Box>
              <Box className="stat">
                <FaChartLine />
                <Typography variant="span">{game.stats.maxWin} Max Kazanç</Typography>
              </Box>
            </GameStats>
          </BannerContent>
        </Banner>

        <Content>
          <Header>
            <CreateLobbyButton onClick={() => setShowCreateLobbyModal(true)}>
              <FaUsers /> Lobi Oluştur
            </CreateLobbyButton>
          </Header>

          <MainContent>
            <GameDetails>
              <Section>
                <SectionTitle variant="h2">
                  <FaInfoCircle />
                  Oyun Hakkında
                </SectionTitle>
                <SectionText variant="body1">{game.description}</SectionText>
              </Section>

              <Section>
                <SectionTitle variant="h2">
                  <FaInfoCircle />
                  Kurallar
                </SectionTitle>
                <RulesList>
                  {game.rules.map((rule, index) => (
                    <StyledListItem key={index}>
                      <SectionText variant="body1">{rule}</SectionText>
                    </StyledListItem>
                  ))}
                </RulesList>
              </Section>

              <Section>
                <SectionTitle variant="h2">
                  <FaInfoCircle />
                  İpuçları
                </SectionTitle>
                <RulesList>
                  {game.tips.map((tip, index) => (
                    <StyledListItem key={index}>
                      <SectionText variant="body1">{tip}</SectionText>
                    </StyledListItem>
                  ))}
                </RulesList>
              </Section>

              <Section>
                <SectionTitle variant="h2">
                  <FaChartLine />
                  Oyun Geçmişi
                </SectionTitle>
                <Box sx={{ marginTop: '20px' }}>
                  {gameHistory.map((history) => (
                    <Box
                      key={history.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        marginBottom: '10px'
                      }}
                    >
                      <Typography variant="body2">{history.result}</Typography>
                      <Typography variant="body2" sx={{ 
                        color: history.amount.startsWith('+') ? '#4CAF50' : '#FF5252'
                      }}>
                        {history.amount}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6c7293' }}>{history.date}</Typography>
                    </Box>
                  ))}
                </Box>
              </Section>
            </GameDetails>

            <Sidebar>
              <SidebarCard>
                <SidebarTitle variant="h2">
                  <FaUsers style={{ marginRight: 5 }} />
                  Aktif Lobiler
                </SidebarTitle>
                <LobbyList>
                  {loading ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      padding: '20px', 
                      color: 'rgba(255, 255, 255, 0.7)' 
                    }}>
                      <Typography variant="body1">Lobiler yükleniyor...</Typography>
                    </Box>
                  ) : Array.isArray(activeLobbies) && activeLobbies.length > 0 ? (
                    activeLobbies.map((lobby) => (
                      <LobbyItem key={lobby._id || lobby.id}>
                        <Box className="lobby-info">
                          <Typography variant="h3">{lobby.name}</Typography>
                          <Typography variant="body2">
                            {Array.isArray(lobby.players)
                              ? `${lobby.players.length} / ${lobby.maxPlayers} Oyuncu`
                              : '0 Oyuncu'} 
                            {lobby.betAmount > 0 && ` • ${lobby.betAmount} Token`}
                            {lobby.isPrivate && ` • Özel`}
                          </Typography>
                        </Box>
                        <JoinButton onClick={() => navigate(`/lobby/${lobby.lobbyCode}`)}>
                          Katıl
                        </JoinButton>
                      </LobbyItem>
                    ))
                  ) : (
                    <Box sx={{ 
                      textAlign: 'center', 
                      padding: '30px 20px', 
                      color: 'rgba(255, 255, 255, 0.7)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '16px',
                      border: '1px dashed rgba(255, 255, 255, 0.1)'
                    }}>
                      <Typography variant="body1">
                        Aktif lobi bulunamadı. İlk lobiyi oluşturmak için "<strong>Lobi Oluştur</strong>" butonuna tıklayabilirsiniz.
                      </Typography>
                    </Box>
                  )}
                </LobbyList>
              </SidebarCard>

              <ChatSection>
                <SidebarTitle variant="h2">
                  <FaComments style={{ marginRight: 5 }} />
                  Sohbet
                </SidebarTitle>
                <ChatMessages>
                  <MessageContainer isOwnMessage={false}>
                    <Message isOwnMessage={false}>
                      <MessageSender isOwnMessage={false}>Eren Yeager</MessageSender>
                      <MessageText>Merhaba! Bugün oyun oynayacak mısınız?</MessageText>
                      <MessageTime>14:30</MessageTime>
                    </Message>
                  </MessageContainer>
                  <MessageContainer isOwnMessage={true}>
                    <Message isOwnMessage={true}>
                      <MessageSender isOwnMessage={true}>Siz</MessageSender>
                      <MessageText>Evet, akşam 8'de başlayabilirim.</MessageText>
                      <MessageTime>14:32</MessageTime>
                    </Message>
                  </MessageContainer>
                  <MessageContainer isOwnMessage={false}>
                    <Message isOwnMessage={false}>
                      <MessageSender isOwnMessage={false}>Mikasa Ackerman</MessageSender>
                      <MessageText>Ben de katılabilirim, lobi kodunu paylaşır mısınız?</MessageText>
                      <MessageTime>14:35</MessageTime>
                    </Message>
                  </MessageContainer>
                </ChatMessages>
                <ChatInput 
                  placeholder="Mesajınızı yazın..." 
                  variant="outlined"
                  fullWidth
                  size="small"
                  InputProps={{
                    style: { color: 'white' },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          edge="end" 
                          sx={{ 
                            color: 'rgba(124, 77, 255, 0.7)',
                            '&:hover': {
                              color: '#7C4DFF'
                            }
                          }}
                        >
                          <FaPaperPlane />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </ChatSection>
            </Sidebar>
          </MainContent>
        </Content>

        {showCreateLobbyModal && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <ModalTitle variant="h2">Yeni Lobi Oluştur</ModalTitle>
                <IconButton 
                  onClick={() => setShowCreateLobbyModal(false)}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '1.8rem',
                    height: '40px',
                    width: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      transform: 'rotate(90deg)'
                    }
                  }}
                >
                  &times;
                </IconButton>
              </ModalHeader>
              <Box component="form" onSubmit={handleCreateLobby}>
                <LobbyTypeSelector>
                  <Button
                    type="button"
                    className={lobbyType === 'normal' ? 'active' : ''}
                    onClick={() => setLobbyType('normal')}
                  >
                    <FaUsers style={{ marginRight: '8px' }} />
                    Normal Lobi
                  </Button>
                  <Button
                    type="button"
                    className={lobbyType === 'event' ? 'active' : ''}
                    onClick={() => setLobbyType('event')}
                  >
                    <FaCalendarAlt style={{ marginRight: '8px' }} />
                    Etkinlik Lobi
                  </Button>
                </LobbyTypeSelector>

                <FormGroup fullWidth>
                  <FormLabel component="label">Lobi Adı</FormLabel>
                  <TextField
                    type="text"
                    placeholder="Lobi adını girin"
                    value={lobbyData.name}
                    onChange={(e) => setLobbyData({ ...lobbyData, name: e.target.value })}
                    required
                    fullWidth
                    variant="outlined"
                    inputProps={{ style: { color: 'white' } }}
                  />
                </FormGroup>

                <FormGroup fullWidth>
                  <FormLabel component="label">Bahis Miktarı</FormLabel>
                  <TextField
                    type="number"
                    placeholder="Bahis miktarını girin"
                    value={lobbyData.betAmount}
                    onChange={(e) => setLobbyData({ ...lobbyData, betAmount: e.target.value })}
                    min="0"
                    required
                    fullWidth
                    variant="outlined"
                    inputProps={{ style: { color: 'white' } }}
                  />
                </FormGroup>

                <FormGroup fullWidth>
                  <FormLabel component="label">Lobi Şifresi (Opsiyonel)</FormLabel>
                  <TextField
                    type="password"
                    placeholder="Şifre belirleyin"
                    value={lobbyData.password}
                    onChange={(e) => setLobbyData({ ...lobbyData, password: e.target.value })}
                    fullWidth
                    variant="outlined"
                    inputProps={{ style: { color: 'white' } }}
                  />
                </FormGroup>

                {lobbyType === 'event' && (
                  <>
                    <FormGroup fullWidth>
                      <FormLabel component="label">
                        <FaClock style={{ marginRight: '8px' }} />
                        Başlangıç Tarihi ve Saati
                      </FormLabel>
                      <TextField
                        type="datetime-local"
                        value={lobbyData.startDate}
                        onChange={(e) => setLobbyData({ ...lobbyData, startDate: e.target.value })}
                        required={lobbyType === 'event'}
                        fullWidth
                        variant="outlined"
                        inputProps={{ style: { color: 'white' } }}
                      />
                    </FormGroup>

                    <FormGroup fullWidth>
                      <FormLabel component="label">
                        <FaClock style={{ marginRight: '8px' }} />
                        Bitiş Tarihi ve Saati
                      </FormLabel>
                      <TextField
                        type="datetime-local"
                        value={lobbyData.endDate}
                        onChange={(e) => setLobbyData({ ...lobbyData, endDate: e.target.value })}
                        required={lobbyType === 'event'}
                        fullWidth
                        variant="outlined"
                        inputProps={{ style: { color: 'white' } }}
                      />
                    </FormGroup>
                  </>
                )}

                <SubmitButton 
                  type="submit" 
                  disabled={isSubmitting} 
                  variant="contained"
                  sx={{ 
                    marginTop: '20px', 
                    marginBottom: '10px' 
                  }}
                >
                  {isSubmitting ? 'Oluşturuluyor...' : 'Lobi Oluştur'}
                </SubmitButton>
              </Box>
            </ModalContent>
          </Modal>
        )}

        {showSuccessModal && createdLobby && (
          <SuccessModal>
            <SuccessContent>
              <ModalHeader>
                <ModalTitle variant="h2">Lobi Başarıyla Oluşturuldu!</ModalTitle>
                <IconButton 
                  onClick={() => {
                    setShowSuccessModal(false);
                    resetForm();
                  }}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '1.8rem',
                    height: '40px',
                    width: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      transform: 'rotate(90deg)'
                    }
                  }}
                >
                  &times;
                </IconButton>
              </ModalHeader>
              
              <Typography variant="body1">Lobiye katılması için arkadaşlarınıza aşağıdaki kodu paylaşın:</Typography>
              
              <LobbyCode>
                {createdLobby.lobbyCode}
              </LobbyCode>
              
              <CopyButton onClick={handleCopyCode} variant="outlined">
                {copySuccess ? <FaCheck /> : <FaCopy />}
                {copySuccess ? 'Kopyalandı!' : 'Kodu Kopyala'}
              </CopyButton>
              
              <ShareButtons>
                {/* Buraya sosyal medya paylaşım butonları eklenebilir */}
              </ShareButtons>
              
              <SubmitButton 
                onClick={() => navigate(`/lobby/${createdLobby.lobbyCode}`)}
                sx={{ marginTop: '20px' }}
                variant="contained"
              >
                Lobiye Git
              </SubmitButton>
            </SuccessContent>
          </SuccessModal>
        )}
      </PageContainer>
    </MainLayout>
  );
}

export default GameDetailPage; 