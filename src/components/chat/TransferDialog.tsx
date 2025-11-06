import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface TransferDialogProps {
  attendanceId: string;
  clientName: string;
  onTransferComplete: () => void;
}

export const TransferDialog = ({ attendanceId, clientName, onTransferComplete }: TransferDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [matricula, setMatricula] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async () => {
    if (!matricula.trim()) {
      toast.error('Digite a matrícula do atendente');
      return;
    }

    setIsTransferring(true);
    try {
      // Update attendance status
      const { error: updateError } = await supabase
        .from('attendances')
        .update({
          assigned_to: 'agent',
          notes: `Transferido para matrícula: ${matricula}`
        })
        .eq('id', attendanceId);

      if (updateError) throw updateError;

      toast.success(`Atendimento transferido`);
      setIsOpen(false);
      setMatricula("");
      onTransferComplete();
    } catch (error) {
      console.error('Error transferring:', error);
      toast.error('Erro ao transferir atendimento');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Transferir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>🔄 Transferir Atendimento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Transferindo atendimento de: <strong>{clientName}</strong>
          </p>
          <div>
            <Label htmlFor="matricula">Matrícula do Atendente</Label>
            <Input
              id="matricula"
              placeholder="Digite a matrícula"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              className="mt-2"
            />
          </div>
          <Button
            onClick={handleTransfer}
            disabled={isTransferring}
            className="w-full"
          >
            {isTransferring ? 'Transferindo...' : 'Confirmar Transferência'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
