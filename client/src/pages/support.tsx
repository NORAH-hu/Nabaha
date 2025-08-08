import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSupportTicketSchema } from "@shared/schema";
import { z } from "zod";
import {
  HelpCircle,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  FileText,
  CreditCard,
  Settings,
  Lightbulb,
  Send,
  Phone,
  ExternalLink
} from "lucide-react";

const supportFormSchema = insertSupportTicketSchema.extend({
  firstName: z.string().min(1, "الاسم الأول مطلوب"),
  lastName: z.string().min(1, "الاسم الأخير مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  category: z.string().min(1, "يرجى اختيار نوع الاستفسار"),
  subject: z.string().min(1, "الموضوع مطلوب"),
  message: z.string().min(10, "الرسالة يجب أن تكون 10 أحرف على الأقل"),
});

type SupportFormData = z.infer<typeof supportFormSchema>;

export default function Support() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      category: "",
      subject: "",
      message: "",
    },
  });

  // Fetch user's support tickets if authenticated
  const { data: supportTickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ["/api/support/tickets"],
    enabled: isAuthenticated,
  });

  // Submit support ticket mutation
  const submitTicketMutation = useMutation({
    mutationFn: async (data: SupportFormData) => {
      const response = await apiRequest("POST", "/api/support/tickets", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إرسال طلب الدعم",
        description: "سنتواصل معك قريباً للمساعدة",
      });
      form.reset();
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      }
    },
    onError: (error) => {
      toast({
        title: "فشل في إرسال طلب الدعم",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SupportFormData) => {
    submitTicketMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "مفتوح";
      case "in_progress":
        return "قيد المعالجة";
      case "resolved":
        return "تم الحل";
      case "closed":
        return "مغلق";
      default:
        return "غير معروف";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technical":
        return Settings;
      case "billing":
        return CreditCard;
      case "usage":
        return HelpCircle;
      case "feature":
        return Lightbulb;
      default:
        return MessageSquare;
    }
  };

  const faqItems = [
    {
      question: "كيف أرفع ملف PDF؟",
      answer: "يمكنك سحب الملف وإفلاته في منطقة التحميل في صفحة المحادثة أو الضغط عليها للتصفح والاختيار."
    },
    {
      question: "كم تستغرق مدة صلاحية الاشتراك؟",
      answer: "تختلف حسب الخطة: 30 يوم للطارئة، 90 يوم للأساسية، 180 يوم للمميزة."
    },
    {
      question: "هل يمكنني مشاركة محادثاتي؟",
      answer: "لا، المحادثات خاصة ولا يمكن مشاركتها للحفاظ على خصوصيتك وأمان بياناتك."
    },
    {
      question: "كيف يعمل تحليل نقاط الضعف؟",
      answer: "النظام يحلل إجاباتك ويحدد المناطق التي تحتاج تحسين بناءً على نسبة الإجابات الخاطئة."
    },
    {
      question: "ما هي أنواع الملفات المدعومة؟",
      answer: "ندعم ملفات PDF, DOC, DOCX بحد أقصى 10 ميجابايت لكل ملف."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 font-arabic">
            كيف يمكننا مساعدتك؟
          </h1>
          <p className="text-xl text-muted-foreground font-arabic">
            فريق الدعم جاهز لمساعدتك في أي وقت
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Support Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-foreground font-arabic">
                  إرسال استفسار
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-arabic">الاسم الأول</FormLabel>
                            <FormControl>
                              <Input {...field} className="font-arabic" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-arabic">الاسم الأخير</FormLabel>
                            <FormControl>
                              <Input {...field} className="font-arabic" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-arabic">البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-arabic">نوع الاستفسار</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع الاستفسار" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="technical">مشكلة تقنية</SelectItem>
                              <SelectItem value="billing">استفسار عن الفوترة</SelectItem>
                              <SelectItem value="usage">طلب مساعدة في الاستخدام</SelectItem>
                              <SelectItem value="feature">اقتراح تحسين</SelectItem>
                              <SelectItem value="other">أخرى</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-arabic">الموضوع</FormLabel>
                          <FormControl>
                            <Input {...field} className="font-arabic" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-arabic">الرسالة</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={5}
                              placeholder="اكتب رسالتك هنا..."
                              className="resize-none font-arabic"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full font-arabic"
                      disabled={submitTicketMutation.isPending}
                    >
                      {submitTicketMutation.isPending ? (
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <div className="loading-spinner w-4 h-4" />
                          <span>جاري الإرسال...</span>
                        </div>
                      ) : (
                        <>
                          إرسال الاستفسار
                          <Send className="w-4 h-4 mr-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Support Information */}
          <div className="space-y-8">
            {/* FAQ */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <HelpCircle className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-xl font-semibold text-blue-800 dark:text-blue-300 font-arabic">
                    الأسئلة الشائعة
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <details key={index} className="group border-b border-border pb-4 last:border-b-0">
                      <summary className="cursor-pointer text-foreground hover:text-primary transition-colors font-arabic font-medium">
                        {item.question}
                      </summary>
                      <p className="mt-2 text-muted-foreground text-sm font-arabic leading-relaxed">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Methods */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2 font-arabic">البريد الإلكتروني</h4>
                  <p className="text-muted-foreground text-sm">support@nabaha.com</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-accent mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2 font-arabic">ساعات العمل</h4>
                  <p className="text-muted-foreground text-sm font-arabic">24/7 دعم متواصل</p>
                </CardContent>
              </Card>
            </div>

            {/* Response Time */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 space-x-reverse mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-800 dark:text-green-300 font-arabic">
                    وقت الاستجابة
                  </h4>
                </div>
                <p className="text-green-700 dark:text-green-300 text-sm font-arabic">
                  نهدف للرد خلال 24 ساعة كحد أقصى
                </p>
              </CardContent>
            </Card>

            {/* User's Support Tickets */}
            {isAuthenticated && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-arabic">طلبات الدعم السابقة</CardTitle>
                </CardHeader>
                <CardContent>
                  {ticketsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : supportTickets && supportTickets.length > 0 ? (
                    <div className="space-y-4">
                      {supportTickets.slice(0, 5).map((ticket: any) => {
                        const CategoryIcon = getCategoryIcon(ticket.category);
                        return (
                          <div key={ticket.id} className="border border-border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-3 space-x-reverse">
                                <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                                <h5 className="font-medium text-foreground font-arabic">
                                  {ticket.subject}
                                </h5>
                              </div>
                              <Badge className={getStatusColor(ticket.status)}>
                                {getStatusLabel(ticket.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 font-arabic">
                              {ticket.message.length > 100 
                                ? `${ticket.message.substring(0, 100)}...` 
                                : ticket.message
                              }
                            </p>
                            <div className="text-xs text-muted-foreground">
                              {new Date(ticket.createdAt).toLocaleDateString('ar-SA')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground font-arabic">لا توجد طلبات دعم سابقة</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
