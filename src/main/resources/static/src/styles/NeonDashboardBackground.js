import { keyframes } from '@mui/system';

// Neon dashboard inspired background effects
const neonDashboardBackground = {
  // Main container background - dark with subtle grid lines
  mainBackground: {
    background: '#040714',
    backgroundImage: `
      linear-gradient(rgba(8, 44, 71, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(8, 44, 71, 0.05) 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '100vh',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at center, transparent 0%, #040714 70%)',
      pointerEvents: 'none',
      zIndex: 1,
    }
  },

  // Glowing horizontal lines animation
  glowingLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 0,
    opacity: 0.5,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-10%',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `
        linear-gradient(transparent 5%, rgba(8, 223, 247, 0.03) 6%, transparent 6.5%),
        linear-gradient(transparent 25%, rgba(8, 223, 247, 0.03) 26%, transparent 26.5%),
        linear-gradient(transparent 45%, rgba(8, 223, 247, 0.03) 46%, transparent 46.5%),
        linear-gradient(transparent 65%, rgba(8, 223, 247, 0.03) 66%, transparent 66.5%),
        linear-gradient(transparent 85%, rgba(8, 223, 247, 0.03) 86%, transparent 86.5%)
      `,
      backgroundSize: '100% 150%',
      animation: 'moveLines 30s linear infinite',
    }
  },

  // Particles effect
  particles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 0,
    '&::before': {
      content: '""',
      position: 'absolute',
      width: '2px',
      height: '2px',
      background: 'rgba(8, 223, 247, 0.5)',
      boxShadow: `
        0 0 6px rgba(8, 223, 247, 0.3),
        30vw 20vh 1px rgba(8, 223, 247, 0.3),
        15vw 40vh 0px rgba(8, 223, 247, 0.3),
        40vw 60vh 1px rgba(8, 223, 247, 0.3),
        60vw 30vh 0px rgba(8, 223, 247, 0.3),
        75vw 70vh 0px rgba(8, 223, 247, 0.3),
        80vw 40vh 1px rgba(8, 223, 247, 0.3),
        90vw 10vh 0px rgba(8, 223, 247, 0.3),
        35vw 80vh 0px rgba(8, 223, 247, 0.3),
        50vw 50vh 0px rgba(8, 223, 247, 0.3),
        65vw 15vh 0px rgba(8, 223, 247, 0.3),
        85vw 30vh 0px rgba(8, 223, 247, 0.3),
        10vw 60vh 0px rgba(8, 223, 247, 0.3),
        20vw 30vh 0px rgba(8, 223, 247, 0.3),
        40vw 90vh 0px rgba(8, 223, 247, 0.3),
        55vw 35vh 0px rgba(8, 223, 247, 0.3),
        70vw 50vh 0px rgba(8, 223, 247, 0.3),
        30vw 70vh 0px rgba(8, 223, 247, 0.3),
        50vw 20vh 0px rgba(8, 223, 247, 0.3),
        65vw 65vh 0px rgba(8, 223, 247, 0.3),
        75vw 5vh 0px rgba(8, 223, 247, 0.3),
        5vw 90vh 0px rgba(8, 223, 247, 0.3),
        15vw 55vh 0px rgba(8, 223, 247, 0.3),
        95vw 80vh 0px rgba(8, 223, 247, 0.3)
      `,
    }
  },

  // Glowing chart aesthetic
  glowingChart: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    height: '70%',
    borderRadius: '12px',
    border: '1px solid rgba(8, 223, 247, 0.2)',
    boxShadow: '0 0 20px rgba(8, 223, 247, 0.1)',
    opacity: 0.15,
    zIndex: 0,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `
        linear-gradient(90deg, transparent 50%, rgba(8, 223, 247, 0.1) 50%),
        linear-gradient(rgba(8, 223, 247, 0.1) 50%, transparent 50%)
      `,
      backgroundSize: '20px 20px',
      borderRadius: '12px',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '25%',
      left: '5%',
      width: '30%',
      height: '30%',
      borderRadius: '50%',
      border: '1px solid rgba(20, 242, 132, 0.3)',
      boxShadow: '0 0 10px rgba(20, 242, 132, 0.2)',
      opacity: 0.5,
    }
  },

  // Container for page content
  contentContainer: {
    position: 'relative',
    zIndex: 2,
  },

  // Animation keyframes
  '@keyframes moveLines': {
    '0%': { transform: 'translateY(0)' },
    '100%': { transform: 'translateY(150%)' }
  },

  // Card with neon glow effect
  neonCard: {
    backgroundColor: 'rgba(4, 7, 20, 0.8)',
    borderRadius: '12px',
    border: '1px solid rgba(8, 223, 247, 0.1)',
    boxShadow: '0 0 15px rgba(8, 223, 247, 0.1)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 0 20px rgba(8, 223, 247, 0.2)',
      border: '1px solid rgba(8, 223, 247, 0.2)',
    }
  },

  // Button with neon style
  neonButton: {
    backgroundColor: 'rgba(8, 223, 247, 0.1)',
    color: 'rgb(8, 223, 247)',
    border: '1px solid rgba(8, 223, 247, 0.3)',
    boxShadow: '0 0 10px rgba(8, 223, 247, 0.1)',
    '&:hover': {
      backgroundColor: 'rgba(8, 223, 247, 0.2)',
      boxShadow: '0 0 15px rgba(8, 223, 247, 0.2)',
    }
  },

  // Custom styles for charts to match the neon theme
  neonChartStyles: {
    '.recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line': {
      stroke: 'rgba(8, 223, 247, 0.1)',
    },
    '.recharts-text': {
      fill: 'rgba(8, 223, 247, 0.8)',
    },
    '.recharts-line-curve': {
      stroke: 'rgb(8, 223, 247)',
      strokeWidth: 2,
      filter: 'drop-shadow(0 0 2px rgba(8, 223, 247, 0.5))',
    },
    '.recharts-area-area': {
      fill: 'rgba(8, 223, 247, 0.1)',
    },
    '.recharts-pie': {
      filter: 'drop-shadow(0 0 4px rgba(8, 223, 247, 0.3))',
    },
    '.recharts-bar-rectangle': {
      filter: 'drop-shadow(0 0 2px rgba(20, 242, 132, 0.3))',
    }
  }
};

export default neonDashboardBackground;