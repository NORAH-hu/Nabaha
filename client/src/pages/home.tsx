import React, { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { MasteryIndicator } from "@/components/MasteryIndicator";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  MessageSquare, 
  TrendingUp, 
  BookOpen, 
  Calendar,
  BarChart3,
  FileText,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Fetch user's chat sessions
  const { data: chatSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/chat/sessions"],
  });

  // Fetch user's performance analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics/performance"],
  });

  // Check subscription status
  const isSubscriptionActive = user?.subscriptionExpiresAt 
    ? new Date(user.subscriptionExpiresAt) > new Date()
    : false;

  const sessionsRemaining = user?.sessionsRemaining || 0;

  // Calculate overall mastery percentage
  const calculateOverallMastery = () => {
    if (!analytics || analytics.length === 0) return 0;
    const totalScore = analytics.reduce((sum: number, item: any) => sum + parseFloat(item.score || "0"), 0);
    return Math.round(totalScore / analytics.length);
  };

  const overallMastery = calculateOverallMastery();

  // Get subject breakdown
  const getSubjectBreakdown = () => {
    if (!analytics) return [];
    const subjects = analytics.reduce((acc: any, item: any) => {
      const subject = item.subject;
      if (!acc[subject]) {
        acc[subject] = { scores: [], weakAreas: [] };
      }
      acc[subject].scores.push(parseFloat(item.score || "0"));
      acc[subject].weakAreas.push(...(item.weakAreas || []));
      return acc;
    }, {});

    return Object.entries(subjects).map(([subject, data]: [string, any]) => ({
      subject,
      averageScore: Math.round(data.scores.reduce((a: number, b: number) => a + b, 0) / data.scores.length),
      weakAreas: [...new Set(data.weakAreas)], // Remove duplicates
    }));
  };

  const subjectBreakdown = getSubjectBreakdown();

  const handleCreateSession = () => {
    if (!isSubscriptionActive) {
      toast({
        title: "اشتراك منتهي الصلاحية",
        description: "يرجى تجديد اشتراكك لإنشاء جلسات جديدة",
        variant: "destructive",
      });
      setIsSubscriptionModalOpen(true);
      return;
    }

    if (sessionsRemaining <= 0) {
      toast({
        title: "لا توجد جلسات متبقية",
        description: "لقد استنفدت جميع جلساتك المتاحة. يرجى ترقية خطتك.",
        variant: "destructive",
      });
      setIsSubscriptionModalOpen(true);
      return;
    }

    // Navigate to chat page to create new session
    window.location.href = "/chat";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 font-arabic">
            مرحباً، {user?.firstName || "عزيزي الطالب"}
          </h1>
          <p className="text-muted-foreground font-arabic">
            استمر في رحلتك التعليمية مع مساعد نباهة الذكي
          </p>
        </div>

        {/* Subscription Status */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-arabic">حالة الاشتراك</CardTitle>
              <MasteryIndicator percentage={overallMastery} subject="الإتقان العام" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-arabic">الخطة الحالية</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Badge variant={isSubscriptionActive ? "default" : "destructive"}>
                    {user?.currentPlan === "premium" ? "المميزة" : 
                     user?.currentPlan === "basic" ? "الأساسية" : 
                     user?.currentPlan === "emergency" ? "الطارئة" : "غير مفعل"}
                  </Badge>
                  {!isSubscriptionActive && (
                    <Button
                      size="sm"
                      onClick={() => setIsSubscriptionModalOpen(true)}
                      className="font-arabic"
                    >
                      تجديد
                    </Button>
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
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-arabic">ينتهي في</span>
                </div>
                <div className="text-sm text-muted-foreground font-arabic">
                  {user?.subscriptionExpiresAt 
                    ? new Date(user.subscriptionExpiresAt).toLocaleDateString('ar-SA')
                    : "غير محدد"
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Sessions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground font-arabic">جلسات المحادثة</h2>
              <Button onClick={handleCreateSession} className="flex items-center space-x-2 space-x-reverse font-arabic">
                <Plus className="w-4 h-4" />
                <span>جلسة جديدة</span>
              </Button>
            </div>

            {sessionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : chatSessions && chatSessions.length > 0 ? (
              <div className="space-y-4">
                {chatSessions.slice(0, 5).map((session: any) => (
                  <Link key={session.id} href={`/chat/${session.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1 font-arabic">
                              {session.title}
                            </h3>
                            <div className="flex items-center space-x-4 space-x-reverse text-sm text-muted-foreground">
                              {session.subject && (
                                <div className="flex items-center space-x-1 space-x-reverse">
                                  <BookOpen className="w-3 h-3" />
                                  <span className="font-arabic">{session.subject}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(session.updatedAt).toLocaleDateString('ar-SA')}</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={session.isActive ? "default" : "secondary"} className="font-arabic">
                            {session.isActive ? "نشط" : "منتهي"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                
                {chatSessions.length > 5 && (
                  <Link href="/chat">
                    <Button variant="outline" className="w-full font-arabic">
                      عرض جميع الجلسات ({chatSessions.length})
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2 font-arabic">لا توجد جلسات محادثة</h3>
                  <p className="text-muted-foreground mb-6 font-arabic">
                    ابدأ جلسة محادثة جديدة للتفاعل مع مساعد نباهة الذكي
                  </p>
                  <Button onClick={handleCreateSession} className="font-arabic">
                    إنشاء جلسة جديدة
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Performance Analytics */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground font-arabic">تحليل الأداء</h2>

            {/* Overall Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="font-arabic">التقدم العام</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {overallMastery}%
                  </div>
                  <p className="text-sm text-muted-foreground font-arabic">نسبة الإتقان العامة</p>
                  <Progress value={overallMastery} className="mt-4" />
                </div>
              </CardContent>
            </Card>

            {/* Subject Breakdown */}
            {analyticsLoading ? (
              <Card className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-3 bg-muted rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : subjectBreakdown.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="font-arabic">أداء المواد</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subjectBreakdown.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground font-arabic">
                            {item.subject}
                          </span>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <MasteryIndicator 
                              percentage={item.averageScore} 
                              subject={item.subject}
                              size="sm"
                            />
                            <span className="text-sm text-muted-foreground">
                              {item.averageScore}%
                            </span>
                          </div>
                        </div>
                        <Progress value={item.averageScore} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-arabic">لا توجد بيانات أداء بعد</p>
                </CardContent>
              </Card>
            )}

            {/* Weakness Analysis */}
            {subjectBreakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-arabic">نقاط تحتاج تركيز</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subjectBreakdown
                      .filter(item => item.averageScore < 60)
                      .map((item, index) => (
                        <div key={index} className="flex items-start space-x-3 space-x-reverse p-3 bg-destructive/10 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-foreground font-arabic">{item.subject}</p>
                            <p className="text-sm text-muted-foreground font-arabic">
                              النسبة: {item.averageScore}% - يحتاج مراجعة
                            </p>
                          </div>
                        </div>
                      ))}
                    
                    {subjectBreakdown.filter(item => item.averageScore >= 80).length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-foreground mb-2 font-arabic">نقاط القوة</h4>
                        {subjectBreakdown
                          .filter(item => item.averageScore >= 80)
                          .map((item, index) => (
                            <div key={index} className="flex items-center space-x-2 space-x-reverse p-2 bg-accent/10 rounded">
                              <CheckCircle className="w-3 h-3 text-accent" />
                              <span className="text-sm text-muted-foreground font-arabic">
                                {item.subject} ({item.averageScore}%)
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-arabic">إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/chat">
                    <Button variant="outline" className="w-full justify-start space-x-2 space-x-reverse font-arabic">
                      <MessageSquare className="w-4 h-4" />
                      <span>محادثة جديدة</span>
                    </Button>
                  </Link>
                  
                  <Link href="/subscribe">
                    <Button variant="outline" className="w-full justify-start space-x-2 space-x-reverse font-arabic">
                      <Star className="w-4 h-4" />
                      <span>ترقية الاشتراك</span>
                    </Button>
                  </Link>
                  
                  <Link href="/support">
                    <Button variant="outline" className="w-full justify-start space-x-2 space-x-reverse font-arabic">
                      <FileText className="w-4 h-4" />
                      <span>طلب دعم</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
    </div>
  );
}
