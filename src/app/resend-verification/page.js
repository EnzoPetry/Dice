"use client"

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResendVerificationPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleResend(e) {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const { data, error: authError } = await authClient.sendVerificationEmail({
                email: email,
                callbackURL: "/login",
            });

            if (authError) {
                throw new Error(authError.message || "Erro ao reenviar e-mail");
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
                <Card className="w-full max-w-md shadow-xl">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <Mail className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl">E-mail Reenviado!</CardTitle>
                        <CardDescription>
                            Verifique sua caixa de entrada
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">Sucesso!</AlertTitle>
                            <AlertDescription className="text-green-700">
                                Enviamos um novo link de verificação para <strong>{email}</strong>
                            </AlertDescription>
                        </Alert>

                        <Alert className="border-yellow-200 bg-yellow-50">
                            <AlertDescription className="text-sm text-yellow-800">
                                <strong>Não recebeu?</strong> Verifique sua caixa de spam ou lixo eletrônico.
                            </AlertDescription>
                        </Alert>

                        <div className="flex">
                            <Button
                                onClick={() => router.push("/login")}
                                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Ir para Login
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader>
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/login")}
                        className="w-fit -ml-2 mb-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                    <CardTitle className="text-2xl">Verificar sua conta</CardTitle>
                    <CardDescription>
                        Digite seu e-mail para receber um novo link de verificação
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4 animate-in slide-in-from-top-2">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Erro</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleResend} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="h-11"
                            />
                            <p className="text-xs text-muted-foreground">
                                Use o mesmo e-mail que você cadastrou
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            disabled={loading || !email}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Reenviar E-mail
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}