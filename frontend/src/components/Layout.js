import { Box } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Navbar />
        {/* Main Content Area */}
        <Box sx={{ p: 3, flexGrow: 1, backgroundColor: "#f8f9fa" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;