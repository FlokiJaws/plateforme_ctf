import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import FormField from '../../components/common/FormField.jsx';
import { Button } from "@/components/ui/button.jsx";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card.jsx";
import { buildApiUrl } from '@/config/api';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post(buildApiUrl('/auth/login'), {
                email,
                password
            });

            localStorage.setItem('token', response.data);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Email ou mot de passe incorrect.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Connexion</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <FormField
                            label="Email"
                            type="email"
                            placeholder="admin@rootyou.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <FormField
                            label="Mot de passe"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full">Se connecter</Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-slate-500">
                        Pas de compte ? <Link to="/register" className="text-blue-600 font-semibold">S'inscrire</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;