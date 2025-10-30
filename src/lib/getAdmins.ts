import { createClient } from "@supabase/supabase-js";

const projectUrl = "https://rsqwjoloqwtrujdhhjmi.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzcXdqb2xvcXd0cnVqZGhoam1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MjY2MzEsImV4cCI6MjA3NzQwMjYzMX0.E8sLdvpVYwCeEzpYBvmEYBbDBLtGeqd-nVjghYZMvAI";

const supabase = createClient(projectUrl, anonKey);

async function getAdmins() {
  const { data, error } = await supabase.from("administrators").select("matricula");
  if (error) {
    console.error("Erro ao buscar administradores:", error);
    return;
  }
  console.log("Matrículas de administradores cadastradas:", data);
}

getAdmins();