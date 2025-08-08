import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatResponse {
  content: string;
  isQuestion?: boolean;
  options?: string[];
  metadata?: any;
}

export interface AssessmentQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface WeaknessAnalysis {
  subject: string;
  chapter?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  weakAreas: string[];
  recommendations: string[];
}

export interface SummaryRequest {
  content: string;
  focusAreas?: string[];
  summaryType: "general" | "weaknesses" | "forgotten_points" | "clarifications";
}

// Main chat function for educational AI assistant
export async function generateChatResponse(
  message: string,
  context: string = "",
  subject?: string
): Promise<ChatResponse> {
  try {
    const systemPrompt = `أنت مساعد تعليمي ذكي باللغة العربية متخصص في التعليم الأكاديمي. مهمتك هي:
1. مساعدة الطلاب في فهم المواد الدراسية
2. توليد أسئلة تقييمية مناسبة
3. تحليل نقاط الضعف وتقديم التوصيات
4. الإجابة على الاستفسارات الأكاديمية بوضوح

${subject ? `التخصص الحالي: ${subject}` : ""}
${context ? `السياق: ${context}` : ""}

تأكد من الإجابة باللغة العربية وبطريقة واضحة ومفيدة للطالب.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content || "";
    
    return {
      content,
      metadata: {
        model: "gpt-4o",
        timestamp: new Date().toISOString(),
        subject
      }
    };
  } catch (error) {
    throw new Error("فشل في الحصول على استجابة من المساعد الذكي: " + (error as Error).message);
  }
}

// Generate assessment questions for a specific subject/chapter
export async function generateAssessmentQuestions(
  subject: string,
  chapter?: string,
  difficulty: "easy" | "medium" | "hard" = "medium",
  count: number = 5
): Promise<AssessmentQuestion[]> {
  try {
    const prompt = `قم بإنشاء ${count} أسئلة اختيار من متعدد باللغة العربية للموضوع التالي:
الموضوع: ${subject}
${chapter ? `الفصل: ${chapter}` : ""}
مستوى الصعوبة: ${difficulty}

يجب أن تكون الأسئلة:
1. واضحة ومحددة
2. لها 4 خيارات (أ، ب، ج، د)
3. إجابة واحدة صحيحة فقط
4. مع شرح للإجابة الصحيحة

أرجع النتيجة بصيغة JSON مع هذا التنسيق:
{
  "questions": [
    {
      "question": "نص السؤال",
      "options": ["أ) الخيار الأول", "ب) الخيار الثاني", "ج) الخيار الثالث", "د) الخيار الرابع"],
      "correctAnswer": 0,
      "explanation": "شرح الإجابة الصحيحة",
      "difficulty": "${difficulty}"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.questions || [];
  } catch (error) {
    throw new Error("فشل في توليد الأسئلة التقييمية: " + (error as Error).message);
  }
}

// Analyze student performance and identify weaknesses
export async function analyzePerformance(
  subject: string,
  answers: { questionId: number; userAnswer: number; correctAnswer: number }[],
  chapter?: string
): Promise<WeaknessAnalysis> {
  try {
    const correctAnswers = answers.filter(a => a.userAnswer === a.correctAnswer).length;
    const totalQuestions = answers.length;
    const score = (correctAnswers / totalQuestions) * 100;

    const prompt = `حلل أداء الطالب التالي وحدد نقاط الضعف والتوصيات:

الموضوع: ${subject}
${chapter ? `الفصل: ${chapter}` : ""}
عدد الأسئلة الكلي: ${totalQuestions}
الإجابات الصحيحة: ${correctAnswers}
النسبة: ${score.toFixed(2)}%

الأسئلة والإجابات:
${answers.map((a, i) => `السؤال ${i + 1}: ${a.userAnswer === a.correctAnswer ? 'صحيح' : 'خطأ'}`).join('\n')}

حدد:
1. نقاط الضعف الرئيسية (إذا كانت النسبة أقل من 60%)
2. التوصيات للتحسين
3. المواضيع التي تحتاج مراجعة

أرجع النتيجة بصيغة JSON:
{
  "weakAreas": ["نقطة ضعف 1", "نقطة ضعف 2"],
  "recommendations": ["توصية 1", "توصية 2", "توصية 3"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      subject,
      chapter,
      score,
      totalQuestions,
      correctAnswers,
      weakAreas: result.weakAreas || [],
      recommendations: result.recommendations || []
    };
  } catch (error) {
    throw new Error("فشل في تحليل الأداء: " + (error as Error).message);
  }
}

// Generate personalized summary
export async function generateSummary(request: SummaryRequest): Promise<string> {
  try {
    let prompt = "";
    
    switch (request.summaryType) {
      case "weaknesses":
        prompt = `اكتب ملخصاً يركز على نقاط الضعف التي يجب تقويتها من المحتوى التالي:\n\n${request.content}`;
        break;
      case "forgotten_points":
        prompt = `اكتب ملخصاً للنقاط المهمة التي قد ينساها الطالب من المحتوى التالي:\n\n${request.content}`;
        break;
      case "clarifications":
        prompt = `اكتب ملخصاً يوضح النقاط الغامضة والمعقدة من المحتوى التالي:\n\n${request.content}`;
        break;
      default:
        prompt = `اكتب ملخصاً شاملاً للمحتوى التالي:\n\n${request.content}`;
    }

    if (request.focusAreas && request.focusAreas.length > 0) {
      prompt += `\n\nركز على هذه المناطق: ${request.focusAreas.join(", ")}`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 800,
    });

    return response.choices[0].message.content || "لا يمكن إنشاء الملخص في الوقت الحالي.";
  } catch (error) {
    throw new Error("فشل في إنشاء الملخص: " + (error as Error).message);
  }
}

// Analyze uploaded PDF content
export async function analyzePDFContent(
  content: string,
  fileName: string
): Promise<{ subject: string; topics: string[]; summary: string }> {
  try {
    const prompt = `حلل محتوى هذا الملف الأكاديمي وحدد:
1. الموضوع/المادة الدراسية
2. المواضيع الرئيسية المغطاة
3. ملخص مختصر للمحتوى

اسم الملف: ${fileName}
المحتوى:
${content.substring(0, 2000)}...

أرجع النتيجة بصيغة JSON:
{
  "subject": "اسم المادة/الموضوع",
  "topics": ["موضوع 1", "موضوع 2", "موضوع 3"],
  "summary": "ملخص مختصر للمحتوى"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      subject: result.subject || "غير محدد",
      topics: result.topics || [],
      summary: result.summary || "لا يوجد ملخص متاح"
    };
  } catch (error) {
    throw new Error("فشل في تحليل محتوى الملف: " + (error as Error).message);
  }
}

// Translate content
export async function translateContent(
  content: string,
  targetLanguage: "ar" | "en" = "ar"
): Promise<string> {
  try {
    const languageMap = {
      ar: "العربية",
      en: "الإنجليزية"
    };

    const prompt = `ترجم النص التالي إلى اللغة ${languageMap[targetLanguage]} مع الحفاظ على المصطلحات الأكاديمية والعلمية:

${content}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 1500,
    });

    return response.choices[0].message.content || "فشل في الترجمة";
  } catch (error) {
    throw new Error("فشل في ترجمة المحتوى: " + (error as Error).message);
  }
}
