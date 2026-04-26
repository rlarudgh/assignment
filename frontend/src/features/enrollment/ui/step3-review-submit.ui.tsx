"use client";

import type { Course, EnrollmentFormData } from "@/entities/enrollment";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";
import { AlertCircle, Check } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { step3Schema } from "../lib/validation.lib";
import { ApplicantSummary, CourseSummary, PriceSummary } from "./summary";

interface Step3Props {
  formData: EnrollmentFormData;
  course: Course | null;
  onSubmit: () => void;
  onPrev: () => void;
  onEditStep: (step: number) => void;
  loading?: boolean;
}

export function Step3ReviewSubmit({
  formData,
  course,
  onSubmit,
  onPrev,
  onEditStep,
  loading = false,
}: Step3Props) {
  const [agreedToTerms, setAgreedToTerms] = useState(formData.agreedToTerms);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    try {
      step3Schema.parse({ agreedToTerms });
      setError(null);
      onSubmit();
    } catch (err) {
      if (err instanceof z.ZodError) setError(err.errors[0]?.message || "약관에 동의해주세요");
    }
  };

  return (
    <div className="space-y-6">
      <CourseSummary
        course={course}
        formData={formData}
        onEdit={() => onEditStep(1)}
        loading={loading}
      />
      <ApplicantSummary formData={formData} onEdit={() => onEditStep(2)} loading={loading} />
      <PriceSummary course={course} formData={formData} />

      <div className="space-y-3">
        <div className="flex items-start space-x-3 p-4 border rounded-lg">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => {
              setAgreedToTerms(checked as boolean);
              setError(null);
            }}
            disabled={loading}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="terms" className="text-sm font-medium">
              이용약관에 동의합니다
            </Label>
            <p className="text-xs text-muted-foreground">
              수강 신청 시 개인정보 수집 및 이용에 동의하게 되며, 취소/환불 정책을 확인하였습니다.
            </p>
          </div>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} size="lg" disabled={loading}>
          이전 단계
        </Button>
        <Button
          onClick={handleSubmit}
          size="lg"
          disabled={loading || !agreedToTerms}
          className="min-w-[120px]"
        >
          {loading ? (
            <>
              <Skeleton className="h-4 w-4 mr-2 rounded-full" />
              제출 중...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              신청하기
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
