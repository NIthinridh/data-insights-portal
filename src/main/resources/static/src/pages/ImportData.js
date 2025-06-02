import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HistoryIcon from '@mui/icons-material/History';
import { uploadFile, getImportHistory } from '../services/importService';

const steps = ['Select File', 'Configure Import', 'Review'];

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`import-tabpanel-${index}`}
      aria-labelledby={`import-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Helper function to safely capitalize strings
const safeCapitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const ImportData = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileCategory, setFileCategory] = useState('');
  const [importType, setImportType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const fileInputRef = useRef(null);
  const [tabValue, setTabValue] = useState(0);
  const [importHistory, setImportHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    // Load import history when on history tab
    if (tabValue === 1) {
      fetchImportHistory();
    }
  }, [tabValue]);

  const fetchImportHistory = async () => {
    try {
      setHistoryLoading(true);
      const history = await getImportHistory();
      setImportHistory(history || []);
    } catch (err) {
      console.error('Failed to fetch import history:', err);
      setImportHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File is too large. Maximum size is 10MB.');
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
      
      // Read file preview
      readFilePreview(selectedFile);
    }
  };

  const readFilePreview = (file) => {
    // Only process CSV or Excel files
    if (file.type === 'text/csv' || 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel') {
      
      // For demonstration - generate more realistic mock data
      const categories = ['Housing', 'Food', 'Transportation', 'Utilities', 'Entertainment', 'Healthcare', 'Education'];
      const mockData = [];
      
      // Generate 5 random transactions
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        mockData.push({
          date: date.toISOString().split('T')[0],
          amount: +(Math.random() * 1000).toFixed(2),
          category: categories[Math.floor(Math.random() * categories.length)],
          description: `Transaction ${i + 1} from imported file`
        });
      }
      
      setPreviewData(mockData);
    } else {
      setError('Unsupported file format. Please select a CSV or Excel file.');
      setFile(null);
      setFileName('');
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !file) {
      setError('Please select a file to import');
      return;
    }
    
    if (activeStep === 1 && (!fileCategory || !importType)) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (activeStep === steps.length - 1) {
      handleImport();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError('');
    setSuccess('');
  };

  const handleImport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const options = {
        category: fileCategory,
        importType,
        description
      };
      
      // Use the import service
      const response = await uploadFile(file, options);
      
      setSuccess(`File uploaded successfully! Import job #${response.importId || response.id || 'New'} has been created.`);
      
      // Reset form after successful import
      setTimeout(() => {
        setActiveStep(0);
        setFile(null);
        setFileName('');
        setFileCategory('');
        setImportType('');
        setDescription('');
        setPreviewData([]);
        setSuccess('');
        
        // Refresh import history if we're going to show it
        fetchImportHistory();
        
        // Switch to history tab
        setTabValue(1);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <input
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
              id="contained-button-file"
              multiple={false}
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <label htmlFor="contained-button-file">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                Select File
              </Button>
            </label>
            {fileName && (
              <Typography variant="body1" sx={{ mt: 2 }}>
                Selected file: {fileName}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              Supported file formats: CSV, Excel (XLSX, XLS)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Maximum file size: 10MB
            </Typography>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="category-label">Data Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    value={fileCategory}
                    label="Data Category"
                    onChange={(e) => setFileCategory(e.target.value)}
                  >
                    <MenuItem value="income">Income</MenuItem>
                    <MenuItem value="expense">Expense</MenuItem>
                    <MenuItem value="investment">Investment</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="import-type-label">Import Type</InputLabel>
                  <Select
                    labelId="import-type-label"
                    id="importType"
                    value={importType}
                    label="Import Type"
                    onChange={(e) => setImportType(e.target.value)}
                  >
                    <MenuItem value="append">Append to existing data</MenuItem>
                    <MenuItem value="replace">Replace existing data</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  label="Description (Optional)"
                  variant="outlined"
                  multiline
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description to help identify this import later"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Import Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4} sx={{ fontWeight: 'bold' }}>File:</Grid>
              <Grid item xs={8}>{fileName}</Grid>
              
              <Grid item xs={4} sx={{ fontWeight: 'bold' }}>Category:</Grid>
              <Grid item xs={8}>
                <Chip 
                  label={safeCapitalize(fileCategory)} 
                  color={
                    fileCategory === 'income' ? 'success' : 
                    fileCategory === 'expense' ? 'error' : 
                    fileCategory === 'investment' ? 'primary' : 'default'
                  }
                  size="small"
                />
              </Grid>
              
              <Grid item xs={4} sx={{ fontWeight: 'bold' }}>Import Type:</Grid>
              <Grid item xs={8}>
                <Chip 
                  label={safeCapitalize(importType)} 
                  color={importType === 'append' ? 'info' : 'warning'}
                  size="small"
                />
              </Grid>
              
              {description && (
                <>
                  <Grid item xs={4} sx={{ fontWeight: 'bold' }}>Description:</Grid>
                  <Grid item xs={8}>{description}</Grid>
                </>
              )}
            </Grid>
            
            {previewData.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Data Preview ({previewData.length} records)
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, maxHeight: 300 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell align="right">${item.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              Click 'Import' to start processing your file. This may take a few moments depending on the file size.
            </Typography>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  const renderImportHistory = () => {
    if (historyLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!importHistory || importHistory.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No import history found. Import your first file to see it here.
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>File Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Records</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {importHistory.map((item, index) => (
              <TableRow key={item?.id || index}>
                <TableCell>{item?.id || 'N/A'}</TableCell>
                <TableCell>{item?.fileName || 'Unknown'}</TableCell>
                <TableCell>
                  {item?.category ? (
                    <Chip 
                      label={safeCapitalize(item.category)} 
                      color={
                        item.category === 'income' ? 'success' : 
                        item.category === 'expense' ? 'error' : 
                        item.category === 'investment' ? 'primary' : 'default'
                      }
                      size="small"
                    />
                  ) : (
                    <Chip label="Unknown" size="small" />
                  )}
                </TableCell>
                <TableCell>{safeCapitalize(item?.importType || '')}</TableCell>
                <TableCell>
                  {item?.status ? (
                    <Chip 
                      label={safeCapitalize(item.status)} 
                      color={
                        item.status === 'completed' ? 'success' : 
                        item.status === 'processing' ? 'warning' : 
                        item.status === 'failed' ? 'error' : 'default'
                      }
                      size="small"
                    />
                  ) : (
                    <Chip label="Unknown" size="small" />
                  )}
                </TableCell>
                <TableCell>{item?.recordCount || 0}</TableCell>
                <TableCell>
                  {item?.createdAt ? 
                    new Date(item.createdAt).toLocaleString() : 
                    'Unknown'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Financial Data Import
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="import tabs">
          <Tab label="New Import" icon={<CloudUploadIcon />} iconPosition="start" />
          <Tab label="Import History" icon={<HistoryIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Paper elevation={3}>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 2, px: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {error && (
            <Alert severity="error" sx={{ mx: 3, mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mx: 3, mb: 2 }}>
              {success}
            </Alert>
          )}
          
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 3 }}>
            <Button
              variant="outlined"
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              endIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {activeStep === steps.length - 1 ? 'Import' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <Paper elevation={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Import History
            </Typography>
            {renderImportHistory()}
          </Box>
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default ImportData;