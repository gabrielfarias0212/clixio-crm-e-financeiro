import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    signIn,
    signUp,
    user
  } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const {
          success,
          error
        } = await signIn(email, password);
        if (success) {
          navigate("/");
        } else {
          setError(error || "Falha ao fazer login. Verifique suas credenciais.");
        }
      } else {
        const {
          success,
          error
        } = await signUp(email, password, name);
        if (success) {
          setMode("login");
          setError("Registro bem-sucedido. Por favor, faça login agora.");
        } else {
          setError(error || "Falha ao registrar. Tente novamente.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <h1 className="text-2xl font-bold">Wedding CRM</h1>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {mode === "login" ? "Entre na sua conta" : "Crie uma conta"}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === "login" ? "Digite suas credenciais para acessar o sistema" : "Preencha os dados abaixo para criar sua conta"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Seu nome completo" value={name} onChange={e => setName(e.target.value)} required />
              </div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="exemplo@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full rounded-none bg-orange-500 hover:bg-orange-400 text-black">
              {loading ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aguarde...
                </> : mode === "login" ? "Entrar" : "Registrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button variant="link" className="w-full" onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError(null);
        }}>
            {mode === "login" ? "Não tem uma conta? Registre-se" : "Já tem uma conta? Entre"}
          </Button>
        </CardFooter>
      </Card>
    </div>;
}