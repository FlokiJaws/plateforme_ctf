import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Button } from "@/components/ui/button.jsx";
import { ArrowLeft } from "lucide-react";
import ParticipantsManagement from '../../components/ctf/ParticipantsManagement.jsx';

const OrganizerCtfParticipants = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ctf, setCtf] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const role = Array.isArray(decoded.groups) ? decoded.groups[0] : decoded.groups;

            if (role !== 'ORGANISATEUR') {
                navigate('/profile');
                return;
            }
        } catch (e) {
            console.error('Erreur JWT:', e);
            navigate('/login');
            return;
        }

        fetchCtfInfo();
    }, [id, navigate]);

    const fetchCtfInfo = async () => {
        const token = localStorage.getItem('token');
        try {
            const ctfResponse = await axios.get(`http://localhost:8080/ctfs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCtf(ctfResponse.data);
            setLoading(false);
        } catch (err) {
            console.error('Erreur:', err);
            setError(err.response?.data?.message || 'Erreur lors du chargement');
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-10 text-lg">Chargement...</div>;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <p className="text-xl font-bold text-destructive">{error}</p>
                <Button variant="outline" onClick={() => navigate('/organizer-ctfs')}>Retour</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/organizer-ctfs')}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2" size={16} />
                    Retour à mes CTFs
                </Button>

                <div>
                    <h1 className="text-3xl font-bold">{ctf?.titre}</h1>
                    <p className="text-muted-foreground mt-1">Gestion des participants</p>
                </div>
            </div>

            <ParticipantsManagement mode="single" ctfId={parseInt(id)} />
        </div>
    );
};

export default OrganizerCtfParticipants;