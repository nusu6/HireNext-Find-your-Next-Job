import React, { useState, useEffect } from "react";
import API from "../services/api";
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Button, CircularProgress } from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";

function Notification() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const response = await API.get("/notifications/list");
      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error("Could not fetch alerts matrix", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await API.post("/notifications/mark-all-read");
      // UI State sync normalization mapping mutation optimization:
      setNotifications(notifications.map(n => ({ ...n, status: "read" })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", my: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 750, mx: "auto", p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Alerts & Notifications</Typography>
          <Typography variant="body1" color="text.secondary">Stay updated with structural recruitment events and application decisions.</Typography>
        </Box>
        {notifications.some(n => n.status === "unread") && (
          <Button variant="outlined" startIcon={<DoneAllIcon />} onClick={handleMarkAllRead}>Mark All Read</Button>
        )}
      </Box>

      <Paper sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        {notifications.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ p: 4, textAlign: "center" }}>No notification items logged to your history.</Typography>
        ) : (
          <List disablePadding>
            {notifications.map((notif, index) => (
              <React.Fragment key={notif.id}>
                <ListItem sx={{ p: 3, bgcolor: notif.status === "unread" ? "rgba(25, 118, 210, 0.04)" : "inherit" }}>
                  <ListItemText 
                    primary={<Typography fontWeight={notif.status === "unread" ? "bold" : "normal"}>{notif.title}</Typography>}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.primary" sx={{ my: 0.5 }}>{notif.message}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(notif.createdAt).toLocaleString()}</Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}

export default Notification;