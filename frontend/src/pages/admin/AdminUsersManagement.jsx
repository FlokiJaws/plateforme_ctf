import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Ban, User, Mail, Shield } from "lucide-react";
import Pagination from "@/components/common/Pagination.jsx";
import { buildApiUrl } from '@/config/api';

const ITEMS_PER_PAGE = 10;

const AdminUsersManagement = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("ALL");

    const [banningUser, setBanningUser] = useState(null);
    const [banReason, setBanReason] = useState("");

    useEffect(() => {
        fetchAllUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [allUsers, searchTerm, filterRole]);

    const fetchAllUsers = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(buildApiUrl("/users/getall/admin"), {
                headers: { Authorization: `Bearer ${token}` },
            });

            setAllUsers(response.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Erreur users :", err);
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...allUsers];

        if (filterRole === "BANNED") {
            filtered = filtered.filter(user => user.banned === true);
        } else {
            filtered = filtered.filter(user => user.banned !== true);

            if (filterRole !== "ALL") {
                filtered = filtered.filter(user => user.role === filterRole);
            }
        }

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                user.pseudo?.toLowerCase().includes(search) ||
                user.email?.toLowerCase().includes(search) ||
                user.role?.toLowerCase().includes(search)
            );
        }

        setFilteredUsers(filtered);
        setCurrentPage(1);
    };

    const handleBan = async () => {
        if (!banReason.trim()) {
            alert("Veuillez fournir une raison de bannissement");
            return;
        }

        const token = localStorage.getItem("token");
        try {
            await axios.post(
                buildApiUrl("/users/ban"),
                { userEmail: banningUser.email, banReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchAllUsers();
            setBanningUser(null);
            setBanReason("");
            alert("Utilisateur banni avec succès");
        } catch (err) {
            console.error("Erreur bannissement :", err);
            alert(err.response?.data?.message || "Erreur lors du bannissement");
        }
    };

    const getRoleBadge = (role) => {
        const styles = {
            ADMINISTRATEUR: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
            ORGANISATEUR: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
            PARTICIPANT: "bg-green-500/20 text-green-600 dark:text-green-400"
        };
        return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${styles[role]}`}>{role}</span>;
    };

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedUsers = filteredUsers.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return <div className="text-center p-10 text-lg">Chargement...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
                <p className="text-muted-foreground">{filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}</p>

                <div className="flex gap-3 flex-wrap items-center">
                    <Input
                        placeholder="Rechercher par pseudo, email ou rôle..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />

                    <div className="flex gap-2">
                        <Button
                            variant={filterRole === "ALL" ? "default" : "outline"}
                            onClick={() => setFilterRole("ALL")}
                            size="sm"
                        >
                            Tous
                        </Button>
                        <Button
                            variant={filterRole === "ADMINISTRATEUR" ? "default" : "outline"}
                            onClick={() => setFilterRole("ADMINISTRATEUR")}
                            size="sm"
                        >
                            Admin
                        </Button>
                        <Button
                            variant={filterRole === "ORGANISATEUR" ? "default" : "outline"}
                            onClick={() => setFilterRole("ORGANISATEUR")}
                            size="sm"
                        >
                            Organisateur
                        </Button>
                        <Button
                            variant={filterRole === "PARTICIPANT" ? "default" : "outline"}
                            onClick={() => setFilterRole("PARTICIPANT")}
                            size="sm"
                        >
                            Participant
                        </Button>
                        <Button
                            variant={filterRole === "BANNED" ? "destructive" : "outline"}
                            onClick={() => setFilterRole("BANNED")}
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                            Bannis
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {paginatedUsers.length > 0 ? (
                    paginatedUsers.map(user => (
                        <Card key={user.email} className="border-2 border-primary/40">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-muted-foreground" />
                                                <span className="font-semibold">{user.pseudo}</span>
                                                {getRoleBadge(user.role)}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail size={14} />
                                                <span>{user.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {!user.banned ? (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setBanningUser(user)}
                                            className="flex items-center gap-2"
                                        >
                                            <Ban size={16} />
                                            Bannir
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                            className="flex items-center gap-2 opacity-50"
                                        >
                                            <Ban size={16} />
                                            Déjà banni
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        Aucun utilisateur trouvé
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}

            {/* Modal de bannissement */}
            {banningUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardContent className="pt-6 space-y-4">
                            <h3 className="text-lg font-bold text-red-600">Bannir l'utilisateur</h3>
                            <p>
                                Vous êtes sur le point de bannir <strong>{banningUser.pseudo}</strong> ({banningUser.email})
                            </p>

                            <div>
                                <label className="text-sm font-medium">Raison du bannissement</label>
                                <Input
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    placeholder="Ex: Violation des règles de la plateforme"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setBanningUser(null);
                                        setBanReason("");
                                    }}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleBan}
                                    disabled={!banReason.trim()}
                                >
                                    Bannir définitivement
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminUsersManagement;