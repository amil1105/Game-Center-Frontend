<h1 align="center">

<br>
 <a href="https://32bit.com.tr"><img src="https://32bit.com.tr/wp-content/uploads/2019/09/32Bit_TransparentBG_1500x434.png" alt="32bit" width="300"></a>
  <br>
  <br>
  Game Center Platform
  <br>
</h1>

<a name="readme-top"></a>

> A modern web-based game center platform built with React and Material UI. It brings together different packages (web application, tombala game, common components) with a monorepo structure.


[![Node.js][node-shield]][node-url]
[![React][React.js]][React-url]
[![Material UI][material-shield]][material-url]
[![Vite][vite-shield]][vite-url]
[![React Router][react-router-shield]][react-router-url]
[![Express][express-shield]][express-url]
[![MongoDB][mongodb-shield]][mongodb-url]
[![Socket.io][socketio-shield]][socketio-url]
[![Axios][axios-shield]][axios-url]
[![Lerna][lerna-shield]][lerna-url]
[![MIT License][license-shield]][license-url]

## Demo

email: test@example.com
password: toyota

## 🚩 Contents
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Pages](#-pages)
  * [Login Page](#login-page)
  * [Main Dashboard](#main-dashboard)
  * [Game Detail Page](#game-detail-page)
  * [Profile Page](#profile-page)
  * [Leaderboard Page](#leaderboard-page)
  * [Settings Page](#settings-page)
  * [Lobby System](#lobby-system)
  * [Tombala Game](#tombala-game)
  * [Minesweeper Game](#minesweeper-game)
- [Features](#-features)
  * [Authentication System](#authentication-system)
  * [Lobby Management](#lobby-management)
  * [Real-time Multiplayer](#real-time-multiplayer)
  * [Responsive Design](#responsive-design)
  * [Internationalization](#internationalization)
- [Technologies](#-technologies)
- [Experiences and Challenges](#-experiences-and-challenges)
- [Browser Support](#-browser-support)
- [Contact](#-contact)
- [Acknowledgements](#-acknowledgements)
- [License](#-license)


## 🗃 Project Structure

```
Game-Center-Frontend/
├── packages/
│   ├── web/               # Main web application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── context/
│   │   │   ├── api/
│   │   │   └── styles/
│   ├── tombala/           # Tombala game (https://github.com/amil1105/tombala)
│   ├── minesweeper/       # Minesweeper game (https://github.com/amil1105/minesweeper)
│   ├── common/            # Common components
│   └── core/              # Core functionality
├── server/                # Express backend
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── utils/
├── public/                # Static files
└── lerna.json             # Monorepo configuration
```

<p align="right">(<a href="#readme-top">🔝</a>)</p>

## 	🧰 Getting Started

### ‼️ Prerequisites

This project uses npm as the package manager.

```bash
npm install npm@latest -g
```

### ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/amil1105/Game-Center-Frontend.git

# Navigate to project directory
cd Game-Center-Frontend

# Install dependencies for the main project
npm install

# Clone the game repositories into the packages directory
cd packages
git clone https://github.com/amil1105/tombala.git tombala
git clone https://github.com/amil1105/minesweeper.git minesweeper
cd ..

# Install dependencies for each game
cd packages/tombala
npm install
cd ../minesweeper
npm install
cd ../..

# Start frontend projects (Web app, Tombola, Minesweeper)
npm start

# Start backend server (in a new terminal)
cd server
npm run dev
```

This command will start frontend and backend services simultaneously:
- Web application: http://localhost:3000
- Tombala game: http://localhost:3100
- Minesweeper game: http://localhost:3001
- Backend API: http://localhost:5000

> **Important**: You need to clone the Tombala game repository from https://github.com/amil1105/tombala and the Minesweeper game repository from https://github.com/amil1105/minesweeper into the packages directory for the game functionality to work properly. Also, ensure you run `npm install` in each game's directory.

<p align="right">(<a href="#readme-top">🔝</a>)</p>

## 💻 Pages

### Login Page
- User authentication with email and password
- Secure login with SHA-256 token encryption
- Responsive design with validation support
- Internationalization features

![image](https://github.com/user-attachments/assets/7f3103fd-7171-4ae1-85a4-a06760a0acbc)


### Main Dashboard
- Grid/list view of available games
- Chat system integration
- Welcome banner and statistics display

![image](https://github.com/user-attachments/assets/c33d522f-ede0-49ff-8a02-4a379229198e)


### Game Detail Page
- Game information and description
- Game rules and tips
- Statistics and active lobbies
- Banner and visual integration

![image](https://github.com/user-attachments/assets/73c5972e-d0f7-4155-b53e-a28fe0ba2fd0)


### Profile Page
- User statistics and achievements display
- Game history tracking
- Animated user avatar with status indicator
- Responsive card layout design

![image](https://github.com/user-attachments/assets/5fdf47bf-9a7f-4c99-a849-88d8882d3096)


### Leaderboard Page
- Global player rankings across different games
- Category filtering by game type
- Top player highlights with animated effects
- Player search functionality

![image](https://github.com/user-attachments/assets/3dab0f3b-b0b2-4289-b611-3fea10e15a91)


### Settings Page
- User profile customization
- Notification preferences management
- Account security settings
- Theme and language preferences

![image](https://github.com/user-attachments/assets/9116641d-a8d0-479c-8aef-7885085839de)


### Lobby System
- Create lobbies with custom settings
- Join existing lobbies via links/codes
- Event-based and normal lobby types
- Automatic lobby management features

![image](https://github.com/user-attachments/assets/c26f00ef-5fb5-40ff-b733-7d531f1641fe)


### Tombala Game
- Real-time multiplayer gameplay
- Synchronized card distribution
- Automatic number drawing
- Win condition tracking

![image](https://github.com/user-attachments/assets/bc157554-e62f-4b6b-9944-87aba8b6ca33)


### Minesweeper Game
- Classic Minesweeper gameplay
- Customizable grid size and mine count
- Flagging and timer functionalities
- Playable at http://localhost:3001

![image](https://github.com/user-attachments/assets/aa04815f-f51d-4762-964e-f7ddb144100f)


### Minesweeper Game
- Classic Minesweeper gameplay
- Customizable grid size and mine count
- Flagging and timer functionalities
- Playable at http://localhost:3001

<p align="right">(<a href="#readme-top">🔝</a>)</p>

## 🤖 Features

### Authentication System
- Secure login with SHA-256 encryption
- Session management with JWT
- User permissions and roles

### Lobby Management
- Create custom lobbies with various settings
- Join lobbies via generated links or codes
- Event-based lobbies with scheduled start/end times
- Automatic lobby closure after inactivity

### Real-time Multiplayer
- WebSocket integration for live gameplay
- Synchronized game states across all players
- Automatic reconnection on connection loss
- Bot players with realistic behavior

### Responsive Design
- Mobile-first approach for all screen sizes
- Adaptive layouts for different devices
- Touch-friendly interface elements
- Cross-browser compatibility

### Internationalization
- Multi-language support
- Localized content and UI elements
- Right-to-left language support
- Easy language switching

<p align="right">(<a href="#readme-top">🔝</a>)</p>

## 🛠 Technologies

### Frontend
- React 19.0
- Material UI 6.4
- React Router 7.2
- Socket.io-client (real-time communication)
- Axios (API requests)

### Backend
- Node.js 22.x
- Express
- Socket.io
- MongoDB
- JSON Web Token

<p align="right">(<a href="#readme-top">🔝</a>)</p>

## 📖 Experiences and Challenges

During development, several challenges were encountered:

- **WebSocket Synchronization**: Ensuring all players received the same game state simultaneously
- **Session Management**: Handling user authentication across the application
- **Responsive Design**: Creating a consistent experience across various devices
- **Bot Integration**: Developing realistic bot behavior for games
- **Monorepo Structure**: Managing dependencies and shared code across multiple packages

<p align="right">(<a href="#readme-top">🔝</a>)</p>


## 🌏 Browser Support

| <img src="https://user-images.githubusercontent.com/1215767/34348387-a2e64588-ea4d-11e7-8267-a43365103afe.png" alt="Chrome" width="16px" height="16px" /> Chrome | <img src="https://user-images.githubusercontent.com/1215767/34348590-250b3ca2-ea4f-11e7-9efb-da953359321f.png" alt="IE" width="16px" height="16px" /> Internet Explorer | <img src="https://user-images.githubusercontent.com/1215767/34348380-93e77ae8-ea4d-11e7-8696-9a989ddbbbf5.png" alt="Edge" width="16px" height="16px" /> Edge | <img src="https://user-images.githubusercontent.com/1215767/34348394-a981f892-ea4d-11e7-9156-d128d58386b9.png" alt="Safari" width="16px" height="16px" /> Safari | <img src="https://user-images.githubusercontent.com/1215767/34348383-9e7ed492-ea4d-11e7-910c-03b39d52f496.png" alt="Firefox" width="16px" height="16px" /> Firefox |
| :---------: | :---------: | :---------: | :---------: | :---------: |
| Yes | 11+ | Yes | Yes | Yes |

<p align="right">(<a href="#readme-top">🔝</a>)</p>

## 🤝 Contact
- Amil Shikhiyev - amilworks@gmail.com - amil.shikhiyev@ogr.sakarya.edu.tr
- Project Link: [https://github.com/amil1105/Game-Center-Frontend](https://github.com/Metecode/TOYOTA-32bit-project.git)
- Tombala Game: [https://github.com/amil1105/tombala]
- Minesweeper Game: [https://github.com/amil1105/minesweeper]
<p align="right">(<a href="#readme-top">🔝</a>)</p>

## 💎 Acknowledgements

- [React](https://reactjs.org/)
- [Material UI](https://mui.com/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Express.js](https://expressjs.com/)
- [Socket.io](https://socket.io/)
- [MongoDB](https://www.mongodb.com/)
- [32bit](https://32bit.com.tr)

<p align="right">(<a href="#readme-top">🔝</a>)</p>

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">🔝</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[node-shield]: https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[node-url]: https://nodejs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[material-shield]: https://img.shields.io/badge/Material%20UI-007FFF?style=for-the-badge&logo=mui&logoColor=white
[material-url]: https://mui.com/
[vite-shield]: https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E
[vite-url]: https://vitejs.dev/
[react-router-shield]: https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white
[react-router-url]: https://reactrouter.com/
[express-shield]: https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white
[express-url]: https://expressjs.com/
[mongodb-shield]: https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white
[mongodb-url]: https://www.mongodb.com/
[socketio-shield]: https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white
[socketio-url]: https://socket.io/
[axios-shield]: https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white
[axios-url]: https://axios-http.com/
[lerna-shield]: https://img.shields.io/badge/Lerna-9333EA?style=for-the-badge&logo=lerna&logoColor=white
[lerna-url]: https://lerna.js.org/
[license-shield]: https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge
[license-url]: https://opensource.org/licenses/MIT
