import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { ArrowLeft, Target, Award, Plus, AlertCircle, CheckCircle } from "lucide-react";

const CreateDefi = () => {
    const navigate = useNavigate();
    const { token, isLoading } = useAuth(['ADMINISTRATEUR']);

    const [titre, setTitre] = useState('');
    const [points, setPoints] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const getDifficultyPreview = (pts) => {
        const p = parseInt(pts) || 0;
        if (p >= 500) return { label: 'Expert', color: 'bg-red-500/20 text-red-600 dark:text-red-400' };
        if (p >= 300) return { label: 'Difficile', color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400' };
        if (p >= 100) return { label: 'Moyen', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' };
        if (p > 0) return { label: 'Facile', color: 'bg-green-500/20 text-green-600 dark:text-green-400' };
        return null;
    };

    const getPointsColor = (pts) => {
        const p = parseInt(pts) || 0;
        if (p >= 500) return 'text-red-500';
        if (p >= 300) return 'text-orange-500';
        if (p >= 100) return 'text-yellow-500';
        return 'text-green-500';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!titre.trim()) {
            setError('Le titre est obligatoire');
            return;
        }

        if (!points || parseInt(points) <= 0) {
            setError('Les points doivent être supérieurs à 0');
            return;
        }

        setLoading(true);

        try {
            await axios.post(
                'http://localhost:8080/defis/create',
                { titre: titre.trim(), points: parseInt(points) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess(true);
            setTitre('');
            setPoints('');

            setTimeout(() => navigate('/defis'), 2000);
        } catch (err) {
            console.error('Erreur création défi:', err);
            setError(err.response?.data?.message || 'Erreur lors de la création du défi');
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return <div className="text-center p-10 text-lg">Chargement...</div>;
    }

    const difficulty = getDifficultyPreview(points);

    return (
        <div className="container mx-auto py-10 px-4 max-w-2xl">
            <div className="space-y-6">
                <Button variant="outline" onClick={() => navigate('/defis')} className="flex items-center gap-2">
                    <ArrowLeft size={18} />
                    Retour aux défis
                </Button>

                <Card className="border-2 border-primary/40">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-lg">
                                <Target className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Créer un nouveau défi</CardTitle>
                                <p className="text-muted-foreground mt-1">
                                    Ajoutez un défi pour les participants
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg">
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-lg">
                                    <CheckCircle size={20} />
                                    <span>Défi créé avec succès ! Redirection...</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="titre" className="text-sm font-medium">
                                    Titre du défi <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="titre"
                                    type="text"
                                    placeholder="Ex: Injection SQL avancée"
                                    value={titre}
                                    onChange={(e) => setTitre(e.target.value)}
                                    disabled={loading || success}
                                    maxLength={200}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {titre.length}/200 caractères
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="points" className="text-sm font-medium">
                                    Points <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4 items-center">
                                    <Input
                                        id="points"
                                        type="number"
                                        placeholder="Ex: 250"
                                        value={points}
                                        onChange={(e) => setPoints(e.target.value)}
                                        disabled={loading || success}
                                        min="1"
                                        max="1000"
                                        className="flex-1"
                                    />
                                    {difficulty && (
                                        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${difficulty.color}`}>
                                            {difficulty.label}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Facile: 1-99 | Moyen: 100-299 | Difficile: 300-499 | Expert: 500+
                                </p>
                            </div>

                            {titre && points && parseInt(points) > 0 && (
                                <div className="p-4 bg-secondary/30 rounded-lg space-y-3">
                                    <p className="text-sm font-medium text-muted-foreground">Aperçu</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Target className="w-6 h-6 text-primary" />
                                            <span className="font-semibold">{titre}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Award className={`w-5 h-5 ${getPointsColor(points)}`} />
                                            <span className={`font-bold ${getPointsColor(points)}`}>
                                                {points} pts
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading || success || !titre.trim() || !points}
                                className="w-full"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                                        <span>Création en cours...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Plus size={18} />
                                        <span>Créer le défi</span>
                                    </div>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CreateDefi;