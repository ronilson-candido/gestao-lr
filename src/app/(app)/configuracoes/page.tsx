import { requireProfile } from "@/lib/auth-helpers";
import { signOut } from "@/lib/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";
import { formatDateTime } from "@/lib/utils/format";

export const metadata = {
  title: "Configurações",
};

export default async function SettingsPage() {
  const profile = await requireProfile();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-900">Configurações</h1>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Nome" value={profile.name} />
          <Row label="E-mail" value={profile.email} />
          <Row label="Conta criada em" value={formatDateTime(profile.created_at)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessão</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signOut}>
            <Button type="submit" variant="danger" leftIcon={<LogOut className="h-4 w-4" />}>
              Sair da conta
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-brand-500">
        {label}
      </dt>
      <dd className="text-sm text-brand-900 sm:col-span-2">{value}</dd>
    </div>
  );
}
