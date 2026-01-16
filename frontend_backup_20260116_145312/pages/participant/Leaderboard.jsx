import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Trophy, Medal, Award, Search, RefreshCw } from "lucide-react";
import Pagination from "@/components/common/Pagination.jsx";

const PARTICIPANTS_URL = "http://localhost:8080/users/getall/participants";
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes en millisecondes

const Leaderboard = () => {
    const navigate = useNavigate();
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const participantsPerPage = 50;

    const fetchParticipants = () => {
        const token = localStorage.getItem("token");
        setRefreshing(true);

        // Récupérer le pseudo de l'utilisateur connecté
        let userPseudo = null;
        if (token) {
            try {
                const decoded = jwtDecode(token);
                userPseudo = decoded.pseudo;
            } catch (err) {
                console.error('Erreur décodage token:', err);
            }
        }

        axios.get(PARTICIPANTS_URL, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined
        })
            .then(res => {
                const allParticipants = res.data || [];
                // Trier par score décroissant (du plus haut au plus bas)
                const sorted = [...allParticipants].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
                setParticipants(sorted);
                setLastUpdate(new Date());

                // Trouver l'utilisateur connecté dans la liste
                if (userPseudo) {
                    const user = sorted.find(p => p.pseudo === userPseudo);
                    if (user) {
                        const rank = sorted.findIndex(p => p.pseudo === userPseudo) + 1;
                        setCurrentUser({ ...user, rank });
                    }
                }
            })
            .catch(err => {
                console.error('Erreur lors de la récupération des participants:', err);
                setParticipants([]);
            })
            .finally(() => {
                setLoading(false);
                setRefreshing(false);
            });
    };

    useEffect(() => {
        fetchParticipants();

        // Auto-refresh toutes les 5 minutes
        const interval = setInterval(() => {
            fetchParticipants();
        }, REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    const handleSearch = () => {
        if (searchQuery.trim() === '') {
            setSearchResult(null);
            return;
        }

        const found = participants.find(p => p.pseudo === searchQuery.trim());
        if (found) {
            const rank = participants.findIndex(p => p.pseudo === found.pseudo) + 1;
            setSearchResult({ ...found, rank });
        } else {
            setSearchResult({ notFound: true });
        }
    };

    const indexOfLastParticipant = currentPage * participantsPerPage;
    const indexOfFirstParticipant = indexOfLastParticipant - participantsPerPage;
    const currentParticipants = participants.slice(indexOfFirstParticipant, indexOfLastParticipant);
    const totalPages = Math.ceil(participants.length / participantsPerPage);

    const getPodiumPlayers = () => {
        if (participants.length === 0) return { first: null, second: null, third: null };
        return {
            first: participants[0] || null,
            second: participants[1] || null,
            third: participants[2] || null
        };
    };

    const { first, second, third } = getPodiumPlayers();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex items-center justify-center gap-4 mb-8">
                <h1 className="text-4xl font-bold text-center">Classement Général</h1>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchParticipants}
                    disabled={refreshing}
                    className="relative"
                >
                    <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                </Button>
            </div>

            {/* Podium */}
            <div className="mb-8">
                <div className="flex items-end justify-center gap-3 mb-8">
                    {/* 2ème place */}
                    {second && (
                        <Card className="w-40 bg-gradient-to-b from-gray-300 to-gray-400 border-2 border-gray-500">
                            <CardContent className="pt-4 text-center">
                                <div className="flex justify-center mb-2">
                                    <Medal size={36} className="text-gray-600" />
                                </div>
                                <div className="text-5xl font-bold mb-1">2</div>
                                <div className="text-lg font-semibold mb-1 truncate px-1">{second.pseudo}</div>
                                <div className="text-base font-medium">{second.score} pts</div>
                            </CardContent>
                        </Card>
                    )}

                    {/* 1ère place */}
                    {first && (
                        <Card className="w-48 bg-gradient-to-b from-yellow-300 to-yellow-500 border-4 border-yellow-600 transform scale-105">
                            <CardContent className="pt-5 text-center">
                                <div className="flex justify-center mb-2">
                                    <Trophy size={48} className="text-yellow-700" />
                                </div>
                                <div className="text-6xl font-bold mb-1">1</div>
                                <div className="text-xl font-bold mb-1 truncate px-1">{first.pseudo}</div>
                                <div className="text-lg font-bold">{first.score} pts</div>
                            </CardContent>
                        </Card>
                    )}

                    {/* 3ème place */}
                    {third && (
                        <Card className="w-40 bg-gradient-to-b from-orange-300 to-orange-500 border-2 border-orange-600">
                            <CardContent className="pt-4 text-center">
                                <div className="flex justify-center mb-2">
                                    <Award size={36} className="text-orange-700" />
                                </div>
                                <div className="text-5xl font-bold mb-1">3</div>
                                <div className="text-lg font-semibold mb-1 truncate px-1">{third.pseudo}</div>
                                <div className="text-base font-medium">{third.score} pts</div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Carte de l'utilisateur connecté - SOUS LE PODIUM */}
                {currentUser && (
                    <div className="max-w-xl mx-auto">
                        <Card className={`border-2 ${
                            currentUser.rank <= 3
                                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                                : 'border-primary bg-primary/5'
                        }`}>
                            <CardContent className="p-4">
                                {/* Message personnalisé pour le top 3 */}
                                {currentUser.rank === 1 && (
                                    <div className="mb-3 text-center">
                                        <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-500">
                                            🏆 Félicitations champion ! Vous êtes en tête du classement !
                                        </p>
                                    </div>
                                )}
                                {currentUser.rank === 2 && (
                                    <div className="mb-3 text-center">
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-400">
                                            🥈 Excellent ! Encore un petit effort pour décrocher la première place !
                                        </p>
                                    </div>
                                )}
                                {currentUser.rank === 3 && (
                                    <div className="mb-3 text-center">
                                        <p className="text-sm font-semibold text-orange-700 dark:text-orange-500">
                                            🥉 Bravo ! Vous êtes sur le podium, continuez comme ça !
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl font-bold text-primary">
                                            #{currentUser.rank}
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold">{currentUser.pseudo}</p>
                                            <p className="text-xs text-muted-foreground">Votre position</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary">{currentUser.score}</p>
                                        <p className="text-xs text-muted-foreground">points</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Barre de recherche */}
            <div className="mb-6">
                <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
                    <Input
                        type="text"
                        placeholder="Rechercher par pseudo exact..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-10"
                    />
                </div>
                <div className="text-center mt-2">
                    <button
                        onClick={handleSearch}
                        className="text-sm text-primary hover:underline"
                    >
                        Rechercher
                    </button>
                    {searchResult && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSearchResult(null);
                            }}
                            className="text-sm text-muted-foreground hover:underline ml-4"
                        >
                            Effacer
                        </button>
                    )}
                </div>
            </div>

            {/* Résultat de recherche */}
            {searchResult && (
                <div className="mb-6 max-w-md mx-auto">
                    {searchResult.notFound ? (
                        <Card className="border-red-500">
                            <CardContent className="p-4 text-center text-red-600">
                                Aucun participant trouvé avec ce pseudo
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-primary">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-lg">{searchResult.pseudo}</p>
                                        <p className="text-sm text-muted-foreground">Rang: #{searchResult.rank}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary">{searchResult.score} pts</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Tableau des participants */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold">Rang</th>
                                <th className="px-6 py-4 text-left font-semibold">Pseudo</th>
                                <th className="px-6 py-4 text-right font-semibold">Score</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentParticipants.length > 0 ? (
                                currentParticipants.map((participant, index) => {
                                    const globalIndex = indexOfFirstParticipant + index;
                                    const isCurrentUser = currentUser && participant.pseudo === currentUser.pseudo;
                                    return (
                                        <tr
                                            key={globalIndex}
                                            className={`border-b transition-colors ${
                                                isCurrentUser
                                                    ? 'bg-primary/10 hover:bg-primary/15 font-semibold'
                                                    : 'hover:bg-muted/50'
                                            }`}
                                        >
                                            <td className="px-6 py-4 font-medium">
                                                {globalIndex + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                {participant.pseudo}
                                                {isCurrentUser && (
                                                    <span className="ml-2 text-xs text-primary">(Vous)</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold">
                                                {participant.score} pts
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-muted-foreground">
                                        Aucun participant trouvé
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
};

export default Leaderboard;