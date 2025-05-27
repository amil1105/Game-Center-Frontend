import React, { createContext, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ThemeContext = createContext();

export const CustomThemeProvider = ({ children }) => {
  const theme = useMemo(() => createTheme({
    typography: {
      fontFamily: '"Oxanium", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      h1: {
        fontFamily: '"Oxanium", sans-serif',
        fontWeight: 700,
      },
      h2: {
        fontFamily: '"Oxanium", sans-serif',
        fontWeight: 600,
      },
      h3: {
        fontFamily: '"Oxanium", sans-serif',
        fontWeight: 600,
      },
      h4: {
        fontFamily: '"Oxanium", sans-serif',
        fontWeight: 500,
      },
      h5: {
        fontFamily: '"Oxanium", sans-serif',
        fontWeight: 500,
      },
      h6: {
        fontFamily: '"Oxanium", sans-serif',
        fontWeight: 500,
      },
      button: {
        fontFamily: '"Oxanium", sans-serif',
        fontWeight: 600,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @font-face {
            font-family: 'Oxanium';
            font-style: normal;
            font-display: swap;
            font-weight: 400;
            src: url(https://fonts.gstatic.com/s/oxanium/v14/RrQPboN_4yJ0JmiMUW7sIGjd1IA9G83JfniMBXQ7d67x.woff2) format('woff2');
          }
          @font-face {
            font-family: 'Oxanium';
            font-style: normal;
            font-display: swap;
            font-weight: 500;
            src: url(https://fonts.gstatic.com/s/oxanium/v14/RrQPboN_4yJ0JmiMUW7sIGjd1IA9G83JfniMBXQ7d67x.woff2) format('woff2');
          }
          @font-face {
            font-family: 'Oxanium';
            font-style: normal;
            font-display: swap;
            font-weight: 600;
            src: url(https://fonts.gstatic.com/s/oxanium/v14/RrQPboN_4yJ0JmiMUW7sIGjd1IA9G83JfniMBXQ7d67x.woff2) format('woff2');
          }
          @font-face {
            font-family: 'Oxanium';
            font-style: normal;
            font-display: swap;
            font-weight: 700;
            src: url(https://fonts.gstatic.com/s/oxanium/v14/RrQPboN_4yJ0JmiMUW7sIGjd1IA9G83JfniMBXQ7d67x.woff2) format('woff2');
          }
          @font-face {
            font-family: 'Oxanium';
            font-style: normal;
            font-display: swap;
            font-weight: 800;
            src: url(https://fonts.gstatic.com/s/oxanium/v14/RrQPboN_4yJ0JmiMUW7sIGjd1IA9G83JfniMBXQ7d67x.woff2) format('woff2');
          }
          
          body {
            font-family: 'Oxanium', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          }
        `,
      },
    },
  }), []);

  return (
    <ThemeContext.Provider value={theme}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};