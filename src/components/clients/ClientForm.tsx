"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import {
  createClientAction,
  updateClientAction,
  deleteClientAction,
  type FormState,
} from "@/lib/actions/clients";
import { maskCPF, onlyDigits } from "@/lib/validations/cpf";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/Modal";

function SubmitButton({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} leftIcon={!pending ? icon : undefined}>
      {children}
    </Button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-600">{message}</p>;
}

export function NewClientForm() {
  const [state, action] = useActionState<FormState | undefined, FormData>(
    createClientAction,
    undefined,
  );
  const [cpf, setCpf] = useState("");
  const { show } = useToast();

  React.useEffect(() => {
    if (state?.error && !state.fieldErrors) show(state.error, "error");
  }, [state, show]);

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Dados do cliente</CardTitle>
        <CardDescription>Preencha as informações obrigatórias.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {state?.error && !state.fieldErrors && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="name" required>
              Nome completo
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex.: Maria Neide Carneiro de Oliveira"
              required
              aria-invalid={!!state?.fieldErrors?.name}
            />
            <FieldError message={state?.fieldErrors?.name} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cpf" required>
              CPF
            </Label>
            <Input
              id="cpf"
              name="cpf"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              maxLength={14}
              required
              aria-invalid={!!state?.fieldErrors?.cpf}
            />
            <FieldError message={state?.fieldErrors?.cpf} />
            <p className="text-xs text-brand-500">
              Armazenado apenas com dígitos. A máscara é apenas visual.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Link href="/clientes">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
            <SubmitButton icon={<UserPlus className="h-4 w-4" />}>
              Cadastrar cliente
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function EditClientForm({
  clientId,
  initial,
}: {
  clientId: string;
  initial: { name: string; cpf: string };
}) {
  const boundAction = React.useMemo(
    () => updateClientAction.bind(null, clientId),
    [clientId],
  );
  const [state, action] = useActionState<FormState | undefined, FormData>(
    boundAction,
    undefined,
  );
  const [cpf, setCpf] = useState(initial.cpf);
  const { show } = useToast();

  React.useEffect(() => {
    if (state?.error && !state.fieldErrors) show(state.error, "error");
  }, [state, show]);

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Editar cliente</CardTitle>
        <CardDescription>Atualize as informações do cliente.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {state?.error && !state.fieldErrors && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="name" required>
              Nome completo
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={initial.name}
              required
              aria-invalid={!!state?.fieldErrors?.name}
            />
            <FieldError message={state?.fieldErrors?.name} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cpf" required>
              CPF
            </Label>
            <Input
              id="cpf"
              name="cpf"
              inputMode="numeric"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              maxLength={14}
              required
              aria-invalid={!!state?.fieldErrors?.cpf}
            />
            <FieldError message={state?.fieldErrors?.cpf} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Link href={`/clientes/${clientId}`}>
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
            <SubmitButton icon={<Save className="h-4 w-4" />}>Salvar alterações</SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function DeleteClientButton({ clientId, name }: { clientId: string; name: string }) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const { show } = useToast();

  const onConfirm = async () => {
    setPending(true);
    const result = await deleteClientAction(clientId);
    setPending(false);
    if (!result.ok) {
      show(result.error ?? "Erro ao excluir.", "error");
      setOpen(false);
    }
    // Em caso de sucesso, o server action redireciona.
  };

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Excluir cliente
      </Button>
      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        title="Excluir cliente"
        description={`Tem certeza que deseja excluir "${name}"? Esta ação também removerá todas as operações e observações vinculadas e não pode ser desfeita.`}
        confirmText="Excluir"
        destructive
        isLoading={pending}
      />
    </>
  );
}
