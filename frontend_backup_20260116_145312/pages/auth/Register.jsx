import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { z } from "zod";
import FormField from "@/components/common/FormField.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card.jsx";

const Register = () => {
    const navigate = useNavigate();
    const [pseudo, setPseudo] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setFieldErrors({});
        setServerError('');

        const formData = { pseudo, email, password };

        const registerSchema = z.object({
            pseudo: z.string().min(3, "Le pseudo doit faire au moins 3 caractères"),
            email: z.string().email("Format d'email invalide"),
            password: z.string()
                .min(8, "Le mot de passe doit faire au moins 8 caractères")
                .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre")
                .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
                .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
                .regex(/[!@#$%^&*(),.?":{}|<>]/, "Le mot de passe doit contenir au moins un caractère spécial")
        });

        const result = registerSchema.safeParse(formData);
        if (!result.success) {
            setFieldErrors(result.error.flatten().fieldErrors);
            return;
        }

        try {
            await axios.post('http://localhost:8080/auth/register/participant', formData);
            navigate('/login');
        } catch (err) {
            setServerError(err.response?.data?.message || "Erreur lors de l'inscription.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Créer un compte</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <FormField
                            label="Pseudo"
                            placeholder="pseudo"
                            value={pseudo}
                            onChange={(e) => setPseudo(e.target.value)}
                            error={fieldErrors.pseudo}
                        />

                        <FormField
                            label="Email"
                            type="email"
                            placeholder="admin@rootyou.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={fieldErrors.email}
                        />

                        <FormField
                            label="Mot de passe"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={fieldErrors.password}
                        />

                        {serverError && (
                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                {serverError}
                            </div>
                        )}

                        <Button type="submit" className="w-full">S'inscrire</Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-slate-500">
                        Déjà inscrit ? <Link to="/login" className="text-blue-600 font-semibold">Se connecter</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Register;