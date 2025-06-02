// src/pages/ReportGenerator.js
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  PictureAsPdf as PdfIcon,
  TableChart as TableIcon,
  BarChart as ChartIcon,
  Email as EmailIcon,
  GetApp as DownloadIcon,
  Preview as PreviewIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { format, subMonths } from 'date-fns';
import apiClient, { reportsApi } from '../services/api';

const reportTypes = [
  { id: 'financial', name: 'Income & Expenses', icon: <TableIcon /> },
  { id: 'analytics', name: 'Budget Performance', icon: <ChartIcon /> },
  { id: 'net-worth', name: 'Net Worth Statement', icon: <TableIcon /> },
  { id: 'transaction-history', name: 'Transaction History', icon: <TableIcon /> },
  { id: 'tax-summary', name: 'Tax Summary', icon: <TableIcon /> },
  { id: 'savings-goals', name: 'Savings & Goals', icon: <ChartIcon /> }
];

const timeperiods = [
  { id: 'current-month', name: 'Current Month' },
  { id: 'previous-month', name: 'Previous Month' },
  { id: 'current-quarter', name: 'Current Quarter' },
  { id: 'current-year', name: 'Current Year' },
  { id: 'previous-year', name: 'Previous Year' },
  { id: 'ytd', name: 'Year to Date' },
  { id: 'custom', name: 'Custom Date Range' }
];

const exportFormats = [
  { id: 'pdf', name: 'PDF Document', icon: <PdfIcon /> },
  { id: 'excel', name: 'Excel Spreadsheet', icon: <TableIcon /> },
  { id: 'csv', name: 'CSV File', icon: <TableIcon /> }
];

const ReportGenerator = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [reportType, setReportType] = useState('');
  const [timePeriod, setTimePeriod] = useState('current-month');
  const [startDate, setStartDate] = useState(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeTransactions, setIncludeTransactions] = useState(true);
  const [reportTitle, setReportTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reportPreview, setReportPreview] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [generatedReportData, setGeneratedReportData] = useState(null);
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
  };
  
  const handleTimePeriodChange = (event) => {
    setTimePeriod(event.target.value);
  };
  
  const handleExportFormatChange = (event) => {
    setExportFormat(event.target.value);
  };
  
  const handleReportTitleChange = (event) => {
    setReportTitle(event.target.value);
  };
  
  const validateStep = () => {
    if (activeStep === 0 && !reportType) {
      setError('Please select a report type');
      return false;
    }
    
    if (activeStep === 1 && timePeriod === 'custom' && (!startDate || !endDate)) {
      setError('Please select both start and end dates');
      return false;
    }
    
    if (activeStep === 1 && timePeriod === 'custom' && startDate > endDate) {
      setError('End date must be after start date');
      return false;
    }
    
    if (activeStep === 2 && !exportFormat) {
      setError('Please select an export format');
      return false;
    }
    
    setError('');
    return true;
  };
  
  const handleStepAction = () => {
    if (!validateStep()) {
      return;
    }
    
    if (activeStep === 3) {
      generateReport();
    } else {
      handleNext();
    }
  };
  
  const createReportConfig = () => {
    // Create configuration parameters for the report
    const dateParams = {};
    if (timePeriod === 'custom') {
      dateParams.startDate = format(startDate, 'yyyy-MM-dd');
      dateParams.endDate = format(endDate, 'yyyy-MM-dd');
    } else {
      dateParams.timeframe = timePeriod;
    }
    
    return {
      name: reportTitle || `${reportTypes.find(t => t.id === reportType)?.name} Report`,
      description: `Report generated on ${format(new Date(), 'MMM d, yyyy')}`,
      type: reportType,
      isPublic: false,
      configuration: {
        timeframe: timePeriod,
        ...dateParams,
        includeCharts,
        includeSummary,
        includeTransactions,
        exportFormat
      }
    };
  };
  
  const generateReport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // First create a report in the database
      const reportConfig = createReportConfig();
      const createResponse = await apiClient.post('/api/reports', reportConfig);
      const createdReport = createResponse.data;
      setReportId(createdReport.id);
      
      // Next, generate the report data
      const generateResponse = await apiClient.post(`/api/reports/${createdReport.id}/generate`);
      const reportData = generateResponse.data;
      setGeneratedReportData(reportData);
      
      // Set report preview data
      setReportPreview({
        id: createdReport.id,
        type: reportTypes.find(t => t.id === reportType)?.name,
        timePeriod: timePeriod === 'custom' 
          ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}` 
          : timeperiods.find(t => t.id === timePeriod)?.name,
        format: exportFormats.find(f => f.id === exportFormat)?.name,
        title: createdReport.name,
        includeCharts,
        includeSummary,
        includeTransactions,
        data: reportData
      });
      
      setSuccess('Report generated successfully! You can now download or preview it.');
      setLoading(false);
    } catch (error) {
      console.error('Failed to generate report:', error);
      setError(`Failed to generate report: ${error.response?.data?.message || error.message}`);
      setLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!reportId) {
      setError('No report ID available for download');
      return;
    }
    
    // Open the report export endpoint in a new window/tab
    window.open(`${apiClient.defaults.baseURL}/api/reports/${reportId}/export?format=${exportFormat}`, '_blank');
    setSuccess('Report download started!');
  };
  
  const handlePreview = () => {
    if (!reportPreview) {
      setError('No report preview available');
      return;
    }
    
    // In a real application, you would open a modal or navigate to a preview page
    // For now, we'll just display the generated data more prominently
    alert('Report preview functionality would show a formatted version of the report.\n\nCurrently displaying raw data in the UI.');
  };
  
  const handleEmail = () => {
    // This would normally connect to an email sending API
    setSuccess('Email functionality would be implemented here. Report would be sent to your email.');
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const steps = ['Select Report Type', 'Choose Time Period', 'Format Options', 'Review & Generate'];
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Financial Report Generator
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          
          {/* Step 1: Select Report Type */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                What type of report would you like to generate?
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {reportTypes.map((type) => (
                  <Grid item xs={12} sm={6} md={4} key={type.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer', 
                        border: reportType === type.id ? '2px solid' : '1px solid',
                        borderColor: reportType === type.id ? 'primary.main' : 'divider',
                        height: '100%',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 2
                        }
                      }}
                      onClick={() => setReportType(type.id)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Radio
                            checked={reportType === type.id}
                            onChange={handleReportTypeChange}
                            value={type.id}
                            name="report-type-radio"
                          />
                          <Typography variant="h6" component="div">
                            {type.name}
                          </Typography>
                        </Box>
                        <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                          {type.icon}
                          <Typography variant="body2">
                            {type.id === 'financial' && 'Analyze your income and spending patterns'}
                            {type.id === 'analytics' && 'See how well you\'re sticking to your budgets'}
                            {type.id === 'net-worth' && 'Calculate your total assets and liabilities'}
                            {type.id === 'transaction-history' && 'View detailed transaction records'}
                            {type.id === 'tax-summary' && 'Categorized transactions for tax purposes'}
                            {type.id === 'savings-goals' && 'Track progress toward your financial goals'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {/* Step 2: Choose Time Period */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Select time period for your report
              </Typography>
              
              <FormControl component="fieldset" sx={{ width: '100%', maxWidth: 500, mb: 3 }}>
                <RadioGroup
                  value={timePeriod}
                  onChange={handleTimePeriodChange}
                >
                  {timeperiods.map((period) => (
                    <FormControlLabel 
                      key={period.id} 
                      value={period.id} 
                      control={<Radio />} 
                      label={period.name} 
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              
              {timePeriod === 'custom' && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={setStartDate}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={setEndDate}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      minDate={startDate}
                    />
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
          
          {/* Step 3: Format Options */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Report format and options
              </Typography>
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Export Format
                  </Typography>
                  
                  <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
                    <RadioGroup
                      value={exportFormat}
                      onChange={handleExportFormatChange}
                    >
                      {exportFormats.map((format) => (
                        <FormControlLabel 
                          key={format.id} 
                          value={format.id} 
                          control={<Radio />} 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {format.icon}
                              {format.name}
                            </Box>
                          }
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Report Title
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Custom Report Title (Optional)"
                    value={reportTitle}
                    onChange={handleReportTitleChange}
                    placeholder={`Financial Report - ${reportTypes.find(t => t.id === reportType)?.name || ''}`}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Include in Report
                  </Typography>
                  
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={includeCharts}
                          onChange={(e) => setIncludeCharts(e.target.checked)}
                        />
                      }
                      label="Charts and Visualizations"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={includeSummary}
                          onChange={(e) => setIncludeSummary(e.target.checked)}
                        />
                      }
                      label="Summary Statistics"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={includeTransactions}
                          onChange={(e) => setIncludeTransactions(e.target.checked)}
                        />
                      }
                      label="Detailed Transactions"
                    />
                  </FormGroup>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Step 4: Review & Generate */}
          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Review and Generate Report
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Report Type
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {reportTypes.find(t => t.id === reportType)?.name}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Time Period
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {timePeriod === 'custom' 
                        ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}` 
                        : timeperiods.find(t => t.id === timePeriod)?.name}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Export Format
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {exportFormats.find(f => f.id === exportFormat)?.name}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Report Title
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {reportTitle || `Financial Report - ${reportTypes.find(t => t.id === reportType)?.name}`}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Included Content
                    </Typography>
                    <Typography variant="body1">
                      {[
                        includeCharts && 'Charts and Visualizations',
                        includeSummary && 'Summary Statistics',
                        includeTransactions && 'Detailed Transactions'
                      ].filter(Boolean).join(', ')}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
              
              {reportPreview && (
                <Box sx={{ mb: 3 }}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Your report is ready!
                  </Alert>
                  
                  {/* Preview the report data */}
                  <Paper variant="outlined" sx={{ p: 2, mb: 3, maxHeight: 300, overflow: 'auto' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Report Preview
                    </Typography>
                    {reportPreview.data && (
                      <pre style={{ margin: 0, overflow: 'auto' }}>
                        {JSON.stringify(reportPreview.data, null, 2)}
                      </pre>
                    )}
                  </Paper>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownload}
                    >
                      Download
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<PreviewIcon />}
                      onClick={handlePreview}
                    >
                      Preview
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<EmailIcon />}
                      onClick={handleEmail}
                    >
                      Email
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      onClick={handlePrint}
                    >
                      Print
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleStepAction}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : activeStep === steps.length - 1 ? (
                'Generate Report'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default ReportGenerator;