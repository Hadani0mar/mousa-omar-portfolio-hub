import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  if (!showForm) return null;

  const handleFileChange = (
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
    <Card>
      <CardHeader>
        <CardTitle>{editingProject ? "تعديل المشروع" : "إضافة مشروع جديد"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="title">اسم المشروع *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="technologies">التقنيات المستخدمة (مفصولة بفاصلة)</Label>
              <Input
                id="technologies"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                placeholder="HTML, CSS, JavaScript"
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
            />
          </div>

          <div>
            <Label htmlFor="html">كود HTML *</Label>
            <Textarea
              id="html"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              rows={6}
              className="font-mono text-sm"
              placeholder="<!DOCTYPE html>..."
              required
            />
            <Input
              type="file"
              accept=".html"
              onChange={(e) => handleFileChange(e, setHtmlContent)}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="css">كود CSS (اختياري)</Label>
              <Textarea
                id="css"
                value={cssContent}
                onChange={(e) => setCssContent(e.target.value)}
                rows={6}
                className="font-mono text-sm"
                placeholder="body { ... }"
              />
              <Input
                type="file"
                accept=".css"
                onChange={(e) => handleFileChange(e, setCssContent)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="js">كود JavaScript (اختياري)</Label>
              <Textarea
                id="js"
                value={jsContent}
                onChange={(e) => setJsContent(e.target.value)}
                rows={6}
                className="font-mono text-sm"
                placeholder="console.log('Hello');"
              />
              <Input
                type="file"
                accept=".js"
                onChange={(e) => handleFileChange(e, setJsContent)}
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded"
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
            <Button type="submit">
              {editingProject ? "تحديث المشروع" : "نشر المشروع"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
