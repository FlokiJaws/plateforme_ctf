import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { MapPin, Eye, Edit2, Trash2, CheckCircle, X, Users } from "lucide-react";
import Pagination from "@/components/common/Pagination.jsx";

const ITEMS_PER_PAGE = 10;

const AdminCtfsManagement = () => {
    const navigate = useNavigate();
    const [allCtfs, setAllCtfs] = useState([]);
    const [filteredCtfs, setFilteredCtfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatut, setFilterStatut] = useState("ALL");

    const [editingCtf, setEditingCtf] = useState(null);
    const [editForm, setEditForm] = useState({ titre: "", description: "", lieu: "" });

    const [deletingCtf, setDeletingCtf] = useState(null);
    const [deleteConfirmName, setDeleteConfirmName] = useState("");

    const [validatingCtf, setValidatingCtf] = useState(null);

    useEffect(() => {
        fetchAllCtfs();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [allCtfs, searchTerm, filterStatut]);

    const fetchAllCtfs = async () => {
        const token = localStorage.getItem("token");
        try {
            const [actifs, enAttente, inactifs] = await Promise.all([
                axios.get("http://localhost:8080/ctfs/list/actif", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get("http://localhost:8080/ctfs/list/en_attente", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get("http://localhost:8080/ctfs/list/inactif", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const all = [
                ...(actifs.data || []),
                ...(enAttente.data || []),
                ...(inactifs.data || []),
            ];

            setAllCtfs(all);
            setLoading(false);
        } catch (err) {
            console.error("Erreur CTFs :", err);
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...allCtfs];

        if (filterStatut !== "ALL") {
            filtered = filtered.filter(ctf => ctf.statut === filterStatut);
        }

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(ctf =>
                ctf.titre.toLowerCase().includes(search) ||
                ctf.description.toLowerCase().includes(search) ||
                ctf.lieu.toLowerCase().includes(search)
            );
        }

        setFilteredCtfs(filtered);
        setCurrentPage(1);
    };

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
                `http://localhost:8080/ctfs/${editingCtf.id}/modify`,
                editForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchAllCtfs();
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
                `http://localhost:8080/ctfs/${deletingCtf.id}/disable`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchAllCtfs();
            setDeletingCtf(null);
            setDeleteConfirmName("");
            alert("CTF supprimé avec succès !");
        } catch (err) {
            console.error("Erreur suppression :", err);
            alert(err.response?.data?.message || "Erreur lors de la suppression");
        }
    };

    const handleValidate = async (approve) => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(
                `http://localhost:8080/ctfs/${validatingCtf.id}/validation`,
                { isValid: approve },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchAllCtfs();
            setValidatingCtf(null);
            alert(approve ? "CTF validé avec succès !" : "CTF refusé");
        } catch (err) {
            console.error("Erreur validation :", err);
            alert(err.response?.data?.message || "Erreur lors de la validation");
        }
    };

    const totalPages = Math.ceil(filteredCtfs.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedCtfs = filteredCtfs.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return <div className="text-center p-10 text-lg">Chargement...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold">Gestion des CTFs</h1>
                <p className="text-muted-foreground">{filteredCtfs.length} CTF{filteredCtfs.length > 1 ? 's' : ''}</p>

                <div className="flex gap-4 flex-wrap">
                    <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                    />

                    <select
                        value={filterStatut}
                        onChange={(e) => setFilterStatut(e.target.value)}
                        className="px-3 py-2 rounded-md border border-input bg-background text-foreground"
                    >
                        <option value="ALL">Tous les statuts</option>
                        <option value="ACTIF">Actif</option>
                        <option value="EN_ATTENTE">En attente</option>
                        <option value="INACTIF">Inactif</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {paginatedCtfs.length > 0 ? (
                    paginatedCtfs.map(ctf => (
                        <Card key={ctf.id} className="border-2 border-primary/40">
                            <CardHeader>
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <CardTitle className="text-xl mb-2">{ctf.titre}</CardTitle>
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
                                {ctf.organisateurPseudo && (
                                    <p className="text-xs text-muted-foreground">
                                        Par <span className="font-semibold">{ctf.organisateurPseudo}</span>
                                    </p>
                                )}
                            </CardContent>

                            <CardFooter className="border-t pt-4 flex justify-end gap-2">
                                {ctf.statut === "EN_ATTENTE" && (
                                    <Button
                                        variant="default"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => setValidatingCtf(ctf)}
                                    >
                                        <CheckCircle size={16} className="mr-2" />
                                        Valider
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/admin/ctfs/${ctf.id}/participants`)}
                                >
                                    <Users size={16} className="mr-2" />
                                    Participants
                                </Button>
                                <Button variant="outline" onClick={() => handleEdit(ctf)}>
                                    <Edit2 size={16} className="mr-2" />
                                    Modifier
                                </Button>
                                <Button variant="destructive" onClick={() => setDeletingCtf(ctf)}>
                                    <Trash2 size={16} className="mr-2" />
                                    Supprimer
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        Aucun CTF trouvé
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}

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

            {/* Modal de validation */}
            {validatingCtf && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle>Valider le CTF</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Voulez-vous valider le CTF : <strong>{validatingCtf.titre}</strong> ?</p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setValidatingCtf(null)}>Annuler</Button>
                            <Button variant="destructive" onClick={() => handleValidate(false)}>Refuser</Button>
                            <Button onClick={() => handleValidate(true)}>Valider</Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminCtfsManagement;