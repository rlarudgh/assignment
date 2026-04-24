"use client";

import { useState } from "react";
import type { Course, EnrollmentType } from "@/entities/enrollment";
import { useCourses } from "@/entities/enrollment";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { AlertCircle, Users } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { CourseListSkeleton } from "./skeletons.ui";
import { CourseCard } from "./course-card.ui";
import { SelectedCourse } from "./selected-course.ui";
import { step1Schema } from "../lib/validation.lib";
import { z } from "zod";

interface Step1Props {
  initialData: { courseId: string; type: EnrollmentType };
  onNext: (data: { courseId: string; type: EnrollmentType }) => void;
}

const categoryLabels: Record<string, string> = {
  all: "전체", development: "개발", design: "디자인", marketing: "마케팅", business: "비즈니스",
};

export function Step1CourseSelection({ initialData, onNext }: Step1Props) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCourseId, setSelectedCourseId] = useState(initialData.courseId);
  const [selectedType, setSelectedType] = useState<EnrollmentType>(initialData.type);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { data, isLoading, error } = useCourses(selectedCategory);

  const courses = data?.courses || [];
  const categories = data ? ["all", ...data.categories] : [];

  const handleNext = () => {
    try {
      step1Schema.parse({ courseId: selectedCourseId, type: selectedType });
      setValidationErrors({});
      onNext({ courseId: selectedCourseId, type: selectedType });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => { errors[e.path[0] as string] = e.message; });
        setValidationErrors(errors);
      }
    }
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  if (isLoading) return <CourseListSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>
            {categoryLabels[cat] || cat}
          </Button>
        ))}
      </div>

      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>강의 목록을 불러오는데 실패했습니다.</AlertDescription></Alert>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} isSelected={selectedCourseId === course.id} onSelect={() => setSelectedCourseId(course.id)} />
        ))}
      </div>

      {validationErrors.courseId && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{validationErrors.courseId}</AlertDescription></Alert>}

      <SelectedCourse course={selectedCourse || null} />

      <div className="space-y-3">
        <Label className="text-base font-semibold">신청 유형</Label>
        <RadioGroup value={selectedType} onValueChange={(v) => setSelectedType(v as EnrollmentType)} className="grid grid-cols-2 gap-4">
          {["personal", "group"].map((type) => (
            <div key={type}>
              <RadioGroupItem value={type} id={type} className="peer sr-only" />
              <Label htmlFor={type} className={cn(
                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent cursor-pointer transition-all",
                selectedType === type && "border-primary bg-primary/5"
              )}>
                <Users className="mb-3 h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium">{type === "personal" ? "개인 신청" : "단체 신청"}</p>
                  <p className="text-xs text-muted-foreground">{type === "personal" ? "1인 수강" : "2~10인"}</p>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
        {validationErrors.type && <p className="text-sm text-destructive">{validationErrors.type}</p>}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} size="lg" disabled={!selectedCourseId || isLoading}>다음 단계</Button>
      </div>
    </div>
  );
}
