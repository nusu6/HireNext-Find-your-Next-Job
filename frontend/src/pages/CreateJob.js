import React, { useState } from "react";
import API from "../services/api";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  InputAdornment
} from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];
const EXPERIENCE_LEVELS = ["Junior", "Mid-level", "Senior", "Lead"];

function CreateJob() {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    experienceLevel: "Mid-level",
    salaryRange: "",
    description: "",
    requirements: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      await API.post("/jobs/create", formData);
      setStatus({ type: "success", message: "Job post published successfully!" });
      setFormData({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        experienceLevel: "Mid-level",
        salaryRange: "",
        description: "",
        requirements: "",
      });
    } catch (err) {
      console.error("Job compilation failure:", err);
      setStatus({ 
        type: "error", 
        message: err.response?.data?.error || "Unable to save your job posting." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Post a New Position
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Publish open job details to find qualified candidate applications.
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        {status.message && (
          <Alert severity={status.type} sx={{ mb: 3 }}>
            {status.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Job Title" name="title" value={formData.title} onChange={handleChange} disabled={loading} placeholder="e.g., Senior Full Stack Engineer" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Company Name" name="company" value={formData.company} onChange={handleChange} disabled={loading} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Location" name="location" value={formData.location} onChange={handleChange} disabled={loading} placeholder="e.g., New York, NY or Remote" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Salary Range" name="salaryRange" value={formData.salaryRange} onChange={handleChange} disabled={loading} placeholder="e.g., $110,000 - $140,000" InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Job Type" name="type" value={formData.type} onChange={handleChange} disabled={loading}>
                {JOB_TYPES.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Experience Level" name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} disabled={loading}>
                {EXPERIENCE_LEVELS.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth required multiline rows={4} label="Job Description" name="description" value={formData.description} onChange={handleChange} disabled={loading} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Requirements" name="requirements" value={formData.requirements} onChange={handleChange} disabled={loading} placeholder="List key qualifications separated by lines or bullets" />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" size="large" startIcon={<WorkOutlineIcon />} disabled={loading} sx={{ px: 4, borderRadius: 2, textTransform: "none", fontWeight: "bold" }}>
                {loading ? "Publishing Job..." : "Publish Position"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default CreateJob;