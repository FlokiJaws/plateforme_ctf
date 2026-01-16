import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card.jsx";
import { ArrowLeft, Users, AlertCircle, Upload, X } from "lucide-react";

const CreateTeam = () => {
    const navigate = useNavigate();
    const [nomEquipe, setNomEquipe] = useState('');
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
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

            if (role !== 'PARTICIPANT') {
                navigate('/profile');
                return;
            }
        } catch (e) {
            console.error('Erreur JWT:', e);
            navigate('/login');
        }
    }, [navigate]);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Vérifier le type de fichier
            if (!file.type.startsWith('image/')) {
                setError('Veuillez sélectionner une image valide');
                return;
            }

            // Vérifier la taille (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError('L\'image doit faire moins de 2MB');
                return;
            }

            setLogoFile(file);

            // Créer une preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
    };

    const generateDefaultLogo = (name) => {
        // Génère un logo par défaut avec les initiales
        const initials = name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        return initials || 'EQ';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!nomEquipe.trim()) {
            setError('Le nom de l\'équipe est obligatoire');
            return;
        }

        if (nomEquipe.trim().length < 3) {
            setError('Le nom de l\'équipe doit contenir au moins 3 caractères');
            return;
        }

        const token = localStorage.getItem('token');
        setSubmitting(true);

        try {
            // Pour l'instant, on n'envoie que le nom (le backend ne gère pas encore le logo)
            await axios.post('http://localhost:8080/equipes/new', {
                nomEquipe: nomEquipe.trim()
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // TODO: Quand le backend supportera les logos, ajouter l'upload ici
            // if (logoFile) {
            //     const formData = new FormData();
            //     formData.append('logo', logoFile);
            //     await axios.post(`http://localhost:8080/equipes/${equipeId}/logo`, formData, {
            //         headers: {
            //             Authorization: `Bearer ${token}`,
            //             'Content-Type': 'multipart/form-data'
            //         }
            //     });
            // }

            navigate('/my-team');
        } catch (err) {
            console.error('Erreur création équipe:', err);
            setError(err.response?.data?.message || 'Erreur lors de la création de l\'équipe');
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
                        onClick={() => navigate('/my-team')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Retour
                    </Button>
                    <h1 className="text-3xl font-bold">Créer une équipe</h1>
                </div>

                {/* Formulaire */}
                <Card className="border-border shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="text-primary" />
                            Nouvelle équipe
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            En créant une équipe, vous devenez automatiquement le chef d'équipe
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

                            {/* Nom de l'équipe */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Nom de l'équipe <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="Ex: Les Hackers du Limousin"
                                    value={nomEquipe}
                                    onChange={(e) => setNomEquipe(e.target.value)}
                                    disabled={submitting}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Minimum 3 caractères
                                </p>
                            </div>

                            {/* Logo */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Logo de l'équipe (optionnel)
                                </label>

                                {logoPreview ? (
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img
                                                src={logoPreview}
                                                alt="Aperçu du logo"
                                                className="w-24 h-24 rounded-lg object-cover border-2 border-border"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-6 w-6"
                                                onClick={removeLogo}
                                            >
                                                <X size={14} />
                                            </Button>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <p className="font-medium">Logo sélectionné</p>
                                            <p className="text-xs">{logoFile?.name}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                                <p className="mb-2 text-sm text-muted-foreground">
                                                    <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    PNG, JPG ou GIF (MAX. 2MB)
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                disabled={submitting}
                                            />
                                        </label>

                                        {nomEquipe && (
                                            <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
                                                <p className="text-sm font-medium mb-2">Aperçu du logo par défaut :</p>
                                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                                                    {generateDefaultLogo(nomEquipe)}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Ce logo sera utilisé si vous n'en uploadez pas
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <p className="text-xs text-muted-foreground">
                                    Note : La gestion complète des logos sera disponible prochainement
                                </p>
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-between bg-secondary/30 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/my-team')}
                                disabled={submitting}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting || !nomEquipe.trim()}
                            >
                                {submitting ? 'Création en cours...' : 'Créer l\'équipe'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Info supplémentaire */}
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                    <CardContent className="pt-6">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            En tant que chef d'équipe, vous pourrez :
                        </h3>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                            <li>Inviter d'autres participants à rejoindre votre équipe</li>
                            <li>Gérer les membres de l'équipe</li>
                            <li>Inscrire votre équipe à des CTFs</li>
                            <li>Transférer le rôle de chef à un autre membre</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CreateTeam;