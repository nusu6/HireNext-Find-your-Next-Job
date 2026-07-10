import React, { useState, useEffect } from "react";
import API from "../services/api";
import { Box, Typography, Paper, Grid, TextField, Button, Alert, Chip, CircularProgress, Divider } from "@mui/material";
import AccountBoxIcon from "@mui/icons-material/AccountBox";

function Profile() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [skillInput, setSkillInput] = useState("");
  
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    professionalTitle: "",
    bio: "",
    portfolioUrl: "",
    githubUrl: "",
    skills: [],
    education: "",
    previousJobs: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/profile/my-profile");
        if (response.data && response.data.profile) {
          setProfileData({
            firstName: response.data.profile.firstName || "",
            lastName: response.data.profile.lastName || "",
            dateOfBirth: response.data.profile.dateOfBirth || "",
            professionalTitle: response.data.profile.professionalTitle || "",
            bio: response.data.profile.bio || "",
            portfolioUrl: response.data.profile.portfolioUrl || "",
            githubUrl: response.data.profile.githubUrl || "",
            skills: response.data.profile.skills || [],
            education: response.data.profile.education || "",
            previousJobs: response.data.profile.previousJobs || ""
          });
        }
      } catch (err) {
        console.error("Error loading profile layout", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!profileData.skills.includes(skillInput.trim())) {
        setProfileData({ ...profileData, skills: [...profileData.skills, skillInput.trim()] });
      }
      setSkillInput("");
    }
  };

  const handleDeleteSkill = (skillToDelete) => {
    setProfileData({ ...profileData, skills: profileData.skills.filter(s => s !== skillToDelete) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      await API.post("/profile/save", profileData);
      setMessage({ type: "success", text: "Professional profile parameters updated successfully." });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to persist updated profile registry attributes." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", my: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 850, mx: "auto", p: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Professional Details</Typography>
        <Typography variant="body1" color="text.secondary">Configure your public industry data visibility footprint for recruiters.</Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        {message.text && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            
            {/* Section: Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: -1 }}>Personal Information</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField required fullWidth label="First Name" name="firstName" value={profileData.firstName} onChange={handleInputChange} placeholder="John" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField required fullWidth label="Last Name" name="lastName" value={profileData.lastName} onChange={handleInputChange} placeholder="Doe" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth type="date" label="Date of Birth" name="dateOfBirth" value={profileData.dateOfBirth} onChange={handleInputChange} InputLabelProps={{ shrink: true }} />
            </Grid>

            <Grid item xs={12} sx={{ my: 1 }}>
              <Divider />
            </Grid>

            {/* Section: Professional Context */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: -1 }}>Professional Summary</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Professional Title" name="professionalTitle" value={profileData.professionalTitle} onChange={handleInputChange} placeholder="e.g. Senior Frontend Engineer / UX Lead" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={4} label="Professional Bio" name="bio" value={profileData.bio} onChange={handleInputChange} placeholder="Tell recruiters about your expertise, passions, and background..." />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Portfolio URL" name="portfolioUrl" value={profileData.portfolioUrl} onChange={handleInputChange} type="url" placeholder="https://myportfolio.com" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="GitHub URL" name="githubUrl" value={profileData.githubUrl} onChange={handleInputChange} type="url" placeholder="https://github.com/username" />
            </Grid>

            <Grid item xs={12} sx={{ my: 1 }}>
              <Divider />
            </Grid>

            {/* Section: Skills & Background */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: -1 }}>Skills & Background</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Core Skills & Technologies" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} placeholder="Type a technology and press Enter" helperText="Press Enter after each individual token tag assignment." />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                {profileData.skills.map((skill) => (
                  <Chip key={skill} label={skill} onDelete={() => handleDeleteSkill(skill)} color="primary" variant="outlined" />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Education History" name="education" value={profileData.education} onChange={handleInputChange} placeholder="e.g. B.Sc. in Computer Science - University of California (2018 - 2022)" helperText="Mention degrees, certificates, institutions, and years." />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={4} label="Work Experience / Previous Jobs" name="previousJobs" value={profileData.previousJobs} onChange={handleInputChange} placeholder="e.g. Software Engineer at TechCorp (2022 - Present)&#10;- Developed scalable React application features&#10;- Optimized API architectures..." helperText="Summarize your past professional job descriptions." />
            </Grid>

            {/* Action Submit */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" size="large" startIcon={<AccountBoxIcon />} disabled={submitting}>
                {submitting ? "Saving Parameters..." : "Commit Profile Changes"}
              </Button>
            </Grid>

          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default Profile;