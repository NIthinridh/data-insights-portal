import React from 'react';
import { Card, CardContent, CardHeader, useTheme, Box, alpha } from '@mui/material';

/**
 * GlassCard - A styled card component with glassmorphism effect
 * Use this component to create cards that work well with the background image
 * 
 * @param {object} props - Component props
 * @param {ReactNode} props.children - Card content
 * @param {string} props.title - Card title (optional)
 * @param {ReactNode} props.action - Action element for the card header (optional)
 * @param {object} props.sx - Additional styles to apply to the card
 * @param {number} props.elevation - Card elevation (1-24)
 * @param {string} props.glowColor - Custom glow color (default: primary color)
 * @param {boolean} props.neonBorder - Whether to add a neon border effect
 * @param {string} props.accentPosition - Position of accent color ('top', 'left', 'bottom', 'right')
 * @returns {JSX.Element} GlassCard component
 */
const GlassCard = ({ 
  children, 
  title, 
  action, 
  sx = {}, 
  elevation = 3,
  glowColor,
  neonBorder = false,
  accentPosition = 'none'
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  // Determine the color for glow effects
  const primaryColor = theme.palette.primary.main;
  const finalGlowColor = glowColor || primaryColor;
  
  // Additional styles for the accent position
  let accentStyles = {};
  if (accentPosition !== 'none') {
    const borderWidth = '3px';
    const accentStyle = `${borderWidth} solid ${finalGlowColor}`;
    
    switch (accentPosition) {
      case 'top':
        accentStyles = { borderTop: accentStyle };
        break;
      case 'left':
        accentStyles = { borderLeft: accentStyle };
        break;
      case 'bottom':
        accentStyles = { borderBottom: accentStyle };
        break;
      case 'right':
        accentStyles = { borderRight: accentStyle };
        break;
      default:
        accentStyles = {};
    }
  }
  
  return (
    <Card
      elevation={elevation}
      sx={{
        borderRadius: 2.5,
        backgroundColor: isDark 
          ? alpha(theme.palette.background.paper, 0.85) 
          : alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(10px)',
        border: neonBorder 
          ? `1px solid ${alpha(finalGlowColor, 0.4)}` 
          : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: neonBorder 
          ? `0 0 15px ${alpha(finalGlowColor, 0.2)}` 
          : undefined,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...accentStyles,
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: neonBorder 
            ? `0 10px 20px rgba(0,0,0,0.2), 0 0 15px ${alpha(finalGlowColor, 0.3)}`
            : `0 10px 20px rgba(0,0,0,0.2)`,
        },
        ...sx
      }}
    >
      {title && (
        <CardHeader
          title={
            <Box component="div" sx={{ 
              color: neonBorder ? finalGlowColor : undefined,
              textShadow: neonBorder ? `0 0 5px ${alpha(finalGlowColor, 0.3)}` : undefined,
              fontWeight: 600
            }}>
              {title}
            </Box>
          }
          action={action}
          sx={{ pb: 0 }}
        />
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default GlassCard;