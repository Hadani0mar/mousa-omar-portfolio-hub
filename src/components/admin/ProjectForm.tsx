
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  html_content: string;
  css_content?: string;
  js_content?: string;
  is_featured: boolean;
  display_order: number;
  project_status: string;
}

interface ProjectFormProps {
  showForm: boolean;
  editingProject: Project | null;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  technologies: string;
  setTechnologies: (value: string) => void;
  htmlContent: string;
  setHtmlContent: (value: string) => void;
  cssContent: string;
  setCssContent: (value: string) => void;
  jsContent: string;
  setJsContent: (value: string) => void;
  isFeatured: boolean;
  setIsFeatured: (value: boolean) => void;
  displayOrder: number;
  setDisplayOrder: (value: number) => void;
  projectStatus: string;
  setProjectStatus: (value: string) => void;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingProject ? 'تعديل المشروع' : 'إضافة مشروع جديد'}</CardTitle>
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
            <div>
              <Label htmlFor="display-order">ترتيب العرض</Label>
              <Input
                id="display-order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
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
              {editingProject ? 'تحديث المشروع' : 'إضافة المشروع'}
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
