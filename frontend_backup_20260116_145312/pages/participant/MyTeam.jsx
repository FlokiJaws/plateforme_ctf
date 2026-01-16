import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Users, Plus, ArrowLeft, Crown, Mail, LogOut, UserX, UserCog, AlertCircle, Bell } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog.jsx";

const MyTeam = () => {
    const navigate = useNavigate();
    const { token, userEmail, isLoading } = useAuth(['PARTICIPANT']);

    const [myTeam, setMyTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isChef, setIsChef] = useState(false);

    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [showKickDialog, setShowKickDialog] = useState(false);
    const [showTransferDialog, setShowTransferDialog] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [newChefEmail, setNewChefEmail] = useState('');
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

    useEffect(() => {
        if (!isLoading && token && userEmail) {
            fetchMyTeam();
        }
    }, [token, userEmail, isLoading]);

    const fetchMyTeam = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.get('http://localhost:8080/equipes/all', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const allEquipes = response.data || [];
            let foundTeam = null;
            let foundIsChef = false;

            const teamAsChef = allEquipes.find(equipe => equipe.chefEquipeEmail === userEmail);

            if (teamAsChef) {
                foundTeam = teamAsChef;
                foundIsChef = true;
            } else {
                for (const equipe of allEquipes) {
                    const teamId = equipe.equipeId || equipe.id;
                    if (!teamId) continue;

                    try {
                        const detailsResponse = await axios.get(`http://localhost:8080/equipes/${teamId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        const participants = detailsResponse.data.participants || [];
                        const isMember = participants.some(p => p.email === userEmail);

                        if (isMember) {
                            foundTeam = detailsResponse.data;
                            foundIsChef = detailsResponse.data.chefEquipeEmail === userEmail;
                            break;
                        }
                    } catch (detailErr) {
                        console.warn(`Erreur pour l'équipe ${teamId}:`, detailErr);
                    }
                }
            }

            if (foundTeam) {
                const teamId = foundTeam.equipeId || foundTeam.id;

                if (!teamId) {
                    setMyTeam(null);
                    setIsChef(false);
                    setError('Équipe invalide (pas d\'ID)');
                    return;
                }

                try {
                    const detailsResponse = await axios.get(`http://localhost:8080/equipes/${teamId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    const teamData = {
                        ...detailsResponse.data,
                        id: detailsResponse.data.id || teamId,
                        nom: detailsResponse.data.nom || foundTeam.nomEquipe
                    };

                    setMyTeam(teamData);
                    setIsChef(foundIsChef);

                    if (foundIsChef) {
                        try {
                            const requestsResponse = await axios.get(
                                `http://localhost:8080/equipes/${teamId}/members?candidature_statut=EN_ATTENTE`,
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            setPendingRequestsCount(requestsResponse.data?.length || 0);
                        } catch (reqErr) {
                            setPendingRequestsCount(0);
                        }
                    }
                } catch (detailErr) {
                    setError('Impossible de récupérer les détails de l\'équipe');
                    setMyTeam(null);
                    setIsChef(false);
                }
            } else {
                setMyTeam(null);
                setIsChef(false);
            }
        } catch (err) {
            console.error('Erreur récupération équipe:', err);
            setError(err.response?.data?.message || 'Erreur lors de la récupération de votre équipe');
            setMyTeam(null);
            setIsChef(false);
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveTeam = async () => {
        try {
            await axios.post(`http://localhost:8080/equipes/leave?equipeId=${myTeam.id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowLeaveDialog(false);
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'abandon de l\'équipe');
            setShowLeaveDialog(false);
        }
    };

    const handleKickMember = async () => {
        try {
            await axios.post('http://localhost:8080/equipes/kick', {
                equipeId: myTeam.id,
                membreEmail: selectedMember.email
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowKickDialog(false);
            setSelectedMember(null);
            fetchMyTeam();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'expulsion du membre');
            setShowKickDialog(false);
        }
    };

    const handleDesignateNewChef = async () => {
        if (!newChefEmail?.trim()) {
            setError('Veuillez sélectionner un nouveau chef');
            return;
        }

        try {
            await axios.post('http://localhost:8080/equipes/designate_new_chef', {
                equipeId: myTeam.id,
                newChefEmail
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowTransferDialog(false);
            setNewChefEmail('');
            fetchMyTeam();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du transfert du rôle de chef');
            setShowTransferDialog(false);
        }
    };

    const generateDefaultLogo = (name) => {
        if (!name) return 'EQ';
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || 'EQ';
    };

    if (isLoading || loading) {
        return <div className="text-center p-10 text-lg">Chargement...</div>;
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Users className="text-primary" />
                            Mon Équipe
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {myTeam
                                ? 'Gérez votre équipe pour les compétitions CTF'
                                : 'Créez votre équipe pour participer aux CTFs en groupe'
                            }
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/profile')} className="flex items-center space-x-2">
                        <ArrowLeft size={18} />
                        <span>Retour</span>
                    </Button>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-start gap-3">
                        <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
                        <p>{error}</p>
                    </div>
                )}

                {!myTeam ? (
                    <Card className="border-border shadow-lg">
                        <CardContent className="pt-12 pb-12 text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="p-6 bg-secondary rounded-full">
                                    <Users size={64} className="text-muted-foreground" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">Vous n'avez pas encore d'équipe</h2>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    Créez votre équipe pour participer aux CTFs en groupe !
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button onClick={() => navigate('/team/create')} className="flex items-center gap-2" size="lg">
                                    <Plus size={20} />
                                    Créer une équipe
                                </Button>
                                <Button variant="outline" size="lg" onClick={() => navigate('/all-teams')}>
                                    <Users size={20} className="mr-2" />
                                    Voir toutes les équipes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {isChef && (
                            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                                <CardContent className="pt-6">
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                        <Crown className="w-5 h-5" />
                                        Vos privilèges de chef d'équipe
                                    </h3>
                                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                                        <li>Gérer les demandes d'adhésion</li>
                                        <li>Expulser des membres</li>
                                        <li>Promouvoir un membre au rang de chef</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-2 border-primary/40 shadow-lg">
                            <CardHeader className="border-b border-border">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                            {generateDefaultLogo(myTeam.nom)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-3xl mb-2">{myTeam.nom}</CardTitle>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Crown className="w-4 h-4 text-yellow-500" />
                                                <span className="text-muted-foreground">
                                                    {isChef ? 'Vous êtes le chef d\'équipe' : 'Membre de l\'équipe'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {isChef && (
                                        <Button variant="outline" onClick={() => navigate('/team/requests')} className="flex items-center gap-2 relative">
                                            <Bell size={18} />
                                            Demandes
                                            {pendingRequestsCount > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                    {pendingRequestsCount}
                                                </span>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="pt-6">
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-4">Informations</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                                            <Mail className="w-5 h-5 text-primary mt-0.5" />
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Chef d'équipe</p>
                                                <p className="font-semibold">{myTeam.chefEquipePseudo || 'N/A'}</p>
                                                <p className="text-sm text-muted-foreground">{myTeam.chefEquipeEmail}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                                            <Users className="w-5 h-5 text-primary mt-0.5" />
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Membres</p>
                                                <p className="font-semibold text-lg">{myTeam.participants?.length || 1}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Membres de l'équipe</h3>
                                    <div className="space-y-3">
                                        {myTeam.participants?.length > 0 ? (
                                            myTeam.participants.map((participant, index) => {
                                                const isTeamChef = participant.email === myTeam.chefEquipeEmail;
                                                const isCurrentUser = participant.email === userEmail;

                                                return (
                                                    <div key={participant.email || index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                                                        <div className="flex items-center gap-3">
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
                                                                    {isTeamChef && <Crown className="w-4 h-4 text-yellow-500" />}
                                                                    {isCurrentUser && <span className="text-xs text-primary">(Vous)</span>}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <Mail className="w-3 h-3" />
                                                                    <span>{participant.email}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {isChef && !isCurrentUser && !isTeamChef && (
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm" onClick={() => {
                                                                    setNewChefEmail(participant.email);
                                                                    setShowTransferDialog(true);
                                                                }} className="flex items-center gap-2">
                                                                    <UserCog size={14} />
                                                                    Promouvoir
                                                                </Button>
                                                                <Button variant="destructive" size="sm" onClick={() => {
                                                                    setSelectedMember(participant);
                                                                    setShowKickDialog(true);
                                                                }} className="flex items-center gap-2">
                                                                    <UserX size={14} />
                                                                    Expulser
                                                                </Button>
                                                            </div>
                                                        )}

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

                            <CardFooter className="border-t border-border pt-6 flex justify-between">
                                <Button variant="outline" onClick={() => navigate('/all-teams')} className="flex items-center gap-2">
                                    <Users size={16} />
                                    Toutes les équipes
                                </Button>

                                <Button variant="destructive" onClick={() => setShowLeaveDialog(true)} className="flex items-center gap-2">
                                    <LogOut size={16} />
                                    {isChef ? 'Quitter (et transférer)' : 'Quitter l\'équipe'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </>
                )}
            </div>

            <ConfirmDialog
                show={showLeaveDialog}
                title="Quitter l'équipe"
                message={isChef
                    ? "En tant que chef, vous devez d'abord désigner un nouveau chef. Voulez-vous vraiment quitter ?"
                    : `Êtes-vous sûr de vouloir quitter l'équipe "${myTeam?.nom}" ?`
                }
                onConfirm={handleLeaveTeam}
                onCancel={() => setShowLeaveDialog(false)}
                confirmLabel="Quitter"
                confirmVariant="destructive"
            />

            <ConfirmDialog
                show={showKickDialog}
                title="Expulser un membre"
                message={`Êtes-vous sûr de vouloir expulser ${selectedMember?.pseudo} de l'équipe ?`}
                onConfirm={handleKickMember}
                onCancel={() => { setShowKickDialog(false); setSelectedMember(null); }}
                confirmLabel="Expulser"
                confirmVariant="destructive"
            />

            {showTransferDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCog className="text-primary" />
                                Promouvoir au rang de chef
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Vous allez transférer le rôle de chef d'équipe.
                            </p>
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    <strong>Attention :</strong> Cette action est irréversible.
                                </p>
                            </div>
                            {newChefEmail && (
                                <div className="p-3 bg-secondary rounded-lg">
                                    <p className="text-sm">
                                        <span className="text-muted-foreground">Nouveau chef :</span>
                                        <br />
                                        <strong>{newChefEmail}</strong>
                                    </p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => { setShowTransferDialog(false); setNewChefEmail(''); }}>
                                Annuler
                            </Button>
                            <Button onClick={handleDesignateNewChef} className="bg-primary">
                                Confirmer le transfert
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default MyTeam;