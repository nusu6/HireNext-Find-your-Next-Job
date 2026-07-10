import React, { useState, useEffect } from "react";
import API from "../services/api";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CloseIcon from "@mui/icons-material/Close";

function Jobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState([]); // Database jobs state
  const [selectedJob, setSelectedJob] = useState(null); // Selected job state for the popup modal

  // Fetch jobs from your Express + Firestore backend on component mount
  useEffect(() => {
    API.get("/jobs/all")
      .then((res) => {
        setJobs(res.data.jobs || []);
      })
      .catch((err) => {
        console.error("Error fetching jobs from server:", err);
      });
  }, []);

  // Securely request the application endpoint via Axios interceptors
  const handleApply = async (jobId) => {
    try {
      const response = await API.post(`/jobs/apply/${jobId}`);
      alert(response.data.message); // "Application submitted successfully!"
    } catch (err) {
      console.error("Application error:", err);
      alert("Authentication error or failed server submission!");
    }
  };

  const handleOpenDetails = (job) => {
    setSelectedJob(job);
  };

  const handleCloseDetails = () => {
    setSelectedJob(null);
  };

  // Real-time search filter filtering over the live database state
  const filteredJobs = jobs.filter(
    (job) =>
      (job.title && job.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.company && job.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box>
      {/* Header and Search Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
          Explore Jobs
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Find your next great opportunity.
        </Typography>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by job title or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ backgroundColor: "white", borderRadius: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Job Cards Grid */}
      <Grid container spacing={3}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Grid item xs={12} md={6} key={job.id}>
              <Card
                onClick={() => handleOpenDetails(job)}
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  },
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {job.title}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" fontWeight="medium" mb={2}>
                    {job.company}
                  </Typography>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">{job.location || "N/A"}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
                      <WorkOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">{job.type || "N/A"}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
                      <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">{job.salary || job.salaryRange || "N/A"}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                    {/* Display experience level context matching your form structure */}
                    {job.experienceLevel && (
                      <Chip label={job.experienceLevel} size="small" color="primary" variant="soft" sx={{ fontWeight: "600" }} />
                    )}
                    {job.tags && job.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    disableElevation
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents layout modal launch when wanting to instantly register application
                      handleApply(job.id);
                    }}
                  >
                    Apply Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary" textAlign="center" mt={4}>
              {jobs.length === 0 
                ? "Loading opportunities from the database..." 
                : `No jobs found matching "${searchTerm}".`}
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Information Details Overlay Popup Modal */}
      <Dialog
        open={Boolean(selectedJob)}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        {selectedJob && (
          <>
            <DialogTitle sx={{ pr: 6, pt: 3 }}>
              <Typography variant="h5" fontWeight="bold" component="div">
                {selectedJob.title}
              </Typography>
              <Typography variant="subtitle1" color="primary" fontWeight="medium" sx={{ mt: 0.5 }}>
                {selectedJob.company}
              </Typography>
              <IconButton
                aria-label="close"
                onClick={handleCloseDetails}
                sx={{
                  position: "absolute",
                  right: 16,
                  top: 16,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ px: 3, py: 2 }}>
              {/* Core Context Row */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3, mt: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
                  <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body1">{selectedJob.location || "N/A"}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
                  <WorkOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body1">{selectedJob.type || "N/A"}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
                  <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body1">{selectedJob.salary || selectedJob.salaryRange || "N/A"}</Typography>
                </Box>
              </Box>

              {/* Detail Attribute Badges */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {selectedJob.experienceLevel && (
                  <Chip label={`Experience: ${selectedJob.experienceLevel}`} color="secondary" variant="outlined" />
                )}
                {selectedJob.tags && selectedJob.tags.map((tag, index) => (
                  <Chip key={index} label={tag} variant="outlined" />
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Detailed Description Block */}
              <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
                Job Description
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-line", mb: 4 }}>
                {selectedJob.description || "No specific details provided."}
              </Typography>

              {/* Requirements Block */}
              {selectedJob.requirements && (
                <>
                  <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
                    Requirements
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-line", mb: 2 }}>
                    {selectedJob.requirements}
                  </Typography>
                </>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2.5, justifyContent: "space-between" }}>
              <Button onClick={handleCloseDetails} color="inherit" sx={{ fontWeight: "bold" }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="large"
                disableElevation
                onClick={() => {
                  handleApply(selectedJob.id);
                  handleCloseDetails();
                }}
                sx={{ px: 4, borderRadius: 2, fontWeight: "bold" }}
              >
                Apply for this Position
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default Jobs;