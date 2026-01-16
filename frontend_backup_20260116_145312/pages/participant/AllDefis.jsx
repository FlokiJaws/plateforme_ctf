import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Trophy, Search, ArrowLeft, Target, Award, Star, Plus } from "lucide-react";
import Pagination from "@/components/common/Pagination.jsx";

const DEFIS_URL = "http://localhost:8080/defis/all";
const ITEMS_PER_PAGE = 12;

const AllDefis = () => {
    const navigate = useNavigate();
    const { token, userRole, isLoading } = useAuth(['PARTICIPANT', 'ADMINISTRATEUR']);

    const [allDefis, setAllDefis] = useState([]);
    const [filteredDefis, setFilteredDefis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('none');

    useEffect(() => {
        if (!isLoading && token) {
            fetchDefis();
        }
    }, [token, isLoading]);

    useEffect(() => {
        applyFilters();
    }, [allDefis, searchTerm, sortBy]);

    const fetchDefis = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.get(DEFIS_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllDefis(response.data || []);
        } catch (err) {
            console.error('Erreur récupération défis:', err);
            setError(err.response?.data?.message || 'Erreur lors de la récupération des défis');
            setAllDefis([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...allDefis];

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(defi =>
                defi.titre?.toLowerCase().includes(search)
            );
        }

        if (sortBy === 'points-asc') {
            filtered.sort((a, b) => a.points - b.points);
        } else if (sortBy === 'points-desc') {
            filtered.sort((a, b) => b.points - a.points);
        } else if (sortBy === 'name-asc') {
            filtered.sort((a, b) => a.titre.localeCompare(b.titre));
        } else if (sortBy === 'name-desc') {
            filtered.sort((a, b) => b.titre.localeCompare(a.titre));
        }

        setFilteredDefis(filtered);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(filteredDefis.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedDefis = filteredDefis.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    if (isLoading || loading) {
        return <div className="text-center p-10 text-lg">Chargement des défis...</div>;
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
                            <Target className="text-primary w-10 h-10" />
                            Tous les Défis
                        </h1>
                        <p className="text-muted-foreground text-lg mt-2">
                            {filteredDefis.length} défi{filteredDefis.length > 1 ? 's' : ''} disponible{filteredDefis.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {userRole === 'ADMINISTRATEUR' && (
                            <Button onClick={() => navigate('/defis/create')} className="flex items-center space-x-2">
                                <Plus size={18} />
                                <span>Créer un défi</span>
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => navigate('/profile')} className="flex items-center space-x-2">
                            <ArrowLeft size={18} />
                            <span>Retour</span>
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex gap-4 flex-wrap items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                        <Input
                            placeholder="Rechercher un défi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={sortBy === 'points-desc' ? 'default' : 'outline'}
                            onClick={() => setSortBy(sortBy === 'points-desc' ? 'none' : 'points-desc')}
                            size="sm"
                        >
                            <Trophy size={16} className="mr-2" />
                            Plus de points
                        </Button>
                        <Button
                            variant={sortBy === 'points-asc' ? 'default' : 'outline'}
                            onClick={() => setSortBy(sortBy === 'points-asc' ? 'none' : 'points-asc')}
                            size="sm"
                        >
                            <Trophy size={16} className="mr-2" />
                            Moins de points
                        </Button>
                        <Button
                            variant={sortBy.startsWith('name') ? 'default' : 'outline'}
                            onClick={() => setSortBy(sortBy === 'name-asc' ? 'name-desc' : 'name-asc')}
                            size="sm"
                        >
                            A-Z
                        </Button>
                    </div>
                </div>

                {filteredDefis.length === 0 ? (
                    <Card className="border-border">
                        <CardContent className="pt-12 pb-12 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-6 bg-secondary rounded-full">
                                    <Target size={64} className="text-muted-foreground" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {searchTerm ? 'Aucun défi trouvé' : 'Aucun défi disponible'}
                            </h3>
                            <p className="text-muted-foreground">
                                {searchTerm
                                    ? 'Essayez de modifier votre recherche'
                                    : 'Les défis seront bientôt disponibles'
                                }
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedDefis.map((defi) => {
                            const difficulty = getDifficultyLabel(defi.points);

                            return (
                                <Card
                                    key={defi.id}
                                    onClick={() => navigate(`/defis/${defi.id}`)}
                                    className="border-2 border-primary/40 hover:border-primary/70 transition-all duration-300 hover:shadow-lg group cursor-pointer"
                                >
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="p-3 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                                                <Target className="w-6 h-6 text-primary" />
                                            </div>
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficulty.color}`}>
                                                {difficulty.label}
                                            </span>
                                        </div>
                                        <CardTitle className="text-xl mt-4 line-clamp-2">
                                            {defi.titre}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="flex items-center justify-between pt-4 border-t border-border">
                                            <div className="flex items-center gap-2">
                                                <Award className={`w-5 h-5 ${getPointsColor(defi.points)}`} />
                                                <span className="text-sm text-muted-foreground">Points</span>
                                            </div>
                                            <div className={`text-2xl font-bold ${getPointsColor(defi.points)}`}>
                                                {defi.points}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={i < Math.ceil(defi.points / 200)
                                                        ? 'text-yellow-500 fill-yellow-500'
                                                        : 'text-gray-300'
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
};

export default AllDefis;