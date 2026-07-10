import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import ResumeBuilder from "./pages/ResumeBuilder";
import Layout from "./components/Layout";
import Settings from "./pages/Settings"; 
import CreateJob from "./pages/CreateJob";
import Profile from "./pages/Profile";
import Notification from "./pages/Notification";
import Applicants from "./pages/Applicants";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={
          <Layout><Dashboard /></Layout>
        } />

        <Route path="/jobs" element={
          <Layout><Jobs /></Layout>
        } />

        <Route path="/resume" element={
          <Layout><ResumeBuilder /></Layout>
        } />
        
        <Route path="/settings" element={
          <Layout><Settings /></Layout>
        } />

        <Route path="/createJob" element={
          <Layout><CreateJob/></Layout>
        } />

        <Route path="/profile" element={
          <Layout><Profile /></Layout>
        } />

        <Route path="/notifications" element={
         <Layout> <Notification/></Layout>
        } />

        <Route path="/applicants" element={
         <Layout> <Applicants/></Layout>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;