"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { useActionState, useState } from "react";
import { Save, Plus, Pencil, Trash2 } from "lucide-react";
import { OperationSummary as OperationSummaryUI } from "./OperationCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  createOperationAction,
  updateOperationAction,
  deleteOperationAction,
} from "@/lib/actions/operations";
import type { Bank, OperationWithBanks } from "@/types/domain";

function SubmitButton({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
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

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "pago", label: "Pago" },
];

function PaymentStatusField({
  status,
  date,
  onChange,
  error,
  disabled,
}: {
  status: string;
  date: string;
  onChange: (patch: { status: "pendente" | "pago"; date: string }) => void;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="payment_status">Status do pagamento</Label>
        <Select
          id="payment_status"
          name="payment_status"
          value={status}
          onChange={(e) =>
            onChange({ status: e.target.value as "pendente" | "pago", date })
          }
          disabled={disabled}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <FieldError message={error} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="payment_date">Data do pagamento</Label>
        <Input
          id="payment_date"
          name="payment_date"
          type="date"
          value={date}
          onChange={(e) =>
            onChange({
              status: status as "pendente" | "pago",
              date: e.target.value,
            })
          }
          disabled={disabled || status === "pendente"}
        />
        {status === "pendente" && (
          <p className="text-xs text-brand-500">
            A data é preenchida quando o status é marcado como Pago.
          </p>
        )}
      </div>
    </div>
  );
}

function NewOperationForm({
  clientId,
  banks,
}: {
  clientId: string;
  banks: Bank[];
}) {
  const [state, action] = useActionState(createOperationAction, undefined);
  const [status, setStatus] = useState<"pendente" | "pago">("pendente");
  const [date, setDate] = useState("");
  const { show } = useToast();

  React.useEffect(() => {
    if (state?.error && !state.fieldErrors) show(state.error, "error");
  }, [state, show]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova operação</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <input type="hidden" name="client_id" value={clientId} />
          {state?.error && !state.fieldErrors && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bank_id" required>
                Banco (destino)
              </Label>
              <Select id="bank_id" name="bank_id" required aria-invalid={!!state?.fieldErrors?.bank_id}>
                <option value="">Selecione…</option>
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
              <FieldError message={state?.fieldErrors?.bank_id} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="origin_bank_id" required>
                Banco de origem
              </Label>
              <Select
                id="origin_bank_id"
                name="origin_bank_id"
                required
                aria-invalid={!!state?.fieldErrors?.origin_bank_id}
              >
                <option value="">Selecione…</option>
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
              <FieldError message={state?.fieldErrors?.origin_bank_id} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount" required>
                Valor (R$)
              </Label>
              <Input
                id="amount"
                name="amount"
                inputMode="decimal"
                placeholder="0,00"
                required
                aria-invalid={!!state?.fieldErrors?.amount}
              />
              <FieldError message={state?.fieldErrors?.amount} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="installments" required>
                Quantidade de parcelas
              </Label>
              <Input
                id="installments"
                name="installments"
                type="number"
                min={1}
                max={360}
                required
                aria-invalid={!!state?.fieldErrors?.installments}
              />
              <FieldError message={state?.fieldErrors?.installments} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="installment_amount" required>
                Valor da parcela (R$)
              </Label>
              <Input
                id="installment_amount"
                name="installment_amount"
                inputMode="decimal"
                placeholder="0,00"
                required
                aria-invalid={!!state?.fieldErrors?.installment_amount}
              />
              <FieldError message={state?.fieldErrors?.installment_amount} />
            </div>
          </div>
          <PaymentStatusField
            status={status}
            date={date}
            onChange={({ status, date }) => {
              setStatus(status);
              setDate(date);
            }}
            error={state?.fieldErrors?.payment_status}
          />
          <div className="flex justify-end pt-2">
            <SubmitButton icon={<Plus className="h-4 w-4" />}>
              Adicionar operação
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function EditOperationForm({
  op,
  clientId,
  banks,
}: {
  op: OperationWithBanks;
  clientId: string;
  banks: Bank[];
}) {
  const boundAction = React.useMemo(
    () => updateOperationAction.bind(null, op.id, clientId),
    [op.id, clientId],
  );
  const [state, action] = useActionState(boundAction, undefined);
  const [status, setStatus] = useState<"pendente" | "pago">(op.payment_status);
  const [date, setDate] = useState(
    op.payment_date ? op.payment_date.slice(0, 10) : "",
  );
  const { show } = useToast();

  React.useEffect(() => {
    if (state?.error && !state.fieldErrors) show(state.error, "error");
  }, [state, show]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar operação</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {state?.error && !state.fieldErrors && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`bank_id-${op.id}`} required>
                Banco (destino)
              </Label>
              <Select
                id={`bank_id-${op.id}`}
                name="bank_id"
                defaultValue={op.bank_id}
                required
              >
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`origin_bank_id-${op.id}`} required>
                Banco de origem
              </Label>
              <Select
                id={`origin_bank_id-${op.id}`}
                name="origin_bank_id"
                defaultValue={op.origin_bank_id}
                required
              >
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`amount-${op.id}`} required>
                Valor (R$)
              </Label>
              <Input
                id={`amount-${op.id}`}
                name="amount"
                inputMode="decimal"
                defaultValue={op.amount}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`installments-${op.id}`} required>
                Quantidade de parcelas
              </Label>
              <Input
                id={`installments-${op.id}`}
                name="installments"
                type="number"
                min={1}
                max={360}
                defaultValue={op.installments}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`installment_amount-${op.id}`} required>
                Valor da parcela (R$)
              </Label>
              <Input
                id={`installment_amount-${op.id}`}
                name="installment_amount"
                inputMode="decimal"
                defaultValue={op.installment_amount}
                required
              />
            </div>
          </div>
          <PaymentStatusField
            status={status}
            date={date}
            onChange={({ status, date }) => {
              setStatus(status);
              setDate(date);
            }}
          />
          <div className="flex justify-end pt-2">
            <SubmitButton icon={<Save className="h-4 w-4" />}>
              Salvar operação
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function DeleteOperationButton({
  op,
  clientId,
}: {
  op: OperationWithBanks;
  clientId: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const { show } = useToast();

  const onConfirm = async () => {
    setPending(true);
    const result = await deleteOperationAction(op.id, clientId);
    setPending(false);
    if (!result.ok) {
      show(result.error ?? "Erro ao excluir.", "error");
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
      >
        <Trash2 className="h-4 w-4" />
        Excluir
      </Button>
      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        title="Excluir operação"
        description="Tem certeza que deseja excluir esta operação? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        destructive
        isLoading={pending}
      />
    </>
  );
}

export function OperationList({
  clientId,
  banks,
  operations,
}: {
  clientId: string;
  banks: Bank[];
  operations: OperationWithBanks[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-brand-900">Operações</h2>
        {!creating && (
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>
            Nova operação
          </Button>
        )}
      </div>

      {creating && (
        <div className="space-y-2">
          <NewOperationForm clientId={clientId} banks={banks} />
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {operations.length === 0 && !creating ? (
        <Card>
          <CardContent className="text-center text-sm text-brand-600">
            Nenhuma operação cadastrada para este cliente.
          </CardContent>
        </Card>
      ) : (
        operations.map((op) => (
          <Card key={op.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle>
                  {op.bank.name} ← {op.origin_bank.name}
                </CardTitle>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {editingId !== op.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(op.id);
                      setCreating(false);
                    }}
                    leftIcon={<Pencil className="h-4 w-4" />}
                  >
                    Editar
                  </Button>
                )}
                <DeleteOperationButton op={op} clientId={clientId} />
              </div>
            </CardHeader>
            <CardContent>
              {editingId === op.id ? (
                <EditOperationForm op={op} clientId={clientId} banks={banks} />
              ) : (
                <OperationSummaryUI op={op} />
              )}
              {editingId === op.id && (
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" onClick={() => setEditingId(null)}>
                    Fechar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
