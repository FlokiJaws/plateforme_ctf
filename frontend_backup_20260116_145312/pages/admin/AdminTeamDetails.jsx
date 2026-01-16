import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Users, ArrowLeft, Crown, Mail, AlertCircle } from "lucide-react";

const AdminTeamDetails = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const role = Array.isArray(decoded.groups) ? decoded.groups[0] : decoded.groups;

            if (role !== 'ADMINISTRATEUR') {
                navigate('/profile');
                return;
            }

            fetchTeamDetails(token);
        } catch (e) {
            console.error('Erreur JWT:', e);
            navigate('/login');
        }
    }, [teamId, navigate]);

    const fetchTeamDetails = async (token) => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.get(`http://localhost:8080/equipes/${teamId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTeam(response.data);
        } catch (err) {
            console.error('Erreur récupération équipe:', err);
            setError(err.response?.data?.message || 'Erreur lors de la récupération de l\'équipe');
        } finally {
            setLoading(false);
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

    if (loading) {
        return <div className="text-center p-10 text-lg">Chargement...</div>;
    }

    if (error || !team) {
        return (
            <div className="container mx-auto py-10 px-4 max-w-4xl">
                <div className="space-y-4">
                    <Button variant="outline" onClick={() => navigate('/admin/teams')} className="flex items-center gap-2">
                        <ArrowLeft size={18} />
                        Retour
                    </Button>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-start gap-3">
                        <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
                        <p>{error || 'Équipe introuvable'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/admin/teams')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Retour
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Détails de l'équipe</h1>
                        <p className="text-muted-foreground mt-1">Vue administrateur</p>
                    </div>
                </div>

                {/* Carte de l'équipe */}
                <Card className="border-2 border-primary/40 shadow-lg">
                    <CardHeader className="border-b border-border">
                        <div className="flex items-center gap-6">
                            {/* Logo de l'équipe */}
                            <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {generateDefaultLogo(team.nomEquipe)}
                            </div>

                            <div>
                                <CardTitle className="text-3xl mb-2">{team.nomEquipe}</CardTitle>
                                <div className="flex items-center gap-2 text-sm">
                                    <Crown className="w-4 h-4 text-yellow-500" />
                                    <span className="text-muted-foreground">
                                        Chef : {team.chefEquipePseudo || team.chefEquipeEmail}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        {/* Informations de l'équipe */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4">Informations</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                                    <Mail className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Chef d'équipe</p>
                                        <p className="font-semibold">{team.chefEquipePseudo || 'N/A'}</p>
                                        <p className="text-sm text-muted-foreground">{team.chefEquipeEmail}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                                    <Users className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Membres</p>
                                        <p className="font-semibold text-lg">{team.participants?.length || 1}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(team.participants?.length || 1) === 1 ? 'Membre' : 'Membres'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Liste des membres */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Membres de l'équipe</h3>
                            <div className="space-y-3">
                                {team.participants && team.participants.length > 0 ? (
                                    team.participants.map((participant, index) => {
                                        const isTeamChef = participant.email === team.chefEquipeEmail;

                                        return (
                                            <div
                                                key={participant.email || index}
                                                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* Avatar */}
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                                        isTeamChef
                                                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                                                            : 'bg-gradient-to-br from-primary to-blue-500'
                                                    }`}>
                                                        {participant.pseudo?.charAt(0).toUpperCase() || 'U'}
                                                    </div>

                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold">{participant.pseudo || 'Utilisateur'}</p>
                                                            {isTeamChef && (
                                                                <Crown className="w-4 h-4 text-yellow-500" />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Mail className="w-3 h-3" />
                                                            <span>{participant.email}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {isTeamChef && (
                                                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                                        Chef
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Aucun membre pour le moment
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminTeamDetails;