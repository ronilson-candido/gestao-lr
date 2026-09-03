import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { OperationWithBanks } from "@/types/domain";

export function StatusBadge({ status }: { status: "pendente" | "pago" }) {
  if (status === "pago") {
    return <Badge variant="success">Pago</Badge>;
  }
  return <Badge variant="warning">Pendente</Badge>;
}

export function OperationSummary({ op }: { op: OperationWithBanks }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      <Field label="Banco" value={op.bank.name} />
      <Field label="Banco de origem" value={op.origin_bank.name} />
      <Field label="Valor" value={formatCurrency(op.amount)} />
      <Field label="Parcelas" value={`${op.installments}x`} />
      <Field label="Valor da parcela" value={formatCurrency(op.installment_amount)} />
      <Field
        label="Status"
        value={
          <StatusBadge status={op.payment_status} />
        }
      />
      <Field
        label="Data do pagamento"
        value={
          op.payment_date ? (
            formatDate(op.payment_date)
          ) : (
            <span className="text-brand-400">—</span>
          )
        }
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-brand-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-brand-900">{value}</dd>
    </div>
  );
}
