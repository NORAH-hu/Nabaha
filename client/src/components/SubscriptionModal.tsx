import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { subscriptionPlans, type SubscriptionPlan } from "@shared/schema";
import { Check, Crown, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanSelect?: (planId: SubscriptionPlan) => void;
}

export function SubscriptionModal({ isOpen, onClose, onPlanSelect }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const { toast } = useToast();

  const createSubscriptionMutation = useMutation({
    mutationFn: async (planId: SubscriptionPlan) => {
      const response = await apiRequest("POST", "/api/create-subscription", { planId });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم إنشاء الاشتراك بنجاح",
        description: "سيتم توجيهك لإكمال عملية الدفع",
      });
      // In a real app, you would redirect to Stripe checkout
      // For now, we'll just show a success message
      onClose();
      if (onPlanSelect && selectedPlan) {
        onPlanSelect(selectedPlan);
      }
    },
    onError: (error) => {
      toast({
        title: "فشل في إنشاء الاشتراك",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectPlan = (planId: SubscriptionPlan) => {
    setSelectedPlan(planId);
  };

  const handleProceedToPayment = () => {
    if (selectedPlan) {
      createSubscriptionMutation.mutate(selectedPlan);
    }
  };

  const getPlanIcon = (planId: SubscriptionPlan) => {
    switch (planId) {
      case "emergency":
        return <Zap className="w-6 h-6" />;
      case "basic":
        return <Star className="w-6 h-6" />;
      case "premium":
        return <Crown className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planId: SubscriptionPlan) => {
    switch (planId) {
      case "emergency":
        return "border-warning text-warning";
      case "basic":
        return "border-primary text-primary";
      case "premium":
        return "border-accent text-accent";
      default:
        return "border-primary text-primary";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center font-arabic">
            اختر خطة الاشتراك
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 py-6">
          {(Object.keys(subscriptionPlans) as SubscriptionPlan[]).map((planId) => {
            const plan = subscriptionPlans[planId];
            const isSelected = selectedPlan === planId;
            const planColor = getPlanColor(planId);

            return (
              <Card
                key={planId}
                className={cn(
                  "relative cursor-pointer transition-all duration-200 hover:shadow-lg",
                  isSelected ? `border-2 ${planColor} shadow-lg scale-105` : "border border-border",
                  plan.isSpecial && "overflow-hidden"
                )}
                onClick={() => handleSelectPlan(planId)}
              >
                {plan.isSpecial && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-warning to-orange-600 text-white text-center py-2 text-sm font-semibold font-arabic">
                    خطة طارئة
                  </div>
                )}

                {planId === "premium" && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground font-arabic">
                      الأكثر شعبية
                    </Badge>
                  </div>
                )}

                <CardHeader className={cn("text-center", plan.isSpecial && "mt-8")}>
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                    planId === "emergency" ? "bg-warning/10" :
                    planId === "basic" ? "bg-primary/10" :
                    "bg-accent/10"
                  )}>
                    <div className={planColor}>
                      {getPlanIcon(planId)}
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl font-semibold font-arabic">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="text-center">
                    <span className={cn("text-4xl font-bold", planColor)}>
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground font-arabic"> ريال سعودي</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center text-sm text-muted-foreground font-arabic">
                      صالح لمدة {plan.duration} يوم • {plan.sessions} جلسات
                    </div>

                    <Separator />

                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-3 space-x-reverse text-sm">
                          <Check className={cn("w-4 h-4 flex-shrink-0", planColor)} />
                          <span className="font-arabic">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedPlan && (
          <div className="space-y-4 border-t pt-6">
            <div className="bg-muted/50 rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 font-arabic">ملخص الطلب</h3>
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted-foreground font-arabic">
                  {subscriptionPlans[selectedPlan].name}
                </span>
                <span className="font-bold text-foreground">
                  {subscriptionPlans[selectedPlan].price} ريال
                </span>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground font-arabic">المجموع</span>
                <span className="font-bold text-xl text-primary">
                  {subscriptionPlans[selectedPlan].price} ريال
                </span>
              </div>
            </div>

            <Button
              onClick={handleProceedToPayment}
              disabled={createSubscriptionMutation.isPending}
              className="w-full py-6 text-lg font-semibold font-arabic"
            >
              {createSubscriptionMutation.isPending ? (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="loading-spinner w-5 h-5" />
                  <span>جاري المعالجة...</span>
                </div>
              ) : (
                <>
                  المتابعة للدفع
                  <Check className="w-5 h-5 mr-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
