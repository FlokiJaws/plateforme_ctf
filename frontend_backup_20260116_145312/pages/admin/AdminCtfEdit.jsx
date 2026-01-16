import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { ShieldAlert, ArrowLeft, Edit2 } from "lucide-react";

const AdminCtfEdit = () => {
    const navigate = useNavigate();
    const [ctfs, setCtfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ titre: "", description: "", lieu: "" });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        let decoded;
        try {
            decoded = jwtDecode(token);
            const isAdmin = decoded.groups?.includes("ADMINISTRATEUR");
            const isOrganisateur = decoded.groups?.includes("ORGANISATEUR");

            if (!isAdmin && !isOrganisateur) {
                navigate("/profile");
                return;
            }
        } catch (e) {
            navigate("/login");
            return;
        }

        // Récupérer les CTFs valides
        axios
            .get("http://localhost:8080/ctfs/list/actif", {
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

    const handleEditStart = (ctf) => {
        setEditingId(ctf.id);
        setEditData({
            titre: ctf.titre,
            description: ctf.description,
            lieu: ctf.lieu,
        });
    };

    const handleSaveEdit = async (ctfId) => {
        const token = localStorage.getItem("token");
        try {
            await axios.put(
                `http://localhost:8080/ctfs/${ctfId}/edit`,
                editData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCtfs(ctfs.map(c => c.id === ctfId ? { ...c, ...editData } : c));
            setEditingId(null);
            alert("CTF modifié avec succès !");
        } catch (err) {
            console.error("Erreur modification CTF :", err);
            alert("Erreur lors de la modification du CTF");
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
                <h1 className="text-3xl font-bold">Modification des CTFs</h1>
            </div>

            {/* Liste des CTFs */}
            <div className="space-y-4">
                {ctfs.length === 0 ? (
                    <Card className="border-border bg-card shadow-lg">
                        <CardContent className="pt-6 text-center py-12 space-y-4">
                            <Edit2 className="w-12 h-12 mx-auto opacity-50 text-muted-foreground" />
                            <p className="text-muted-foreground text-lg">
                                Aucun CTF à modifier.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    ctfs.map((ctf) => (
                        <Card key={ctf.id} className="border-border bg-card shadow-lg">
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {editingId === ctf.id ? (
                                        // Mode édition
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
                                                    Titre
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editData.titre}
                                                    onChange={(e) => setEditData({ ...editData, titre: e.target.value })}
                                                    className="w-full px-3 py-2 rounded border border-input bg-background text-foreground"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={editData.description}
                                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                                    className="w-full px-3 py-2 rounded border border-input bg-background text-foreground resize-none"
                                                    rows="4"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
                                                    Lieu
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editData.lieu}
                                                    onChange={(e) => setEditData({ ...editData, lieu: e.target.value })}
                                                    className="w-full px-3 py-2 rounded border border-input bg-background text-foreground"
                                                />
                                            </div>

                                            <div className="flex gap-2 pt-4">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSaveEdit(ctf.id)}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    Enregistrer
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setEditingId(null)}
                                                >
                                                    Annuler
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Mode affichage
                                        <>
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

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEditStart(ctf)}
                                                className="flex items-center gap-2"
                                            >
                                                <Edit2 size={14} />
                                                Modifier
                                            </Button>
                                        </>
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

export default AdminCtfEdit;