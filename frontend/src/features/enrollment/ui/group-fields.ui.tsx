import type { GroupInfo } from "@/entities/enrollment";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { AlertCircle, Plus, Trash2, Users } from "lucide-react";

interface GroupFieldsProps {
  group: GroupInfo;
  errors: Record<string, string>;
  onChange: (field: keyof GroupInfo, value: string | number) => void;
  onParticipantChange: (index: number, field: "name" | "email", value: string) => void;
  onAddParticipant: () => void;
  onRemoveParticipant: (index: number) => void;
}

export function GroupFields({
  group,
  errors,
  onChange,
  onParticipantChange,
  onAddParticipant,
  onRemoveParticipant,
}: GroupFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            단체
          </Badge>
          단체 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="단첼명" required error={errors["group.organizationName"]}>
            <Input
              value={group.organizationName}
              onChange={(e) => onChange("organizationName", e.target.value)}
              placeholder="회사명 또는 단첼명"
            />
          </Field>
          <Field label="담당자 연락처" required error={errors["group.contactPerson"]}>
            <Input
              value={group.contactPerson}
              onChange={(e) => onChange("contactPerson", e.target.value)}
              placeholder="담당자 전화번호"
            />
          </Field>
          <Field label="신청 인원" required error={errors["group.headCount"]}>
            <Input
              type="number"
              min={2}
              max={10}
              value={group.headCount}
              onChange={(e) => onChange("headCount", Number.parseInt(e.target.value) || 2)}
            />
          </Field>
        </div>

        <ParticipantList
          participants={group.participants}
          errors={errors}
          onChange={onParticipantChange}
          onRemove={onRemoveParticipant}
        />

        {group.participants.length < 10 && (
          <Button type="button" variant="outline" className="w-full" onClick={onAddParticipant}>
            <Plus className="w-4 h-4 mr-2" />
            참가자 추가
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

interface ParticipantListProps {
  participants: Array<{ name: string; email: string }>;
  errors: Record<string, string>;
  onChange: (index: number, field: "name" | "email", value: string) => void;
  onRemove: (index: number) => void;
}

function ParticipantList({ participants, errors, onChange, onRemove }: ParticipantListProps) {
  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          참가자 명단 <span className="text-destructive">*</span>
        </Label>
        <span className="text-sm text-muted-foreground">{participants.length}명 / 최대 10명</span>
      </div>

      {errors["group.participants"] && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors["group.participants"]}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {participants.map((p, i) => (
          <div key={i} className="flex gap-3 items-start p-3 bg-muted/50 rounded-lg">
            <div className="flex-1 grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">이름</Label>
                <Input
                  value={p.name}
                  onChange={(e) => onChange(i, "name", e.target.value)}
                  placeholder={`참가자 ${i + 1} 이름`}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">이메일</Label>
                <Input
                  type="email"
                  value={p.email}
                  onChange={(e) => onChange(i, "email", e.target.value)}
                  placeholder={`참가자 ${i + 1} 이메일`}
                />
              </div>
            </div>
            {participants.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-5 shrink-0"
                onClick={() => onRemove(i)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
