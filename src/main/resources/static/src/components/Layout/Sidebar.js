import React, { useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Collapse,
  Box,
  Typography,
  Avatar,
  useTheme,
  Tooltip,
  alpha,
  useMediaQuery,
  IconButton
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BarChartIcon from '@mui/icons-material/BarChart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TimelineIcon from '@mui/icons-material/Timeline';
import FlagIcon from '@mui/icons-material/Flag';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useAuth();
  const [reportsOpen, setReportsOpen] = useState(false);
  
  // Mobile state management
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Load avatar from localStorage
  const avatarUrl = localStorage.getItem('userAvatar');

  const handleReportsClick = () => {
    setReportsOpen(!reportsOpen);
  };

  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileNavClick = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false); // Close mobile menu after navigation
    }
  };

  // Check if a menu item is the current active route
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const mainMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Transactions', icon: <ReceiptIcon />, path: '/transactions' },
    { text: 'Budgets', icon: <AccountBalanceWalletIcon />, path: '/budgets' },
    { text: 'Goals', icon: <FlagIcon />, path: '/goals' },
    { text: 'Forecasting', icon: <TimelineIcon />, path: '/forecasting' },
    { text: 'Financial Health', icon: <HealthAndSafetyIcon />, path: '/financial-health' },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
  ];

  const reportMenuItems = [
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
    { text: 'Report Generator', icon: <PictureAsPdfIcon />, path: '/report-generator' },
  ];

  const otherMenuItems = [
    { text: 'Data Import', icon: <UploadFileIcon />, path: '/import' },
  ];

  // Get display name for avatar
  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    } else if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return '';
  };

  // Custom styles for menu items
  const listItemButtonStyle = {
    py: 1,
    px: 2,
    borderRadius: 1.5,
    mx: 1,
    my: 0.5,
    transition: 'all 0.2s ease',
  };

  // Active item styles with subtle color gradient
  const activeItemStyle = {
    ...listItemButtonStyle,
    color: theme.palette.primary.main,
    fontWeight: 600,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '25%',
      height: '50%',
      width: 4,
      borderRadius: '0 4px 4px 0',
      backgroundColor: theme.palette.primary.main,
    },
  };

  // Hover state for menu items
  const hoverItemStyle = {
    '&:hover': {
      backgroundColor: alpha(theme.palette.text.primary, 0.04),
    },
  };

  // Drawer content component to avoid duplication
  const DrawerContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* App logo and branding with mobile close button */}
      <Box
        sx={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.03),
          color: theme.palette.primary.main,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            component="span"
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.1rem',
              mr: 1.5,
            }}
          >
            DI
          </Box>
          Data Insights
        </Typography>
        
        {/* Mobile close button */}
        {isMobile && (
          <IconButton
            onClick={handleMobileToggle}
            sx={{ color: theme.palette.primary.main }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* User profile section */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        }}
      >
        <Avatar
          src={avatarUrl}
          sx={{
            width: 40,
            height: 40,
            mr: 2,
            backgroundColor: theme.palette.primary.main,
          }}
        >
          {getDisplayName()}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ maxWidth: 150 }}>
            {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
            {user?.email || ''}
          </Typography>
        </Box>
      </Box>

      {/* Main navigation */}
      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        <List component="nav" disablePadding sx={{ p: 1 }}>
          {mainMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <Tooltip title={item.text} placement="right" disableHoverListener={!isActiveRoute(item.path)}>
                <ListItemButton
                  selected={isActiveRoute(item.path)}
                  onClick={() => handleMobileNavClick(item.path)}
                  sx={isActiveRoute(item.path) ? activeItemStyle : { ...listItemButtonStyle, ...hoverItemStyle }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isActiveRoute(item.path) ? theme.palette.primary.main : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontWeight: isActiveRoute(item.path) ? 600 : 400,
                      variant: 'body2',
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mx: 2, my: 1, borderColor: alpha(theme.palette.divider, 0.5) }} />

        <List component="nav" disablePadding sx={{ p: 1 }}>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={handleReportsClick}
              sx={listItemButtonStyle}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Reports" 
                primaryTypographyProps={{
                  variant: 'body2',
                }}
              />
              {reportsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={reportsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {reportMenuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <Tooltip title={item.text} placement="right" disableHoverListener={!isActiveRoute(item.path)}>
                    <ListItemButton
                      selected={isActiveRoute(item.path)}
                      onClick={() => handleMobileNavClick(item.path)}
                      sx={isActiveRoute(item.path) 
                        ? { ...activeItemStyle, pl: 5 } 
                        : { ...listItemButtonStyle, pl: 5, ...hoverItemStyle }
                      }
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: isActiveRoute(item.path) ? theme.palette.primary.main : 'inherit',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{
                          fontWeight: isActiveRoute(item.path) ? 600 : 400,
                          variant: 'body2',
                        }}
                      />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          </Collapse>
          
          {otherMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <Tooltip title={item.text} placement="right" disableHoverListener={!isActiveRoute(item.path)}>
                <ListItemButton
                  selected={isActiveRoute(item.path)}
                  onClick={() => handleMobileNavClick(item.path)}
                  sx={isActiveRoute(item.path) ? activeItemStyle : { ...listItemButtonStyle, ...hoverItemStyle }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isActiveRoute(item.path) ? theme.palette.primary.main : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontWeight: isActiveRoute(item.path) ? 600 : 400,
                      variant: 'body2',
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Box>
      
      {/* App version footer */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Data Insights v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Menu Button - Fixed position */}
      {isMobile && (
        <IconButton
          onClick={handleMobileToggle}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: (theme) => theme.zIndex.drawer + 2,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.primary.main,
            boxShadow: theme.shadows[4],
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Desktop Drawer - Permanent */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <DrawerContent />
      </Drawer>

      {/* Mobile Drawer - Temporary */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleMobileToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          },
        }}
      >
        <DrawerContent />
      </Drawer>
    </>
  );
};

export default Sidebar;