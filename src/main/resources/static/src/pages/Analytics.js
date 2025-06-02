import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  TextField,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Sector
} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { getAnalyticsData } from '../services/analyticsService';

// Constants
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chart-tabpanel-${index}`}
      aria-labelledby={`chart-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Custom rendering for pie chart labels
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 0.8;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#333"
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
    >
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Analytics = () => {
  const [filterOptions, setFilterOptions] = useState({
    analysisType: 'expenses',
    timeRange: 'month',
    startDate: null,
    endDate: null
  });
  const [customRange, setCustomRange] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    savingsRate: 0,
    averageTransaction: 0,
    largestTransaction: 0,
    smallestTransaction: 0,
    topCategory: 'None'
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [chartTab, setChartTab] = useState(0);

  useEffect(() => {
    if (filterOptions.timeRange === 'custom') {
      setCustomRange(true);
      
      // Set default dates if none selected
      setFilterOptions(prev => {
        const updates = {};
        if (!prev.startDate) {
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          updates.startDate = sixMonthsAgo;
        }
        if (!prev.endDate) {
          updates.endDate = new Date();
        }
        return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
      });
    } else {
      setCustomRange(false);
    }
  }, [filterOptions.timeRange]);

  // Force re-render when the data changes
  useEffect(() => {
    // This will force a re-render of the charts when data changes
    if (dataLoaded) {
      setChartTab(prevTab => prevTab);
    }
  }, [pieData, barData, lineData, dataLoaded]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilterOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, date) => {
    setFilterOptions(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleChartTabChange = (event, newValue) => {
    setChartTab(newValue);
  };

  const getTopCategory = () => {
    if (!pieData || pieData.length === 0) return 'None';
    
    // Sort by value and return the top category
    const sortedData = [...pieData].sort((a, b) => b.value - a.value);
    return sortedData[0]?.name || 'None';
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get the data
      const result = await getAnalyticsData(
        filterOptions.analysisType,
        filterOptions.timeRange,
        filterOptions.startDate,
        filterOptions.endDate
      );
      
      console.log('Analysis result:', result);
      console.log('DATA BEING DISPLAYED IN UI:');
      console.log('Summary data:', JSON.stringify(result.summary, null, 2));
      console.log('Pie chart data:', JSON.stringify(result.pieData, null, 2));
      console.log('Bar chart data:', JSON.stringify(result.barData, null, 2));
      console.log('Line chart data:', JSON.stringify(result.lineData, null, 2));
      
      // Make sure all data is properly set with defaults if empty
      setPieData(result.pieData || []);
      setBarData(result.barData || []);
      setLineData(result.lineData || []);
      setSummary(result.summary || {
        totalTransactions: 0,
        totalAmount: 0,
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        savingsRate: 0,
        averageTransaction: 0,
        largestTransaction: 0,
        smallestTransaction: 0,
        topCategory: 'None'
      });
      
      setDataLoaded(true);
    } catch (err) {
      setError('Failed to run analysis. Please try again.');
      console.error('Analysis error:', err);
      // Set default values in case of error
      setPieData([]);
      setBarData([]);
      setLineData([]);
      setSummary({
        totalTransactions: 0,
        totalAmount: 0,
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        savingsRate: 0,
        averageTransaction: 0,
        largestTransaction: 0,
        smallestTransaction: 0,
        topCategory: 'None'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run initial analysis when component mounts
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadChart = (chartType) => {
    // This would typically trigger a download of chart data
    // For development mode, we'll just show an alert
    alert(`Downloading ${chartType} chart data as CSV`);
  };

  // Helper functions to safely format numbers
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "$0.00";
    return `$${parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null) return "0";
    return parseFloat(value).toLocaleString();
  };

  // Helper to check if we have data to display
  const hasChartData = (
    (pieData && pieData.length > 0) || 
    (barData && barData.length > 0) || 
    (lineData && lineData.length > 0)
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Financial Analytics
        </Typography>
        
        {/* Filters section */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Analysis Type</InputLabel>
                <Select
                  name="analysisType"
                  value={filterOptions.analysisType}
                  label="Analysis Type"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="expenses">Expense Analysis</MenuItem>
                  <MenuItem value="income">Income Analysis</MenuItem>
                  <MenuItem value="comparison">Income vs Expenses</MenuItem>
                  <MenuItem value="trends">Trends Analysis</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Time Range</InputLabel>
                <Select
                  name="timeRange"
                  value={filterOptions.timeRange}
                  label="Time Range"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="week">Last Week</MenuItem>
                  <MenuItem value="month">Last Month</MenuItem>
                  <MenuItem value="year">Last Year</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={runAnalysis}
                disabled={loading}
                sx={{ height: '56px' }}
                startIcon={loading ? <CircularProgress size={24} /> : <RefreshIcon />}
              >
                {loading ? 'Analyzing...' : 'Run Analysis'}
              </Button>
            </Grid>
            
            {customRange && (
              <>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={filterOptions.startDate}
                    onChange={(newValue) => handleDateChange('startDate', newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={filterOptions.endDate}
                    onChange={(newValue) => handleDateChange('endDate', newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Analytics content based on selected type */}
        {dataLoaded ? (
          <>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" color="textSecondary">
                    {filterOptions.analysisType === 'expenses' ? 'Total Expenses' : 
                     filterOptions.analysisType === 'income' ? 'Total Income' : 
                     filterOptions.analysisType === 'comparison' ? 'Net Balance' : 'Total Amount'}
                  </Typography>
                  <Typography variant="h4">
                    {filterOptions.analysisType === 'expenses' ? formatCurrency(Math.abs(summary?.totalExpenses)) : 
                     filterOptions.analysisType === 'income' ? formatCurrency(summary?.totalIncome) : 
                     filterOptions.analysisType === 'comparison' ? formatCurrency(summary?.balance) : 
                     formatCurrency(summary?.totalAmount)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" color="textSecondary">
                    Total Transactions
                  </Typography>
                  <Typography variant="h4">
                    {formatNumber(summary?.totalTransactions)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" color="textSecondary">
                    Top Category
                  </Typography>
                  <Typography variant="h4">
                    {summary?.topCategory || getTopCategory()}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Chart Tabs */}
            <Paper sx={{ width: '100%', mb: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={chartTab} 
                  onChange={handleChartTabChange} 
                  aria-label="chart tabs"
                  variant="fullWidth"
                >
                  <Tab icon={<PieChartIcon />} label="DISTRIBUTION" />
                  <Tab icon={<BarChartIcon />} label="COMPARISON" />
                  <Tab icon={<ShowChartIcon />} label="TRENDS" />
                </Tabs>
              </Box>
              
              {/* Distribution Chart (Pie) */}
              <TabPanel value={chartTab} index={0}>
                <Box sx={{ position: 'relative' }}>
                  <Box sx={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}>
                    <Tooltip title="Download data">
                      <IconButton onClick={() => downloadChart('distribution')}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="h6" align="center" gutterBottom>
                    {filterOptions.analysisType === 'expenses' ? 'Expense Distribution by Category' : 
                     filterOptions.analysisType === 'income' ? 'Income Distribution by Source' :
                     filterOptions.analysisType === 'comparison' ? 'Income vs Expenses Distribution' :
                     'Trend Distribution'}
                  </Typography>
                  <Box sx={{ height: 400, display: 'flex', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        {pieData && pieData.length > 0 ? (
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={renderCustomizedLabel}
                            isAnimationActive={true}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                        ) : (
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                            No data available
                          </text>
                        )}
                        <RechartsTooltip formatter={(value) => `${value}%`} />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </TabPanel>
              
              {/* Comparison Chart (Bar) */}
              <TabPanel value={chartTab} index={1}>
                <Box sx={{ position: 'relative' }}>
                  <Box sx={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}>
                    <Tooltip title="Download data">
                      <IconButton onClick={() => downloadChart('comparison')}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="h6" align="center" gutterBottom>
                    {filterOptions.analysisType === 'comparison' ? 'Income vs Expenses by Period' : 
                     `${filterOptions.analysisType.charAt(0).toUpperCase() + filterOptions.analysisType.slice(1)} by Period`}
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip formatter={(value) => `$${value ? value.toLocaleString() : 0}`} />
                        <Legend />
                        {filterOptions.analysisType === 'comparison' ? (
                          <>
                            <Bar dataKey="income" name="Income" fill="#4caf50" />
                            <Bar dataKey="expenses" name="Expenses" fill="#f44336" />
                          </>
                        ) : (
                          <Bar 
                            dataKey="value" 
                            name={filterOptions.analysisType.charAt(0).toUpperCase() + filterOptions.analysisType.slice(1)} 
                            fill="#2196f3" 
                          />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </TabPanel>
              
              {/* Trends Chart (Line) */}
              <TabPanel value={chartTab} index={2}>
                <Box sx={{ position: 'relative' }}>
                  <Box sx={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}>
                    <Tooltip title="Download data">
                      <IconButton onClick={() => downloadChart('trends')}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="h6" align="center" gutterBottom>
                    {filterOptions.analysisType === 'comparison' ? 'Income and Expense Trends Over Time' : 
                     `${filterOptions.analysisType.charAt(0).toUpperCase() + filterOptions.analysisType.slice(1)} Trends Over Time`}
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={lineData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(tick) => {
                            try {
                              if (!tick) return '';
                              if (tick.startsWith('2025-W')) {
                                // Handle week format (e.g., 2025-W13)
                                const weekNum = tick.split('-W')[1];
                                return `Week ${weekNum}`;
                              }
                              const date = new Date(tick);
                              if (isNaN(date.getTime())) return tick;
                              return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(-2)}`;
                           } catch (e) {
                             return tick || '';
                           }
                         }}
                       />
                       <YAxis />
                       <RechartsTooltip 
                         formatter={(value) => `$${value ? value.toLocaleString() : 0}`}
                         labelFormatter={(label) => {
                           try {
                             if (!label) return '';
                             if (label.startsWith('2025-W')) {
                               // Handle week format (e.g., 2025-W13)
                               const weekNum = label.split('-W')[1];
                               return `Week ${weekNum}, 2025`;
                             }
                             const date = new Date(label);
                             if (isNaN(date.getTime())) return label;
                             return date.toLocaleDateString();
                           } catch (e) {
                             return label || '';
                           }
                         }}
                       />
                       <Legend />
                       {filterOptions.analysisType === 'comparison' ? (
                         <>
                           <Line 
                             type="monotone" 
                             dataKey="income" 
                             name="Income"
                             stroke="#4caf50" 
                             activeDot={{ r: 8 }} 
                           />
                           <Line 
                             type="monotone" 
                             dataKey="expenses" 
                             name="Expenses"
                             stroke="#f44336" 
                             activeDot={{ r: 8 }} 
                           />
                         </>
                       ) : (
                         <Line 
                           type="monotone" 
                           dataKey="amount" 
                           name={filterOptions.analysisType.charAt(0).toUpperCase() + filterOptions.analysisType.slice(1)} 
                           stroke="#2196f3" 
                           activeDot={{ r: 8 }} 
                         />
                       )}
                     </LineChart>
                   </ResponsiveContainer>
                 </Box>
               </Box>
             </TabPanel>
           </Paper>
           
           {/* Additional Analysis Cards */}
           <Grid container spacing={3}>
             <Grid item xs={12} md={6}>
               <Card>
                 <CardHeader title="Transaction Statistics" />
                 <Divider />
                 <CardContent>
                   <Grid container spacing={2}>
                     <Grid item xs={6}>
                       <Typography variant="subtitle1" color="textSecondary">Average Transaction</Typography>
                       <Typography variant="h6">{formatCurrency(summary?.averageTransaction)}</Typography>
                     </Grid>
                     <Grid item xs={6}>
                       <Typography variant="subtitle1" color="textSecondary">Largest Transaction</Typography>
                       <Typography variant="h6">{formatCurrency(summary?.largestTransaction)}</Typography>
                     </Grid>
                     <Grid item xs={6}>
                       <Typography variant="subtitle1" color="textSecondary">Smallest Transaction</Typography>
                       <Typography variant="h6">{formatCurrency(summary?.smallestTransaction)}</Typography>
                     </Grid>
                     {summary?.savingsRate !== undefined && (
                       <Grid item xs={6}>
                         <Typography variant="subtitle1" color="textSecondary">Savings Rate</Typography>
                         <Typography variant="h6">{summary?.savingsRate?.toFixed(2)}%</Typography>
                       </Grid>
                     )}
                   </Grid>
                 </CardContent>
               </Card>
             </Grid>
             
             <Grid item xs={12} md={6}>
               <Card>
                 <CardHeader title="Insights" />
                 <Divider />
                 <CardContent>
                   <Typography variant="body1" paragraph>
                     {filterOptions.analysisType === 'expenses' ? 
                       `Your highest expense category is ${summary?.topCategory || getTopCategory()}, accounting for ${(pieData && pieData.length > 0 && pieData[0].value) || 0}% of your total expenses.` :
                      filterOptions.analysisType === 'income' ? 
                       `Your primary income source is ${summary?.topCategory || getTopCategory()}, representing ${(pieData && pieData.length > 0 && pieData[0].value) || 0}% of your total income.` :
                      filterOptions.analysisType === 'comparison' ? 
                       `Your savings rate is ${summary?.savingsRate?.toFixed(2) || 0}% of your income. Income represents ${(pieData && pieData.length > 0 && pieData[0].value) || 0}% of your financial activity, while expenses account for ${(pieData && pieData.length > 1 && pieData[1].value) || 0}%.` :
                       `Your financial trends show an overall balance of ${formatCurrency(summary?.balance)} over the analyzed time period.`}
                   </Typography>
                   <Typography variant="body1">
                     {filterOptions.timeRange === 'week' ? 
                       'This weekly analysis shows your most recent financial patterns.' :
                      filterOptions.timeRange === 'month' ? 
                       'This monthly view helps identify your regular spending and income patterns.' :
                      filterOptions.timeRange === 'year' ? 
                       'This annual perspective shows longer-term trends in your finances.' :
                       'This custom date range gives you a focused view of your selected time period.'}
                   </Typography>
                 </CardContent>
               </Card>
             </Grid>
           </Grid>
         </>
       ) : (
         <Paper sx={{ p: 4, textAlign: 'center' }}>
           {loading ? (
             <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <CircularProgress sx={{ mb: 2 }} />
               <Typography variant="h6">Analyzing your financial data...</Typography>
               <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                 This may take a few moments while we crunch the numbers.
               </Typography>
             </Box>
           ) : (
             <>
               <Typography variant="h6" gutterBottom>
                 Select your analysis criteria and click "Run Analysis" to view financial insights
               </Typography>
               <Typography variant="body1" color="textSecondary">
                 You'll be able to see category breakdowns, monthly comparisons, and financial trends based on your selection.
               </Typography>
             </>
           )}
         </Paper>
       )}
     </Box>
   </LocalizationProvider>
 );
};

export default Analytics;