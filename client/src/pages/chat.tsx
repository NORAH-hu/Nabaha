import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { MasteryIndicator } from "@/components/MasteryIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Bot,
  User,
  Send,
  Upload,
  FileText,
  Settings,
  MoreVertical,
  ArrowLeft,
  Mic,
  Sparkles,
  Target,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  Languages,
  Star,
  AlertCircle
} from "lucide-react";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  metadata?: any;
  createdAt: string;
}

interface ChatSession {
  id: number;
  title: string;
  subject?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Chat() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const sessionId = params.id ? parseInt(params.id) : null;
  const [message, setMessage] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [showNewSessionForm, setShowNewSessionForm] = useState(!sessionId);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample mastery data - in real app this would come from analytics API
  const [masteryData, setMasteryData] = useState({
    overall: 48,
    subjects: [
      { name: "CH1", percentage: 75 },
      { name: "CH2", percentage: 60 },
      { name: "CH3", percentage: 45 },
      { name: "CH4", percentage: 80 },
      { name: "CH5", percentage: 35 },
    ]
  });

  // Fetch chat sessions
  const { data: chatSessions } = useQuery({
    queryKey: ["/api/chat/sessions"],
  });

  // Fetch current session data
  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ["/api/chat/sessions", sessionId],
    enabled: !!sessionId,
  });

  const currentSession = sessionData?.session;
  const messages = sessionData?.messages || [];

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: { title: string; subject?: string }) => {
      const response = await apiRequest("POST", "/api/chat/sessions", data);
      return response.json();
    },
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] });
      setLocation(`/chat/${newSession.id}`);
      setShowNewSessionForm(false);
      toast({
        title: "تم إنشاء الجلسة بنجاح",
        description: "يمكنك الآن بدء المحادثة",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مصرح",
          description: "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "فشل في إنشاء الجلسة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/chat/sessions/${sessionId}/messages`, {
        content,
        role: "user",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions", sessionId] });
      setMessage("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مصرح",
          description: "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "فشل في إرسال الرسالة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // File upload mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      if (sessionId) formData.append("sessionId", sessionId.toString());

      const response = await apiRequest("POST", "/api/files/upload", formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم رفع الملف بنجاح",
        description: data.message,
      });
      if (data.analysis) {
        // Update subject if analyzed
        if (data.analysis.subject && currentSession) {
          setSelectedSubject(data.analysis.subject);
        }
      }
    },
    onError: (error) => {
      toast({
        title: "فشل في رفع الملف",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCreateSession = () => {
    if (!newSessionTitle.trim()) {
      toast({
        title: "عنوان الجلسة مطلوب",
        description: "يرجى إدخال عنوان للجلسة",
        variant: "destructive",
      });
      return;
    }

    createSessionMutation.mutate({
      title: newSessionTitle,
      subject: selectedSubject || undefined
    });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !sessionId) return;
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "الملف كبير جداً",
        description: "حجم الملف يجب أن يكون أقل من 10 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    uploadFileMutation.mutate(file);
  };

  const getMasteryColor = (percentage: number) => {
    if (percentage >= 80) return "text-accent";
    if (percentage >= 60) return "text-warning";
    return "text-destructive";
  };

  if (showNewSessionForm) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-center font-arabic">إنشاء جلسة محادثة جديدة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground font-arabic">
                  عنوان الجلسة
                </label>
                <Input
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  placeholder="مثال: مراجعة التفاضل والتكامل"
                  className="font-arabic"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground font-arabic">
                  الموضوع (اختياري)
                </label>
                <Input
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  placeholder="مثال: MATH_302"
                  className="font-arabic"
                />
              </div>

              <div className="flex space-x-4 space-x-reverse">
                <Button
                  onClick={handleCreateSession}
                  disabled={createSessionMutation.isPending}
                  className="flex-1 font-arabic"
                >
                  {createSessionMutation.isPending ? "جاري الإنشاء..." : "إنشاء الجلسة"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/")}
                  className="font-arabic"
                >
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="loading-spinner mx-auto" />
            <p className="text-muted-foreground font-arabic">جاري تحميل الجلسة...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Chat Header */}
      <div className="bg-primary text-primary-foreground p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Bot className="w-8 h-8" />
            <div>
              <h3 className="font-semibold font-arabic">
                {currentSession?.title || "جلسة محادثة"}
              </h3>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-sm text-primary-foreground/80 font-arabic">نشط</span>
                {currentSession?.subject && (
                  <>
                    <span className="text-primary-foreground/60">•</span>
                    <span className="text-sm text-primary-foreground/80">
                      {currentSession.subject}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <MasteryIndicator 
              percentage={masteryData.overall} 
              subject={currentSession?.subject}
              showTrend={true}
              previousPercentage={45}
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Course Progress */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-arabic">نسبة الإتقان...</span>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {masteryData.overall}%
            </span>
          </div>
          <Progress value={masteryData.overall} className="h-2" />
          
          {/* Subject breakdown */}
          <div className="flex justify-between mt-4 space-x-2 space-x-reverse">
            {masteryData.subjects.map((subject, index) => (
              <div key={index} className="flex flex-col items-center space-y-1">
                <span className="text-xs text-muted-foreground">{subject.name}</span>
                <div className="w-2 h-16 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`w-full rounded-full transition-all duration-300 ${
                      subject.percentage >= 80 ? 'bg-accent' : 
                      subject.percentage >= 60 ? 'bg-warning' : 'bg-destructive'
                    }`}
                    style={{ height: `${subject.percentage}%` }}
                  />
                </div>
                <span className={`text-xs ${getMasteryColor(subject.percentage)}`}>
                  {subject.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2 font-arabic">ابدأ المحادثة</h3>
              <p className="text-muted-foreground font-arabic">
                اطرح أسئلتك أو ارفع ملفاتك للحصول على المساعدة
              </p>
            </div>
          ) : (
            messages.map((msg: ChatMessage) => (
              <div key={msg.id} className={`flex items-start space-x-3 space-x-reverse ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                <div className={`p-2 rounded-full ${
                  msg.role === 'user' ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-primary" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                </div>
                
                <div className={`rounded-2xl p-4 max-w-md ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tl-sm' 
                    : 'bg-muted text-muted-foreground rounded-tr-sm'
                }`}>
                  <p className="whitespace-pre-wrap font-arabic">{msg.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {new Date(msg.createdAt).toLocaleTimeString('ar-SA')}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* File Upload Zone */}
      <div className="border-t border-border p-4">
        <div className="max-w-4xl mx-auto">
          <div 
            className="upload-zone mb-4"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-6 h-6 text-muted-foreground mb-2 mx-auto" />
            <p className="text-muted-foreground font-arabic">اسحب وأفلت ملفاتك هنا أو اضغط للتصفح</p>
            <p className="text-sm text-muted-foreground mt-1">PDF, DOC, DOCX حتى 10MB</p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
            />
          </div>

          {/* Chat Input */}
          <div className="flex items-end space-x-3 space-x-reverse">
            <div className="flex-1 relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا..."
                className="pr-12 resize-none font-arabic"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="px-6"
            >
              {sendMessageMutation.isPending ? (
                <div className="loading-spinner w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-muted/30 p-4 border-t border-border">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2 space-x-reverse font-arabic"
          >
            <Languages className="w-4 h-4 text-primary" />
            <span>ترجمة الملف</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2 space-x-reverse font-arabic"
          >
            <FileText className="w-4 h-4 text-accent" />
            <span>طلب ملخص</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2 space-x-reverse font-arabic"
          >
            <Star className="w-4 h-4 text-warning" />
            <span>تقييم المستوى</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
