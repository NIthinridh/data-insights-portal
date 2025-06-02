import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create a context for theme management
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }) => {
  // Check if dark mode was previously set in localStorage
  const storedMode = localStorage.getItem('darkMode');
  const [darkMode, setDarkMode] = useState(storedMode !== 'false'); // Default to dark mode for neon theme

  // Define color constants for neon theme
  const neonBlue = '#08DFF7';
  const neonGreen = '#14F284';
  const darkNavy = '#040714';
  const deepBlue = '#082C47';
  const neonPink = '#F2088C';
  const neonPurple = '#9D08F2';

  // Create the MUI theme based on the dark mode setting
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: neonBlue,
        light: '#59E7F9',
        dark: '#06A6B9',
        contrastText: '#ffffff',
      },
      secondary: {
        main: neonGreen,
        light: '#5FF5AD',
        dark: '#0DB663',
        contrastText: '#ffffff',
      },
      success: {
        main: neonGreen,
        light: '#5FF5AD',
        dark: '#0DB663',
        contrastText: '#ffffff',
      },
      error: {
        main: neonPink,
        light: '#F55FB6',
        dark: '#B60669',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#F27208',
        light: '#F59F59',
        dark: '#B65506',
        contrastText: '#ffffff',
      },
      info: {
        main: neonBlue,
        light: '#59E7F9',
        dark: '#06A6B9',
        contrastText: '#ffffff',
      },
      background: {
        default: darkMode ? darkNavy : '#f3f4f6',
        paper: darkMode ? '#071426' : '#ffffff',
      },
      divider: darkMode ? 'rgba(8, 223, 247, 0.1)' : 'rgba(0, 0, 0, 0.12)',
      text: {
        primary: darkMode ? '#f3f4f6' : '#1f2937',
        secondary: darkMode ? '#9ca3af' : '#4b5563',
        disabled: darkMode ? '#6b7280' : '#9ca3af',
      },
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system', 
        'BlinkMacSystemFont', 
        '"Segoe UI"', 
        'Roboto', 
        'Oxygen', 
        'Ubuntu', 
        'Cantarell', 
        '"Fira Sans"', 
        '"Droid Sans"', 
        '"Helvetica Neue"',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 700,
        fontSize: '2rem',
        lineHeight: 1.2,
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
        lineHeight: 1.2,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.2,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.2,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.2,
      },
      subtitle1: {
        fontWeight: 500,
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      subtitle2: {
        fontWeight: 500,
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      body1: {
        fontWeight: 400,
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontWeight: 400,
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        fontWeight: 500,
        fontSize: '0.875rem',
        textTransform: 'none',
      },
      caption: {
        fontWeight: 400,
        fontSize: '0.75rem',
        lineHeight: 1.5,
      },
      overline: {
        fontWeight: 600,
        fontSize: '0.75rem',
        lineHeight: 1.5,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: darkMode ? `${neonBlue} ${darkNavy}` : undefined,
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              backgroundColor: darkMode ? darkNavy : '#f5f5f5',
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 6,
              backgroundColor: darkMode ? neonBlue : '#cccccc',
              border: darkMode ? `1px solid ${neonBlue}` : undefined,
            },
            '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
              backgroundColor: darkMode ? '#06A6B9' : '#999999',
            },
            '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
              backgroundColor: darkMode ? '#06A6B9' : '#999999',
            },
            '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
              backgroundColor: darkMode ? '#06A6B9' : '#999999',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: darkMode ? `0 0 10px ${neonBlue}` : '0 2px 8px rgba(0, 0, 0, 0.1)',
            },
          },
          contained: {
            padding: '8px 16px',
            ...(darkMode && {
              backgroundColor: 'rgba(8, 223, 247, 0.15)',
              color: neonBlue,
              border: '1px solid rgba(8, 223, 247, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(8, 223, 247, 0.25)',
                boxShadow: `0 0 15px ${neonBlue}`,
              },
            }),
          },
          outlined: {
            padding: '7px 15px',
            ...(darkMode && {
              borderColor: 'rgba(8, 223, 247, 0.3)',
              color: neonBlue,
              '&:hover': {
                borderColor: neonBlue,
                backgroundColor: 'rgba(8, 223, 247, 0.08)',
                boxShadow: `0 0 10px ${neonBlue}`,
              },
            }),
          },
          text: {
            ...(darkMode && {
              color: neonBlue,
              '&:hover': {
                backgroundColor: 'rgba(8, 223, 247, 0.08)',
              },
            }),
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 2px 10px rgba(0, 0, 0, 0.05)',
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            ...(darkMode && {
              backgroundColor: 'rgba(7, 20, 38, 0.7)',
              border: '1px solid rgba(8, 223, 247, 0.1)',
            }),
            '&:hover': {
              boxShadow: darkMode 
                ? '0 5px 25px rgba(0, 0, 0, 0.6), 0 0 10px rgba(8, 223, 247, 0.2)' 
                : '0 4px 15px rgba(0, 0, 0, 0.08)',
              ...(darkMode && {
                borderColor: 'rgba(8, 223, 247, 0.2)',
              }),
            },
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            padding: '20px 24px 0 24px',
            ...(darkMode && {
              '& .MuiCardHeader-title': {
                color: neonBlue,
              },
            }),
          },
          title: {
            fontSize: '1.125rem',
            fontWeight: 600,
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '16px 24px 24px 24px',
            '&:last-child': {
              paddingBottom: 24,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 2px 10px rgba(0, 0, 0, 0.05)',
            borderRadius: 12,
            ...(darkMode && {
              backgroundImage: 'none',
            }),
          },
          elevation1: {
            boxShadow: darkMode ? '0 2px 10px rgba(0, 0, 0, 0.5)' : '0 1px 8px rgba(0, 0, 0, 0.04)',
            ...(darkMode && {
              backgroundColor: 'rgba(7, 20, 38, 0.7)',
              border: '1px solid rgba(8, 223, 247, 0.05)',
            }),
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '12px 16px',
          },
          head: {
            fontWeight: 600,
            backgroundColor: darkMode ? 'rgba(8, 223, 247, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            ...(darkMode && {
              color: neonBlue,
            }),
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            ...(darkMode && {
              '&:nth-of-type(odd)': {
                backgroundColor: 'rgba(8, 223, 247, 0.01)',
              },
              '&:hover': {
                backgroundColor: 'rgba(8, 223, 247, 0.03)',
              },
            }),
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '4px 8px',
            ...(darkMode && {
              '&.Mui-selected': {
                backgroundColor: 'rgba(8, 223, 247, 0.15)',
                color: neonBlue,
                '&:hover': {
                  backgroundColor: 'rgba(8, 223, 247, 0.2)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(8, 223, 247, 0.08)',
              },
            }),
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            ...(darkMode && {
              color: 'inherit',
              '.Mui-selected > &': {
                color: neonBlue,
              },
            }),
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: darkMode ? '0 1px 10px rgba(0, 0, 0, 0.6)' : '0 1px 10px rgba(0, 0, 0, 0.1)',
            ...(darkMode && {
              backgroundColor: 'rgba(7, 20, 38, 0.8)',
              backdropFilter: 'blur(10px)',
              borderBottom: `1px solid rgba(8, 223, 247, 0.1)`,
            }),
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            ...(darkMode && {
              backgroundColor: 'rgba(4, 7, 20, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRight: `1px solid rgba(8, 223, 247, 0.1)`,
            }),
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
            ...(darkMode && {
              '&.MuiChip-colorDefault': {
                backgroundColor: 'rgba(8, 223, 247, 0.08)',
                border: `1px solid rgba(8, 223, 247, 0.1)`,
                color: neonBlue,
              },
              '&.MuiChip-colorPrimary': {
                backgroundColor: 'rgba(8, 223, 247, 0.1)',
                color: neonBlue,
                boxShadow: `0 0 5px rgba(8, 223, 247, 0.1)`,
              },
              '&.MuiChip-colorSecondary': {
                backgroundColor: 'rgba(20, 242, 132, 0.1)',
                color: neonGreen,
                boxShadow: `0 0 5px rgba(20, 242, 132, 0.1)`,
              },
            }),
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            boxShadow: darkMode ? '0 8px 35px rgba(0, 0, 0, 0.8)' : '0 8px 25px rgba(0, 0, 0, 0.15)',
            ...(darkMode && {
              backgroundColor: 'rgba(7, 20, 38, 0.9)',
              backdropFilter: 'blur(10px)',
              border: `1px solid rgba(8, 223, 247, 0.1)`,
            }),
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            minHeight: 48,
            ...(darkMode && {
              '&.Mui-selected': {
                color: neonBlue,
              },
            }),
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            ...(darkMode && {
              backgroundColor: neonBlue,
              boxShadow: `0 0 8px ${neonBlue}`,
            }),
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          },
          bar: {
            borderRadius: 4,
            ...(darkMode && {
              boxShadow: `0 0 8px ${neonBlue}`,
            }),
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            ...(darkMode && {
              '&:hover': {
                backgroundColor: 'rgba(8, 223, 247, 0.08)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(8, 223, 247, 0.15)',
                color: neonBlue,
                '&:hover': {
                  backgroundColor: 'rgba(8, 223, 247, 0.2)',
                },
              },
            }),
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            ...(darkMode && {
              '& label.Mui-focused': {
                color: neonBlue,
              },
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: neonBlue,
                  boxShadow: `0 0 5px rgba(8, 223, 247, 0.2)`,
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(8, 223, 247, 0.5)',
                },
              },
            }),
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            ...(darkMode && {
              '&.Mui-checked': {
                color: neonBlue,
                '& + .MuiSwitch-track': {
                  backgroundColor: 'rgba(8, 223, 247, 0.5)',
                  opacity: 0.5,
                },
                '&.Mui-disabled + .MuiSwitch-track': {
                  backgroundColor: 'rgba(8, 223, 247, 0.2)',
                },
              },
            }),
          },
          track: {
            ...(darkMode && {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }),
          },
        },
      },
      MuiCircularProgress: {
        styleOverrides: {
          root: {
            ...(darkMode && {
              color: neonBlue,
            }),
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontWeight: 600,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 6,
            fontSize: '0.75rem',
            ...(darkMode && {
              backgroundColor: 'rgba(8, 223, 247, 0.9)',
              color: '#000000',
              boxShadow: '0 0 10px rgba(8, 223, 247, 0.5)',
            }),
          },
          arrow: {
            ...(darkMode && {
              color: 'rgba(8, 223, 247, 0.9)',
            }),
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            ...(darkMode && {
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
              '&.MuiAlert-standardSuccess': {
                backgroundColor: 'rgba(20, 242, 132, 0.1)',
                border: `1px solid rgba(20, 242, 132, 0.3)`,
                color: neonGreen,
              },
              '&.MuiAlert-standardError': {
                backgroundColor: 'rgba(242, 8, 140, 0.1)',
                border: `1px solid rgba(242, 8, 140, 0.3)`,
                color: neonPink,
              },
              '&.MuiAlert-standardWarning': {
                backgroundColor: 'rgba(242, 114, 8, 0.1)',
                border: `1px solid rgba(242, 114, 8, 0.3)`,
                color: '#F27208',
              },
              '&.MuiAlert-standardInfo': {
                backgroundColor: 'rgba(8, 223, 247, 0.1)',
                border: `1px solid rgba(8, 223, 247, 0.3)`,
                color: neonBlue,
              },
            }),
          },
          icon: {
            ...(darkMode && {
              opacity: 0.9,
            }),
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            ...(darkMode && {
              backgroundColor: 'rgba(8, 223, 247, 0.2)',
              color: neonBlue,
              border: `1px solid rgba(8, 223, 247, 0.3)`,
            }),
          },
        },
      },
    },
  });

  // Function to toggle between light and dark mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // Save the preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Context value that will be provided
  const value = {
    darkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};