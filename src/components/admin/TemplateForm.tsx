
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface TemplateFormProps {
  showForm: boolean;
  editingTemplate: boolean;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  technologies: string;
  setTechnologies: (val: string) => void;
  templateCategory: string;
  setTemplateCategory: (val: string) => void;
  templatePrice: number;
  setTemplatePrice: (val: number) => void;
  previewUrl: string;
  setPreviewUrl: (val: string) => void;
  htmlContent: string;
  setHtmlContent: (val: string) => void;
  cssContent: string;
  setCssContent: (val: string) => void;
  jsContent: string;
  setJsContent: (val: string) => void;
  displayOrder: number;
  setDisplayOrder: (val: number) => void;
  projectStatus: string;
  setProjectStatus: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  showForm,
  editingTemplate,
  title,
  setTitle,
  description,
  setDescription,
  technologies,
  setTechnologies,
  templateCategory,
  setTemplateCategory,
  templatePrice,
  setTemplatePrice,
  previewUrl,
  setPreviewUrl,
  onSubmit,
  onCancel,
}) => {
  if (!showForm) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingTemplate ? "تعديل القالب" : "إضافة قالب جديد"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">اسم القالب *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="اسم القالب"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">فئة القالب *</Label>
              <Input
                id="category"
                value={templateCategory}
                onChange={(e) => setTemplateCategory(e.target.value)}
                placeholder="مثال: مواقع شخصية، متاجر إلكترونية، مدونات"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">السعر (دينار ليبي) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={templatePrice}
                onChange={(e) => setTemplatePrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="previewUrl">رابط المعاينة *</Label>
              <Input
                id="previewUrl"
                type="url"
                value={previewUrl}
                onChange={(e) => setPreviewUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="technologies">اللغات المستخدمة *</Label>
            <Input
              id="technologies"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="HTML, CSS, JavaScript, React"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              أدخل اللغات مفصولة بفاصلة
            </p>
          </div>

          <div>
            <Label htmlFor="description">وصف القالب *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="اكتب وصفاً مفصلاً للقالب وميزاته..."
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {editingTemplate ? "تحديث القالب" : "نشر القالب"}
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
