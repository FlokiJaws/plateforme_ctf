import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, User, Mail, Shield, Trophy, Flag, Users, Target, MessageSquare } from "lucide-react";

const Profile = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        let decoded;
        try {
            decoded = jwtDecode(token);
            const now = Date.now() / 1000;
            if (decoded.exp && decoded.exp < now) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }
        } catch (e) {
            console.error("Erreur JWT :", e);
            localStorage.removeItem("token");
            navigate("/login");
            return;
        }

        setUserInfo(decoded);
        setLoading(false);
    }, [navigate]);

    const getUserRole = () => {
        if (!userInfo) return null;
        return Array.isArray(userInfo.groups) ? userInfo.groups[0] : userInfo.groups;
    };

    if (loading) return <div className="text-center p-10 text-lg">Chargement...</div>;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <ShieldAlert size={48} className="text-destructive" />
                <p className="text-xl font-bold text-destructive">{error}</p>
                <Button variant="outline" onClick={() => navigate("/")}>Retour</Button>
            </div>
        );
    }

    const userRole = getUserRole();

    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            {/* Infos Utilisateur */}
            {userInfo && (
                <Card className="border-border bg-gradient-to-r from-card to-primary/5 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl">Mon Profil</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Pseudo */}
                            <div className="flex items-center space-x-4 p-4 bg-secondary/30 rounded-lg border border-border">
                                <User className="text-primary w-6 h-6 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Pseudo</p>
                                    <p className="text-lg font-semibold break-words">
                                        {userInfo.pseudo || "N/A"}
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center space-x-4 p-4 bg-secondary/30 rounded-lg border border-border">
                                <Mail className="text-primary w-6 h-6 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                                    <p className="text-lg font-semibold break-words">
                                        {userInfo.sub || "N/A"}
                                    </p>
                                </div>
                            </div>

                            {/* Rôle */}
                            <div className="flex items-center space-x-4 p-4 bg-secondary/30 rounded-lg border border-border">
                                <Shield className="text-primary w-6 h-6 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Rôle</p>
                                    <p className="text-lg font-semibold break-words">
                                        {userRole || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => navigate("/")}
                            className="w-full md:w-auto"
                        >
                            Retour à l'accueil
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Accès rapides selon le rôle */}
            {userInfo && (
                <Card className="border-border shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl">Accès rapides</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                            {/* ========== LIENS POUR TOUS ========== */}

                            {/* CTFs */}
                            <Button
                                variant="outline"
                                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary/10"
                                onClick={() => navigate('/all-ctfs')}
                            >
                                <Flag className="w-6 h-6 text-primary" />
                                <span className="font-semibold">CTFs</span>
                            </Button>

                            {/* Classement */}
                            <Button
                                variant="outline"
                                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary/10"
                                onClick={() => navigate('/leaderboard')}
                            >
                                <Trophy className="w-6 h-6 text-primary" />
                                <span className="font-semibold">Classement</span>
                            </Button>

                            {/* ========== LIENS PARTICIPANT ========== */}

                            {userRole === 'PARTICIPANT' && (
                                <>
                                    {/* Défis */}
                                    <Button
                                        variant="outline"
                                        className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                        onClick={() => navigate('/defis')}
                                    >
                                        <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                        <span className="font-semibold">Défis</span>
                                    </Button>

                                    {/* Messagerie */}
                                    <Button
                                        variant="outline"
                                        className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                        onClick={() => navigate('/messaging')}
                                    >
                                        <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        <span className="font-semibold">Messagerie</span>
                                    </Button>

                                    {/* Mes CTFs */}
                                    <Button
                                        variant="outline"
                                        className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-green-50 dark:hover:bg-green-900/20"
                                        onClick={() => navigate('/my-ctfs')}
                                    >
                                        <ShieldAlert className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        <span className="font-semibold">Mes CTFs</span>
                                    </Button>

                                    {/* Mon Équipe */}
                                    <Button
                                        variant="outline"
                                        className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                        onClick={() => navigate('/my-team')}
                                    >
                                        <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        <span className="font-semibold">Mon Équipe</span>
                                    </Button>
                                </>
                            )}

                            {/* ========== LIENS ORGANISATEUR ========== */}

                            {userRole === 'ORGANISATEUR' && (
                                <>
                                    {/* Messagerie */}
                                    <Button
                                        variant="outline"
                                        className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                        onClick={() => navigate('/messaging')}
                                    >
                                        <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        <span className="font-semibold">Messagerie</span>
                                    </Button>

                                    {/* Mes CTFs */}
                                    <Button
                                        variant="outline"
                                        className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-green-50 dark:hover:bg-green-900/20"
                                        onClick={() => navigate('/organizer-ctfs')}
                                    >
                                        <ShieldAlert className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        <span className="font-semibold">Mes CTFs</span>
                                    </Button>
                                </>
                            )}

                            {/* ========== LIENS ADMINISTRATEUR ========== */}

                            {userRole === 'ADMINISTRATEUR' && (
                                <>
                                    {/* Défis */}
                                    <Button
                                        variant="outline"
                                        className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                        onClick={() => navigate('/defis')}
                                    >
                                        <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                        <span className="font-semibold">Défis</span>
                                    </Button>

                                    {/* Messagerie */}
                                    <Button
                                        variant="outline"
                                        className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                        onClick={() => navigate('/messaging')}
                                    >
                                        <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        <span className="font-semibold">Messagerie</span>
                                    </Button>

                                    {/* Dashboard */}
                                    <Button
                                        variant="outline"
                                        className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        onClick={() => navigate('/admin/dashboard')}
                                    >
                                        <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
                                        <span className="font-semibold">Dashboard</span>
                                    </Button>

                                    {/* Équipes */}
                                    <Button
                                        variant="outline"
                                        className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                        onClick={() => navigate('/admin/teams')}
                                    >
                                        <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        <span className="font-semibold">Équipes</span>
                                    </Button>
                                </>
                            )}

                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Profile;