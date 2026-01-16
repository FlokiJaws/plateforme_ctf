import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card.jsx";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { buildApiUrl } from '@/config/api';

const CreateCtf = () => {
    const navigate = useNavigate();
    const [titre, setTitre] = useState('');
    const [description, setDescription] = useState('');
    const [lieu, setLieu] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const role = Array.isArray(decoded.groups) ? decoded.groups[0] : decoded.groups;

            if (role !== 'ORGANISATEUR') {
                navigate('/profile');
                return;
            }
        } catch (e) {
            console.error('Erreur JWT:', e);
            navigate('/login');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!titre.trim() || !description.trim() || !lieu.trim()) {
            setError('Tous les champs sont obligatoires');
            return;
        }

        const token = localStorage.getItem('token');
        setSubmitting(true);

        try {
            await axios.post(buildApiUrl('/ctfs/request_creation'), {
                titre,
                description,
                lieu
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate('/organizer-ctfs');
        } catch (err) {
            console.error('Erreur création CTF:', err);
            setError(err.response?.data?.message || 'Erreur lors de la création du CTF');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-3xl">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/organizer-ctfs')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Retour
                    </Button>
                    <h1 className="text-3xl font-bold">Créer un nouveau CTF</h1>
                </div>

                {/* Formulaire */}
                <Card className="border-border shadow-lg">
                    <CardHeader>
                        <CardTitle>Demande de création de CTF</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Votre demande sera soumise à validation par un administrateur
                        </p>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            {/* Erreur */}
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Titre */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Titre <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="Ex: CTF National Cybersécurité 2026"
                                    value={titre}
                                    onChange={(e) => setTitre(e.target.value)}
                                    disabled={submitting}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <Textarea
                                    placeholder="Décrivez votre CTF : catégories, niveau, public visé..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={submitting}
                                    rows={6}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Minimum 20 caractères recommandés
                                </p>
                            </div>

                            {/* Lieu */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Lieu <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="Ex: Paris ou https://ctf.example.com"
                                    value={lieu}
                                    onChange={(e) => setLieu(e.target.value)}
                                    disabled={submitting}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Ville pour un événement physique ou URL pour un CTF en ligne
                                </p>
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-between bg-secondary/30 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/organizer-ctfs')}
                                disabled={submitting}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting ? 'Envoi en cours...' : 'Soumettre la demande'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Info supplémentaire */}
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                    <CardContent className="pt-6">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            Informations importantes
                        </h3>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                            <li>Votre CTF passera en statut "EN_ATTENTE"</li>
                            <li>Un administrateur devra valider votre demande</li>
                            <li>Une fois validé, votre CTF sera visible publiquement</li>
                            <li>Vous pourrez le modifier à tout moment depuis "Mes CTFs"</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CreateCtf;