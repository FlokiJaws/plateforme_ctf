import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Plus, User, ShieldAlert, X } from "lucide-react";

const CONVERSATIONS_PER_PAGE = 10;

const Messaging = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal nouvelle conversation
    const [showNewConversationModal, setShowNewConversationModal] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [loadingUsers, setLoadingUsers] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
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

        const role = Array.isArray(decoded.groups) ? decoded.groups[0] : decoded.groups;

        // Vérifier que l'utilisateur a accès à la messagerie
        if (role !== 'PARTICIPANT' && role !== 'ORGANISATEUR' && role !== 'ADMINISTRATEUR') {
            navigate("/");
            return;
        }

        setUserInfo(decoded);
        setUserRole(role);
        fetchConversations();
    }, [navigate, token]);

    const fetchConversations = async () => {
        try {
            const response = await axios.get('http://localhost:8080/messaging/conversations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(response.data || []);
        } catch (err) {
            console.error('Erreur récupération conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableUsers = async () => {
        setLoadingUsers(true);
        try {
            const decoded = jwtDecode(token);
            const currentUserEmail = decoded.sub;

            let allUsers = [];

            // Si admin, utiliser l'endpoint qui récupère tout le monde
            if (userRole === 'ADMINISTRATEUR') {
                const response = await axios.get('http://localhost:8080/users/getall/admin', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                allUsers = response.data || [];
            } else {
                // Pour les autres rôles, récupérer participants et organisateurs
                const [participantsRes, organisateursRes] = await Promise.all([
                    axios.get('http://localhost:8080/users/getall/participants', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:8080/users/getall/organisateurs', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                allUsers = [
                    ...(participantsRes.data || []).map(u => ({ ...u, role: 'PARTICIPANT' })),
                    ...(organisateursRes.data || []).map(u => ({ ...u, role: 'ORGANISATEUR' }))
                ];
            }

            // Filtrer l'utilisateur actuel
            const filteredUsers = allUsers.filter(u => u.email !== currentUserEmail);

            setAvailableUsers(filteredUsers);
        } catch (err) {
            console.error('Erreur récupération utilisateurs:', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const openNewConversationModal = () => {
        setShowNewConversationModal(true);
        fetchAvailableUsers();
    };

    const startConversation = async (userEmail) => {
        try {
            const response = await axios.post(
                'http://localhost:8080/messaging/conversations/start',
                { recipientEmail: userEmail },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Réponse start conversation:', response.data);
            const conversationId = response.data.conversationId || response.data.id || response.data.data?.conversationId;
            console.log('conversationId extrait:', conversationId);

            if (!conversationId) {
                console.error('Pas de conversationId dans la réponse');
                return;
            }

            setShowNewConversationModal(false);
            navigate(`/messaging/${conversationId}`);
        } catch (err) {
            console.error('Erreur création conversation:', err);
        }
    };

    // Filtrer les conversations
    const filteredConversations = conversations.filter(conv => {
        const searchLower = searchTerm.toLowerCase();
        return (
            conv.otherUserPseudo?.toLowerCase().includes(searchLower) ||
            conv.otherUserEmail?.toLowerCase().includes(searchLower)
        );
    });

    // Pagination
    const totalPages = Math.ceil(filteredConversations.length / CONVERSATIONS_PER_PAGE);
    const startIndex = (currentPage - 1) * CONVERSATIONS_PER_PAGE;
    const paginatedConversations = filteredConversations.slice(startIndex, startIndex + CONVERSATIONS_PER_PAGE);

    // Filtrer les utilisateurs dans le modal
    const filteredUsers = availableUsers.filter(user => {
        const searchLower = userSearchTerm.toLowerCase();
        return (
            user.pseudo?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower)
        );
    });

    // Formater la date
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "À l'instant";
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays}j`;

        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Badge de rôle
    const getRoleBadge = (role) => {
        switch (role) {
            case 'ORGANISATEUR':
                return (
                    <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                        Orga
                    </span>
                );
            case 'ADMINISTRATEUR':
                return (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                        Admin
                    </span>
                );
            case 'PARTICIPANT':
            default:
                return (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                        Part
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <Card className="border-border shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-primary" />
                        <CardTitle className="text-3xl">Messagerie</CardTitle>
                    </div>
                    <Button onClick={openNewConversationModal} className="gap-2">
                        <Plus size={18} />
                        Nouvelle conversation
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Barre de recherche */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                            placeholder="Rechercher une conversation..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10"
                        />
                    </div>

                    {/* Liste des conversations */}
                    {paginatedConversations.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-xl font-medium text-muted-foreground mb-2">
                                {searchTerm ? "Aucune conversation trouvée" : "Aucune conversation"}
                            </p>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm
                                    ? "Essayez avec d'autres termes de recherche"
                                    : "Commencez à discuter avec quelqu'un !"
                                }
                            </p>
                            {!searchTerm && (
                                <Button onClick={openNewConversationModal} className="gap-2">
                                    <Plus size={18} />
                                    Démarrer une conversation
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {paginatedConversations.map((conv) => (
                                <div
                                    key={conv.conversationId}
                                    onClick={() => navigate(`/messaging/${conv.conversationId}`)}
                                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                                >
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>

                                    {/* Infos */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold truncate">
                                                {conv.otherUserPseudo || "Utilisateur"}
                                            </span>
                                            {getRoleBadge(conv.otherUserRole)}
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {conv.lastMessage || "Aucun message"}
                                        </p>
                                    </div>

                                    {/* Date et badge non lu */}
                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(conv.lastMessageAt)}
                                        </span>
                                        {conv.unreadCount > 0 && (
                                            <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                                                {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Précédent
                            </Button>
                            <span className="text-sm text-muted-foreground px-4">
                                Page {currentPage} sur {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Suivant
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal nouvelle conversation */}
            {showNewConversationModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-background rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-bold">Nouvelle conversation</h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowNewConversationModal(false)}
                            >
                                <X size={20} />
                            </Button>
                        </div>

                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                <Input
                                    placeholder="Rechercher un utilisateur..."
                                    value={userSearchTerm}
                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {loadingUsers ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Aucun utilisateur trouvé
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={() => startConversation(user.email)}
                                            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <User className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium truncate">
                                                        {user.pseudo}
                                                    </span>
                                                    {getRoleBadge(user.role)}
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messaging;