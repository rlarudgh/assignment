import type { EnrollmentFormData } from "@/entities/enrollment";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Building2, Edit2, Users } from "lucide-react";

interface ApplicantSummaryProps {
  formData: EnrollmentFormData;
  onEdit: () => void;
  loading?: boolean;
}

export function ApplicantSummary({ formData, onEdit, loading }: ApplicantSummaryProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Badge variant="outline">2단계</Badge>신청자 정보
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={onEdit}
          disabled={loading}
        >
          <Edit2 className="w-4 h-4 mr-1" />
          수정
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <InfoRow label="이름" value={formData.applicant.name} />
        <InfoRow label="이메일" value={formData.applicant.email} />
        <InfoRow label="전화번호" value={formData.applicant.phone} />
        {formData.applicant.motivation && (
          <div className="py-2">
            <span className="text-muted-foreground block mb-1">수강 동기</span>
            <p className="text-sm bg-muted/50 p-3 rounded-lg">{formData.applicant.motivation}</p>
          </div>
        )}
        {formData.type === "group" && formData.group && <GroupSummary group={formData.group} />}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function GroupSummary({ group }: { group: NonNullable<EnrollmentFormData["group"]> }) {
  return (
    <div className="space-y-3 pt-4 border-t">
      <h4 className="font-medium flex items-center gap-2">
        <Building2 className="w-4 h-4" />
        단체 정보
      </h4>
      <InfoRow label="단체명" value={group.organizationName} />
      <InfoRow label="담당자 연락처" value={group.contactPerson} />
      <div className="space-y-2">
        <span className="text-muted-foreground flex items-center gap-2">
          <Users className="w-4 h-4" />
          참가자 명단 ({group.participants.length}인)
        </span>
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          {group.participants.map((p) => (
            <div key={p.email} className="flex items-center gap-3 text-sm">
              <span className="font-medium">{p.name}</span>
              <span className="text-muted-foreground">{p.email}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
