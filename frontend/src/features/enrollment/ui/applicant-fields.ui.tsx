import type { ApplicantInfo } from "@/entities/enrollment";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

interface ApplicantFieldsProps {
  applicant: ApplicantInfo;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  onChange: (field: keyof ApplicantInfo, value: string) => void;
  onBlur: (field: keyof ApplicantInfo) => void;
}

export function ApplicantFields({
  applicant,
  errors,
  touched,
  onChange,
  onBlur,
}: ApplicantFieldsProps) {
  const getError = (field: string) => (touched[field] ? errors[field] : undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            공통
          </Badge>
          신청자 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="이름" required error={getError("applicant.name")}>
            <Input
              value={applicant.name}
              onChange={(e) => onChange("name", e.target.value)}
              onBlur={() => onBlur("name")}
              placeholder="홍길동"
            />
          </Field>
          <Field label="이메일" required error={getError("applicant.email")}>
            <Input
              type="email"
              value={applicant.email}
              onChange={(e) => onChange("email", e.target.value)}
              onBlur={() => onBlur("email")}
              placeholder="example@email.com"
            />
          </Field>
          <Field label="전화번호" required error={getError("applicant.phone")}>
            <Input
              value={applicant.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              onBlur={() => onBlur("phone")}
              placeholder="010-1234-5678"
            />
          </Field>
          <div className="space-y-2 md:col-span-2">
            <Label>수강 동기 (선택)</Label>
            <Textarea
              value={applicant.motivation || ""}
              onChange={(e) => onChange("motivation", e.target.value)}
              onBlur={() => onBlur("motivation")}
              placeholder="수강을 결정하게 된 동기나 기대하는 바를 간단히 적어주세요."
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground">
                {(applicant.motivation || "").length}/300자
              </span>
            </div>
          </div>
        </div>
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
