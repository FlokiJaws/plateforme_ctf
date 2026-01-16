import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Eye, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card.jsx";
import Pagination from "@/components/common/Pagination.jsx";

const ITEMS_PER_PAGE = 12;

const AllCtfs = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [allCtfs, setAllCtfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('none');
    const [selectedCity, setSelectedCity] = useState('');

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        axios.get('http://localhost:8080/ctfs/list/actif', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setAllCtfs(res.data || []))
            .catch(err => {
                console.error("Erreur", err);
                setAllCtfs([]);
            })
            .finally(() => setLoading(false));
    }, [token, navigate]);

    const cities = [...new Set(allCtfs.map(ctf => ctf.lieu))].sort();

    const filteredCtfs = allCtfs
        .filter(ctf => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = (
                ctf.titre.toLowerCase().includes(searchLower) ||
                ctf.description.toLowerCase().includes(searchLower) ||
                ctf.lieu.toLowerCase().includes(searchLower)
            );
            const matchesCity = !selectedCity || ctf.lieu === selectedCity;
            return matchesSearch && matchesCity;
        })
        .sort((a, b) => {
            if (sortBy === 'vues') return b.nbVues - a.nbVues;
            if (sortBy === 'lieu') return a.lieu.localeCompare(b.lieu);
            return 0;
        });

    const totalPages = Math.ceil(filteredCtfs.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedCtfs = filteredCtfs.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    if (loading) {
        return <div className="text-center p-10 text-lg">Chargement des CTFs...</div>;
    }

    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                    Tous les CTFs
                </h1>
                <p className="text-muted-foreground text-lg">
                    {filteredCtfs.length} compétition{filteredCtfs.length > 1 ? 's' : ''} trouvée{filteredCtfs.length > 1 ? 's' : ''}
                </p>
            </div>

            <div className="flex gap-5 flex-wrap items-end">
                <div className="w-80">
                    <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>

                <select
                    value={selectedCity}
                    onChange={(e) => {
                        setSelectedCity(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm"
                >
                    <option value="">Toutes les villes</option>
                    {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>

                <Button
                    variant={sortBy === 'vues' ? 'default' : 'outline'}
                    onClick={() => setSortBy(sortBy === 'vues' ? 'none' : 'vues')}
                    className="flex items-center gap-2"
                    size="sm"
                >
                    {sortBy === 'vues' ? <SortDesc size={16} /> : <SortAsc size={16} />}
                    Trier par vues
                </Button>

                <Button
                    variant={sortBy === 'lieu' ? 'default' : 'outline'}
                    onClick={() => setSortBy(sortBy === 'lieu' ? 'none' : 'lieu')}
                    className="flex items-center gap-2"
                    size="sm"
                >
                    {sortBy === 'lieu' ? <SortDesc size={16} /> : <SortAsc size={16} />}
                    Trier par lieu
                </Button>
            </div>

            <div className="space-y-4">
                {paginatedCtfs.length > 0 ? (
                    paginatedCtfs.map(ctf => (
                        <Card key={ctf.id} className="border-2 border-primary/40 hover:border-primary/70 transition-all duration-300 hover:shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-2xl">{ctf.titre}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-between items-center">
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {ctf.description}
                                    </p>
                                    <div className="flex gap-6 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} />
                                            <span>{ctf.lieu}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Eye size={16} />
                                            <span>{ctf.nbVues} vues</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-border pt-4 flex justify-end">
                                <Button onClick={() => navigate(`/ctf/${ctf.id}`)}>
                                    Voir les détails
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-lg text-muted-foreground">
                            Aucun CTF correspondant à ta recherche
                        </p>
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
        </div>
    );
};

export default AllCtfs;