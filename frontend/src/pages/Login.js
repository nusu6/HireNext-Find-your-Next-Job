import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert, 
  CircularProgress,
  InputAdornment,
  IconButton,
  Link as MuiLink
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
// Import your Firebase client app initialization instance
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; 

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault(); // Prevents focus loss when clicking the icon
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic client validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      // Get the Firebase auth client instance
      const auth = getAuth();
      
      // Sign in the user directly via Firebase client SDK
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Redirect user straight to their dynamic dashboard page on success
      navigate('/dashboard');
    } catch (err) {
      console.error('Firebase authentication crash:', err);
      
      // User-friendly contextual error parsing
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email address or password combination.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Access temporarily disabled due to too many failed attempts. Try again later.');
      } else {
        setError('Failed to authenticate. Please verify your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%', borderRadius: 2 }}>
          <Typography component="h1" variant="h4" align="center" fontWeight="bold" color="primary" gutterBottom>
            HireNext
          </Typography>
          <Typography component="h2" variant="h6" align="center" color="textSecondary" gutterBottom>
            Sign in to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'} // Toggles based on state
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
            
            {/* Register Link Section */}
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Don't have an account?{' '}
                <MuiLink component={RouterLink} to="/register" underline="hover" color="primary" fontWeight="bold">
                  Register here
                </MuiLink>
              </Typography>
            </Box>

          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;