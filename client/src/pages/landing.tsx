import React, { useState } from "react";
import { Header } from "@/components/Header";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { subscriptionPlans } from "@shared/schema";
import { 
  Bot, 
  Check, 
  Upload, 
  BarChart3, 
  Languages, 
  FileText, 
  Shield,
  MessageSquare,
  Star,
  Crown,
  Zap,
  ArrowLeft,
  Lightbulb,
  TrendingUp,
  Phone
} from "lucide-react";

export default function Landing() {
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const features = [
    {
      icon: MessageSquare,
      title: "محادثات ذكية",
      description: "تفاعل مع مساعد ذكي يفهم تخصصك الأكاديمي ويقدم إجابات دقيقة ومخصصة",
      color: "text-primary bg-primary/10"
    },
    {
      icon: Upload,
      title: "رفع الملفات",
      description: "ارفع مذكراتك وكتبك الدراسية بصيغة PDF واحصل على شرح تفاعلي للمحتوى",
      color: "text-accent bg-accent/10"
    },
    {
      icon: BarChart3,
      title: "تحليل الأداء",
      description: "تتبع تقدمك واكتشف نقاط الضعف مع تقارير مفصلة وتوصيات للتحسين",
      color: "text-warning bg-warning/10"
    },
    {
      icon: Languages,
      title: "ترجمة الملفات",
      description: "احصل على ترجمة دقيقة للمصادر الأكاديمية بجودة عالية وبسرعة فائقة",
      color: "text-purple-600 bg-purple-100"
    },
    {
      icon: FileText,
      title: "ملخصات ذكية",
      description: "احصل على ملخصات مخصصة لمحادثاتك مع التركيز على النقاط المهمة",
      color: "text-blue-600 bg-blue-100"
    },
    {
      icon: Shield,
      title: "أمان وخصوصية",
      description: "محادثاتك محمية ولا يمكن مشاركتها، مع إمكانية الدخول من أجهزة متعددة بأمان",
      color: "text-red-600 bg-red-100"
    }
  ];

  const getPlanIcon = (planId: string) => {
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

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "emergency":
        return "text-warning border-warning hover:border-warning";
      case "basic":
        return "text-primary border-primary hover:border-primary";
      case "premium":
        return "text-accent border-accent hover:border-accent";
      default:
        return "text-primary border-primary hover:border-primary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-right">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 font-arabic">
                نباهة هنا <span className="text-primary">تساعدك تفهم</span>، تراجع، وتختبر نفسك
              </h1>
              <p className="text-xl text-muted-foreground mb-8 font-arabic">
                جاهز تتعلم بطريقة أذكى؟
              </p>
              
              {/* Features List */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  "ذكاء اصطناعي متطور",
                  "تحليل نقاط الضعف", 
                  "رفع الملفات وترجمتها",
                  "تقييم الأداء المستمر"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 space-x-reverse">
                    <Check className="text-accent text-xl flex-shrink-0" />
                    <span className="text-muted-foreground font-arabic">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                size="lg"
                onClick={() => setIsSubscriptionModalOpen(true)}
                className="px-8 py-4 text-lg font-semibold font-arabic transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                ابدأ رحلتك التعليمية
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
            </div>

            {/* Illustration */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                {/* Phone mockup */}
                <Card className="w-64 h-96 p-6 shadow-2xl transform rotate-6 hover:rotate-3 transition-transform duration-300">
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4">
                    {/* Chat Interface Preview */}
                    <div className="flex items-center space-x-3 space-x-reverse mb-4">
                      <Bot className="text-primary text-2xl" />
                      <div>
                        <h3 className="font-semibold text-foreground font-arabic">مساعد نباهة</h3>
                        <span className="text-xs text-accent">متصل</span>
                      </div>
                    </div>
                    
                    {/* Sample chat bubbles */}
                    <div className="space-y-3">
                      <div className="bg-muted p-3 rounded-lg rounded-tr-none">
                        <p className="text-sm text-muted-foreground font-arabic">مرحباً! كيف يمكنني مساعدتك اليوم؟</p>
                      </div>
                      <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-tl-none text-left">
                        <p className="text-sm font-arabic">أريد مراجعة التفاضل والتكامل</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg rounded-tr-none">
                        <p className="text-sm text-muted-foreground font-arabic">ممتاز! سأساعدك في فهم المفاهيم الأساسية</p>
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground p-3 rounded-full shadow-lg animate-bounce">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-warning text-warning-foreground p-3 rounded-full shadow-lg animate-pulse">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 font-arabic">
              لماذا تختار نباهة؟
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-arabic">
              منصة تعليمية ذكية تجمع بين أحدث تقنيات الذكاء الاصطناعي وأفضل ممارسات التعلم
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-muted/50 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground mb-4 font-arabic">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-arabic">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 font-arabic">
              خطط اشتراك مرنة
            </h2>
            <p className="text-xl text-muted-foreground font-arabic">
              اختر الخطة التي تناسب احتياجاتك الدراسية
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {Object.entries(subscriptionPlans).map(([planId, plan]) => {
              const IconComponent = getPlanIcon(planId);
              const colorClass = getPlanColor(planId);
              
              return (
                <Card 
                  key={planId}
                  className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 ${
                    planId === "emergency" ? 'border-warning/20' : ''
                  }`}
                >
                  {planId === "emergency" && (
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
                  
                  <CardHeader className={planId === "emergency" ? "mt-8" : ""}>
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                        planId === "emergency" ? "bg-warning/10" :
                        planId === "basic" ? "bg-primary/10" :
                        "bg-accent/10"
                      }`}>
                        <IconComponent className={`w-8 h-8 ${
                          planId === "emergency" ? "text-warning" :
                          planId === "basic" ? "text-primary" :
                          "text-accent"
                        }`} />
                      </div>
                      
                      <CardTitle className="text-2xl font-bold text-foreground mb-4 font-arabic">
                        {plan.name}
                      </CardTitle>
                      
                      <div className="mb-6">
                        <span className={`text-4xl font-bold ${
                          planId === "emergency" ? "text-warning" :
                          planId === "basic" ? "text-primary" :
                          "text-accent"
                        }`}>
                          {plan.price}
                        </span>
                        <span className="text-muted-foreground font-arabic"> ريال سعودي</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-center space-x-3 space-x-reverse">
                        <Check className={`flex-shrink-0 ${
                          planId === "emergency" ? "text-warning" :
                          planId === "basic" ? "text-primary" :
                          "text-accent"
                        }`} />
                        <span className="text-muted-foreground font-arabic">{plan.duration} يوم صالح</span>
                      </li>
                      <li className="flex items-center space-x-3 space-x-reverse">
                        <Check className={`flex-shrink-0 ${
                          planId === "emergency" ? "text-warning" :
                          planId === "basic" ? "text-primary" :
                          "text-accent"
                        }`} />
                        <span className="text-muted-foreground font-arabic">{plan.sessions} جلسات محادثة</span>
                      </li>
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-3 space-x-reverse">
                          <Check className={`flex-shrink-0 ${
                            planId === "emergency" ? "text-warning" :
                            planId === "basic" ? "text-primary" :
                            "text-accent"
                          }`} />
                          <span className="text-muted-foreground font-arabic">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full py-3 font-semibold font-arabic transition-colors ${
                        planId === "emergency" ? "bg-warning hover:bg-warning/90 text-warning-foreground" :
                        planId === "basic" ? "bg-primary hover:bg-primary/90 text-primary-foreground" :
                        "bg-accent hover:bg-accent/90 text-accent-foreground"
                      }`}
                      onClick={() => setIsSubscriptionModalOpen(true)}
                    >
                      اختر الخطة
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <Bot className="text-2xl text-primary" />
                <h3 className="text-2xl font-bold font-arabic">نباهة</h3>
              </div>
              <p className="text-gray-300 mb-6 font-arabic">
                منصة تعليمية ذكية تساعد الطلاب على التعلم والمراجعة بطريقة تفاعلية باستخدام أحدث تقنيات الذكاء الاصطناعي
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 font-arabic">روابط سريعة</h4>
              <ul className="space-y-3">
                <li><a href="#home" className="text-gray-300 hover:text-white transition-colors font-arabic">الرئيسية</a></li>
                <li><a href="#features" className="text-gray-300 hover:text-white transition-colors font-arabic">المميزات</a></li>
                <li><a href="#pricing" className="text-gray-300 hover:text-white transition-colors font-arabic">الأسعار</a></li>
                <li><a href="/support" className="text-gray-300 hover:text-white transition-colors font-arabic">الدعم</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 font-arabic">قانوني</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-arabic">شروط الاستخدام</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-arabic">سياسة الخصوصية</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-arabic">سياسة الاسترداد</a></li>
                <li><a href="/support" className="text-gray-300 hover:text-white transition-colors font-arabic">اتصل بنا</a></li>
              </ul>
            </div>
          </div>

          <hr className="border-gray-700 my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm font-arabic">© 2024 نباهة. جميع الحقوق محفوظة.</p>
            <p className="text-gray-400 text-sm mt-4 md:mt-0 font-arabic">صنع بـ ❤️ للطلاب العرب</p>
          </div>
        </div>
      </footer>

      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
    </div>
  );
}
