import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  AccountCircle as AccountCircleIcon,
  PhotoCamera as PhotoCameraIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Language as WebsiteIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  
  // Profile state with default values
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    role: '',
    bio: '',
    jobTitle: '',
    department: '',
    location: '',
    phoneNumber: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      website: ''
    },
    joinDate: '',
    interests: [],
    avatar: null
  });

  // Fetch user data from auth/me endpoint
  const fetchUserData = async () => {
    setLoading(true);
    
    try {
      const response = await apiClient.get('/api/auth/me');
      
      if (response && response.data) {
        // Extract user data from response
        const userData = response.data;
        
        // Update profile data with user information
        setProfileData(prevData => ({
          ...prevData,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          username: userData.username || '',
          role: userData.role || 'User',
          // Use localStorage for preferences/profile data that isn't in the API
          bio: localStorage.getItem('userBio') || 'Financial analyst with a passion for data visualization and insights.',
          jobTitle: localStorage.getItem('userJobTitle') || 'Financial Analyst',
          department: localStorage.getItem('userDepartment') || 'Finance',
          location: localStorage.getItem('userLocation') || '',
          phoneNumber: localStorage.getItem('userPhoneNumber') || '',
          socialLinks: {
            linkedin: localStorage.getItem('userLinkedin') || '',
            twitter: localStorage.getItem('userTwitter') || '',
            website: localStorage.getItem('userWebsite') || ''
          },
          joinDate: userData.createdAt || new Date().toISOString().split('T')[0],
          interests: localStorage.getItem('userInterests') ? 
                     JSON.parse(localStorage.getItem('userInterests')) : 
                     ['Data Analytics', 'Financial Modeling'],
          avatar: localStorage.getItem('userAvatar') || null
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setErrorMessage('Could not fetch user data. Using default values instead.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    // Handle nested object properties like socialLinks
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create a FileReader to read the file
      const reader = new FileReader();
      
      // Define what happens on file load
      reader.onload = (e) => {
        // e.target.result contains the data URL which is a base64 encoded string
        setProfileData(prev => ({
          ...prev,
          avatar: e.target.result
        }));
      };
      
      // Read the file as a data URL
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // Since we don't have a profile API endpoint, we'll store in localStorage
      localStorage.setItem('userBio', profileData.bio);
      localStorage.setItem('userJobTitle', profileData.jobTitle);
      localStorage.setItem('userDepartment', profileData.department);
      localStorage.setItem('userLocation', profileData.location);
      localStorage.setItem('userPhoneNumber', profileData.phoneNumber);
      localStorage.setItem('userLinkedin', profileData.socialLinks.linkedin);
      localStorage.setItem('userTwitter', profileData.socialLinks.twitter);
      localStorage.setItem('userWebsite', profileData.socialLinks.website);
      localStorage.setItem('userInterests', JSON.stringify(profileData.interests));
      
      if (profileData.avatar) {
        localStorage.setItem('userAvatar', profileData.avatar);
      }
      
      // If an updateProfile function exists in the auth context, try to use it
      if (updateProfile) {
        try {
          await updateProfile({
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            email: profileData.email
          });
        } catch (contextError) {
          console.warn('Could not update profile in auth context:', contextError);
          // Continue anyway since we saved to localStorage
        }
      }
      
      setSuccessMessage('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrorMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData.username) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
              <Box sx={{ position: 'relative', mb: { xs: 2, md: 0 }, mr: { md: 4 } }}>
                <Avatar 
                  src={profileData.avatar} 
                  sx={{ width: 150, height: 150 }}
                >
                  {profileData.firstName && profileData.lastName ? 
                    `${profileData.firstName[0]}${profileData.lastName[0]}` : 
                    <AccountCircleIcon fontSize="large" />
                  }
                </Avatar>
                {editMode && (
                  <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="avatar-upload"
                      type="file"
                      onChange={handleAvatarChange}
                    />
                    <label htmlFor="avatar-upload">
                      <IconButton 
                        component="span" 
                        sx={{ 
                          backgroundColor: 'primary.main', 
                          color: 'white',
                          '&:hover': { backgroundColor: 'primary.dark' }
                        }}
                      >
                        <PhotoCameraIcon />
                      </IconButton>
                    </label>
                  </Box>
                )}
              </Box>
              
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h4">
                    {profileData.firstName} {profileData.lastName}
                  </Typography>
                  {!editMode ? (
                    <Tooltip title="Edit Profile">
                      <Button 
                        startIcon={<EditIcon />} 
                        variant="outlined" 
                        onClick={() => setEditMode(true)}
                      >
                        Edit
                      </Button>
                    </Tooltip>
                  ) : (
                    <Box>
                      <Button 
                        sx={{ mr: 1 }}
                        onClick={() => {
                          setEditMode(false);
                          fetchUserData(); // Reset data on cancel
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        startIcon={<SaveIcon />}
                        disabled={loading}
                      >
                        Save
                      </Button>
                    </Box>
                  )}
                </Box>
                
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  {profileData.jobTitle}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {profileData.bio}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profileData.interests.map((interest, index) => (
                    <Chip key={index} label={interest} size="small" />
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          {/* Profile Details */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Personal Information" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      value={profileData.location}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  {editMode && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        name="bio"
                        multiline
                        rows={4}
                        value={profileData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us a bit about yourself..."
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Work & Social Info */}
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Professional Information" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Job Title"
                      name="jobTitle"
                      value={profileData.jobTitle}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      name="department"
                      value={profileData.department}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Username"
                      name="username"
                      value={profileData.username}
                      disabled={true}
                      helperText="Username cannot be changed"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Role"
                      name="role"
                      value={profileData.role}
                      disabled={true}
                      helperText="Role is assigned by administrators"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Join Date"
                      name="joinDate"
                      value={profileData.joinDate}
                      disabled={true}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader title="Social Profiles" />
              <Divider />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <LinkedInIcon />
                    </ListItemIcon>
                    {!editMode ? (
                      <ListItemText 
                        primary="LinkedIn" 
                        secondary={profileData.socialLinks.linkedin || 'Not provided'} 
                      />
                    ) : (
                      <TextField
                        fullWidth
                        label="LinkedIn URL"
                        name="socialLinks.linkedin"
                        value={profileData.socialLinks.linkedin}
                        onChange={handleInputChange}
                      />
                    )}
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TwitterIcon />
                    </ListItemIcon>
                    {!editMode ? (
                      <ListItemText 
                        primary="Twitter" 
                        secondary={profileData.socialLinks.twitter || 'Not provided'} 
                      />
                    ) : (
                      <TextField
                        fullWidth
                        label="Twitter URL"
                        name="socialLinks.twitter"
                        value={profileData.socialLinks.twitter}
                        onChange={handleInputChange}
                      />
                    )}
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WebsiteIcon />
                    </ListItemIcon>
                    {!editMode ? (
                      <ListItemText 
                        primary="Website" 
                        secondary={profileData.socialLinks.website || 'Not provided'} 
                      />
                    ) : (
                      <TextField
                        fullWidth
                        label="Website URL"
                        name="socialLinks.website"
                        value={profileData.socialLinks.website}
                        onChange={handleInputChange}
                      />
                    )}
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default Profile;