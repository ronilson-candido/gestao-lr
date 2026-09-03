"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { useActionState, useState } from "react";
import { Pencil, Trash2, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime } from "@/lib/utils/format";
import {
  createObservationAction,
  updateObservationAction,
  deleteObservationAction,
} from "@/lib/actions/observations";
import type { Observation } from "@/types/domain";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} size="sm">
      {children}
    </Button>
  );
}

function NewObservationForm({ clientId }: { clientId: string }) {
  const [state, action] = useActionState(createObservationAction, undefined);
  const { show } = useToast();

  React.useEffect(() => {
    if (state?.error && !state.fieldErrors) show(state.error, "error");
  }, [state, show]);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="client_id" value={clientId} />
      <Textarea
        name="content"
        placeholder="Escreva uma nova observação..."
        rows={3}
        aria-invalid={!!state?.fieldErrors?.content}
      />
      {state?.fieldErrors?.content && (
        <p className="text-xs text-rose-600">{state.fieldErrors.content}</p>
      )}
      <div className="flex justify-end">
        <SubmitButton>Adicionar observação</SubmitButton>
      </div>
    </form>
  );
}

function EditObservationForm({
  observation,
  clientId,
  onDone,
}: {
  observation: Observation;
  clientId: string;
  onDone: () => void;
}) {
  const boundAction = React.useMemo(
    () => updateObservationAction.bind(null, observation.id, clientId),
    [observation.id, clientId],
  );
  const [state, action] = useActionState(boundAction, undefined);

  React.useEffect(() => {
    if (state?.error && !state.fieldErrors) {
      // sem toast elaborado aqui; exibe inline.
    }
  }, [state]);

  return (
    <form action={action} className="space-y-2">
      <Textarea
        name="content"
        defaultValue={observation.content}
        rows={3}
        required
        aria-invalid={!!state?.fieldErrors?.content}
      />
      {state?.fieldErrors?.content && (
        <p className="text-xs text-rose-600">{state.fieldErrors.content}</p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancelar
        </Button>
        <SubmitButton>
          <Save className="mr-1 inline h-4 w-4" />
          Salvar
        </SubmitButton>
      </div>
    </form>
  );
}

function DeleteObservationButton({
  observation,
  clientId,
}: {
  observation: Observation;
  clientId: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const { show } = useToast();

  const onConfirm = async () => {
    setPending(true);
    const result = await deleteObservationAction(observation.id, clientId);
    setPending(false);
    if (!result.ok) {
      show(result.error ?? "Erro ao excluir.", "error");
      setOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md p-1 text-brand-500 hover:bg-rose-50 hover:text-rose-600"
        aria-label="Excluir observação"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        title="Excluir observação"
        description="Tem certeza que deseja excluir esta observação? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        destructive
        isLoading={pending}
      />
    </>
  );
}

export function ObservationsPanel({
  clientId,
  observations,
}: {
  clientId: string;
  observations: Observation[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-brand-900">Observações</h2>
        {!adding && (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setAdding(true)}
          >
            Nova observação
          </Button>
        )}
      </div>

      {adding && (
        <Card>
          <CardContent className="space-y-2">
            <NewObservationForm clientId={clientId} />
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {observations.length === 0 && !adding ? (
        <Card>
          <CardContent className="text-center text-sm text-brand-600">
            Nenhuma observação registrada.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {observations.map((obs) => (
            <Card key={obs.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
                    {formatDateTime(obs.created_at)}
                    {obs.updated_at !== obs.created_at && (
                      <span className="ml-2 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] normal-case text-brand-600">
                        editada em {formatDateTime(obs.updated_at)}
                      </span>
                    )}
                  </p>
                </div>
                {editingId !== obs.id && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(obs.id);
                        setAdding(false);
                      }}
                      className="rounded-md p-1 text-brand-500 hover:bg-brand-100 hover:text-brand-800"
                      aria-label="Editar observação"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <DeleteObservationButton
                      observation={obs}
                      clientId={clientId}
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {editingId === obs.id ? (
                  <EditObservationForm
                    observation={obs}
                    clientId={clientId}
                    onDone={() => setEditingId(null)}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-brand-800">
                    {obs.content}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
