// src/pages/FinancialHealth.js - FIXED AND STRETCHED
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Divider,
  Button,
  Tooltip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getFinancialHealthData, getHealthScoreHistory } from '../services/healthService';

const FinancialHealth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [expanded, setExpanded] = useState(null);
  
  useEffect(() => {
    const fetchHealthData = async () => {
      setLoading(true);
      setErrorMessage(null);
      
      try {
        // Fetch data from API
        const data = await getFinancialHealthData();
        console.log('Health data from API:', data); // Log the full response for debugging
        setHealthData(data);
        
        // Fetch history data
        try {
          const history = await getHealthScoreHistory(6);
          console.log('History data from API:', history); // Log the full response for debugging
          setHistoryData(history);
        } catch (historyError) {
          console.error('Error fetching history data:', historyError);
          setErrorMessage('Failed to load historical data. Please try again later.');
        }
      } catch (error) {
        console.error('Failed to fetch health data:', error);
        setErrorMessage('Could not connect to the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHealthData();
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'warning.main';
    return 'error.main';
  };
  
  const getScoreText = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'good':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'critical':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (errorMessage || !healthData) {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage || 'Failed to load financial health data. Please try again later.'}
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }
  
  // Ensure we're using the correct numeric values from the API
  const overallScore = parseFloat(healthData.overallScore);
  const previousScore = parseFloat(healthData.previousScore);
  const scoreDifference = parseFloat((overallScore - previousScore).toFixed(1));
  
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Financial Health Score
      </Typography>
      
      {/* Overall Score Card */}
      <Paper sx={{ p: 3, mb: 4, width: '100%' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={200}
                thickness={4}
                sx={{ color: 'rgba(0, 0, 0, 0.1)' }}
              />
              <CircularProgress
                variant="determinate"
                value={overallScore}
                size={200}
                thickness={4}
                sx={{ 
                  position: 'absolute',
                  left: 0,
                  color: getScoreColor(overallScore)
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h3" component="div" color={getScoreColor(overallScore)}>
                  {overallScore.toFixed(1)}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {getScoreText(overallScore)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              Your Financial Health Score
            </Typography>
            
            <Typography variant="body1" paragraph>
              Your financial health score evaluates your overall financial well-being based on several key factors including savings, debt management, spending habits, protection, and investments.
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" mr={1}>
                Change from previous assessment:
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: scoreDifference >= 0 ? 'success.main' : 'error.main'
              }}>
                {scoreDifference >= 0 ? (
                  <TrendingUpIcon sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon sx={{ mr: 0.5 }} />
                )}
                <Typography 
                  variant="body1" 
                  fontWeight="bold"
                  color={scoreDifference >= 0 ? 'success.main' : 'error.main'}
                >
                  {scoreDifference >= 0 ? '+' : ''}
                  {scoreDifference} points
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" onClick={() => setTabValue(1)}>
                View Detailed Analysis
              </Button>
              <Button variant="outlined" sx={{ ml: 2 }} onClick={() => navigate('/goals')}>
                Set Financial Goals
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Category Tabs */}
      <Paper sx={{ mb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" />
          <Tab label="Detailed Analysis" />
          <Tab label="Recommendations" />
          <Tab label="History" />
        </Tabs>
        
        {/* Overview Tab */}
        <Box 
          role="tabpanel" 
          hidden={tabValue !== 0} 
          id="tabpanel-overview" 
          sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}
        >
          {tabValue === 0 && (
            <Grid container spacing={3} sx={{ width: '100%', flexGrow: 1 }}>
              {healthData.categories.map((category) => {
                // Ensure category score is a number
                const categoryScore = parseFloat(category.score);
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={category.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{category.name}</Typography>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: getScoreColor(categoryScore),
                              fontWeight: 'bold'
                            }}
                          >
                            {categoryScore.toFixed(1)}
                          </Typography>
                        </Box>
                        
                        <LinearProgress 
                          variant="determinate" 
                          value={categoryScore} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            mb: 2,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getScoreColor(categoryScore)
                            }
                          }}
                        />
                        
                        <Typography variant="body2" color="text.secondary">
                          {category.metrics.length} metrics evaluated
                        </Typography>
                        
                        <Box sx={{ flexGrow: 1 }} />
                        
                        <Button 
                          size="small" 
                          sx={{ mt: 2, alignSelf: 'flex-start' }}
                          onClick={() => {
                            setTabValue(1);
                            setExpanded(category.id);
                          }}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
        
        {/* Detailed Analysis Tab */}
        <Box 
          role="tabpanel" 
          hidden={tabValue !== 1} 
          id="tabpanel-analysis" 
          sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
        >
          {tabValue === 1 && (
            <Box sx={{ width: '100%' }}>
              {healthData.categories.map((category) => {
                // Ensure category score is a number
                const categoryScore = parseFloat(category.score);
                
                return (
                  <Accordion 
                    key={category.id}
                    expanded={expanded === category.id}
                    onChange={handleAccordionChange(category.id)}
                    sx={{ mb: 2 }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Grid container alignItems="center">
                        <Grid item xs={8}>
                          <Typography variant="h6">{category.name}</Typography>
                        </Grid>
                        <Grid item xs={4} sx={{ textAlign: 'right' }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: getScoreColor(categoryScore),
                              fontWeight: 'bold'
                            }}
                          >
                            {categoryScore.toFixed(1)} - {getScoreText(categoryScore)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Metrics
                        </Typography>
                        
                        <List dense>
                          {category.metrics.map((metric, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                {getStatusIcon(metric.status)}
                              </ListItemIcon>
                              <ListItemText 
                                primary={
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" component="span">
                                      {metric.name}
                                      <Tooltip title="Learn more about this metric">
                                        <HelpIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle', fontSize: 16, color: 'text.secondary' }} />
                                      </Tooltip>
                                    </Typography>
                                    <Typography variant="body2" component="span" fontWeight="medium">
                                      {typeof metric.value === 'number' ? 
                                        `${metric.value}${metric.unit === 'percent' ? '%' : ` ${metric.unit}`}` : 
                                        metric.value
                                      }
                                      <Typography variant="caption" component="span" color="text.secondary" sx={{ ml: 1 }}>
                                        (Target: {typeof metric.target === 'number' ? 
                                          `${metric.target}${metric.unit === 'percent' ? '%' : ` ${metric.unit}`}` : 
                                          metric.target
                                        })
                                      </Typography>
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  typeof metric.value === 'number' && typeof metric.target === 'number' ? (
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={(metric.value / metric.target) * 100} 
                                      sx={{ 
                                        height: 4, 
                                        borderRadius: 2,
                                        mt: 0.5,
                                        backgroundColor: 'rgba(0,0,0,0.1)',
                                        '& .MuiLinearProgress-bar': {
                                          backgroundColor: 
                                            metric.status === 'good' ? 'success.main' :
                                            metric.status === 'warning' ? 'warning.main' : 'error.main'
                                        }
                                      }}
                                    />
                                  ) : null
                                }
                                secondaryTypographyProps={{ component: 'div' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          Recommendations
                        </Typography>
                        
                        <List dense>
                          {category.recommendations.map((recommendation, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <InfoIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText primary={recommendation} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          )}
        </Box>
        
        {/* Recommendations Tab */}
        <Box 
          role="tabpanel" 
          hidden={tabValue !== 2} 
          id="tabpanel-recommendations" 
          sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
        >
          {tabValue === 2 && (
            <Box sx={{ width: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Top Recommendations to Improve Your Financial Health
              </Typography>
              
              <List>
                {healthData.categories
                  .sort((a, b) => parseFloat(a.score) - parseFloat(b.score)) // Sort by lowest score first
                  .slice(0, 3) // Take top 3 categories that need improvement
                  .map((category) => {
                    // Ensure category score is a number
                    const categoryScore = parseFloat(category.score);
                    
                    return (
                      <React.Fragment key={category.id}>
                        <ListItem>
                          <ListItemIcon>
                            <InfoIcon color="primary" fontSize="large" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={
                              <Typography variant="h6" component="div">
                                Improve Your {category.name} Score
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }} component="div">
                                <Typography variant="body2" component="div">
                                  Your current score: <span style={{ color: getScoreColor(categoryScore), fontWeight: 'bold' }}>{categoryScore.toFixed(1)}</span>
                                </Typography>
                                <List dense>
                                  {category.recommendations.map((recommendation, index) => (
                                    <ListItem key={index} sx={{ pl: 0 }}>
                                      <ListItemIcon sx={{ minWidth: 24 }}>
                                        <CheckCircleIcon color="success" fontSize="small" />
                                      </ListItemIcon>
                                      <ListItemText primary={recommendation} />
                                    </ListItem>
                                  ))}
                                </List>
                                
                                <Box sx={{ mt: 2 }}>
                                  <Button 
                                    variant="outlined" 
                                    size="small"
                                    onClick={() => {
                                      // Navigate to the appropriate page based on category
                                      if (category.id === 'savings') navigate('/goals');
                                      else if (category.id === 'debt') navigate('/transactions');
                                      else if (category.id === 'spending') navigate('/budgets');
                                      else if (category.id === 'growth') navigate('/analytics');
                                      else navigate('/dashboard');
                                    }}
                                  >
                                    Take Action
                                  </Button>
                                </Box>
                              </Box>
                            }
                            secondaryTypographyProps={{ component: 'div' }}
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" sx={{ my: 2 }} />
                      </React.Fragment>
                    );
                  })}
              </List>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/goals')}
                >
                  Create New Financial Goals
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        
        {/* History Tab */}
        <Box 
          role="tabpanel" 
          hidden={tabValue !== 3} 
          id="tabpanel-history" 
          sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}
        >
          {tabValue === 3 && (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Financial Health Score History
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Your financial health score is calculated monthly based on your financial activities and progress toward your goals.
              </Alert>
              
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {historyData.length > 0 ? (
                  <Box sx={{ width: '100%', maxWidth: 800, mt: 4, flexGrow: 1 }}>
                    {historyData.map((item, index) => {
                      // Ensure history score is a number
                      const historyScore = parseFloat(item.score);
                      
                      return (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">{item.month}</Typography>
                            <Typography 
                              variant="body2"
                              fontWeight="bold"
                              color={getScoreColor(historyScore)}
                            >
                              {historyScore.toFixed(1)} - {getScoreText(historyScore)}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={historyScore} 
                            sx={{ 
                              height: 10, 
                              borderRadius: 5,
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getScoreColor(historyScore)
                              }
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ mt: 4 }}>
                    No historical data available yet. Check back after your next financial health assessment.
                  </Alert>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default FinancialHealth;