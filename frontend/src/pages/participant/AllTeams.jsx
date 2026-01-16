import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Users, ArrowLeft, Crown, Search, Send } from "lucide-react";
import Pagination from "@/components/common/Pagination.jsx";
import ConfirmDialog from "@/components/common/ConfirmDialog.jsx";
import { buildApiUrl } from '@/config/api';

const TEAMS_PER_PAGE = 12;

const AllTeams = () => {
    const navigate = useNavigate();
    const [allTeams, setAllTeams] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [userEmail, setUserEmail] = useState('');
    const [userTeamId, setUserTeamId] = useState(null);

    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const role = Array.isArray(decoded.groups) ? decoded.groups[0] : decoded.groups;

            if (role !== 'PARTICIPANT') {
                navigate('/profile');
                return;
            }

            setUserEmail(decoded.sub);
            fetchAllTeams(token, decoded.sub);
        } catch (e) {
            console.error('Erreur JWT:', e);
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        applyFilters();
    }, [allTeams, searchTerm]);

    const fetchAllTeams = async (token, email) => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.get(buildApiUrl('/equipes/all'), {
                headers: { Authorization: `Bearer ${token}` }
            });

            const teams = response.data || [];
            setAllTeams(teams);

            // Vérifier si l'utilisateur est déjà dans une équipe
            const userTeam = teams.find(team => team.chefEquipeEmail === email);
            setUserTeamId(userTeam?.id || null);
        } catch (err) {
            console.error('Erreur récupération équipes:', err);
            setError(err.response?.data?.message || 'Erreur lors de la récupération des équipes');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...allTeams];

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(team =>
                team.nom?.toLowerCase().includes(search) ||
                team.chefEquipePseudo?.toLowerCase().includes(search) ||
                team.chefEquipeEmail?.toLowerCase().includes(search)
            );
        }

        setFilteredTeams(filtered);
        setCurrentPage(1);
    };

    const handleJoinRequest = async () => {
        if (!selectedTeam) return;

        const token = localStorage.getItem('token');

        try {
            await axios.post(buildApiUrl(`/equipes/request?equipeId=${selectedTeam.id}`), {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowJoinDialog(false);
            setSelectedTeam(null);
            alert('Votre demande a été envoyée avec succès !');
        } catch (err) {
            console.error('Erreur demande rejoindre:', err);
            setError(err.response?.data?.message || 'Erreur lors de l\'envoi de la demande');
            setShowJoinDialog(false);
        }
    };

    const generateDefaultLogo = (name) => {
        if (!name) return 'EQ';
        const initials = name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        return initials || 'EQ';
    };

    const totalPages = Math.ceil(filteredTeams.length / TEAMS_PER_PAGE);
    const startIdx = (currentPage - 1) * TEAMS_PER_PAGE;
    const paginatedTeams = filteredTeams.slice(startIdx, startIdx + TEAMS_PER_PAGE);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return <div className="text-center p-10 text-lg">Chargement...</div>;
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold flex items-center gap-3">
                            <Users className="text-primary" />
                            Toutes les Équipes
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {filteredTeams.length} équipe{filteredTeams.length > 1 ? 's' : ''} trouvée{filteredTeams.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/my-team')} className="flex items-center space-x-2">
                        <ArrowLeft size={18} />
                        <span>Mon équipe</span>
                    </Button>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Barre de recherche */}
                <div className="flex gap-4 flex-wrap items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                        <Input
                            placeholder="Rechercher une équipe ou un chef..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Info si l'utilisateur a déjà une équipe */}
                {userTeamId && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-lg">
                        Vous êtes déjà membre d'une équipe. Vous devez la quitter avant de rejoindre une autre équipe.
                    </div>
                )}

                {/* Liste des équipes */}
                {filteredTeams.length === 0 ? (
                    <Card className="border-border">
                        <CardContent className="pt-12 pb-12 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-6 bg-secondary rounded-full">
                                    <Users size={64} className="text-muted-foreground" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {searchTerm ? 'Aucune équipe trouvée' : 'Aucune équipe créée'}
                            </h3>
                            <p className="text-muted-foreground">
                                {searchTerm
                                    ? 'Essayez de modifier votre recherche'
                                    : 'Soyez le premier à créer une équipe !'
                                }
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedTeams.map((team, index) => {
                            const isUserTeam = team.id === userTeamId;
                            const isUserChef = team.chefEquipeEmail === userEmail;

                            return (
                                <Card
                                    key={team.id || index}
                                    className={`border-2 transition-all duration-300 hover:shadow-lg ${
                                        isUserTeam
                                            ? 'border-primary bg-primary/5'
                                            : 'border-primary/40 hover:border-primary/70'
                                    }`}
                                >
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-4">
                                            {/* Logo de l'équipe */}
                                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0">
                                                {generateDefaultLogo(team.nom)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-xl truncate">
                                                    {team.nom}
                                                </CardTitle>
                                                {isUserTeam && (
                                                    <span className="text-xs text-primary font-medium">
                                                        Votre équipe
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="space-y-3">
                                            {/* Chef d'équipe */}
                                            <div className="flex items-start gap-2">
                                                <Crown className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Chef d'équipe</p>
                                                    <p className="font-semibold truncate">
                                                        {team.chefEquipePseudo || 'N/A'}
                                                    </p>
                                                    {team.chefEquipeEmail && (
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {team.chefEquipeEmail}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Nombre de membres */}
                                            <div className="flex items-center gap-2 pt-2 border-t border-border">
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">
                                                    {team.nombreMembres || team.membresCount || 1} membre{(team.nombreMembres || team.membresCount || 1) > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="pt-4 border-t border-border">
                                        {isUserTeam ? (
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => navigate('/my-team')}
                                            >
                                                Voir mon équipe
                                            </Button>
                                        ) : (
                                            <Button
                                                className="w-full flex items-center gap-2"
                                                onClick={() => {
                                                    setSelectedTeam(team);
                                                    setShowJoinDialog(true);
                                                }}
                                                disabled={!!userTeamId}
                                            >
                                                <Send size={16} />
                                                {userTeamId ? 'Déjà dans une équipe' : 'Demander à rejoindre'}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            {/* Dialog: Demander à rejoindre */}
            <ConfirmDialog
                show={showJoinDialog}
                title="Demander à rejoindre"
                message={`Envoyer une demande pour rejoindre l'équipe "${selectedTeam?.nom}" ?`}
                onConfirm={handleJoinRequest}
                onCancel={() => {
                    setShowJoinDialog(false);
                    setSelectedTeam(null);
                }}
                confirmLabel="Envoyer la demande"
                confirmVariant="default"
            />
        </div>
    );
};

export default AllTeams;