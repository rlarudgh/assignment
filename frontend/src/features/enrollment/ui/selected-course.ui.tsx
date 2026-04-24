import type { Course } from "@/entities/enrollment";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface SelectedCourseProps {
  course: Course | null;
}

export function SelectedCourse({ course }: SelectedCourseProps) {
  if (!course) return null;

  const formatPrice = (price: number) => `${price.toLocaleString("ko-KR")}원`;
  const capacityPercentage = (course.currentEnrollment / course.maxCapacity) * 100;

  return (
    <Card className="bg-muted/50 border-primary">
      <CardHeader>
        <CardTitle className="text-base">선택한 강의</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{course.title}</p>
            <p className="text-sm text-muted-foreground">
              {course.instructor} · {formatPrice(course.price)}
            </p>
          </div>
          <Badge variant={capacityPercentage >= 90 ? "destructive" : "default"}>
            {course.maxCapacity - course.currentEnrollment}자리 남음
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
