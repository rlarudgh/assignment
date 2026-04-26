import type { Course, EnrollmentFormData } from "@/entities/enrollment";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Building2, Calendar, CreditCard, Edit2, User } from "lucide-react";

interface CourseSummaryProps {
  course: Course | null;
  formData: EnrollmentFormData;
  onEdit: () => void;
  loading?: boolean;
}

const categoryLabels: Record<string, string> = {
  development: "개발",
  design: "디자인",
  marketing: "마케팅",
  business: "비즈니스",
};

export function CourseSummary({ course, formData, onEdit, loading }: CourseSummaryProps) {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  const formatPrice = (p: number) => `${p.toLocaleString("ko-KR")}원`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Badge variant="outline">1단계</Badge>강의 정보
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
        {course ? (
          <>
            <div className="flex items-start gap-4">
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-24 h-16 object-cover rounded-md"
                />
              )}
              <div className="flex-1">
                <Badge variant="secondary" className="mb-1">
                  {categoryLabels[course.category] || course.category}
                </Badge>
                <h3 className="font-semibold">{course.title}</h3>
                <p className="text-sm text-muted-foreground">{course.instructor}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {formatDate(course.startDate)} ~ {formatDate(course.endDate)}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="w-4 h-4" />
                {formatPrice(course.price)}
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              {formData.type === "personal" ? (
                <User className="w-4 h-4" />
              ) : (
                <Building2 className="w-4 h-4" />
              )}
              <span className="font-medium">
                {formData.type === "personal" ? "개인 신청" : "단체 신청"}
              </span>
              {formData.type === "group" && formData.group && (
                <span className="text-muted-foreground">· {formData.group.headCount}인</span>
              )}
            </div>
          </>
        ) : (
          <div className="h-24 bg-muted animate-pulse rounded-md" />
        )}
      </CardContent>
    </Card>
  );
}
