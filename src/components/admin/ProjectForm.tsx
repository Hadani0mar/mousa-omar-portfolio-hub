
import React, { useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectFormProps {
  showForm: boolean;
  editingProject: boolean;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  technologies: string;
  setTechnologies: (val: string) => void;
  htmlContent: string;
  setHtmlContent: (val: string) => void;
  cssContent: string;
  setCssContent: (val: string) => void;
  jsContent: string;
  setJsContent: (val: string) => void;
  isFeatured: boolean;
  setIsFeatured: (val: boolean) => void;
  displayOrder: number;
  setDisplayOrder: (val: number) => void;
  projectStatus: string;
  setProjectStatus: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  showForm,
  editingProject,
  title,
  setTitle,
  description,
  setDescription,
  technologies,
  setTechnologies,
  htmlContent,
  setHtmlContent,
  cssContent,
  setCssContent,
  jsContent,
  setJsContent,
  isFeatured,
  setIsFeatured,
  displayOrder,
  setDisplayOrder,
  projectStatus,
  setProjectStatus,
  onSubmit,
  onCancel,
}) => {
  const htmlFileRef = useRef<HTMLInputElement>(null);
  const cssFileRef = useRef<HTMLInputElement>(null);
  const jsFileRef = useRef<HTMLInputElement>(null);

  if (!showForm) return null;

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setter(event.target.result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="animate-scale-in">
      <CardHeader>
        <CardTitle>{editingProject ? "تعديل المشروع" : "إضافة مشروع جديد"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">اسم المشروع *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <Label htmlFor="technologies">التقنيات المستخدمة (مفصولة بفاصلة)</Label>
              <Input
                id="technologies"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                placeholder="HTML, CSS, JavaScript"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">وصف المشروع *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <Label htmlFor="html">كود HTML *</Label>
            <div className="space-y-2">
              <Textarea
                id="html"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                rows={6}
                className="font-mono text-sm transition-all duration-200 focus:ring-2 focus:ring-primary"
                placeholder="<!DOCTYPE html>..."
                required
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => htmlFileRef.current?.click()}
                  className="hover-scale"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  رفع ملف HTML
                </Button>
                <input
                  type="file"
                  accept=".html"
                  ref={htmlFileRef}
                  onChange={(e) => handleFileUpload(e, setHtmlContent)}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="css">كود CSS (اختياري)</Label>
              <div className="space-y-2">
                <Textarea
                  id="css"
                  value={cssContent}
                  onChange={(e) => setCssContent(e.target.value)}
                  rows={6}
                  className="font-mono text-sm transition-all duration-200 focus:ring-2 focus:ring-primary"
                  placeholder="body { ... }"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => cssFileRef.current?.click()}
                    className="hover-scale"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    رفع ملف CSS
                  </Button>
                  <input
                    type="file"
                    accept=".css"
                    ref={cssFileRef}
                    onChange={(e) => handleFileUpload(e, setCssContent)}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="js">كود JavaScript (اختياري)</Label>
              <div className="space-y-2">
                <Textarea
                  id="js"
                  value={jsContent}
                  onChange={(e) => setJsContent(e.target.value)}
                  rows={6}
                  className="font-mono text-sm transition-all duration-200 focus:ring-2 focus:ring-primary"
                  placeholder="console.log('Hello');"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => jsFileRef.current?.click()}
                    className="hover-scale"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    رفع ملف JS
                  </Button>
                  <input
                    type="file"
                    accept=".js"
                    ref={jsFileRef}
                    onChange={(e) => handleFileUpload(e, setJsContent)}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded transition-all duration-200"
              />
              <Label htmlFor="featured">مشروع مميز</Label>
            </div>
            <div>
              <Label htmlFor="status">حالة المشروع</Label>
              <Select value={projectStatus} onValueChange={setProjectStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="hover-scale">
              {editingProject ? "تحديث المشروع" : "نشر المشروع"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="hover-scale">
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
