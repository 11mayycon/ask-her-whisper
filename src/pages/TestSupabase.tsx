import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";

interface TestResult {
  name: string;
  status: "success" | "error" | "loading";
  message: string;
  data?: any;
}

export default function TestSupabase() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: TestResult[] = [];

    // Test 1: Verificar conexão básica
    try {
      const { data, error } = await supabase.from("support_rooms").select("*").limit(5) as any;
      results.push({
        name: "Conexão com Supabase",
        status: error ? "error" : "success",
        message: error ? error.message : `✓ Conexão estabelecida. ${data?.length || 0} salas encontradas.`,
        data: data,
      });
    } catch (err: any) {
      results.push({
        name: "Conexão com Supabase",
        status: "error",
        message: err.message || "Erro desconhecido",
      });
    }

    // Test 2: Verificar configuração de autenticação
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      results.push({
        name: "Autenticação",
        status: error ? "error" : "success",
        message: session 
          ? `✓ Usuário autenticado: ${session.user.email}` 
          : "⚠ Nenhum usuário autenticado (esperado em teste)",
      });
    } catch (err: any) {
      results.push({
        name: "Autenticação",
        status: "error",
        message: err.message || "Erro ao verificar sessão",
      });
    }

    // Test 3: Verificar acesso a tabelas públicas
    try {
      const { data, error } = await supabase
        .from("ai_memory")
        .select("id, context, updated_at")
        .limit(1) as any;
      
      results.push({
        name: "Acesso a AI Memory",
        status: error ? "error" : "success",
        message: error 
          ? `⚠ Erro de permissão (esperado sem auth): ${error.message}` 
          : `✓ ${data?.length || 0} registros acessíveis`,
        data: data,
      });
    } catch (err: any) {
      results.push({
        name: "Acesso a AI Memory",
        status: "error",
        message: err.message || "Erro desconhecido",
      });
    }

    // Test 4: Verificar configuração do projeto
    const projectUrl = import.meta.env.VITE_SUPABASE_URL;
    const hasAnonKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    results.push({
      name: "Configuração do Projeto",
      status: projectUrl && hasAnonKey ? "success" : "error",
      message: projectUrl && hasAnonKey
        ? `✓ Projeto: ${projectUrl.replace('https://', '')}`
        : "✗ Variáveis de ambiente não configuradas",
    });

    setTests(results);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Teste de Conexão Supabase</h1>
          <p className="text-muted-foreground mt-2">
            Verificando conectividade e configuração
          </p>
        </div>
        <Button onClick={runTests} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Reexecutar Testes
        </Button>
      </div>

      <div className="space-y-4">
        {tests.map((test, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {test.status === "loading" && <Loader2 className="w-5 h-5 animate-spin" />}
                  {test.status === "success" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {test.status === "error" && <XCircle className="w-5 h-5 text-red-500" />}
                  {test.name}
                </CardTitle>
                <Badge variant={test.status === "success" ? "default" : "destructive"}>
                  {test.status}
                </Badge>
              </div>
              <CardDescription>{test.message}</CardDescription>
            </CardHeader>
            {test.data && (
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                  {JSON.stringify(test.data, null, 2)}
                </pre>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Informações de Configuração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Supabase URL:</span>
            <span className="text-muted-foreground">{import.meta.env.VITE_SUPABASE_URL}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Project ID:</span>
            <span className="text-muted-foreground">{import.meta.env.VITE_SUPABASE_PROJECT_ID}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Anon Key configurada:</span>
            <span className="text-muted-foreground">
              {import.meta.env.VITE_SUPABASE_ANON_KEY ? "✓ Sim" : "✗ Não"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
