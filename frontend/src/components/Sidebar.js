import React, { useState } from "react";
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Box, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkIcon from "@mui/icons-material/Work";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"; 
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People"; // 🆕 Added People icon for Applicants
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt"; 
import LoginIcon from "@mui/icons-material/Login"; 

const drawerWidth = 260;

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate(); 
  
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    // TODO: Add your Firebase/JWT clear token logic here later
    console.log("User logged out");
    navigate("/");
  };

  // Primary navigation items
  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Jobs", icon: <WorkIcon />, path: "/jobs" },
    { text: "Create Job", icon: <AddCircleOutlineIcon />, path: "/createJob" },
    { text: "Resume Builder", icon: <DescriptionIcon />, path: "/resume" },
    { text: "Applicants", icon: <PeopleIcon />, path: "/applicants" }, // 🆕 Added Applicants route
  ];

  // Auth/Public navigation items
  const authItems = [
    { text: "Login", icon: <LoginIcon />, path: "/" }, 
    { text: "Register", icon: <PersonAddAltIcon />, path: "/register" },
  ];

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "#121418",
            color: "#b0b3b8",
            borderRight: "none",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          },
        }}
      >
        <Box>
          {/* Brand Logo Area */}
          <Box sx={{ p: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#ffffff", letterSpacing: 1 }}>
              Hire<span style={{ color: "#1976d2" }}>Next</span>
            </Typography>
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 2 }} />

          {/* Main Navigation */}
          <List sx={{ px: 2 }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: isActive ? "rgba(25, 118, 210, 0.15)" : "transparent",
                      color: isActive ? "#66b2ff" : "inherit",
                      "&:hover": {
                        backgroundColor: isActive ? "rgba(25, 118, 210, 0.25)" : "rgba(255, 255, 255, 0.05)",
                        color: isActive ? "#66b2ff" : "#ffffff",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive ? "#66b2ff" : "inherit", minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? "bold" : "medium" }} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1, mx: 2 }} />

          {/* Authentication Links */}
          <List sx={{ px: 2 }}>
            {authItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: isActive ? "rgba(25, 118, 210, 0.15)" : "transparent",
                      color: isActive ? "#66b2ff" : "inherit",
                      "&:hover": {
                        backgroundColor: isActive ? "rgba(25, 118, 210, 0.25)" : "rgba(255, 255, 255, 0.05)",
                        color: isActive ? "#66b2ff" : "#ffffff",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive ? "#66b2ff" : "inherit", minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? "bold" : "medium" }} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Bottom Utility Actions */}
        <Box sx={{ p: 2 }}>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 2 }} />
          <List disablePadding>
            
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                component={Link} 
                to="/settings" 
                sx={{ borderRadius: 2, "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.05)", color: "#ffffff" } }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}><SettingsIcon /></ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton 
                onClick={handleLogoutClick} 
                sx={{ borderRadius: 2, color: "#f44336", "&:hover": { backgroundColor: "rgba(244, 67, 54, 0.1)" } }}
              >
                <ListItemIcon sx={{ color: "#f44336", minWidth: 40 }}><ExitToAppIcon /></ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>

          </List>
        </Box>
      </Drawer>

      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle fontWeight="bold">Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out of HireNext? You will need to sign in again to access your dashboard.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 3 }}>
          <Button onClick={handleLogoutCancel} color="inherit" sx={{ fontWeight: "bold" }}>
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} color="error" variant="contained" disableElevation>
            Yes, Log out
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Sidebar;