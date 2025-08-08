import React, { useState } from "react";
import { Header } from "@/components/Header";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { subscriptionPlans, type SubscriptionPlan } from "@shared/schema";
import { 
  Crown, 
  Star, 
  Zap, 
  Check, 
  Calendar, 
  MessageSquare, 
  Clock,
  CreditCard,
  TrendingUp,
  Shield,
  Settings
} from "lucide-react";

export default function Subscribe() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isSubscriptionActive = user?.subscriptionExpiresAt 
    ? new Date(user.subscriptionExpiresAt) > new Date()
    : false;

  const currentPlan = user?.currentPlan;
  const sessionsRemaining = user?.sessionsRemaining || 0;
  const subscriptionExpiresAt = user?.subscriptionExpiresAt;

  const getPlanIcon = (planId: SubscriptionPlan) => {
    switch (planId) {
      case "emergency":
        return Zap;
      case "basic":
        return Star;
      case "premium":
        return Crown;
      default:
        return Star;
    }
  };

  const getPlanColor = (planId: SubscriptionPlan) => {
    switch (planId) {
      case "emergency":
        return "text-warning border-warning bg-warning/5";
      case "basic":
        return "text-primary border-primary bg-primary/5";
      case "premium":
        return "text-accent border-accent bg-accent/5";
      default:
        return "text-primary border-primary bg-primary/5";
    }
  };

  const calculateDaysRemaining = () => {
    if (!subscriptionExpiresAt) return 0;
    const expiryDate = new Date(subscriptionExpiresAt);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 font-arabic">
            إدارة الاشتراك
          </h1>
          <p className="text-muted-foreground font-arabic">
            تابع اشتراكك الحالي أو قم بالترقية للحصول على مميزات أكثر
          </p>
        </div>

        {/* Current Subscription Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-arabic">الاشتراك الحالي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-arabic">الخطة</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  {currentPlan ? (
                    <>
                      {React.createElement(getPlanIcon(currentPlan), {
                        className: `w-5 h-5 ${getPlanColor(currentPlan).split(' ')[0]}`
                      })}
                      <span className="font-semibold text-foreground font-arabic">
                        {subscriptionPlans[currentPlan]?.name || "غير محدد"}
                      </span>
                    </>
                  ) : (
                    <Badge variant="secondary" className="font-arabic">غير مفعل</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-arabic">الجلسات المتبقية</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {sessionsRemaining}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-arabic">أيام متبقية</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {daysRemaining}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-arabic">حالة الاشتراك</span>
                </div>
                <Badge variant={isSubscriptionActive ? "default" : "destructive"} className="font-arabic">
                  {isSubscriptionActive ? "نشط" : "منتهي الصلاحية"}
                </Badge>
              </div>
            </div>

            {currentPlan && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground font-arabic">استخدام الجلسات</span>
                  <span className="text-sm text-muted-foreground">
                    {subscriptionPlans[currentPlan].sessions - sessionsRemaining} من {subscriptionPlans[currentPlan].sessions}
                  </span>
                </div>
                <Progress 
                  value={((subscriptionPlans[currentPlan].sessions - sessionsRemaining) / subscriptionPlans[currentPlan].sessions) * 100} 
                  className="h-2"
                />
              </div>
            )}

            {!isSubscriptionActive && (
              <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <Shield className="w-4 h-4 text-destructive" />
                  <span className="font-semibold text-destructive font-arabic">اشتراك منتهي الصلاحية</span>
                </div>
                <p className="text-sm text-muted-foreground font-arabic mb-3">
                  انتهت صلاحية اشتراكك. قم بالتجديد للمتابعة في استخدام الخدمة.
                </p>
                <Button onClick={() => setIsModalOpen(true)} className="font-arabic">
                  تجديد الاشتراك
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6 font-arabic">
            الخطط المتاحة
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {(Object.keys(subscriptionPlans) as SubscriptionPlan[]).map((planId) => {
              const plan = subscriptionPlans[planId];
              const IconComponent = getPlanIcon(planId);
              const isCurrentPlan = currentPlan === planId;
              const colorClass = getPlanColor(planId);

              return (
                <Card 
                  key={planId}
                  className={`relative transition-all duration-300 hover:shadow-lg ${
                    isCurrentPlan ? 'ring-2 ring-primary' : ''
                  } ${plan.isSpecial ? 'overflow-hidden' : ''}`}
                >
                  {plan.isSpecial && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-warning to-orange-600 text-white text-center py-2 text-sm font-semibold font-arabic">
                      خطة طارئة
                    </div>
                  )}

                  {planId === "premium" && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-accent text-accent-foreground font-arabic">
                        الأكثر شعبية
                      </Badge>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-4 right-4">
                      <Badge className="bg-primary text-primary-foreground font-arabic">
                        الخطة الحالية
                      </Badge>
                    </div>
                  )}

                  <CardHeader className={plan.isSpecial ? "mt-8" : ""}>
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colorClass}`}>
                        <IconComponent className="w-8 h-8" />
                      </div>
                      
                      <CardTitle className="text-2xl font-bold text-foreground mb-4 font-arabic">
                        {plan.name}
                      </CardTitle>
                      
                      <div className="mb-6">
                        <span className={`text-4xl font-bold ${colorClass.split(' ')[0]}`}>
                          {plan.price}
                        </span>
                        <span className="text-muted-foreground font-arabic"> ريال سعودي</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4 mb-8">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-foreground">{plan.duration}</div>
                          <div className="text-sm text-muted-foreground font-arabic">يوم</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-foreground">{plan.sessions}</div>
                          <div className="text-sm text-muted-foreground font-arabic">جلسة</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-3 space-x-reverse">
                            <Check className={`w-4 h-4 flex-shrink-0 ${colorClass.split(' ')[0]}`} />
                            <span className="text-sm text-muted-foreground font-arabic">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      className={`w-full py-3 font-semibold font-arabic transition-colors ${
                        planId === "emergency" ? "bg-warning hover:bg-warning/90 text-warning-foreground" :
                        planId === "basic" ? "bg-primary hover:bg-primary/90 text-primary-foreground" :
                        "bg-accent hover:bg-accent/90 text-accent-foreground"
                      }`}
                      onClick={() => setIsModalOpen(true)}
                      disabled={isCurrentPlan && isSubscriptionActive}
                    >
                      {isCurrentPlan && isSubscriptionActive ? "الخطة الحالية" : 
                       isCurrentPlan ? "تجديد" : "اختر الخطة"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Usage Statistics */}
        {currentPlan && (
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic">إحصائيات الاستخدام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground font-arabic">الجلسات</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-arabic">المستخدمة</span>
                      <span className="font-semibold text-foreground">
                        {subscriptionPlans[currentPlan].sessions - sessionsRemaining}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-arabic">المتبقية</span>
                      <span className="font-semibold text-foreground">{sessionsRemaining}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-arabic">الإجمالي</span>
                      <span className="font-semibold text-foreground">
                        {subscriptionPlans[currentPlan].sessions}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground font-arabic">المدة</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-arabic">أيام متبقية</span>
                      <span className="font-semibold text-foreground">{daysRemaining}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-arabic">المدة الإجمالية</span>
                      <span className="font-semibold text-foreground">
                        {subscriptionPlans[currentPlan].duration} يوم
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-arabic">تاريخ الانتهاء</span>
                      <span className="font-semibold text-foreground">
                        {subscriptionExpiresAt 
                          ? new Date(subscriptionExpiresAt).toLocaleDateString('ar-SA')
                          : "غير محدد"
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <SubscriptionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
