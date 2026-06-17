import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, Mail, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Redirect authenticated users away from auth page
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotLoading(false);
    if (error) {
      setError(error.message);
    } else {
      toast({
        title: 'Correo enviado',
        description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
      });
      setShowForgotPassword(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      // Provide user-friendly error messages
      if (error.message.includes('Email logins are disabled')) {
        setError('El inicio de sesión por correo está deshabilitado. Contacta al administrador.');
      } else if (error.message.includes('Invalid login credentials')) {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError(error.message);
      }
      setIsLoading(false);
    } else {
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema",
      });
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const { data, error, needsEmailConfirmation } = await signUp(email, password, fullName);

    if (error) {
      // Provide more specific error messages
      if (error.message?.includes('User already registered')) {
        setError('Ya existe una cuenta con este correo electrónico. Intenta iniciar sesión.');
      } else if (error.message?.includes('Invalid email')) {
        setError('El formato del correo electrónico no es válido.');
      } else if (error.message?.includes('Password')) {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else if (error.message?.includes('Email signups are disabled')) {
        setError('El registro por correo está deshabilitado. Contacta al administrador.');
      } else {
        setError(error.message || 'Error durante el registro. Por favor intenta nuevamente.');
      }
      setIsLoading(false);
    } else if (needsEmailConfirmation) {
      toast({
        title: "Registro exitoso",
        description: "Por favor revisa tu correo electrónico para confirmar tu cuenta. Si fuiste autorizado por un administrador, tu perfil se activará automáticamente.",
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Registro exitoso", 
        description: "Tu cuenta ha sido creada exitosamente. Si tienes problemas accediendo, contacta al administrador.",
      });
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-8">
        <img 
          src="/assets/logo-funluker.jpg" 
          alt="Fundación Luker" 
          className="w-40 h-auto object-contain mix-blend-multiply"
        />
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Sistema de Gestión</CardTitle>
            <CardDescription>
              Accede al sistema de gestión de actores y proyectos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="signup">Registrarse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="password"
                        type="password"
                        placeholder="Contraseña"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex justify-center w-full">
                    <Button 
                      type="submit" 
                      className="px-8 btn-animate" 
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Iniciar Sesión
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm"
                    onClick={() => { setShowForgotPassword(true); setError(null); }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Button>
                </form>

                {showForgotPassword && (
                  <form onSubmit={handleForgotPassword} className="mt-4 space-y-3 border-t pt-4">
                    <p className="text-sm text-muted-foreground">Ingresa tu correo para recibir un enlace de recuperación:</p>
                    <Input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1" disabled={forgotLoading}>
                        {forgotLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar enlace
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowForgotPassword(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="fullName"
                        type="text"
                        placeholder="Nombre completo"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="password"
                        type="password"
                        placeholder="Contraseña (mínimo 6 caracteres)"
                        className="pl-10"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex justify-center w-full">
                    <Button 
                      type="submit" 
                      className="px-8 btn-animate" 
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Registrarse
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}