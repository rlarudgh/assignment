"use client";

import { EnrollmentResponse, EnrollmentFormData, Course } from "@/entities/enrollment";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { CheckCircle, Calendar, CreditCard, Users, Building2, User, Printer } from "lucide-react";

interface SuccessScreenProps {
  response: EnrollmentResponse;
  formData: EnrollmentFormData;
  course: Course | null;
  onReset: () => void;
}

const categoryLabels: Record<string, string> = {
  development: "개발",
  design: "디자인",
  marketing: "마케팅",
  business: "비즈니스",
};

export function SuccessScreen({ response, formData, course, onReset }: SuccessScreenProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR") + "원";
  };

  const totalPrice = course ? (formData.type === "group" && formData.group
    ? course.price * formData.group.headCount
    : course.price) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Message */}
      <div className="text-center space-y-4 py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">수강 신청이 완료되었습니다!</h2>
        <p className="text-muted-foreground">
          신청 번호: <span className="font-mono font-medium text-foreground">{response.enrollmentId}</span>
        </p>
      </div>

      {/* Enrollment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">신청 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Course Info */}
          {course && (
            <div className="space-y-3">
              <Badge variant="secondary">{categoryLabels[course.category] || course.category}</Badge>
              <h3 className="font-semibold text-lg">{course.title}</h3>
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
            </div>
          )}

          {/* Enrollment Type */}
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

          {/* Applicant Info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">신청자</span>
              <span className="font-medium">{formData.applicant.name}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">이메일</span>
              <span className="font-medium">{formData.applicant.email}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">연락처</span>
              <span className="font-medium">{formData.applicant.phone}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">신청일시</span>
              <span className="font-medium">{formatDate(response.enrolledAt)}</span>
            </div>
          </div>

          {/* Total Price */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">총 결제 금액</span>
              <span className="text-xl font-bold text-primary">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              {response.status === "confirmed" ? "신청 확정" : "신청 대기"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="text-center space-y-2 text-sm text-muted-foreground">
        <p>입력하신 이메일로 신청 확인 메일이 발송되었습니다.</p>
        <p>문의사항은 고객센터로 연락해 주세요.</p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" />
          인쇄하기
        </Button>
        <Button onClick={onReset}>새로운 신청</Button>
      </div>
    </div>
  );
}
