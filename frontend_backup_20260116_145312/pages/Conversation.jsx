import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import {
    ArrowLeft,
    Send,
    User,
    Mail,
    Clock,
    CheckCheck,
    Check,
    AlertCircle,
    MessageSquare
} from "lucide-react";

const Conversation = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const messagesEndRef = useRef(null);

    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userEmail, setUserEmail] = useState('');

    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decoded.exp && decoded.exp < currentTime) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            const role = Array.isArray(decoded.groups) ? decoded.groups[0] : decoded.groups;
            setUserEmail(decoded.sub);

            if (role !== 'PARTICIPANT' && role !== 'ORGANISATEUR' && role !== 'ADMINISTRATEUR') {
                navigate('/profile');
                return;
            }
        } catch (e) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
        }

        // Vérifier que conversationId est défini avant de fetch
        if (conversationId && conversationId !== 'undefined') {
            fetchConversation();
        }
    }, [token, navigate, conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversation = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.get(
                `http://localhost:8080/messaging/conversations/${conversationId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setConversation(response.data);
            setMessages(response.data.messages || []);
        } catch (err) {
            console.error('Erreur récupération conversation:', err);
            setError(err.response?.data?.message || 'Erreur lors de la récupération de la conversation');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || sending) return;

        setSending(true);
        setError('');

        try {
            const response = await axios.post(
                `http://localhost:8080/messaging/conversations/${conversationId}/messages`,
                { content: newMessage.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Ajouter le message à la liste
            setMessages([...messages, response.data]);
            setNewMessage('');
        } catch (err) {
            console.error('Erreur envoi message:', err);
            setError(err.response?.data?.message || 'Erreur lors de l\'envoi du message');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Aujourd'hui";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Hier";
        }

        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    const groupMessagesByDate = (messages) => {
        const groups = {};

        messages.forEach(msg => {
            const dateKey = new Date(msg.sentAt).toDateString();
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(msg);
        });

        return groups;
    };

    const getRoleBadge = (role) => {
        if (role === 'ORGANISATEUR') {
            return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
        } else if (role === 'ADMINISTRATEUR') {
            return 'bg-red-500/20 text-red-600 dark:text-red-400';
        }
        return 'bg-green-500/20 text-green-600 dark:text-green-400';
    };

    if (loading) {
        return <div className="text-center p-10 text-lg">Chargement de la conversation...</div>;
    }

    if (error && !conversation) {
        return (
            <div className="container mx-auto py-10 px-4 max-w-4xl">
                <div className="space-y-4">
                    <Button variant="outline" onClick={() => navigate('/messaging')} className="flex items-center gap-2">
                        <ArrowLeft size={18} />
                        Retour
                    </Button>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-start gap-3">
                        <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const groupedMessages = groupMessagesByDate(messages);

    return (
        <div className="container mx-auto py-6 px-4 max-w-4xl h-[calc(100vh-80px)] flex flex-col">
            {/* Header */}
            <Card className="border-border mb-4 flex-shrink-0">
                <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/messaging')}
                        >
                            <ArrowLeft size={20} />
                        </Button>

                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-lg font-bold">
                            {conversation?.otherUserPseudo?.charAt(0).toUpperCase() || 'U'}
                        </div>

                        {/* Infos */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="font-semibold text-lg">
                                    {conversation?.otherUserPseudo || 'Utilisateur'}
                                </h2>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getRoleBadge(conversation?.otherUserRole)}`}>
                                    {conversation?.otherUserRole === 'ORGANISATEUR' ? 'Organisateur' : conversation?.otherUserRole === 'ADMINISTRATEUR' ? 'Admin' : 'Participant'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail size={14} />
                                <span>{conversation?.otherUserEmail}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Message d'erreur */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-start gap-3 mb-4 flex-shrink-0">
                    <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
                    <p>{error}</p>
                </div>
            )}

            {/* Zone des messages */}
            <Card className="border-border flex-1 flex flex-col overflow-hidden">
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="p-6 bg-secondary rounded-full mb-4">
                                <MessageSquare size={48} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Aucun message</h3>
                            <p className="text-muted-foreground">
                                Envoyez le premier message pour démarrer la conversation !
                            </p>
                        </div>
                    ) : (
                        Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
                            <div key={dateKey}>
                                {/* Séparateur de date */}
                                <div className="flex items-center justify-center my-4">
                                    <div className="flex-1 border-t border-border"></div>
                                    <span className="px-4 text-xs text-muted-foreground bg-card">
                                        {formatDate(dateMessages[0].sentAt)}
                                    </span>
                                    <div className="flex-1 border-t border-border"></div>
                                </div>

                                {/* Messages */}
                                <div className="space-y-3">
                                    {dateMessages.map((message, index) => {
                                        const isOwnMessage = message.senderEmail === userEmail;

                                        return (
                                            <div
                                                key={message.id || index}
                                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                                        isOwnMessage
                                                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                                                            : 'bg-secondary text-secondary-foreground rounded-bl-sm'
                                                    }`}
                                                >
                                                    {/* Nom de l'expéditeur (seulement pour les messages reçus) */}
                                                    {!isOwnMessage && (
                                                        <p className="text-xs font-semibold mb-1 opacity-70">
                                                            {message.senderPseudo}
                                                        </p>
                                                    )}

                                                    {/* Contenu du message */}
                                                    <p className="whitespace-pre-wrap break-words">
                                                        {message.content}
                                                    </p>

                                                    {/* Heure et statut */}
                                                    <div className={`flex items-center gap-1 mt-1 ${
                                                        isOwnMessage ? 'justify-end' : 'justify-start'
                                                    }`}>
                                                        <span className="text-xs opacity-70">
                                                            {formatTime(message.sentAt)}
                                                        </span>
                                                        {isOwnMessage && (
                                                            message.isRead ? (
                                                                <CheckCheck size={14} className="opacity-70" />
                                                            ) : (
                                                                <Check size={14} className="opacity-70" />
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>

                {/* Zone d'envoi */}
                <div className="p-4 border-t border-border">
                    <form onSubmit={sendMessage} className="flex gap-3">
                        <Input
                            placeholder="Écrivez votre message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={sending}
                            className="flex-1"
                            maxLength={5000}
                        />
                        <Button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="px-6"
                        >
                            {sending ? (
                                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Send size={18} />
                            )}
                        </Button>
                    </form>
                    <p className="text-xs text-muted-foreground mt-2 text-right">
                        {newMessage.length}/5000 caractères
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default Conversation;