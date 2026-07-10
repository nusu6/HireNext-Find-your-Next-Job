import React, { useState, useEffect } from "react";
import API from "../services/api"; // Your authenticated Axios instance
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  IconButton,
  Chip,
  Alert,
  CircularProgress
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SaveIcon from "@mui/icons-material/Save";

function ResumeBuilder() {
  // State for Personal Information
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    portfolioUrl: "",
    summary: "",
  });

  // State for Work Experience (Dynamic Array)
  const [experiences, setExperiences] = useState([
    { id: 1, company: "", role: "", startDate: "", endDate: "", description: "" },
  ]);

  // State for Skills
  const [skills, setSkills] = useState("");
  
  // Status Tracking States
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });

  // Helper to ensure dates are always in a safe YYYY-MM-DD format for native inputs
  const formatSafeDate = (dateString) => {
    if (!dateString) return "";
    // If it's a full ISO timestamp string, pull just the date segment out
    if (dateString.includes("T")) {
      return dateString.split("T")[0];
    }
    return dateString;
  };

  // 1. Fetch saved resume documents on mount
  useEffect(() => {
    const fetchUserResume = async () => {
      try {
        const response = await API.get("/resume/my-resume");
        if (response.data && response.data.resume) {
          const { personalInfo: savedInfo, experiences: savedExp, skills: savedSkills } = response.data.resume;
          
          if (savedInfo) {
            setPersonalInfo({
              fullName: savedInfo.fullName || "",
              email: savedInfo.email || "",
              phone: savedInfo.phone || "",
              portfolioUrl: savedInfo.portfolioUrl || "",
              summary: savedInfo.summary || "",
            });
          }
          
          if (savedExp && savedExp.length > 0) {
            // Normalize dates upon hydration step to prevent input value tracking glitches
            const normalizedExp = savedExp.map(exp => ({
              ...exp,
              id: exp.id || Date.now() + Math.random(),
              startDate: formatSafeDate(exp.startDate),
              endDate: formatSafeDate(exp.endDate),
              company: exp.company || "",
              role: exp.role || "",
              description: exp.description || ""
            }));
            setExperiences(normalizedExp);
          }
          
          if (savedSkills) setSkills(savedSkills);
        }
      } catch (err) {
        console.warn("No existing resume profile found, starting blank context.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserResume();
  }, []);

  const handlePersonalChange = (e) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const handleExperienceChange = (id, e) => {
    const newExperiences = experiences.map((exp) => {
      if (exp.id === id) {
        return { ...exp, [e.target.name]: e.target.value };
      }
      return exp;
    });
    setExperiences(newExperiences);
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      { id: Date.now(), company: "", role: "", startDate: "", endDate: "", description: "" },
    ]);
  };

  const removeExperience = (id) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  // 2. Hook up AI Assist summary engine via Node.js Gemini bridge endpoint
  const handleAIAssist = async () => {
    if (!skills.trim() && (!experiences[0] || !experiences[0].role.trim())) {
      setNotification({ type: "error", message: "Please enter some skills or roles first so the AI has context!" });
      return;
    }

    setAiLoading(true);
    setNotification({ type: "", message: "" });

    try {
      const response = await API.post("/resume/ai-summarize", {
        skills,
        experiences: experiences.map(e => ({ role: e.role, company: e.company, description: e.description }))
      });

      if (response.data && response.data.summary) {
        setPersonalInfo(prev => ({ ...prev, summary: response.data.summary }));
        setNotification({ type: "success", message: "Summary optimization complete!" });
      }
    } catch (err) {
      console.error("AI aggregation runtime failed:", err);
      setNotification({ type: "error", message: "AI rewrite engine failed. Verify backend Google Gemini configurations." });
    } finally {
      setAiLoading(false);
    }
  };

  // 3. Save resume data straight to Firestore database mapping
  const handleSaveResume = async () => {
    setNotification({ type: "", message: "" });
    try {
      await API.post("/resume/save", { personalInfo, experiences, skills });
      setNotification({ type: "success", message: "Your professional resume profiling has been saved successfully!" });
    } catch (err) {
      console.error("Failed to commit database updates:", err);
      setNotification({ type: "error", message: "Failed to persist document properties." });
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
    <Box sx={{ maxWidth: 900, mx: "auto", pb: 6 }}>
      {notification.message && (
        <Alert severity={notification.type} sx={{ mb: 3 }} onClose={() => setNotification({ type: "", message: "" })}>
          {notification.message}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Resume Builder
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create or update your resume to stand out to employers.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="success"
          startIcon={<SaveIcon />}
          onClick={handleSaveResume}
          sx={{ textTransform: "none", fontWeight: "bold" }}
        >
          Save Resume
        </Button>
      </Box>

      {/* Personal Information Section */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          Personal Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Full Name" name="fullName" value={personalInfo.fullName} onChange={handlePersonalChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Email Address" name="email" value={personalInfo.email} onChange={handlePersonalChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Phone Number" name="phone" value={personalInfo.phone} onChange={handlePersonalChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Portfolio URL" name="portfolioUrl" value={personalInfo.portfolioUrl} onChange={handlePersonalChange} />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Professional Summary</Typography>
              <Button 
                size="small" 
                variant="outlined" 
                color="primary" 
                startIcon={aiLoading ? <CircularProgress size={14} /> : <AutoAwesomeIcon />}
                onClick={handleAIAssist}
                disabled={aiLoading}
                sx={{ borderRadius: 4, textTransform: "none" }}
              >
                {aiLoading ? "Thinking..." : "Write with AI"}
              </Button>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="A brief summary of your professional background..."
              name="summary"
              value={personalInfo.summary}
              onChange={handlePersonalChange}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Work Experience Section */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Work Experience
          </Typography>
          <Button startIcon={<AddCircleOutlineIcon />} onClick={addExperience} color="primary" sx={{ textTransform: "none" }}>
            Add Experience
          </Button>
        </Box>

        {experiences.map((exp, index) => (
          <Box key={exp.id} sx={{ mb: index !== experiences.length - 1 ? 4 : 0 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Job Title" name="role" value={exp.role} onChange={(e) => handleExperienceChange(exp.id, e)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Company Name" name="company" value={exp.company} onChange={(e) => handleExperienceChange(exp.id, e)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="date" label="Start Date" InputLabelProps={{ shrink: true }} name="startDate" value={exp.startDate} onChange={(e) => handleExperienceChange(exp.id, e)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="date" label="End Date" InputLabelProps={{ shrink: true }} name="endDate" value={exp.endDate} onChange={(e) => handleExperienceChange(exp.id, e)} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Job Description"
                  placeholder="Describe your responsibilities and achievements..."
                  name="description"
                  value={exp.description}
                  onChange={(e) => handleExperienceChange(exp.id, e)}
                />
              </Grid>
            </Grid>
            {experiences.length > 1 && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <IconButton color="error" onClick={() => removeExperience(exp.id)}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            )}
            {index !== experiences.length - 1 && <Divider sx={{ mt: 3 }} />}
          </Box>
        ))}
      </Paper>

      {/* Skills Section */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          Skills
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Enter your skills separated by commas (e.g., React, Node.js, Project Management)
        </Typography>
        <TextField
          fullWidth
          label="Your Skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="JavaScript, Python, UI/UX Design..."
        />
        <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {skills
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill !== "") // Filters out empty space fragments cleanly
            .map((cleanSkill, index) => (
              <Chip key={index} label={cleanSkill} color="primary" variant="outlined" />
            ))
          }
        </Box>
      </Paper>
    </Box>
  );
}

export default ResumeBuilder;