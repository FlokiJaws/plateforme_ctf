import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { ShieldAlert, ArrowLeft, Check, X } from "lucide-react";
import { buildApiUrl } from '@/config/api';

const AdminCtfValidation = () => {
    const navigate = useNavigate();
    const [ctfs, setCtfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

        // Récupérer les CTFs en attente
        axios
            .get(buildApiUrl("/ctfs/list/en_attente"), {
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

    const handleValidateCtf = async (ctfId) => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(
                buildApiUrl(`/ctfs/${ctfId}/validation`),
                { isValid: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCtfs(ctfs.filter(c => c.id !== ctfId));
            alert("CTF validé avec succès !");
        } catch (err) {
            console.error("Erreur validation CTF :", err);
            alert("Erreur lors de la validation du CTF");
        }
    };

    const handleRejectCtf = async (ctfId) => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(
                buildApiUrl(`/ctfs/${ctfId}/validation`),
                { isValid: false },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCtfs(ctfs.filter(c => c.id !== ctfId));
            alert("CTF refusé avec succès !");
        } catch (err) {
            console.error("Erreur refus CTF :", err);
            alert("Erreur lors du refus du CTF");
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
                <h1 className="text-3xl font-bold">Validation des CTFs</h1>
            </div>

            {/* CTFs en attente */}
            <div className="space-y-4">
                {ctfs.length === 0 ? (
                    <Card className="border-border bg-card shadow-lg">
                        <CardContent className="pt-6 text-center py-12 space-y-4">
                            <Check className="w-12 h-12 mx-auto opacity-50 text-green-500" />
                            <p className="text-muted-foreground text-lg">
                                Aucun CTF en attente de validation.
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
                                            <p className="text-xs text-muted-foreground uppercase">Statut</p>
                                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                                EN_ATTENTE
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            size="sm"
                                            onClick={() => handleValidateCtf(ctf.id)}
                                            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                                        >
                                            <Check size={16} />
                                            Valider
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleRejectCtf(ctf.id)}
                                            className="flex items-center gap-2"
                                        >
                                            <X size={16} />
                                            Refuser
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminCtfValidation;