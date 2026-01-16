import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { ArrowLeft, Check, X, Mail, User, Clock, AlertCircle } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog.jsx";
import { buildApiUrl } from '@/config/api';

const TeamRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [myTeam, setMyTeam] = useState(null);

    const [showAcceptDialog, setShowAcceptDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

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

            fetchTeamAndRequests(token, decoded.sub);
        } catch (e) {
            console.error('Erreur JWT:', e);
            navigate('/login');
        }
    }, [navigate]);

    const fetchTeamAndRequests = async (token, email) => {
        setLoading(true);
        setError('');

        try {
            // Récupérer toutes les équipes pour trouver celle de l'utilisateur
            const teamsResponse = await axios.get(buildApiUrl('/equipes/all'), {
                headers: { Authorization: `Bearer ${token}` }
            });

            const allEquipes = teamsResponse.data || [];
            const userTeam = allEquipes.find(equipe => equipe.chefEquipeEmail === email);

            if (!userTeam) {
                setError('Vous n\'êtes pas chef d\'une équipe');
                setLoading(false);
                return;
            }

            const teamId = userTeam.equipeId || userTeam.id;

            if (!teamId) {
                setError('Équipe invalide (pas d\'ID)');
                setLoading(false);
                return;
            }

            setMyTeam({
                id: teamId,
                nom: userTeam.nomEquipe || userTeam.nom,
                chefEquipeEmail: userTeam.chefEquipeEmail
            });

            // Récupérer les demandes en attente via l'endpoint existant
            const requestsResponse = await axios.get(
                buildApiUrl(`/equipes/${teamId}/members?candidature_statut=EN_ATTENTE`),
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setRequests(requestsResponse.data || []);
        } catch (err) {
            console.error('Erreur récupération demandes:', err);
            setError(err.response?.data?.message || 'Erreur lors de la récupération des demandes');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async () => {
        if (!selectedRequest) return;

        const token = localStorage.getItem('token');

        try {
            await axios.post(buildApiUrl('/equipes/respond_to_request'), {
                candidatureId: selectedRequest.candidatureId || selectedRequest.id,
                accept: true
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setShowAcceptDialog(false);
            setSelectedRequest(null);

            // Rafraîchir les demandes
            const decoded = jwtDecode(token);
            fetchTeamAndRequests(token, decoded.sub);
        } catch (err) {
            console.error('Erreur acceptation demande:', err);
            setError(err.response?.data?.message || 'Erreur lors de l\'acceptation de la demande');
            setShowAcceptDialog(false);
        }
    };

    const handleRejectRequest = async () => {
        if (!selectedRequest) return;

        const token = localStorage.getItem('token');

        try {
            await axios.post(buildApiUrl('/equipes/respond_to_request'), {
                candidatureId: selectedRequest.candidatureId || selectedRequest.id,
                accept: false
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setShowRejectDialog(false);
            setSelectedRequest(null);

            // Rafraîchir les demandes
            const decoded = jwtDecode(token);
            fetchTeamAndRequests(token, decoded.sub);
        } catch (err) {
            console.error('Erreur refus demande:', err);
            setError(err.response?.data?.message || 'Erreur lors du refus de la demande');
            setShowRejectDialog(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date inconnue';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="text-center p-10 text-lg">Chargement...</div>;
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/my-team')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Retour
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Demandes d'adhésion</h1>
                        {myTeam && (
                            <p className="text-muted-foreground mt-1">
                                {requests.length} demande{requests.length > 1 ? 's' : ''} en attente pour "{myTeam.nom}"
                            </p>
                        )}
                    </div>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-start gap-3">
                        <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
                        <p>{error}</p>
                    </div>
                )}

                {/* Liste des demandes */}
                {requests.length === 0 ? (
                    <Card className="border-border">
                        <CardContent className="pt-12 pb-12 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-6 bg-secondary rounded-full">
                                    <Clock size={64} className="text-muted-foreground" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                Aucune demande en attente
                            </h3>
                            <p className="text-muted-foreground">
                                Les demandes d'adhésion à votre équipe apparaîtront ici
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request, index) => (
                            <Card key={request.candidatureId || request.id || index} className="border-2 border-primary/40">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Avatar */}
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                                                {(request.participantPseudo || request.pseudo)?.charAt(0).toUpperCase() || 'U'}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <User size={16} className="text-muted-foreground" />
                                                    <p className="font-semibold text-lg">
                                                        {request.participantPseudo || request.pseudo || 'Utilisateur'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                    <Mail size={14} />
                                                    <span>{request.participantEmail || request.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock size={12} />
                                                    <span>Demande envoyée le {formatDate(request.joinedAt || request.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setShowAcceptDialog(true);
                                                }}
                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                            >
                                                <Check size={16} />
                                                Accepter
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setShowRejectDialog(true);
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <X size={16} />
                                                Refuser
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Dialog: Accepter la demande */}
            <ConfirmDialog
                show={showAcceptDialog}
                title="Accepter la demande"
                message={`Accepter ${selectedRequest?.participantPseudo || selectedRequest?.pseudo} dans votre équipe "${myTeam?.nom}" ?`}
                onConfirm={handleAcceptRequest}
                onCancel={() => {
                    setShowAcceptDialog(false);
                    setSelectedRequest(null);
                }}
                confirmLabel="Accepter"
                confirmVariant="default"
            />

            {/* Dialog: Refuser la demande */}
            <ConfirmDialog
                show={showRejectDialog}
                title="Refuser la demande"
                message={`Refuser la demande de ${selectedRequest?.participantPseudo || selectedRequest?.pseudo} ?`}
                onConfirm={handleRejectRequest}
                onCancel={() => {
                    setShowRejectDialog(false);
                    setSelectedRequest(null);
                }}
                confirmLabel="Refuser"
                confirmVariant="destructive"
            />
        </div>
    );
};

export default TeamRequests;