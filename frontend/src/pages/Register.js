import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import API from '../services/api'; // Authenticated Axios instance
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; // Firebase client SDK
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Registration form, 2 = OTP Verification
  const [otp, setOtp] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'candidate',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  // Step 1: Handle initial Account Creation and request OTP
  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      return setError('Please fill in all required fields.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    setLoading(true);

    try {
      const auth = getAuth();
      
      // 1. Create client auth in Firebase
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // 2. Trigger Express backend to generate and dispatch the OTP
      // (Your Axios interceptors automatically attach the newly generated Auth Token here)
      await API.post('/auth/send-otp', { email: formData.email });
      
      // 3. Flip view state to OTP challenge screen
      setStep(2);
    } catch (err) {
      console.error('Initial registration failed:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already registered.');
      } else if (err.code === 'auth/invalid-email') {
        setError('The format of the email address is invalid.');
      } else {
        setError(err.response?.data?.error || 'Failed to initialize account. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and synchronize profile mapping data
  const handleOtpVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      return setError('Please enter a valid 6-digit verification code.');
    }

    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('No active user authentication context found.');
      }

      const profileData = {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        otp: otp, // Appending OTP for backend verification
      };

      // Send execution context directly to protected backend route
      await API.post('/auth/register-profile', profileData);
      
      navigate('/dashboard');
    } catch (err) {
      console.error('OTP Validation / Sync process crashed:', err);
      setError(err.response?.data?.error || 'Invalid or expired code. Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 8, marginBottom: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, width: '100%', borderRadius: 2 }}>
          <Typography component="h1" variant="h4" align="center" fontWeight="bold" color="primary" gutterBottom>
            Join HireNext
          </Typography>
          
          <Typography component="h2" variant="body1" align="center" color="textSecondary" sx={{ mb: 3 }}>
            {step === 1 ? 'Create your account to get started' : 'Verify your email address'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Render Step 1: Information Inputs Form */}
          {step === 1 && (
            <Box component="form" onSubmit={handleInitialSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required disabled={loading}>
                    <InputLabel id="role-label">I am a...</InputLabel>
                    <Select
                      labelId="role-label"
                      id="role"
                      name="role"
                      value={formData.role}
                      label="I am a..."
                      onChange={handleChange}
                    >
                      <MenuItem value="candidate">Job Seeker</MenuItem>
                      <MenuItem value="employer">Recruiter</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
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
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleClickShowConfirmPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 4, mb: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </Button>
              
              <Grid container justifyContent="center">
                <Grid item>
                  <Link component={RouterLink} to="/" variant="body2" sx={{ textDecoration: 'none' }}>
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Render Step 2: Six-Digit OTP Field Challenge */}
          {step === 2 && (
            <Box component="form" onSubmit={handleOtpVerifyAndRegister} noValidate>
              <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
                We sent a 6-digit confirmation code to <strong>{formData.email}</strong>. Please check your inbox and entry folder.
              </Typography>
              
              <TextField
                required
                fullWidth
                id="otpCode"
                label="Enter Verification Code"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Restricts inputs to numeric digits only
                disabled={loading}
                inputProps={{ 
                  maxLength: 6,
                  style: { textAlign: 'center', letterSpacing: '0.4em', fontSize: '1.3rem', fontWeight: 'bold' } 
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
                size="large"
                sx={{ mt: 4, mb: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Code & Register'}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default Register;