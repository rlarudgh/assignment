import type { Course, EnrollmentFormData } from "@/entities/enrollment";
import { Card, CardContent } from "@/shared/ui/card";

interface PriceSummaryProps {
  course: Course | null;
  formData: EnrollmentFormData;
}

export function PriceSummary({ course, formData }: PriceSummaryProps) {
  const formatPrice = (p: number) => `${p.toLocaleString("ko-KR")}원`;
  const totalPrice = course
    ? formData.type === "group" && formData.group
      ? course.price * formData.group.headCount
      : course.price
    : 0;

  return (
    <Card className="bg-primary/5 border-primary">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">총 결제 금액</p>
            <p className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</p>
          </div>
          {formData.type === "group" && formData.group && (
            <div className="text-right text-sm text-muted-foreground">
              <p>
                {formatPrice(course?.price ?? 0)} × {formData.group.headCount}인
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
