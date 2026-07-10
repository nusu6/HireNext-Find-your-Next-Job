import React, { useState, useEffect } from "react";
import API from "../services/api"; // Importing your authenticated Axios instance
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider, 
  Chip, 
  Button, 
  CircularProgress,
  LinearProgress,
  MenuItem,
  TextField
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Material Icons
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FlagIcon from '@mui/icons-material/Flag';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

function Dashboard() {
  const navigate = useNavigate();
  
  // Core dynamic data metrics
  const [appliedCount, setAppliedCount] = useState(0);
  const [weeklyAppliedCount, setWeeklyAppliedCount] = useState(0); // 🆕 New state for 7-day rolling metric
  const [userName, setUserName] = useState("");
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
const [rawApplications, setRawApplications] = useState([]);
  // Application process analytics pipeline
  const [statusBreakdown, setStatusBreakdown] = useState({
    pending: 0,
    interviewing: 0,
    offered: 0
  });

  // AI Interview Feature States
  const [selectedJobId, setSelectedJobId] = useState("");
  const [aiTips, setAiTips] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Consolidated parallel backend data stream requests
        const [jobsRes, appsRes, profileRes] = await Promise.all([
          API.get("/jobs/all").catch(() => ({ data: { jobs: [] } })),
          API.get("/jobs/my-applications").catch(() => ({ data: { applications: [] } })),
          API.get("/auth/profile").catch(() => ({ data: { profile: null } }))
        ]);

        const jobsData = jobsRes.data.jobs || [];
        const appsData = appsRes.data.applications || [];
        const profileData = profileRes.data.profile || null;

        setRawApplications(appsData);
        setAppliedCount(appsData.length);
        
        if (profileData && profileData.firstName) {
          setUserName(profileData.firstName);
        }

        // Pre-select first application for the AI module if available
        if (appsData.length > 0) {
          setSelectedJobId(appsData[0].jobId || appsData[0].id);
        }

        // 🆕 Calculate exactly 7 days ago for weekly metrics
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Calculate Funnel & Weekly Metrics
        let pendingCount = 0;
        let interviewCount = 0;
        let offerCount = 0;
        let weeklyCount = 0;

        appsData.forEach(app => {
          // Status Funnel
          const currentStatus = (app.status || "Applied").toLowerCase();
          if (currentStatus.includes("interview")) interviewCount++;
          else if (currentStatus.includes("offer") || currentStatus.includes("accept")) offerCount++;
          else pendingCount++;

          // 🆕 Weekly Calculation check
          if (app.appliedAt) {
            const appliedDate = new Date(app.appliedAt);
            if (appliedDate >= oneWeekAgo) {
              weeklyCount++;
            }
          }
        });

        setStatusBreakdown({
          pending: pendingCount,
          interviewing: interviewCount,
          offered: offerCount
        });
        
        setWeeklyAppliedCount(weeklyCount); // Save our new calculated weekly target

        // Map application logs to build the activity timeline
        const formattedActivities = appsData.map((app) => {
          const correspondingJob = jobsData.find(j => j.id === app.jobId || j._id === app.jobId);
          
          let formattedTime = "Recently";
          if (app.appliedAt) {
            const dateDiff = Math.abs(new Date() - new Date(app.appliedAt));
            const diffDays = Math.floor(dateDiff / (1000 * 60 * 60 * 24));
            formattedTime = diffDays === 0 ? "Today" : `${diffDays} days ago`;
          }

          return {
            id: app.applicationId || app.id || app._id,
            jobId: app.jobId,
            action: "Applied",
            company: correspondingJob ? correspondingJob.company : "Corporate Partner",
            jobTitle: correspondingJob ? correspondingJob.title : "Position Opening",
            time: formattedTime,
            status: app.status || "Applied"
          };
        });

        setRecentActivities(formattedActivities.slice(0, 5));
        setLoading(false);
      } catch (err) {
        console.error("Error aggregating backend metrics:", err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Request Custom AI Questions and Coaching from Backend via Gemini API
  const handleFetchAiInterviewTips = async () => {
    if (!selectedJobId) return;
    setLoadingAi(true);
    setAiTips("");

    // Find the corresponding activity context data
    const activeApp = recentActivities.find(item => item.jobId === selectedJobId);
    const contextPayload = {
      jobTitle: activeApp?.jobTitle || "Software Developer",
      company: activeApp?.company || "Tech Enterprise",
    };

    try {
      // Direct post route to your Express backend integrating Gemini API
      const response = await API.post("/ai/interview-prep", contextPayload);
      setAiTips(response.data.tips || response.data.aiResponse || "Focus on your core system architectures, past code refactoring workflows, and cross-functional agile alignment frameworks.");
    } catch (err) {
      console.error("Failed to query Gemini AI engine:", err);
      setAiTips("Review structural system design paradigms, standard behavior-driven scenarios (STAR method), and data optimizations relevant to this domain.");
    } finally {
      setLoadingAi(false);
    }
  };

  // Static target goals metrics for clean visualization engine
  const targetWeeklyApplications = 5;
  const metricsCards = [
    { 
      title: "Jobs Applied (Total)", 
      value: loading ? <CircularProgress size={24} /> : appliedCount, 
      icon: <WorkIcon fontSize="large" sx={{ color: '#1976d2' }} />, 
      bgColor: '#e3f2fd' 
    },
    { 
      title: "Active Interviews", 
      value: loading ? <CircularProgress size={24} /> : statusBreakdown.interviewing, 
      icon: <RecordVoiceOverIcon fontSize="large" sx={{ color: '#2e7d32' }} />, 
      bgColor: '#edf7ed' 
    },
    { 
      // 🆕 Changed logic here to use the new rolling weekly count instead of lifetime totals
      title: "Weekly Goal Progression", 
      value: loading ? <CircularProgress size={24} /> : `${weeklyAppliedCount} / ${targetWeeklyApplications}`, 
      icon: <FlagIcon fontSize="large" sx={{ color: '#ed6c02' }} />, 
      bgColor: '#fff4e5' 
    }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header Dashboard Area */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
            {userName ? `Welcome back, ${userName}! 👋` : "Dashboard Overview"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track metrics pipeline velocity, current application loops, and tailored AI suggestions.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate("/jobs")}
          sx={{ borderRadius: 2, px: 3, fontWeight: "bold", textTransform: "none" }}
        >
          Find Jobs
        </Button>
      </Box>

      {/* Analytics Stat Grid Modules */}
      <Grid container spacing={3} mb={4}>
        {metricsCards.map((card, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                }
              }}
            >
              <Box sx={{ backgroundColor: card.bgColor, p: 2, borderRadius: 2, mr: 3, display: 'flex', alignItems: 'center' }}>
                {card.icon}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                  {card.title}
                </Typography>
                <Typography variant="h4" color="text.primary" fontWeight="bold" sx={{ my: 0.5 }}>
                  {card.value}
                </Typography>
                {/* 🆕 Updated LinearProgress to cap at 100% and map against the weekly rolling stat */}
                {index === 2 && (
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((weeklyAppliedCount / targetWeeklyApplications) * 100, 100)} 
                    sx={{ height: 6, borderRadius: 3, mt: 1 }} 
                  />
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main Framework Columns */}
      <Grid container spacing={3}>
        {/* Left Side: Pipeline, Logs and AI Suggestions */}
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Application Pipeline Funnel Widget */}
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Application Pipeline Funnel
            </Typography>
            <Grid container spacing={2} textAlign="center">
              <Grid item xs={4}>
                <Box sx={{ p: 2, bgcolor: '#f4f6f8', borderRadius: 2 }}>
                  <HourglassEmptyIcon color="action" sx={{ mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">{statusBreakdown.pending}</Typography>
                  <Typography variant="caption" color="text.secondary">Reviewing / Pending</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                  <GroupIcon color="success" sx={{ mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold" color="#2e7d32">{statusBreakdown.interviewing}</Typography>
                  <Typography variant="caption" color="text.secondary">Interviews Arranged</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                  <AssignmentTurnedInIcon color="primary" sx={{ mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold" color="#1976d2">{statusBreakdown.offered}</Typography>
                  <Typography variant="caption" color="text.secondary">Offers Extended</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* New Feature: Interactive AI Interview Suggestion Assistant Hub */}
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", borderLeft: "5px solid #1976d2" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <AutoAwesomeIcon sx={{ color: "#1976d2" }} />
              <Typography variant="h6" fontWeight="bold">
                Interview Prep Assistant with AI
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Select an active applied position below. Our predictive Gemini engine analyzes the requirements to generate custom high-yield technical and tactical interview tips.
            </Typography>

            {recentActivities.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                  <TextField
                    select
                    size="small"
                    label="Choose Targeted Role"
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    sx={{ minWidth: 280 }}
                  >
                    {recentActivities.map((act) => (
                      <MenuItem key={act.id} value={act.jobId}>
                        {act.company} — {act.jobTitle}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    startIcon={loadingAi ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
                    onClick={handleFetchAiInterviewTips}
                    disabled={loadingAi}
                    sx={{ textTransform: "none", fontWeight: "bold", borderRadius: 2 }}
                  >
                    {loadingAi ? "Generating Framework..." : "Generate Interview Tips"}
                  </Button>
                </Box>

                {aiTips && (
                  <Box sx={{ mt: 1, p: 2.5, bgcolor: "#f8f9fa", borderRadius: 2, border: "1px solid #e0e0e0" }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="text.primary" gutterBottom>
                      Tailored Candidate Strategy:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>
                      {aiTips}
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" py={1}>
                No applied opportunities detected. Once you apply to jobs, selection contexts populate here.
              </Typography>
            )}
          </Paper>

          {/* Recent Activity Pipeline Execution List */}
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 1 }} />
            
            {recentActivities.length > 0 ? (
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Typography variant="subtitle1" fontWeight="bold">
                            {activity.action} - {activity.company} {activity.jobTitle ? `(${activity.jobTitle})` : ''}
                          </Typography>
                        } 
                        secondary={activity.time} 
                      />
                      <Chip 
                        label={activity.status} 
                        size="small" 
                        color={
                          activity.status.toLowerCase().includes('interview') ? 'success' :
                          activity.status.toLowerCase().includes('offer') ? 'primary' : 'default'
                        } 
                        variant="outlined" 
                      />
                    </ListItem>
                    {index !== recentActivities.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                {loading ? "Loading historical activity feed logs..." : "No recent actions tracked."}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Right Side Column: Upcoming Schedule Calendar Context Module */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: '100%' }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <CalendarMonthIcon color="action" />
              <Typography variant="h6" fontWeight="bold">
                Upcoming Schedule
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {statusBreakdown.interviewing > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  You have <strong>{statusBreakdown.interviewing}</strong> pending loops configured. Ensure your configurations and local setup are synchronized.
                </Typography>
                
                {recentActivities.filter(a => a.status.toLowerCase().includes('interview')).map((item) => (
                  <Box key={item.id} sx={{ p: 2, bgcolor: "#edf7ed", borderRadius: 2, borderLeft: "4px solid #2e7d32" }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="#2e7d32">
                      Technical Loop Screening
                    </Typography>
                    <Typography variant="body2" color="text.primary" fontWeight="medium">
                      {item.company}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Role: {item.jobTitle}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  No interview sessions are configured on the grid for this cycle. 
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ px: 2 }}>
                  When corporate response statuses match structured screening criteria, updates sync automatically here.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;