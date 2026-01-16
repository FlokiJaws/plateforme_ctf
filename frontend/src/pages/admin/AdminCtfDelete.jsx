import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { ShieldAlert, ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import { buildApiUrl } from '@/config/api';

const AdminCtfDelete = () => {
    const navigate = useNavigate();
    const [ctfs, setCtfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        let decoded;
        try {
            decoded = jwtDecode(token);
            if (!decoded.groups?.includes("ADMINISTRATEUR")) {
                navigate("/profile");
                return;
            }
        } catch (e) {
            navigate("/login");
            return;
        }

        // Récupérer tous les CTFs valides pour suppression
        axios
            .get(buildApiUrl("/ctfs/list/actif"), {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setCtfs(res.data || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erreur récupération CTFs :", err);
                setError(err.response?.data?.message || "Impossible de charger les CTFs.");
                setLoading(false);
            });
    }, [navigate]);

    const handleDeleteCtf = async (ctfId) => {
        const token = localStorage.getItem("token");
        try {
            await axios.patch(
                buildApiUrl(`/ctfs/${ctfId}/disable`),
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCtfs(ctfs.filter(c => c.id !== ctfId));
            setConfirmDelete(null);
            alert("CTF supprimé avec succès !");
        } catch (err) {
            console.error("Erreur suppression CTF :", err);
            alert("Erreur lors de la suppression du CTF");
        }
    };

    if (loading) return <div className="text-center p-10 text-lg">Chargement...</div>;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <ShieldAlert size={48} className="text-destructive" />
                <p className="text-xl font-bold text-destructive">{error}</p>
                <Button variant="outline" onClick={() => navigate("/profile")}>Retour</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft size={18} />
                    Retour
                </Button>
                <h1 className="text-3xl font-bold">Suppression des CTFs</h1>
            </div>

            {/* Avertissement */}
            <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-900/20">
                <CardContent className="pt-6 flex items-start gap-4">
                    <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" size={24} />
                    <div>
                        <h3 className="font-bold text-red-700 dark:text-red-400">Attention</h3>
                        <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                            La suppression d'un CTF est irréversible. Cette action supprimera complètement le CTF de la plateforme.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Liste des CTFs */}
            <div className="space-y-4">
                {ctfs.length === 0 ? (
                    <Card className="border-border bg-card shadow-lg">
                        <CardContent className="pt-6 text-center py-12 space-y-4">
                            <Trash2 className="w-12 h-12 mx-auto opacity-50 text-muted-foreground" />
                            <p className="text-muted-foreground text-lg">
                                Aucun CTF à supprimer.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    ctfs.map((ctf) => (
                        <Card key={ctf.id} className="border-border bg-card shadow-lg">
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">{ctf.titre}</h3>
                                        <p className="text-sm text-muted-foreground mb-4">{ctf.description}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase">Lieu</p>
                                            <p className="font-semibold">{ctf.lieu}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase">Organisateur</p>
                                            <p className="font-semibold">{ctf.organisateur || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase">Vues</p>
                                            <p className="font-semibold">{ctf.nbVues || 0}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {confirmDelete === ctf.id ? (
                                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg space-y-3">
                                            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                                                Êtes-vous sûr de vouloir supprimer ce CTF ? Cette action est irréversible.
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteCtf(ctf.id)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Trash2 size={14} />
                                                    Confirmer la suppression
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setConfirmDelete(null)}
                                                >
                                                    Annuler
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => setConfirmDelete(ctf.id)}
                                            className="flex items-center gap-2"
                                        >
                                            <Trash2 size={14} />
                                            Supprimer
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminCtfDelete;