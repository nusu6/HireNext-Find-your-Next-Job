import React, { useState, useEffect } from "react";
import API from "../services/api"; // Your authenticated Axios instance
import { getAuth, updatePassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"; // Firebase tools
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress
} from "@mui/material";

import SecurityIcon from "@mui/icons-material/Security";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";

function Settings() {
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Phone State
  const [phone, setPhone] = useState("");

  // Security Form State
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    jobAlerts: true,
    applicationUpdates: true,
    marketingEmails: false,
  });

  // Load configuration options from backend on mount
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const response = await API.get("/settings/my-settings");
        if (response.data && response.data.user) {
          const { phone, preferences } = response.data.user;
          setPhone(phone || "");
          if (preferences) {
            setNotifications({
              jobAlerts: preferences.jobAlerts ?? true,
              applicationUpdates: preferences.applicationUpdates ?? true,
              marketingEmails: preferences.marketingEmails ?? false,
            });
          }
        }
      } catch (err) {
        console.error("Error pulling initial profile records:", err);
        setStatusMessage({ type: "error", message: "Failed to download your account data." });
      } finally {
        setLoading(false);
      }
    };

    fetchUserSettings();
  }, []);

  const handleSecurityChange = (e) => {
    setSecurity({ ...security, [e.target.name]: e.target.value });
  };

  const handleNotificationToggle = (event) => {
    setNotifications({
      ...notifications,
      [event.target.name]: event.target.checked,
    });
  };

  // Centralized Save Handler routing to different endpoints depending on context
  const handleSave = async (section) => {
    setStatusMessage({ type: "", message: "" });
    setSubmitting(true);

    try {
      if (section === "Phone") {
        await API.post("/settings/update-profile", { phone });
        setStatusMessage({ type: "success", message: "Phone number updated successfully!" });
      } 
      
      else if (section === "Notification") {
        await API.post("/settings/update-preferences", { preferences: notifications });
        setStatusMessage({ type: "success", message: "Notification preferences saved successfully!" });
      } 
      
      else if (section === "Security") {
        if (!security.currentPassword || !security.newPassword || !security.confirmNewPassword) {
          throw new Error("Please complete all password input values.");
        }
        if (security.newPassword !== security.confirmNewPassword) {
          throw new Error("Your new passwords do not match.");
        }
        if (security.newPassword.length < 6) {
          throw new Error("New password must be at least 6 characters long.");
        }

        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const credential = EmailAuthProvider.credential(user.email, security.currentPassword);
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, security.newPassword);
          
          setSecurity({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
          setStatusMessage({ type: "success", message: "Password updated successfully!" });
        } else {
          throw new Error("No active credentials found. Try re-logging in.");
        }
      }
    } catch (err) {
      console.error(`Error applying changes to ${section}:`, err);
      setStatusMessage({ 
        type: "error", 
        message: err.message || err.response?.data?.error || "An unexpected error occurred saving configurations." 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm("Are you completely certain? This action permanently purges your candidate applications and resume profiling data.");
    if (!confirmation) return;

    const passwordVerification = window.prompt("Please type your current password to confirm account deletion:");
    if (!passwordVerification) return;

    setSubmitting(true);
    setStatusMessage({ type: "", message: "" });

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const credential = EmailAuthProvider.credential(user.email, passwordVerification);
        await reauthenticateWithCredential(user, credential);

        await API.delete("/settings/purge-account");
        await deleteUser(user);
        
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Critical failure during account purge execution:", err);
      setStatusMessage({ type: "error", message: err.message || "Account deletion sequence failed. Check credentials." });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", px: 2, my: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
          Account Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your telephone details, security authorization settings, and notification options in one place.
        </Typography>
      </Box>

      {statusMessage.message && (
        <Alert severity={statusMessage.type} sx={{ mb: 4, borderRadius: 2 }}>
          {statusMessage.message}
        </Alert>
      )}

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: 4 }}>
        
        {/* SECTION 1: Phone Configuration */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <LocalPhoneIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Phone Number Configuration
            </Typography>
          </Box>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField 
                fullWidth 
                label="Phone Number" 
                name="phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                disabled={submitting} 
                placeholder="+1 (555) 000-0000"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button 
                fullWidth
                variant="contained" 
                color="primary" 
                onClick={() => handleSave("Phone")} 
                disabled={submitting}
                sx={{ py: 1.5 }}
              >
                {submitting ? "Updating..." : "Update Phone"}
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* SECTION 2: Security & Passwords */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <SecurityIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Security & Credentials
            </Typography>
          </Box>
          <Grid container spacing={3} sx={{ maxWidth: 600 }}>
            <Grid item xs={12}>
              <TextField fullWidth type="password" label="Current Password" name="currentPassword" value={security.currentPassword} onChange={handleSecurityChange} disabled={submitting} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="password" label="New Password" name="newPassword" value={security.newPassword} onChange={handleSecurityChange} disabled={submitting} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="password" label="Confirm New Password" name="confirmNewPassword" value={security.confirmNewPassword} onChange={handleSecurityChange} disabled={submitting} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={() => handleSave("Security")} disabled={submitting}>
                {submitting ? "Updating..." : "Update Password"}
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* SECTION 3: Notification Toggles */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <NotificationsIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Email Notifications
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxW: 600 }}>
            <FormControlLabel
              control={<Switch checked={notifications.jobAlerts} onChange={handleNotificationToggle} name="jobAlerts" color="primary" disabled={submitting} />}
              label={
                <Box sx={{ ml: 1 }}>
                  <Typography variant="body1" fontWeight="medium">Job Alerts</Typography>
                  <Typography variant="body2" color="text.secondary">Get notified when new jobs match your skills.</Typography>
                </Box>
              }
            />
            <Divider variant="inset" component="div" sx={{ my: 1 }} />
            <FormControlLabel
              control={<Switch checked={notifications.applicationUpdates} onChange={handleNotificationToggle} name="applicationUpdates" color="primary" disabled={submitting} />}
              label={
                <Box sx={{ ml: 1 }}>
                  <Typography variant="body1" fontWeight="medium">Application Updates</Typography>
                  <Typography variant="body2" color="text.secondary">Receive emails when an employer views or updates your application.</Typography>
                </Box>
              }
            />
            <Divider variant="inset" component="div" sx={{ my: 1 }} />
            <FormControlLabel
              control={<Switch checked={notifications.marketingEmails} onChange={handleNotificationToggle} name="marketingEmails" color="primary" disabled={submitting} />}
              label={
                <Box sx={{ ml: 1 }}>
                  <Typography variant="body1" fontWeight="medium">Promotional Emails</Typography>
                  <Typography variant="body2" color="text.secondary">Receive tips, newsletters, and promotional content from HireNext.</Typography>
                </Box>
              }
            />
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" color="primary" onClick={() => handleSave("Notification")} disabled={submitting}>
                {submitting ? "Saving..." : "Save Preferences"}
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* SECTION 4: Danger Zone */}
        <Box sx={{ bgcolor: "rgba(211, 47, 47, 0.02)", p: 3, borderRadius: 2, border: "1px solid rgba(211, 47, 47, 0.2)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <DeleteForeverIcon color="error" />
            <Typography variant="h6" fontWeight="bold" color="error">
              Danger Zone
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Once you delete your account, all application workflows, resumes, and historical data points will be permanently terminated. This action cannot be undone.
          </Typography>
          <Button variant="outlined" color="error" onClick={handleDeleteAccount} disabled={submitting}>
            {submitting ? "Processing Purge..." : "Delete Account"}
          </Button>
        </Box>

      </Paper>
    </Box>
  );
}

export default Settings;