import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { ShieldAlert, Trophy, ArrowLeft, MapPin, Eye, Edit2, Trash2, X, Plus, Users } from "lucide-react";
import { buildApiUrl } from '@/config/api';

const OrganizerCtfs = () => {
    const navigate = useNavigate();
    const [ctfs, setCtfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatut, setFilterStatut] = useState("ALL");

    const [editingCtf, setEditingCtf] = useState(null);
    const [editForm, setEditForm] = useState({ titre: "", description: "", lieu: "" });

    const [deletingCtf, setDeletingCtf] = useState(null);
    const [deleteConfirmName, setDeleteConfirmName] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        let decoded;
        try {
            decoded = jwtDecode(token);
            const now = Date.now() / 1000;
            if (decoded.exp && decoded.exp < now) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }
        } catch (e) {
            console.error("Erreur JWT :", e);
            localStorage.removeItem("token");
            navigate("/login");
            return;
        }

        const role = Array.isArray(decoded.groups) ? decoded.groups[0] : decoded.groups;
        if (role !== "ORGANISATEUR") {
            navigate("/profile");
            return;
        }

        const userPseudo = decoded.pseudo;

        // Récupérer tous les CTFs de l'organisateur
        const fetchCtfs = async () => {
            try {
                const [actifs, enAttente, inactifs] = await Promise.all([
                    axios.get(buildApiUrl("/ctfs/list/actif"), {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(buildApiUrl("/ctfs/list/en_attente"), {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(buildApiUrl("/ctfs/list/inactif"), {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const allCtfs = [
                    ...(actifs.data || []),
                    ...(enAttente.data || []),
                    ...(inactifs.data || []),
                ];

                const myCtfs = allCtfs.filter(ctf => ctf.organisateurPseudo === userPseudo);
                setCtfs(myCtfs);
                setLoading(false);
            } catch (err) {
                console.error("Erreur CTFs :", err);
                setError(err.response?.data?.message || "Impossible de charger les CTFs.");
                setLoading(false);
            }
        };

        fetchCtfs();
    }, [navigate]);

    // Appliquer les filtres
    const filteredCtfs = ctfs.filter(ctf => {
        // Filtre par statut
        if (filterStatut !== "ALL" && ctf.statut !== filterStatut) {
            return false;
        }

        // Filtre par recherche
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                ctf.titre.toLowerCase().includes(search) ||
                ctf.description.toLowerCase().includes(search) ||
                ctf.lieu.toLowerCase().includes(search)
            );
        }

        return true;
    });

    const getStatutBadge = (statut) => {
        const styles = {
            ACTIF: "bg-green-500/20 text-green-600 dark:text-green-400",
            EN_ATTENTE: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
            INACTIF: "bg-red-500/20 text-red-600 dark:text-red-400"
        };
        return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${styles[statut]}`}>{statut.replace('_', ' ')}</span>;
    };

    const handleEdit = (ctf) => {
        setEditingCtf(ctf);
        setEditForm({ titre: ctf.titre, description: ctf.description, lieu: ctf.lieu });
    };

    const handleSaveEdit = async () => {
        const token = localStorage.getItem("token");
        try {
            await axios.patch(
                buildApiUrl(`/ctfs/${editingCtf.id}/modify`),
                editForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCtfs(ctfs.map(c => c.id === editingCtf.id ? { ...c, ...editForm } : c));
            setEditingCtf(null);
            alert("CTF modifié avec succès !");
        } catch (err) {
            console.error("Erreur modification :", err);
            alert(err.response?.data?.message || "Erreur lors de la modification");
        }
    };

    const handleDelete = async () => {
        if (deleteConfirmName !== deletingCtf.titre) {
            alert("Le nom du CTF ne correspond pas !");
            return;
        }

        const token = localStorage.getItem("token");
        try {
            await axios.patch(
                buildApiUrl(`/ctfs/${deletingCtf.id}/disable`),
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCtfs(ctfs.filter(c => c.id !== deletingCtf.id));
            setDeletingCtf(null);
            setDeleteConfirmName("");
            alert("CTF supprimé avec succès !");
        } catch (err) {
            console.error("Erreur suppression :", err);
            alert(err.response?.data?.message || "Erreur lors de la suppression");
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
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Trophy className="text-primary" />
                        Mes CTFs
                    </h1>
                    <p className="text-muted-foreground">
                        {filteredCtfs.length} CTF{filteredCtfs.length > 1 ? 's' : ''} trouvé{filteredCtfs.length > 1 ? 's' : ''}
                    </p>
                </div>

                <Button variant="outline" onClick={() => navigate("/profile")} className="flex items-center space-x-2">
                    <ArrowLeft size={18} />
                    <span>Retour au profil</span>
                </Button>
            </div>

            {/* Barre de recherche et filtres AVEC BOUTON + */}
            <div className="flex gap-4 flex-wrap items-center justify-between">
                <div className="flex gap-4 flex-wrap items-center">
                    <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                    />

                    <div className="flex gap-2">
                        <Button
                            variant={filterStatut === "ALL" ? "default" : "outline"}
                            onClick={() => setFilterStatut("ALL")}
                            size="sm"
                        >
                            Tous
                        </Button>
                        <Button
                            variant={filterStatut === "ACTIF" ? "default" : "outline"}
                            onClick={() => setFilterStatut("ACTIF")}
                            size="sm"
                            className={filterStatut === "ACTIF" ? "" : "border-green-300 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"}
                        >
                            Actif
                        </Button>
                        <Button
                            variant={filterStatut === "EN_ATTENTE" ? "default" : "outline"}
                            onClick={() => setFilterStatut("EN_ATTENTE")}
                            size="sm"
                            className={filterStatut === "EN_ATTENTE" ? "" : "border-yellow-300 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-900/20"}
                        >
                            En attente
                        </Button>
                        <Button
                            variant={filterStatut === "INACTIF" ? "default" : "outline"}
                            onClick={() => setFilterStatut("INACTIF")}
                            size="sm"
                            className={filterStatut === "INACTIF" ? "" : "border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"}
                        >
                            Inactif
                        </Button>
                    </div>
                </div>

                {/* BOUTON + POUR CRÉER UN CTF */}
                <Button
                    onClick={() => navigate("/organizer-ctfs/create")}
                    className="flex items-center gap-2"
                >
                    <Plus size={20} />
                    <span>Créer un CTF</span>
                </Button>
            </div>

            <div className="space-y-4">
                {filteredCtfs.length > 0 ? (
                    filteredCtfs.map(ctf => (
                        <Card key={ctf.id} className="border-2 border-primary/40 hover:border-primary/70 transition-all duration-300 hover:shadow-lg">
                            <CardHeader>
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <CardTitle className="text-2xl mb-2">{ctf.titre}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{ctf.description}</p>
                                    </div>
                                    {getStatutBadge(ctf.statut)}
                                </div>
                            </CardHeader>

                            <CardContent className="flex justify-between items-center">
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} />
                                        <span>{ctf.lieu}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Eye size={16} />
                                        <span>{ctf.nbVues} vues</span>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="border-t border-border pt-4 flex justify-end gap-3">
                                <Button variant="outline" onClick={() => navigate(`/organizer-ctfs/${ctf.id}/participants`)} className="flex items-center gap-2">
                                    <Users size={16} />
                                    Participants
                                </Button>
                                <Button variant="outline" onClick={() => handleEdit(ctf)} className="flex items-center gap-2">
                                    <Edit2 size={16} />
                                    Modifier
                                </Button>
                                <Button variant="destructive" onClick={() => setDeletingCtf(ctf)} className="flex items-center gap-2">
                                    <Trash2 size={16} />
                                    Supprimer
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg mb-4">Aucun CTF créé pour le moment.</p>
                        <Button onClick={() => navigate("/organizer-ctfs/create")} className="flex items-center gap-2 mx-auto">
                            <Plus size={20} />
                            <span>Créer votre premier CTF</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* Modal d'édition */}
            {editingCtf && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-2xl mx-4">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Modifier le CTF</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => setEditingCtf(null)}>
                                    <X size={20} />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Titre</label>
                                <Input value={editForm.titre} onChange={(e) => setEditForm({ ...editForm, titre: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <Input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Lieu</label>
                                <Input value={editForm.lieu} onChange={(e) => setEditForm({ ...editForm, lieu: e.target.value })} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setEditingCtf(null)}>Annuler</Button>
                            <Button onClick={handleSaveEdit}>Enregistrer</Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* Modal de suppression */}
            {deletingCtf && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle className="text-red-600">Confirmer la suppression</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>Pour confirmer, tapez le nom du CTF : <strong>{deletingCtf.titre}</strong></p>
                            <Input
                                value={deleteConfirmName}
                                onChange={(e) => setDeleteConfirmName(e.target.value)}
                                placeholder="Nom du CTF"
                            />
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => { setDeletingCtf(null); setDeleteConfirmName(""); }}>Annuler</Button>
                            <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default OrganizerCtfs;