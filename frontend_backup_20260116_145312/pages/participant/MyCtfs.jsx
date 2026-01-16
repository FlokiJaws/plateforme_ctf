import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { MapPin, Calendar, CheckCircle, XCircle, LogIn, LogOut, ArrowLeft, ArrowUpDown, SortAsc, SortDesc } from "lucide-react";

const MyCtfs = () => {
    const navigate = useNavigate();
    const [participations, setParticipations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('none'); // Aucun tri par défaut
    const token = localStorage.getItem('token');

    // Vérification du token au montage du composant
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const now = Date.now() / 1000;
            if (decoded.exp && decoded.exp < now) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
        } catch (e) {
            console.error('Erreur JWT:', e);
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, [token, navigate]);

    // Récupération des participations depuis l'API
    useEffect(() => {
        if (!token) return;

        setLoading(true);
        axios.get(`http://localhost:8080/participants/me/participations?filter=${filter}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setParticipations(res.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Erreur récupération participations:', err);
                setError(err.response?.data?.message || 'Impossible de charger vos participations.');
                setLoading(false);
            });
    }, [filter, token]);

    // État pour les dialogs
    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [selectedCtf, setSelectedCtf] = useState(null);

    // Fonction pour rejoindre un CTF
    const handleJoinCtf = async () => {
        if (!selectedCtf) return;

        try {
            await axios.post(`http://localhost:8080/ctfs/${selectedCtf.ctfId}/join`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Recharger les participations
            const response = await axios.get(`http://localhost:8080/participants/me/participations?filter=${filter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setParticipations(response.data || []);
            setShowJoinDialog(false);
            setSelectedCtf(null);
        } catch (err) {
            console.error('Erreur rejoindre CTF:', err);
            alert(err.response?.data?.message || 'Impossible de rejoindre ce CTF.');
        }
    };

    // Fonction pour quitter un CTF
    const handleLeaveCtf = async () => {
        if (!selectedCtf) return;

        try {
            await axios.post(`http://localhost:8080/ctfs/${selectedCtf.ctfId}/leave`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Recharger les participations
            const response = await axios.get(`http://localhost:8080/participants/me/participations?filter=${filter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setParticipations(response.data || []);
            setShowLeaveDialog(false);
            setSelectedCtf(null);
        } catch (err) {
            console.error('Erreur quitter CTF:', err);
            alert(err.response?.data?.message || 'Impossible de quitter ce CTF.');
        }
    };

    // Fonction pour formater les dates avec l'heure
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Dédupliquer et trier les participations côté frontend
    const sortedParticipations = useMemo(() => {
        // 1. Dédupliquer : garder uniquement la dernière participation par CTF
        const participationMap = new Map();

        participations.forEach(participation => {
            const ctfId = participation.ctfId;
            const existing = participationMap.get(ctfId);

            // Si pas d'entrée existante OU si cette participation est plus récente
            if (!existing || new Date(participation.joinedAt) > new Date(existing.joinedAt)) {
                participationMap.set(ctfId, participation);
            }
        });

        // 2. Convertir la Map en tableau
        const uniqueParticipations = Array.from(participationMap.values());

        // 3. Trier selon le critère choisi
        switch (sortBy) {
            case 'name-asc':
                return uniqueParticipations.sort((a, b) => a.ctfTitre.localeCompare(b.ctfTitre));
            case 'name-desc':
                return uniqueParticipations.sort((a, b) => b.ctfTitre.localeCompare(a.ctfTitre));
            case 'date-asc':
                return uniqueParticipations.sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));
            case 'date-desc':
                return uniqueParticipations.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));
            default:
                return uniqueParticipations;
        }
    }, [participations, sortBy]);

    // Déterminer le statut d'une participation
    const getParticipationStatus = (participation) => {
        if (participation.completedAt) {
            return { label: 'Complété', color: 'bg-green-100 text-green-800', icon: CheckCircle };
        }
        if (participation.leftAt) {
            return { label: 'Quitté', color: 'bg-yellow-100 text-yellow-800', icon: XCircle };
        }
        return { label: 'En cours', color: 'bg-blue-100 text-blue-800', icon: Calendar };
    };

    if (loading) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-6xl mx-auto">
                    <p className="text-center text-gray-600 dark:text-gray-400">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/profile')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour au profil
                    </Button>
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Mes CTFs</h1>
                    <p className="text-gray-600 dark:text-gray-400">Gérez vos participations aux challenges CTF</p>
                </div>

                {/* Filtres et Tri */}
                <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                    {/* Filtres à gauche */}
                    <div className="flex gap-4">
                        <Button
                            variant={filter === 'ALL' ? 'default' : 'outline'}
                            onClick={() => setFilter('ALL')}
                        >
                            Tous
                        </Button>
                        <Button
                            variant={filter === 'ACTIVE' ? 'default' : 'outline'}
                            onClick={() => setFilter('ACTIVE')}
                        >
                            En cours
                        </Button>
                        <Button
                            variant={filter === 'INACTIVE' ? 'default' : 'outline'}
                            onClick={() => setFilter('INACTIVE')}
                        >
                            Quittés / Complétés
                        </Button>
                    </div>

                    {/* Tri à droite */}
                    <div className="flex gap-2 items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Trier par :</span>
                        <Button
                            variant={sortBy.startsWith('name') ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                                if (sortBy === 'name-asc') {
                                    setSortBy('name-desc');
                                } else {
                                    setSortBy('name-asc');
                                }
                            }}
                            className="flex items-center gap-2"
                        >
                            Nom
                            {sortBy === 'name-asc' && <SortAsc className="w-4 h-4" />}
                            {sortBy === 'name-desc' && <SortDesc className="w-4 h-4" />}
                            {!sortBy.startsWith('name') && <ArrowUpDown className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant={sortBy.startsWith('date') ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                                if (sortBy === 'date-asc') {
                                    setSortBy('date-desc');
                                } else {
                                    setSortBy('date-asc');
                                }
                            }}
                            className="flex items-center gap-2"
                        >
                            Date
                            {sortBy === 'date-asc' && <SortAsc className="w-4 h-4" />}
                            {sortBy === 'date-desc' && <SortDesc className="w-4 h-4" />}
                            {!sortBy.startsWith('date') && <ArrowUpDown className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Liste des participations */}
                {participations.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            Aucune participation trouvée.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {sortedParticipations.map((participation) => {
                            const status = getParticipationStatus(participation);
                            const StatusIcon = status.icon;
                            const isActive = !participation.leftAt && !participation.completedAt;
                            const isCompleted = !!participation.completedAt;
                            const canRejoin = participation.leftAt && !participation.completedAt;

                            return (
                                <Card key={participation.ctfId} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-6">
                                            {/* Informations principales */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <h3 className="text-2xl font-bold">{participation.ctfTitre}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color} flex items-center gap-1 whitespace-nowrap`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {status.label}
                                                    </span>
                                                </div>

                                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                    {participation.ctfDescription}
                                                </p>

                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center">
                                                        <MapPin className="w-4 h-4 mr-2" />
                                                        {participation.ctfLieu}
                                                    </div>

                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-2" />
                                                        Rejoint le {formatDate(participation.joinedAt)}
                                                    </div>

                                                    {participation.leftAt && (
                                                        <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                                                            <XCircle className="w-4 h-4 mr-2" />
                                                            Quitté le {formatDate(participation.leftAt)}
                                                        </div>
                                                    )}

                                                    {participation.completedAt && (
                                                        <div className="flex items-center text-green-600 dark:text-green-400">
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Complété le {formatDate(participation.completedAt)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Boutons d'action */}
                                            <div className="flex flex-col gap-2 min-w-[140px]">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/ctf/${participation.ctfId}`)}
                                                    className="w-full"
                                                >
                                                    Voir détails
                                                </Button>

                                                {isActive && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedCtf(participation);
                                                            setShowLeaveDialog(true);
                                                        }}
                                                        className="w-full"
                                                    >
                                                        <LogOut className="w-4 h-4 mr-2" />
                                                        Quitter
                                                    </Button>
                                                )}

                                                {canRejoin && (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedCtf(participation);
                                                            setShowJoinDialog(true);
                                                        }}
                                                        className="w-full"
                                                    >
                                                        <LogIn className="w-4 h-4 mr-2" />
                                                        Rejoindre
                                                    </Button>
                                                )}

                                                {isCompleted && (
                                                    <div className="w-full text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                                                        CTF terminé
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Popup de confirmation pour rejoindre */}
            {showJoinDialog && selectedCtf && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle>Confirmer l'inscription</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Êtes-vous sûr de vouloir vous inscrire à nouveau au CTF "{selectedCtf.ctfTitre}" ?</p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => {
                                setShowJoinDialog(false);
                                setSelectedCtf(null);
                            }}>
                                Annuler
                            </Button>
                            <Button onClick={handleJoinCtf}>
                                Oui, m'inscrire
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* Popup de confirmation pour quitter */}
            {showLeaveDialog && selectedCtf && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle>Confirmer l'abandon</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Êtes-vous sûr de vouloir quitter le CTF "{selectedCtf.ctfTitre}" ? Vous pourrez le rejoindre à nouveau plus tard.</p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => {
                                setShowLeaveDialog(false);
                                setSelectedCtf(null);
                            }}>
                                Annuler
                            </Button>
                            <Button variant="destructive" onClick={handleLeaveCtf}>
                                Oui, quitter
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default MyCtfs;