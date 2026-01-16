import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AdminCtfsManagement from "./AdminCtfsManagement.jsx";
import AdminUsersManagement from "./AdminUsersManagement.jsx";
import AdminParticipantsManagement from "./AdminParticipantsManagement.jsx";
import { Button } from "@/components/ui/button.jsx";
import { ArrowLeft } from "lucide-react";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState("ctfs"); // "ctfs", "users" ou "participants"

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const role = Array.isArray(decoded.groups) ? decoded.groups[0] : decoded.groups;

            if (role !== "ADMINISTRATEUR") {
                navigate("/profile");
                return;
            }
        } catch (e) {
            navigate("/login");
            return;
        }
    }, [navigate]);

    const renderContent = () => {
        switch (currentView) {
            case "ctfs":
                return <AdminCtfsManagement />;
            case "users":
                return <AdminUsersManagement />;
            case "participants":
                return <AdminParticipantsManagement />;
            default:
                return <AdminCtfsManagement />;
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            {/* Header avec navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/profile")}
                        className="flex items-center space-x-2"
                    >
                        <ArrowLeft size={18} />
                        <span>Retour</span>
                    </Button>

                    <div className="flex gap-2">
                        <Button
                            variant={currentView === "ctfs" ? "default" : "outline"}
                            onClick={() => setCurrentView("ctfs")}
                        >
                            Gestion CTFs
                        </Button>
                        <Button
                            variant={currentView === "users" ? "default" : "outline"}
                            onClick={() => setCurrentView("users")}
                        >
                            Gestion Utilisateurs
                        </Button>
                    </div>
                </div>
            </div>

            {/* Contenu selon la vue */}
            {renderContent()}
        </div>
    );
};

export default AdminDashboard;