import { useState, useMemo } from 'react';
import { createTheme } from '@mui/material/styles';

export const useTheme = () => {
  const [mode, setMode] = useState('dark');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#3b82f6',
          },
          secondary: {
            main: '#8b5cf6',
          },
          background: {
            default: mode === 'dark' ? '#111827' : '#f3f4f6',
            paper: mode === 'dark' ? '#1f2937' : '#ffffff',
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                scrollbarColor: mode === 'dark' ? '#4b5563' : '#d1d5db',
                '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                },
                '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                  borderRadius: '4px',
                  backgroundColor: mode === 'dark' ? '#4b5563' : '#d1d5db',
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
}; 