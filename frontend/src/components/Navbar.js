import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import API from "../services/api";
import { 
  AppBar, Toolbar, Typography, Box, IconButton, Badge, Avatar, Menu, MenuItem, Tooltip, Divider,
  Dialog, DialogTitle, DialogContent, TextField, List, ListItem, ListItemText, CircularProgress
} from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SearchIcon from "@mui/icons-material/Search";

function Navbar() {
  const navigate = useNavigate();
  const auth = getAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const [userData, setUserData] = useState({
    firstName: "User", lastName: "", initials: "U", role: "Member"
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const response = await API.get("/settings/my-settings");
          if (response.data && response.data.user) {
            const { firstName, lastName, role } = response.data.user;
            const fName = firstName || "User";
            const lName = lastName || "";
            setUserData({
              firstName: fName,
              lastName: lName,
              initials: `${fName.charAt(0)}${lName.charAt(0)}`.toUpperCase(),
              role: role || "Job Seeker"
            });
          }

          // Fetch real unread notification telemetry
          const notifResponse = await API.get("/notifications/unread-count");
          setUnreadNotificationsCount(notifResponse.data.count || 0);

        } catch (err) {
          console.error("Failed to load user info:", err);
        }
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Real-time Global Job Search Execution
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await API.get(`/jobs/search?q=${searchQuery}`);
        setSearchResults(res.data.jobs || []);
      } catch (err) {
        console.error("Search failure", err);
      } finally {
        setSearching(false);
      }
    }, 400); // 400ms Debounce limit to reduce heavy database reads

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ backgroundColor: "#ffffff", color: "#333333", borderBottom: "1px solid rgba(0, 0, 0, 0.08)" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="text.primary">Welcome back, {userData.firstName}! 👋</Typography>
            <Typography variant="body2" color="text.secondary">Here is what's happening with your platform status today.</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Global Search">
              <IconButton size="large" color="inherit" onClick={() => setSearchOpen(true)}>
                <SearchIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton size="large" color="inherit" onClick={() => { setUnreadNotificationsCount(0); navigate("/notifications"); }}>
                <Badge badgeContent={unreadNotificationsCount} color="error">
                  <NotificationsOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.5 }} />

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
              <Avatar sx={{ width: 40, height: 40, bgcolor: "#1976d2", fontWeight: "bold" }}>{userData.initials}</Avatar>
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 200 } }}>
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" fontWeight="bold">{userData.firstName} {userData.lastName}</Typography>
                <Typography variant="body2" color="text.secondary">{userData.role}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); navigate("/profile"); }}>Profile Details</MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); navigate("/settings"); }}>Account Settings</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Global Interactive Search Modal overlay */}
      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold">Search Open Opportunities</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth margin="dense" variant="outlined" placeholder="Type title, company, skills, or tags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          {searching && <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}><CircularProgress size={24} /></Box>}
          <List>
            {searchResults.map((job) => (
              <ListItem button key={job.id} onClick={() => { setSearchOpen(false); navigate(`/jobs/${job.id}`); }}>
                <ListItemText primary={job.title} secondary={`${job.company} — ${job.location}`} />
              </ListItem>
            ))}
            {!searching && searchQuery && searchResults.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>No active matching positions found.</Typography>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Navbar;