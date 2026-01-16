import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card.jsx";
import { MapPin, Eye, Send, MessageSquare, ArrowLeft, LogIn, LogOut } from "lucide-react";
import { buildApiUrl } from '@/config/api';

const CtfDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [ctf, setCtf] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [participationStatus, setParticipationStatus] = useState(null);
    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decoded.exp && decoded.exp < currentTime) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }
        } catch (e) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
        }

        loadCtfData();
    }, [id, token, navigate]);

    const loadCtfData = async () => {
        setLoading(true);

        // Récupérer les détails du CTF
        try {
            const ctfResponse = await axios.get(buildApiUrl(`/ctfs/${id}`), {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCtf(ctfResponse.data);
        } catch (err) {
            console.error(err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.status === 404) {
                setError("CTF introuvable (404).");
            } else {
                setError("Impossible de contacter le serveur.");
            }
        }

        // Récupérer les commentaires
        try {
            const commentsResponse = await axios.get(buildApiUrl(`/comments/ctf/${id}`), {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(commentsResponse.data || []);
        } catch (err) {
            console.error("Erreur chargement commentaires", err);
        }

        // Vérifier le statut de participation
        try {
            const participationsResponse = await axios.get(
                buildApiUrl('/participants/me/participations?filter=ALL'),
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const participation = participationsResponse.data.find(p => p.ctfId === parseInt(id));

            if (participation) {
                if (participation.completedAt) {
                    setParticipationStatus('completed');
                } else if (participation.leftAt) {
                    setParticipationStatus('left');
                } else {
                    setParticipationStatus('active');
                }
            } else {
                setParticipationStatus('none');
            }
        } catch (err) {
            console.error('Erreur vérification participation:', err);
            setParticipationStatus('none');
        }

        setLoading(false);
    };

    const handleJoinCtf = async () => {
        try {
            await axios.post(buildApiUrl(`/ctfs/${id}/join`), {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setParticipationStatus('active');
            setShowJoinDialog(false);
        } catch (err) {
            console.error('Erreur rejoindre CTF:', err);
            alert(err.response?.data?.message || 'Impossible de rejoindre ce CTF.');
        }
    };

    const handleLeaveCtf = async () => {
        try {
            await axios.post(buildApiUrl(`/ctfs/${id}/leave`), {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setParticipationStatus('left');
            setShowLeaveDialog(false);
        } catch (err) {
            console.error('Erreur quitter CTF:', err);
            alert(err.response?.data?.message || 'Impossible de quitter ce CTF.');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();

        if (!commentText.trim()) return;

        setSubmitting(true);
        try {
            await axios.post(
                buildApiUrl(`/comments/new/${id}`),
                { contenu: commentText },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Ajouter le nouveau commentaire à la liste
            const decoded = jwtDecode(token);
            const newComment = {
                contenu: commentText,
                userPseudo: decoded.pseudo || decoded.sub,
                date: new Date().toISOString()
            };
            setComments([newComment, ...comments]);
            setCommentText('');
        } catch (err) {
            console.error('Erreur ajout commentaire:', err);
            alert(err.response?.data?.message || "Impossible d'ajouter le commentaire.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionButton = () => {
        switch (participationStatus) {
            case 'active':
                return (
                    <Button
                        size="lg"
                        onClick={() => setShowLeaveDialog(true)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                    >
                        <LogOut size={20} />
                        Quitter le CTF
                    </Button>
                );
            case 'completed':
                return (
                    <div className="text-center text-green-600 font-semibold">
                        CTF complété ✓
                    </div>
                );
            case 'left':
                return (
                    <Button
                        size="lg"
                        onClick={() => setShowJoinDialog(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                    >
                        <LogIn size={20} />
                        Rejoindre à nouveau
                    </Button>
                );
            default: // 'none'
                return (
                    <Button
                        size="lg"
                        onClick={() => setShowJoinDialog(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                    >
                        <LogIn size={20} />
                        Rejoindre le CTF
                    </Button>
                );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Chargement...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <p className="text-red-600 font-semibold mb-4">{error}</p>
                        <Button onClick={() => navigate(-1)}>Retour</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!ctf) return null;

    return (
        <>
            <div className="min-h-screen py-12 px-4">
                <Card className="max-w-4xl mx-auto border-border shadow-2xl">
                    <CardHeader className="border-b border-border pb-6">
                        <div className="flex items-start justify-between gap-6">
                            <div className="flex-1">
                                <CardTitle className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                                    {ctf.titre}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Organisé par <span className="font-semibold text-foreground">{ctf.organisateurPseudo || "Anonyme"}</span>
                                </p>
                            </div>
                            <div className="text-center p-4 bg-secondary rounded-xl">
                                <span className="block text-2xl font-bold">{ctf.nbVues}</span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wide">Vues</span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6 space-y-8">
                        <div className="prose dark:prose-invert max-w-none">
                            <h3 className="text-xl font-semibold mb-2">Briefing de mission</h3>
                            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                                {ctf.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols gap-6">
                            <div className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-lg">
                                <MapPin className="text-blue-500 h-6 w-6" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Lieu / Plateforme</p>
                                    <p className="font-medium">{ctf.lieu}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-between gap-4 border-t border-border pt-6">
                        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
                            <ArrowLeft size={18} />
                            Retour
                        </Button>
                        {getActionButton()}
                    </CardFooter>
                </Card>

                {/* Section Commentaires */}
                <Card className="max-w-4xl mx-auto mt-8 border-border bg-card">
                    <CardHeader className="border-b border-border pb-4">
                        <div className="flex items-center space-x-2">
                            <MessageSquare className="text-primary h-5 w-5" />
                            <CardTitle className="text-2xl">Commentaires ({comments.length})</CardTitle>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6 space-y-6">
                        {/* Formulaire d'ajout de commentaire */}
                        <div className="space-y-3">
                            <div className="flex items-end gap-3">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Partage ton avis ou pose une question..."
                                    className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                                    rows="3"
                                    disabled={submitting}
                                />
                                <Button
                                    onClick={handleAddComment}
                                    size="icon"
                                    disabled={submitting || !commentText.trim()}
                                    className="flex-shrink-0 h-12 w-12"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Liste des commentaires */}
                        <div className="space-y-4">
                            {comments.length > 0 ? (
                                comments.map((comment, index) => (
                                    <div key={index} className="p-4 bg-secondary/30 rounded-lg border border-border">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-foreground">{comment.userPseudo}</span>
                                            <span className="text-xs text-muted-foreground">{formatDate(comment.date)}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{comment.contenu}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    Aucun commentaire pour le moment. Sois le premier à commenter !
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Popup de confirmation pour rejoindre */}
            {showJoinDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle>Confirmer l'inscription</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Êtes-vous sûr de vouloir vous inscrire au CTF "{ctf.titre}" ?</p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
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
            {showLeaveDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle>Confirmer l'abandon</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Êtes-vous sûr de vouloir quitter le CTF "{ctf.titre}" ? Vous pourrez le rejoindre à nouveau plus tard.</p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
                                Annuler
                            </Button>
                            <Button variant="destructive" onClick={handleLeaveCtf}>
                                Oui, quitter
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </>
    );
};

export default CtfDetail;