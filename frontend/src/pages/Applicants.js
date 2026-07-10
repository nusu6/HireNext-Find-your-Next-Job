import React, { useState, useEffect, useMemo } from "react";
import API from "../services/api"; 
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import FilterListIcon from "@mui/icons-material/FilterList";

function Applicants() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null); 

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        setApiError(null);
        
        // FIXED: Changed /applications/all to /applicants/all to match your server.js
        const [jobsRes, appsRes] = await Promise.all([
          API.get("/jobs/all").catch(() => ({ data: { jobs: [] } })),
          API.get("/applicants/all") 
        ]);

        console.log("DEBUG - RAW JOBS FROM BACKEND:", jobsRes.data);
        console.log("DEBUG - RAW APPLICATIONS FROM BACKEND:", appsRes.data);

        setJobs(jobsRes.data.jobs || []);
        setApplications(appsRes.data.applications || []);
      } catch (error) {
        console.error("Error mapping global application logs:", error);
        setApiError(error.response?.data?.error || error.message || "Failed to connect to backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalData();
  }, []);

  // Unify data layers and group directly by the text Title to prevent missing keys
  const processedApplications = useMemo(() => {
    return applications.map(app => {
      const matchedJob = jobs.find(j => j.id === app.jobId || j._id === app.jobId);
      return {
        ...app,
        displayTitle: matchedJob?.title || app.jobTitle || "Legacy/Unlinked Position",
        displayCompany: matchedJob?.company || app.company || "Unknown Company"
      };
    });
  }, [applications, jobs]);

  // Generate Dropdown Options dynamically
  const { uniqueTitles, uniqueCompanies } = useMemo(() => {
    const titles = new Set();
    const companies = new Set();
    
    processedApplications.forEach(app => {
      titles.add(app.displayTitle);
      companies.add(app.displayCompany);
    });

    return {
      uniqueTitles: Array.from(titles).sort(),
      uniqueCompanies: Array.from(companies).sort()
    };
  }, [processedApplications]);

  // Group applications dynamically by Job Title text string
  const filteredGroupedApplicants = useMemo(() => {
    const grouped = {};

    processedApplications.forEach(app => {
      const matchesTitle = selectedJobTitle ? app.displayTitle === selectedJobTitle : true;
      const matchesCompany = selectedCompany ? app.displayCompany === selectedCompany : true;

      if (matchesTitle && matchesCompany) {
        const key = app.displayTitle; 
        if (!grouped[key]) {
          grouped[key] = {
            jobDetails: { title: app.displayTitle, company: app.displayCompany },
            applicants: []
          };
        }
        grouped[key].applicants.push(app);
      }
    });

    return grouped;
  }, [processedApplications, selectedJobTitle, selectedCompany]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Title Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <AssignmentIndIcon sx={{ fontSize: 40, color: "#1976d2" }} />
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Global Applicants Registry
          </Typography>
          <Typography variant="body2" color="text.secondary">
            System administration matrix showing all applications currently stored across Firestore.
          </Typography>
        </Box>
      </Box>

      {/* Connection or backend server errors */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          <strong>Backend Error Trace:</strong> {apiError} — Open your browser inspect console to review the network tabs.
        </Alert>
      )}

      {/* Structured Filter Bar */}
      <Box 
        sx={{ 
          display: "flex", 
          gap: 2, 
          flexWrap: "wrap", 
          alignItems: "center",
          mb: 4, 
          p: 2, 
          backgroundColor: "#fff", 
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary", mr: 1 }}>
          <FilterListIcon />
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>Filters:</Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 220, flexGrow: 1 }}>
          <InputLabel id="job-title-filter-label">Filter by Job Title</InputLabel>
          <Select
            labelId="job-title-filter-label"
            value={selectedJobTitle}
            label="Filter by Job Title"
            onChange={(e) => setSelectedJobTitle(e.target.value)}
          >
            <MenuItem value=""><em>All Job Titles</em></MenuItem>
            {uniqueTitles.map((title, idx) => (
              <MenuItem key={idx} value={title}>{title}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 220, flexGrow: 1 }}>
          <InputLabel id="company-filter-label">Filter by Company</InputLabel>
          <Select
            labelId="company-filter-label"
            value={selectedCompany}
            label="Filter by Company"
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <MenuItem value=""><em>All Companies</em></MenuItem>
            {uniqueCompanies.map((company, idx) => (
              <MenuItem key={idx} value={company}>{company}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {(selectedJobTitle || selectedCompany) && (
          <Button 
            variant="text" 
            color="error" 
            onClick={() => { setSelectedJobTitle(""); setSelectedCompany(""); }}
            sx={{ fontWeight: "bold" }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Empty Database vs Filter Mismatch separation */}
      {applications.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center", borderRadius: 3, border: "1px dashed #ccc" }}>
          <Typography variant="h6" color="error" fontWeight="bold" sx={{ mb: 1 }}>
            Zero Records Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The API responded successfully, but the `applications` array is empty. Verify that your Firestore collection is explicitly named exactly <strong>"applications"</strong> and contains documents.
          </Typography>
        </Paper>
      ) : Object.keys(filteredGroupedApplicants).length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No applicant items match your chosen dashboard filters.
          </Typography>
        </Paper>
      ) : (
        Object.keys(filteredGroupedApplicants).map((titleKey) => {
          const { applicants, jobDetails } = filteredGroupedApplicants[titleKey];
          
          return (
            <Accordion 
              key={titleKey} 
              defaultExpanded
              sx={{ 
                mb: 2, 
                borderRadius: 2, 
                '&:before': { display: 'none' }, 
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                overflow: "hidden"
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {jobDetails.title} <span style={{ color: "gray", fontSize: "0.9rem", fontWeight: "normal" }}>({jobDetails.company})</span>
                  </Typography>
                  <Chip 
                    label={`${applicants.length} Candidate${applicants.length > 1 ? 's' : ''}`} 
                    color="primary" 
                    variant="contained" 
                    size="small"
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: "#f4f6f8" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Applicant Name</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Email Address</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Applied Date</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Tracking Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {applicants.map((app) => (
                        <TableRow key={app.id} hover>
                          <TableCell sx={{ fontWeight: "medium" }}>{app.applicantName}</TableCell>
                          <TableCell>{app.applicantEmail}</TableCell>
                          <TableCell>
                            {app.appliedAt.includes("T") ? new Date(app.appliedAt).toLocaleDateString() : app.appliedAt}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={app.status} 
                              size="small" 
                              color="info" 
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button 
                              size="small" 
                              variant="text" 
                              color="primary"
                              onClick={() => app.resumeUrl && window.open(app.resumeUrl, "_blank")}
                              disabled={!app.resumeUrl}
                            >
                              {app.resumeUrl ? "View Resume" : "No Resume"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          );
        })
      )}
    </Box>
  );
}

export default Applicants;