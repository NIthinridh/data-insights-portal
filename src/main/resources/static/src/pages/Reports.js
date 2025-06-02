import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Download as DownloadIcon, 
  Visibility as PreviewIcon,
  Share as ShareIcon,
  Assignment as AssignmentIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import apiClient from '../services/api';

// Sample data for reports - used as fallback if API fails
const sampleReports = [
  {
    id: 1,
    name: 'Monthly Expense Summary',
    description: 'Summary of all expenses categorized by month',
    type: 'financial',
    created_at: '2023-07-15',
    is_public: false
  },
  {
    id: 2,
    name: 'Annual Income Report',
    description: 'Detailed breakdown of all income sources for the year',
    type: 'financial',
    created_at: '2023-07-10',
    is_public: true
  },
  {
    id: 3,
    name: 'Category Analysis',
    description: 'Analysis of spending patterns by category',
    type: 'analytics',
    created_at: '2023-07-05',
    is_public: false
  },
  {
    id: 4,
    name: 'Budget Comparison',
    description: 'Comparison of actual spending vs. budgeted amounts',
    type: 'financial',
    created_at: '2023-06-22',
    is_public: true
  },
  {
    id: 5,
    name: 'Trend Analysis',
    description: 'Analysis of financial trends over the past year',
    type: 'analytics',
    created_at: '2023-06-28',
    is_public: false
  }
];

// Sample data for saved templates
const sampleTemplates = [
  {
    id: 101,
    name: 'Monthly Budget Template',
    description: 'Template for tracking monthly budget vs actual spending',
    type: 'template',
    created_at: '2023-07-10'
  },
  {
    id: 102,
    name: 'Expense Breakdown Template',
    description: 'Template for categorizing expenses',
    type: 'template',
    created_at: '2023-07-05'
  }
];

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
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

const Reports = () => {
  const [tabValue, setTabValue] = useState(0);
  const [reports, setReports] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [reportData, setReportData] = useState({
    name: '',
    description: '',
    type: 'financial',
    is_public: false
  });
  const [editingReport, setEditingReport] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewReportId, setPreviewReportId] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [createFromTemplate, setCreateFromTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch reports from the real API
        const response = await apiClient.get('/api/reports');
        setReports(response.data);
        
        // Fetch templates (reports with type 'template')
        try {
          const templatesResponse = await apiClient.get('/api/reports?type=template');
          setTemplates(templatesResponse.data);
        } catch (templateError) {
          console.error('Failed to fetch templates:', templateError);
          setTemplates([]); // Set empty array if we can't fetch templates
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to fetch reports. ' + (err.response?.data || err.message));
        
        // Fallback to sample data in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Using sample data as fallback');
          setReports(sampleReports);
          setTemplates(sampleTemplates);
        }
        
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (report = null) => {
    if (report) {
      setEditingReport(report);
      setReportData({
        name: report.name,
        description: report.description,
        type: report.type,
        is_public: report.is_public || false
      });
      setCreateFromTemplate(false);
    } else {
      setEditingReport(null);
      setReportData({
        name: '',
        description: '',
        type: 'financial',
        is_public: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCreateFromTemplate(false);
    setSelectedTemplate(null);
  };

  const handleReportDataChange = (event) => {
    const { name, value, checked } = event.target;
    setReportData(prev => ({
      ...prev,
      [name]: name === 'is_public' ? checked : value
    }));
  };

  const handleCreateReport = () => {
    setCreateFromTemplate(false);
    setSelectedTemplate(null);
    setReportData({
      name: '',
      description: '',
      type: 'financial',
      is_public: false
    });
    setOpenDialog(true);
  };

  const handleCreateFromTemplate = (template) => {
    setSelectedTemplate(template);
    setReportData({
      name: `${template.name} Copy`,
      description: template.description,
      type: 'financial',
      is_public: false
    });
    setCreateFromTemplate(true);
    setOpenDialog(true);
  };

  const handleCreateOrUpdateReport = async () => {
    if (!reportData.name) {
      return; // Validation failed
    }

    try {
      // Start loading
      setLoading(true);
      
      if (editingReport) {
        // Update existing report
        const response = await apiClient.put(`/api/reports/${editingReport.id}`, reportData);
        setReports(reports.map(report => 
          report.id === editingReport.id ? response.data : report
        ));
      } else {
        // Create new report
        const response = await apiClient.post('/api/reports', reportData);
        setReports([...reports, response.data]);
      }

      handleCloseDialog();
      setLoading(false);
    } catch (err) {
      console.error('Error saving report:', err);
      setError('Failed to save report: ' + (err.response?.data || err.message));
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        setLoading(true);
        
        await apiClient.delete(`/api/reports/${id}`);
        setReports(reports.filter(report => report.id !== id));
        
        setLoading(false);
      } catch (err) {
        console.error('Error deleting report:', err);
        setError('Failed to delete report: ' + (err.response?.data || err.message));
        setLoading(false);
      }
    }
  };

  const handleDownloadReport = (id, format = 'pdf') => {
    // Open in a new window/tab to trigger download
    window.open(`${apiClient.defaults.baseURL}/api/reports/${id}/export?format=${format}`, '_blank');
  };

  const handlePreviewReport = async (id) => {
    try {
      setLoading(true);
      
      // Get report data for preview
      const response = await apiClient.post(`/api/reports/${id}/generate`);
      
      // Find the report to get metadata
      const reportInfo = reports.find(r => r.id === id) || 
                         templates.find(t => t.id === id);
      
      if (reportInfo) {
        // Store preview data
        setPreviewData(response.data);
        setPreviewReportId(id);
        setPreviewOpen(true);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error generating report preview:', err);
      setError('Failed to preview report: ' + (err.response?.data || err.message));
      setLoading(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewReportId(null);
    setPreviewData(null);
  };

  const handleTogglePublic = async (report) => {
    try {
      setLoading(true);
      
      // Create updated report data
      const updatedReportData = {
        name: report.name,
        description: report.description,
        type: report.type,
        is_public: !report.is_public
      };
      
      // Update on server
      const response = await apiClient.put(`/api/reports/${report.id}`, updatedReportData);
      
      // Update local state
      setReports(reports.map(r => r.id === report.id ? response.data : r));
      
      setLoading(false);
    } catch (err) {
      console.error('Error updating report visibility:', err);
      setError('Failed to update report visibility: ' + (err.response?.data || err.message));
      setLoading(false);
    }
  };

  const renderReportTable = (items) => (
    <TableContainer component={Paper}>
      <Table aria-label="reports table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">No reports found</TableCell>
            </TableRow>
          ) : (
            items.map((report) => (
              <TableRow key={report.id} hover>
                <TableCell component="th" scope="row">
                  {report.name}
                </TableCell>
                <TableCell>{report.description}</TableCell>
                <TableCell>
                  <Chip 
                    label={report.type.charAt(0).toUpperCase() + report.type.slice(1)} 
                    color={
                      report.type === 'financial' ? 'primary' : 
                      report.type === 'analytics' ? 'secondary' : 
                      'default'
                    } 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  {report.createdAt ? 
                    new Date(report.createdAt).toLocaleDateString() : 
                    report.created_at ? 
                      new Date(report.created_at).toLocaleDateString() : 
                      'Unknown'}
                </TableCell>
                <TableCell align="center">
                  {(report.hasOwnProperty('isPublic') || report.hasOwnProperty('is_public')) && (
                    <Chip 
                      label={(report.isPublic || report.is_public) ? 'Public' : 'Private'} 
                      color={(report.isPublic || report.is_public) ? 'success' : 'default'} 
                      size="small" 
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Preview">
                    <IconButton size="small" aria-label="preview" onClick={() => handlePreviewReport(report.id)}>
                      <PreviewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download PDF">
                    <IconButton size="small" aria-label="download" onClick={() => handleDownloadReport(report.id, 'pdf')}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" aria-label="edit" onClick={() => handleOpenDialog(report)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" aria-label="delete" onClick={() => handleDeleteReport(report.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  {(report.hasOwnProperty('isPublic') || report.hasOwnProperty('is_public')) && (
                    <Tooltip title={(report.isPublic || report.is_public) ? 'Make Private' : 'Make Public'}>
                      <IconButton 
                        size="small" 
                        aria-label="share" 
                        onClick={() => handleTogglePublic(report)}
                      >
                        <ShareIcon color={(report.isPublic || report.is_public) ? 'primary' : 'action'} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {tabValue === 1 && (
                    <Tooltip title="Create Report from Template">
                      <IconButton 
                        size="small" 
                        aria-label="use template" 
                        onClick={() => handleCreateFromTemplate(report)}
                      >
                        <AssignmentIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderReportPreview = () => {
    // Find the report info
    const report = reports.find(r => r.id === previewReportId) || 
                  templates.find(t => t.id === previewReportId);
    
    if (!report) return null;

    return (
      <Dialog 
        open={previewOpen} 
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Report Preview: {report.name}
          <IconButton
            aria-label="close"
            onClick={handleClosePreview}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>{report.name}</Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Created on {report.createdAt ? 
                new Date(report.createdAt).toLocaleDateString() : 
                report.created_at ? 
                  new Date(report.created_at).toLocaleDateString() : 
                  'Unknown date'}
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>Description</Typography>
            <Typography variant="body1" paragraph>{report.description}</Typography>
            
            <Typography variant="h6" gutterBottom>Report Content</Typography>
            
            {!previewData ? (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {previewData.type === 'financial' ? (
                  <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>Financial Summary</Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Category</TableCell>
                              <TableCell align="right">Amount</TableCell>
                              <TableCell align="right">Percentage</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {previewData.categories && previewData.categories.map((category, index) => (
                              <TableRow key={index}>
                                <TableCell>{category.name}</TableCell>
                                <TableCell align="right">${category.amount.toFixed(2)}</TableCell>
                                <TableCell align="right">{category.percentage}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>Summary</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">Total Income:</Typography>
                            <Typography variant="body1">${previewData.totalIncome?.toFixed(2) || '0.00'}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">Total Expenses:</Typography>
                            <Typography variant="body1">${previewData.totalExpenses?.toFixed(2) || '0.00'}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">Net Savings:</Typography>
                            <Typography variant="body1">${previewData.netSavings?.toFixed(2) || '0.00'}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">Savings Rate:</Typography>
                            <Typography variant="body1">{previewData.savingsRate?.toFixed(1) || '0'}%</Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  </Grid>
                ) : (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body1" paragraph>
                      {previewData.type === 'analytics' && previewData.insights ? (
                        <>
                          <Typography variant="h6" gutterBottom>Key Insights:</Typography>
                          <ul>
                            {previewData.insights.map((insight, index) => (
                              <li key={index}>{insight}</li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <Typography>No preview data available for this report type.</Typography>
                      )}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Close</Button>
          <Button 
            onClick={() => handleDownloadReport(report.id)} 
            variant="contained" 
            startIcon={<DownloadIcon />}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Reports
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateReport}
        >
          Create Report
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="My Reports" />
          <Tab label="Report Templates" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : reports.length > 0 ? (
            renderReportTable(reports)
          ) : (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body1" color="textSecondary">
                No reports found. Create your first report!
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                onClick={handleCreateReport}
                sx={{ mt: 2 }}
              >
                Create Report
              </Button>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : templates.length > 0 ? (
            renderReportTable(templates)
          ) : (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body1" color="textSecondary">
                No report templates found.
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Paper>

      {/* Create/Edit Report Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {editingReport ? 'Edit Report' : createFromTemplate ? 'Create Report from Template' : 'Create New Report'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                required
                fullWidth
                id="name"
                name="name"
                label="Report Name"
                variant="outlined"
                value={reportData.name}
                onChange={handleReportDataChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                variant="outlined"
                multiline
                rows={3}
                value={reportData.description}
                onChange={handleReportDataChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  name="type"
                  value={reportData.type}
                  label="Report Type"
                  onChange={handleReportDataChange}
                >
                  <MenuItem value="financial">Financial</MenuItem>
                  <MenuItem value="analytics">Analytics</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={reportData.is_public}
                    onChange={handleReportDataChange}
                    name="is_public"
                    color="primary"
                  />
                }
                label="Make Report Public"
              />
            </Grid>
            
            {createFromTemplate && selectedTemplate && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  Creating from template: <strong>{selectedTemplate.name}</strong>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>Cancel</Button>
          <Button 
            onClick={handleCreateOrUpdateReport} 
            variant="contained" 
            startIcon={<SaveIcon />}
          >
            {editingReport ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Preview Dialog */}
      {renderReportPreview()}
    </Box>
  );
};

export default Reports;