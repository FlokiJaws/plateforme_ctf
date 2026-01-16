import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CtfCard from '@/components/ctf/CtfCard.jsx';
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy } from "lucide-react";
import { buildApiUrl } from '@/config/api';

const CTFS_URL = buildApiUrl("/ctfs/list/actif");

const Home = () => {
    const navigate = useNavigate();
    const [ctfs, setCtfs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        axios.get(CTFS_URL, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined
        })
            .then(res => {
                const all = res.data || [];
                const top3 = [...all]
                    .sort((a, b) => (b.nbVues ?? 0) - (a.nbVues ?? 0))
                    .slice(0, 3);
                setCtfs(top3);
            })
            .catch(err => {
                console.error("Erreur chargement CTFs", err);
                setCtfs([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="text-center p-10">Chargement des compétitions...</div>;
    }

    return (
        <div className="flex flex-col bg-background">
            {/* Header Section */}
            <div className="py-10 text-center space-y-3 px-4 bg-gradient-to-b from-background to-secondary/20">
                <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent leading-tight px-2">
                    Top 3 des CTFs du moment
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                    Les compétitions les plus vues
                </p>
            </div>

            {/* CTF Cards Section */}
            <div className="flex items-center justify-center px-4 py-12">
                {ctfs.length > 0 ? (
                    <div className="w-full max-w-7xl">
                        {ctfs.length === 1 ? (
                            <div className="flex justify-center">
                                <div className="w-full md:w-96">
                                    <CtfCard ctf={ctfs[0]} featured={true} />
                                </div>
                            </div>
                        ) : ctfs.length === 2 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div>
                                    <CtfCard ctf={ctfs[0]} />
                                </div>
                                <div className="md:scale-110 md:origin-center">
                                    <CtfCard ctf={ctfs[1]} featured={true} />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center auto-rows-max">
                                {/* 2e plus vu → gauche */}
                                <div className="md:col-span-1">
                                    <CtfCard ctf={ctfs[1]} />
                                </div>

                                {/* 1er (le + vu) → milieu */}
                                <div className="md:col-span-1 md:scale-110 md:origin-center">
                                    <CtfCard ctf={ctfs[0]} featured={true} />
                                </div>

                                {/* 3e plus vu → droite */}
                                <div className="md:col-span-1">
                                    <CtfCard ctf={ctfs[2]} />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground text-lg">
                        Aucun CTF disponible pour le moment
                    </div>
                )}
            </div>

            {/* Button Section */}
            <div className="flex justify-center px-4 pb-6">
                <Button
                    onClick={() => navigate('/all-ctfs')}
                    className="bg-primary hover:bg-primary/90 flex items-center gap-3"
                >
                    Voir tous les CTFs
                    <ArrowRight size={16} />
                </Button>
            </div>
        </div>
    );
};

export default Home;