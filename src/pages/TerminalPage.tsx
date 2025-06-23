
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, RefreshCcw, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function TerminalPage() {
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تجربة الكود</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>مرحباً بك في محرر الأكواد</h1>
        <p>جرب كتابة كودك هنا ومشاهدة النتيجة مباشرة</p>
        <button onclick="showMessage()">اضغط هنا</button>
    </div>
    
    <script>
        function showMessage() {
            alert('مرحباً! يمكنك تجربة أي كود تريده هنا');
        }
    </script>
</body>
</html>`);

  const [cssCode, setCssCode] = useState(`body {
    font-family: Arial, sans-serif;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
}

.container {
    background: rgba(255, 255, 255, 0.1);
    padding: 30px;
    border-radius: 15px;
    backdrop-filter: blur(10px);
}

button {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s ease;
}

button:hover {
    background: #ff5252;
    transform: translateY(-2px);
}`);

  const [jsCode, setJsCode] = useState(`function showMessage() {
    const messages = [
        'مرحباً بك في محرر الأكواد!',
        'يمكنك تجربة أي كود تريده هنا',
        'استمتع بالبرمجة!',
        'موفق في مشاريعك!'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    alert(randomMessage);
}

// يمكنك إضافة المزيد من الكود هنا
console.log('مرحباً من وحدة التحكم!');`);

  const [activeTab, setActiveTab] = useState('html');

  const createSandboxHTML = () => {
    let fullHTML = htmlCode;

    // Inject CSS if provided
    if (cssCode.trim()) {
      const cssTag = `<style>${cssCode}</style>`;
      if (fullHTML.includes('</head>')) {
        fullHTML = fullHTML.replace('</head>', `${cssTag}\n</head>`);
      } else {
        fullHTML = `<style>${cssCode}</style>\n${fullHTML}`;
      }
    }

    // Inject JavaScript if provided
    if (jsCode.trim()) {
      const jsTag = `<script>${jsCode}</script>`;
      if (fullHTML.includes('</body>')) {
        fullHTML = fullHTML.replace('</body>', `${jsTag}\n</body>`);
      } else {
        fullHTML = `${fullHTML}\n<script>${jsCode}</script>`;
      }
    }

    return fullHTML;
  };

  const resetCode = () => {
    setHtmlCode(`<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تجربة الكود</title>
</head>
<body>
    <h1>مرحباً بك!</h1>
    <p>ابدأ كتابة كودك هنا</p>
</body>
</html>`);
    setCssCode('');
    setJsCode('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                العودة للرئيسية
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              <h1 className="text-lg font-semibold">محرر الأكواد</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetCode}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              إعادة تعيين
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          {/* Code Editor */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                محرر الكود
              </CardTitle>
              <CardDescription>
                اكتب كودك هنا وشاهد النتيجة مباشرة على اليسار
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="css">CSS</TabsTrigger>
                  <TabsTrigger value="js">JavaScript</TabsTrigger>
                </TabsList>
                
                <TabsContent value="html" className="flex-1 mt-4">
                  <Textarea
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    className="font-mono text-sm h-full resize-none"
                    placeholder="اكتب كود HTML هنا..."
                  />
                </TabsContent>
                
                <TabsContent value="css" className="flex-1 mt-4">
                  <Textarea
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                    className="font-mono text-sm h-full resize-none"
                    placeholder="اكتب كود CSS هنا..."
                  />
                </TabsContent>
                
                <TabsContent value="js" className="flex-1 mt-4">
                  <Textarea
                    value={jsCode}
                    onChange={(e) => setJsCode(e.target.value)}
                    className="font-mono text-sm h-full resize-none"
                    placeholder="اكتب كود JavaScript هنا..."
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    المعاينة المباشرة
                  </CardTitle>
                  <CardDescription>
                    النتيجة المباشرة لكودك
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="bg-white rounded-b-lg overflow-hidden border-t h-full">
                <iframe
                  srcDoc={createSandboxHTML()}
                  className="w-full h-full border-0"
                  title="Code Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
