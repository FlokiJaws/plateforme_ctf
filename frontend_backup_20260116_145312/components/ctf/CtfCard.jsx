import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { MapPin, Eye, Trophy, Flag, Sparkles } from "lucide-react";

const CtfCard = ({ ctf, featured = false }) => {
    const navigate = useNavigate();

    return (
        <Card className={`h-full transition-all duration-300 ${
            featured
                ? 'border-2 border-primary bg-gradient-to-br from-card to-primary/10 shadow-2xl hover:shadow-lg hover:shadow-primary/40'
                : 'border-2 border-primary/40 bg-gradient-to-br from-card to-primary/5 hover:border-primary/70 hover:shadow-lg'
        }`}>
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <div className={`p-2 rounded-lg transition-all ${
                        featured
                            ? 'bg-primary/20 shadow-lg'
                            : 'bg-secondary'
                    }`}>
                        <Flag className={`w-5 h-5 ${featured ? 'text-primary' : 'text-primary'}`} />
                    </div>
                    <span className="text-xs font-medium bg-primary/20 text-primary px-2.5 py-0.5 rounded-full">
                        Ouvert
                    </span>
                </div>
                <CardTitle className={`mt-4 transition-all ${featured ? 'text-3xl' : 'text-2xl'}`}>
                    {ctf.titre}
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1">
                <p className={`text-muted-foreground mb-4 line-clamp-3 ${featured ? 'text-base' : 'text-sm'}`}>
                    {ctf.description}
                </p>
                <div className={`flex flex-col space-y-2 text-muted-foreground ${featured ? 'text-base' : 'text-sm'}`}>
                    <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{ctf.lieu}</span>
                    </div>
                    <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{ctf.nbVues} vues</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className={`pt-4 border-t border-border ${featured ? 'pt-6' : ''}`}>
                <Button
                    className={`w-full transition-all ${
                        featured
                            ? 'bg-gradient-to-r from-primary to-blue-500 hover:shadow-lg text-lg h-12'
                            : 'bg-primary hover:bg-primary/90'
                    }`}
                    onClick={() => navigate(`/ctf/${ctf.id}`)}
                >
                    <Trophy className="w-4 h-4 mr-2" />
                    {featured ? 'Relever le Défi' : 'Voir & Participer'}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default CtfCard;