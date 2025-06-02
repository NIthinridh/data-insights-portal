import { alpha } from '@mui/material/styles';

/**
 * Background pattern styles that can be applied throughout the application
 * These can be imported and applied to any component using the sx prop
 */
const backgroundStyles = {
  // Gradient background with subtle pattern
  appGradient: (theme) => ({
    background: theme.palette.mode === 'dark'
      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.8)} 0%, ${alpha('#000000', 0.9)} 100%)`
      : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.background.default, 0.7)} 100%)`,
    backgroundImage: theme.palette.mode === 'dark'
      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.8)} 0%, ${alpha('#000000', 0.9)} 100%),
         url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='${encodeURIComponent(alpha(theme.palette.primary.main, 0.05))}' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`
      : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.background.default, 0.7)} 100%),
         url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='${encodeURIComponent(alpha(theme.palette.primary.main, 0.2))}' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
    backgroundAttachment: 'fixed',
    backgroundSize: 'cover',
  }),

  // Subtle dot pattern
  dotPattern: (theme) => ({
    backgroundColor: theme.palette.background.default,
    backgroundImage: `radial-gradient(${alpha(theme.palette.primary.main, 0.1)} 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    backgroundAttachment: 'fixed',
  }),

  // Modern wave pattern
  wavePattern: (theme) => ({
    backgroundColor: theme.palette.background.default,
    backgroundImage: theme.palette.mode === 'dark'
      ? `url("data:image/svg+xml,%3Csvg width='100%25' height='50px' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='a' gradientUnits='userSpaceOnUse' x1='0' x2='0' y1='0' y2='50px'%3E%3Cstop offset='0' stop-color='%23000'/%3E%3Cstop offset='1' stop-color='${encodeURIComponent(alpha(theme.palette.primary.dark, 0.3))}'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M0 25C50 0 50 50 100 25L100 0L0 0Z' fill='url(%23a)'/%3E%3C/svg%3E")`
      : `url("data:image/svg+xml,%3Csvg width='100%25' height='50px' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='a' gradientUnits='userSpaceOnUse' x1='0' x2='0' y1='0' y2='50px'%3E%3Cstop offset='0' stop-color='%23fff'/%3E%3Cstop offset='1' stop-color='${encodeURIComponent(alpha(theme.palette.primary.light, 0.1))}'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M0 25C50 0 50 50 100 25L100 0L0 0Z' fill='url(%23a)'/%3E%3C/svg%3E")`,
    backgroundSize: '100% 50px',
    backgroundRepeat: 'repeat-x',
    backgroundPosition: 'bottom',
  }),

  // Dashboard background with grid
  dashboardGrid: (theme) => ({
    backgroundColor: theme.palette.background.default,
    backgroundImage: `linear-gradient(${alpha(theme.palette.divider, 0.05)} 1px, transparent 1px), 
                      linear-gradient(90deg, ${alpha(theme.palette.divider, 0.05)} 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    backgroundAttachment: 'fixed',
  }),

  // Finance-themed background with subtle money pattern
  financePattern: (theme) => ({
    backgroundColor: theme.palette.background.default,
    backgroundImage: theme.palette.mode === 'dark'
      ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cg fill='${encodeURIComponent(alpha(theme.palette.primary.main, 0.03))}'%3E%3Cpath d='M12 0h18v6h6v6h6v18h-6v6h-6v6H12v-6H6v-6H0V12h6V6h6V0zm12 6h-6v6h-6v6H6v6h6v6h6v6h6v-6h6v-6h6v-6h-6v-6h-6V6zm-6 12h6v6h-6v-6zm24 24h6v6h-6v-6z'/%3E%3C/g%3E%3C/svg%3E")`
      : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cg fill='${encodeURIComponent(alpha(theme.palette.primary.main, 0.03))}'%3E%3Cpath d='M12 0h18v6h6v6h6v18h-6v6h-6v6H12v-6H6v-6H0V12h6V6h6V0zm12 6h-6v6h-6v6H6v6h6v6h6v6h6v-6h6v-6h6v-6h-6v-6h-6V6zm-6 12h6v6h-6v-6zm24 24h6v6h-6v-6z'/%3E%3C/g%3E%3C/svg%3E")`,
  }),

  // Login and registration pages background
  authBackground: (theme) => ({
    backgroundImage: theme.palette.mode === 'dark'
      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.8)} 0%, ${alpha('#000000', 0.9)} 100%)`
      : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.6)} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }),

  // Card background with subtle sheen effect
  cardSheen: (theme) => ({
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: -100,
      width: '100%',
      height: '100%',
      background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
      transform: 'skewX(-15deg)',
      animation: 'sheenAnimation 3s infinite linear',
    },
    '@keyframes sheenAnimation': {
      '0%': { left: '-100%' },
      '100%': { left: '200%' },
    },
  }),

  // Blurred glass effect for modals and drawers
  glassMorphism: (theme) => ({
    backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.7 : 0.8),
    backdropFilter: 'blur(10px)',
    borderRadius: 2,
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
      : '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.1 : 0.2)}`,
  }),
};

export default backgroundStyles;