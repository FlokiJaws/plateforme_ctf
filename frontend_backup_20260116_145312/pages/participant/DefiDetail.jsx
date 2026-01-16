import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { ArrowLeft, Target, Award, Star, Trophy, Calendar, User } from "lucide-react";

const DefiDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, isLoading: authLoading } = useAuth(['PARTICIPANT', 'ADMINISTRATEUR']);

    const [defi, setDefi] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && token) {
            fetchDefi();
        }
    }, [token, authLoading, id]);

    const fetchDefi = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.get(`http://localhost:8080/defis/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDefi(response.data);
        } catch (err) {
            console.error('Erreur récupération défi:', err);
            setError(err.response?.data?.message || 'Erreur lors de la récupération du défi');
        } finally {
            setLoading(false);
        }
    };

    const getPointsColor = (points) => {
        if (points >= 500) return 'text-red-500';
        if (points >= 300) return 'text-orange-500';
        if (points >= 100) return 'text-yellow-500';
        return 'text-green-500';
    };

    const getDifficultyLabel = (points) => {
        if (points >= 500) return { label: 'Expert', color: 'bg-red-500/20 text-red-600 dark:text-red-400' };
        if (points >= 300) return { label: 'Difficile', color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400' };
        if (points >= 100) return { label: 'Moyen', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' };
        return { label: 'Facile', color: 'bg-green-500/20 text-green-600 dark:text-green-400' };
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement du défi...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-10 px-4 max-w-4xl">
                <div className="space-y-4">
                    <Button variant="outline" onClick={() => navigate('/defis')} className="flex items-center gap-2">
                        <ArrowLeft size={18} />
                        Retour aux défis
                    </Button>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    if (!defi) return null;

    const difficulty = getDifficultyLabel(defi.points);

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="space-y-6">
                <Button variant="outline" onClick={() => navigate('/defis')} className="flex items-center gap-2">
                    <ArrowLeft size={18} />
                    Retour aux défis
                </Button>

                <Card className="border-2 border-primary/40 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/20 to-blue-500/20 p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-background rounded-xl shadow-lg">
                                    <Target className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${difficulty.color}`}>
                                        {difficulty.label}
                                    </span>
                                    <h1 className="text-3xl font-bold mt-2">{defi.titre}</h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-center p-6 bg-secondary/30 rounded-xl">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Award className={`w-8 h-8 ${getPointsColor(defi.points)}`} />
                                    <span className={`text-5xl font-bold ${getPointsColor(defi.points)}`}>
                                        {defi.points}
                                    </span>
                                </div>
                                <p className="text-muted-foreground">Points à gagner</p>

                                <div className="mt-3 flex items-center justify-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={24}
                                            className={i < Math.ceil(defi.points / 200)
                                                ? 'text-yellow-500 fill-yellow-500'
                                                : 'text-gray-300'
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {defi.description && (
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Description</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {defi.description}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                            {defi.createdAt && (
                                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                                    <Calendar className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">Créé le</p>
                                        <p className="font-medium">
                                            {new Date(defi.createdAt).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {defi.createdBy && (
                                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">Créé par</p>
                                        <p className="font-medium">{defi.createdBy}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {defi.participantsCount !== undefined && (
                            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
                                <Trophy className="w-6 h-6 text-primary" />
                                <div>
                                    <p className="font-semibold text-lg">{defi.participantsCount} participant{defi.participantsCount > 1 ? 's' : ''}</p>
                                    <p className="text-sm text-muted-foreground">ont relevé ce défi</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DefiDetail;