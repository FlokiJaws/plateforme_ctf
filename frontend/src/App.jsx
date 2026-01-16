import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import Home from './pages/Home';
import AllCtfs from './pages/participant/AllCtfs.jsx';
import Navbar from './components/layout/Navbar.jsx';
import CtfDetails from './pages/participant/CtfDetail.jsx';
import Profile from './pages/Profile';
import MyCtfs from './pages/participant/MyCtfs.jsx';
import OrganizerCtfs from './pages/organisateur/OrganizerCtfs.jsx';
import OrganizerCtfParticipants from './pages/organisateur/OrganizerCtfParticipants.jsx';
import CreateCtf from './pages/organisateur/CreateCtf.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminCtfValidation from "@/pages/admin/AdminCtfValidation.jsx";
import AdminCtfDelete from "@/pages/admin/AdminCtfDelete.jsx";
import AdminCtfEdit from "@/pages/admin/AdminCtfEdit.jsx";
import AdminCtfParticipants from './pages/admin/AdminCtfParticipants.jsx';
import Leaderboard from './pages/participant/Leaderboard.jsx';
import MyTeam from './pages/participant/MyTeam.jsx';
import CreateTeam from './pages/participant/CreateTeam.jsx';
import AllTeams from './pages/participant/AllTeams.jsx';
import TeamRequests from './pages/participant/TeamRequests.jsx';
import AdminTeams from './pages/admin/AdminTeams.jsx';
import AdminTeamDetails from './pages/admin/AdminTeamDetails.jsx';
import AllDefis from './pages/participant/AllDefis.jsx';
import Messaging from './pages/Messaging.jsx';
import Conversation from './pages/Conversation.jsx';
import DefiDetail from './pages/participant/DefiDetail.jsx';
import CreateDefi from './pages/admin/CreateDefi.jsx';


function App() {
    const [theme, setTheme] = useState('dark');
    const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    return (
        <Router>
            <div className="min-h-screen bg-background font-sans text-foreground antialiased">
                <Navbar theme={theme} toggleTheme={toggleTheme} />
                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/my-ctfs" element={<MyCtfs />} />
                        <Route path="/organizer-ctfs" element={<OrganizerCtfs />} />
                        <Route path="/organizer-ctfs/create" element={<CreateCtf />} />
                        <Route path="/organizer-ctfs/:id/participants" element={<OrganizerCtfParticipants />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/ctf/:id" element={<CtfDetails />} />
                        <Route path="/all-ctfs" element={<AllCtfs />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/admin/ctf-validation" element={<AdminCtfValidation />} />
                        <Route path="/admin/ctf-delete" element={<AdminCtfDelete />} />
                        <Route path="/admin/ctf-edit" element={<AdminCtfEdit />} />
                        <Route path="/admin/ctfs/:id/participants" element={<AdminCtfParticipants />} />
                        <Route path="/my-team" element={<MyTeam />} />
                        <Route path="/team/create" element={<CreateTeam />} />
                        <Route path="/all-teams" element={<AllTeams />} />
                        <Route path="/team/requests" element={<TeamRequests />} />
                        <Route path="/admin/teams" element={<AdminTeams />} />
                        <Route path="/admin/teams/:teamId" element={<AdminTeamDetails />} />
                        <Route path="/defis" element={<AllDefis />} />
                        <Route path="/messaging" element={<Messaging />} />
                        <Route path="/messaging/:conversationId" element={<Conversation />} />
                        <Route path="/defis/:id" element={<DefiDetail />} />
                        <Route path="/defis/create" element={<CreateDefi />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;