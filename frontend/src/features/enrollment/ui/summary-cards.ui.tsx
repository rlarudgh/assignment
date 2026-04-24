import type { Course, EnrollmentFormData } from "@/entities/enrollment";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Edit2, Calendar, CreditCard, Building2, User, Users } from "lucide-react";

interface CourseSummaryProps {
  course: Course | null;
  formData: EnrollmentFormData;
  onEdit: () => void;
  loading?: boolean;
}

const categoryLabels: Record<string, string> = { development: "개발", design: "디자인", marketing: "마케팅", business: "비즈니스" };

export function CourseSummary({ course, formData, onEdit, loading }: CourseSummaryProps) {
  const formatDate = (d: string) => new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  const formatPrice = (p: number) => p.toLocaleString("ko-KR") + "원";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2"><Badge variant="outline">1단계</Badge>강의 정보</CardTitle>
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onEdit} disabled={loading}><Edit2 className="w-4 h-4 mr-1" />수정</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {course ? (
          <>
            <div className="flex items-start gap-4">
              {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="w-24 h-16 object-cover rounded-md" />}
              <div className="flex-1">
                <Badge variant="secondary" className="mb-1">{categoryLabels[course.category] || course.category}</Badge>
                <h3 className="font-semibold">{course.title}</h3>
                <p className="text-sm text-muted-foreground">{course.instructor}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" />{formatDate(course.startDate)} ~ {formatDate(course.endDate)}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><CreditCard className="w-4 h-4" />{formatPrice(course.price)}</div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              {formData.type === "personal" ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
              <span className="font-medium">{formData.type === "personal" ? "개인 신청" : "단체 신청"}</span>
              {formData.type === "group" && formData.group && <span className="text-muted-foreground">· {formData.group.headCount}인</span>}
            </div>
          </>
        ) : <div className="h-24 bg-muted animate-pulse rounded-md" />}
      </CardContent>
    </Card>
  );
}

interface ApplicantSummaryProps {
  formData: EnrollmentFormData;
  onEdit: () => void;
  loading?: boolean;
}

export function ApplicantSummary({ formData, onEdit, loading }: ApplicantSummaryProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2"><Badge variant="outline">2단계</Badge>신청자 정보</CardTitle>
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onEdit} disabled={loading}><Edit2 className="w-4 h-4 mr-1" />수정</Button>
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
  return <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}

function GroupSummary({ group }: { group: NonNullable<EnrollmentFormData["group"]>; }) {
  return (
    <div className="space-y-3 pt-4 border-t">
      <h4 className="font-medium flex items-center gap-2"><Building2 className="w-4 h-4" />단체 정보</h4>
      <InfoRow label="단첼명" value={group.organizationName} />
      <InfoRow label="담당자 연락처" value={group.contactPerson} />
      <div className="space-y-2">
        <span className="text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4" />참가자 명단 ({group.participants.length}인)</span>
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          {group.participants.map((p, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground w-6">{i + 1}.</span><span className="font-medium">{p.name}</span><span className="text-muted-foreground">{p.email}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PriceSummaryProps {
  course: Course | null;
  formData: EnrollmentFormData;
}

export function PriceSummary({ course, formData }: PriceSummaryProps) {
  const formatPrice = (p: number) => p.toLocaleString("ko-KR") + "원";
  const totalPrice = course ? (formData.type === "group" && formData.group ? course.price * formData.group.headCount : course.price) : 0;

  return (
    <Card className="bg-primary/5 border-primary">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">총 결제 금액</p>
            <p className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</p>
          </div>
          {formData.type === "group" && formData.group && <div className="text-right text-sm text-muted-foreground"><p>{formatPrice(course!.price)} × {formData.group.headCount}인</p></div>}
        </div>
      </CardContent>
    </Card>
  );
}
