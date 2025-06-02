import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CustomThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import ImportData from './pages/ImportData';
import Reports from './pages/Reports';
import Register from './pages/Register';
import UserSettings from './pages/UserSettings';
import Profile from './pages/Profile';
import Transactions from './pages/Transactions';
import BudgetManagement from './pages/BudgetManagement';
import FinancialGoals from './pages/FinancialGoals';
import Forecasting from './pages/Forecasting';
import ReportGenerator from './pages/ReportGenerator';
import FinancialHealth from './pages/FinancialHealth';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import PageContainer from './components/Layout/PageContainer';
import ErrorBoundary from './components/common/ErrorBoundary';
import AuthDebugger from './components/AuthDebugger';
import TokenDebugger from './components/TokenDebugger';
import { Box, useTheme, CssBaseline, Alert, Snackbar } from '@mui/material';
import { healthApi } from './services/api';
import './App.css';

// Background image path
// Note: You should add your actual image to the public folder and reference it here
const backgroundImagePath = '/dashboard-background.jpg';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const theme = useTheme();
  const [connectionStatus, setConnectionStatus] = useState({
    checked: false,
    connected: true,
    message: ''
  });

  // Check backend connectivity on app load
  useEffect(() => {
    const checkBackendConnectivity = async () => {
      try {
        await healthApi.checkBackend();
        console.log('Backend connectivity test successful');
        setConnectionStatus({
          checked: true,
          connected: true,
          message: ''
        });
      } catch (error) {
        console.error('Backend connectivity test failed:', error);
        setConnectionStatus({
          checked: true,
          connected: false,
          message: 'Could not connect to backend server. Please check if the server is running.'
        });
      }
    };

    checkBackendConnectivity();
  }, []);

  // Background styles with image
  const backgroundStyles = {
    mainBackground: {
      minHeight: '100vh',
      width: '100%',
      backgroundImage: `url(${backgroundImagePath})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(4, 7, 20, 0.85)', // Dark overlay for better visibility
        zIndex: 0,
      },
    },
    contentContainer: {
      position: 'relative',
      zIndex: 1, // Place content above the background overlay
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100vh',
    },
  };

  // Close connectivity warning
  const handleCloseWarning = () => {
    setConnectionStatus({
      ...connectionStatus,
      connected: true
    });
  };

  return (
    <AuthProvider>
      <CustomThemeProvider>
        {/* Add CssBaseline for consistent base styling */}
        <CssBaseline />

        {/* Backend connectivity warning */}
        <Snackbar
          open={connectionStatus.checked && !connectionStatus.connected}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ width: '100%' }}
          >
            {connectionStatus.message || 'Backend connection issue detected'}
          </Alert>
        </Snackbar>

        <Router>
          <div className="app">
            <Routes>
              <Route path="/login" element={
                <Box sx={backgroundStyles.mainBackground}>
                  <Box sx={backgroundStyles.contentContainer}>
                    <Login />
                  </Box>
                </Box>
              } />
              <Route path="/register" element={
                <Box sx={backgroundStyles.mainBackground}>
                  <Box sx={backgroundStyles.contentContainer}>
                    <Register />
                  </Box>
                </Box>
              } />
              <Route path="/token-debug" element={<TokenDebugger />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <Box sx={backgroundStyles.mainBackground}>
                    <Box sx={backgroundStyles.contentContainer} className="app-container">
                      <Header />
                      <div className="content-container">
                        <Sidebar />
                        <main className="main-content">
                          <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={
                              <ErrorBoundary>
                                <PageContainer>
                                  <Dashboard />
                                </PageContainer>
                              </ErrorBoundary>
                            } />
                            <Route path="/analytics" element={
                              <ErrorBoundary>
                                <PageContainer>
                                  <Analytics />
                                </PageContainer>
                              </ErrorBoundary>
                            } />
                            <Route path="/import" element={
                              <ErrorBoundary>
                                <PageContainer>
                                  <ImportData />
                                </PageContainer>
                              </ErrorBoundary>
                            } />
                            <Route path="/reports" element={
                              <ErrorBoundary>
                                <PageContainer>
                                  <Reports />
                                </PageContainer>
                              </ErrorBoundary>
                            } />
                            <Route path="/settings" element={
                              <ErrorBoundary>
                                <PageContainer>
                                  <UserSettings />
                                </PageContainer>
                              </ErrorBoundary>
                            } />
                            <Route path="/profile" element={
                              <ErrorBoundary>
                                <PageContainer>
                                  <Profile />
                                </PageContainer>
                              </ErrorBoundary>
                            } />
                            <Route path="/transactions" element={
                              <ErrorBoundary>
                                <PageContainer>
                                  <Transactions />
                                </PageContainer>
                              </ErrorBoundary>
                            } />
                            <Route path="/budgets" element={
                              <ErrorBoundary>
                                <PageContainer>
                                  <BudgetManagement />
                                </PageContainer>
                              </ErrorBoundary>
                            } />
                            <Route path="/goals" element={
                              <ErrorBoundary>
                                <PageContainer>
                                  <FinancialGoals />
                                </PageContainer>
                              </ErrorBoundary>
                            } />
                            <Route path="/forecasting" element={
                              <ErrorBoundary>
                                <PageContainer>
                                  <Forecasting />
                                </PageContainer>
                              </ErrorBoundary>
                            } />
                            <Route path="/report-generator" element={
                              <ErrorBoundary>
                                <PageContainer>
                                  <ReportGenerator />
                                </PageContainer>
                              </ErrorBoundary>
                            } />
                            <Route path="/financial-health" element={
                              <ErrorBoundary>
                                <PageContainer>
                                  <FinancialHealth />
                                </PageContainer>
                              </ErrorBoundary>
                            } />
                            <Route path="/debug" element={
                              <ErrorBoundary>
                                <PageContainer>
                                  <AuthDebugger />
                                </PageContainer>
                              </ErrorBoundary>
                            } />
                          </Routes>
                        </main>
                      </div>
                    </Box>
                  </Box>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </CustomThemeProvider>
    </AuthProvider>
  );
}

export default App;