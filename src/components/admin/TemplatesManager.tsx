import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TemplateForm } from './TemplateForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Template {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  template_category: string;
  template_price: number;
  preview_url: string;
  html_content: string;
  css_content: string;
  js_content: string;
  display_order: number;
  project_status: string;
  created_at: string;
}

export const TemplatesManager: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');
  const [templatePrice, setTemplatePrice] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  const [htmlContent, setHtmlContent] = useState('<!DOCTYPE html>\n<html>\n<head>\n    <title>القالب الجديد</title>\n</head>\n<body>\n    <h1>مرحباً بالقالب الجديد</h1>\n</body>\n</html>');
  const [cssContent, setCssContent] = useState('/* أضف CSS هنا */');
  const [jsContent, setJsContent] = useState('// أضف JavaScript هنا');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [projectStatus, setProjectStatus] = useState('active');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_template', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل القوالب',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTechnologies('');
    setTemplateCategory('');
    setTemplatePrice(0);
    setPreviewUrl('');
    setHtmlContent('<!DOCTYPE html>\n<html>\n<head>\n    <title>القالب الجديد</title>\n</head>\n<body>\n    <h1>مرحباً بالقالب الجديد</h1>\n</body>\n</html>');
    setCssContent('/* أضف CSS هنا */');
    setJsContent('// أضف JavaScript هنا');
    setDisplayOrder(0);
    setProjectStatus('active');
    setEditingTemplate(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !templateCategory.trim() || !previewUrl.trim() || !technologies.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    try {
      const techArray = technologies.split(',').map(tech => tech.trim()).filter(tech => tech);
      
      const templateData = {
        title: title.trim(),
        description: description.trim(),
        technologies: techArray,
        template_category: templateCategory.trim(),
        template_price: templatePrice,
        preview_url: previewUrl.trim(),
        html_content: htmlContent.trim(),
        css_content: cssContent.trim() || null,
        js_content: jsContent.trim() || null,
        display_order: displayOrder,
        project_status: projectStatus,
        is_template: true,
        is_featured: false,
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('projects')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;

        toast({
          title: 'تم التحديث',
          description: 'تم تحديث القالب بنجاح',
        });
      } else {
        const { error } = await supabase
          .from('projects')
          .insert(templateData);

        if (error) throw error;

        toast({
          title: 'تم الإنشاء',
          description: 'تم إنشاء القالب بنجاح',
        });
      }

      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ القالب',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (template: Template) => {
    setTitle(template.title);
    setDescription(template.description);
    setTechnologies(template.technologies.join(', '));
    setTemplateCategory(template.template_category);
    setTemplatePrice(template.template_price);
    setPreviewUrl(template.preview_url || '');
    setHtmlContent(template.html_content);
    setCssContent(template.css_content || '');
    setJsContent(template.js_content || '');
    setDisplayOrder(template.display_order);
    setProjectStatus(template.project_status);
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'تم الحذف',
        description: 'تم حذف القالب بنجاح',
      });

      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف القالب',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'inactive':
        return 'غير نشط';
      case 'draft':
        return 'مسودة';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">إدارة القوالب</h2>
          <p className="text-muted-foreground">إدارة القوالب الجاهزة للبيع</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          إضافة قالب جديد
        </Button>
      </div>

      <TemplateForm
        showForm={showForm}
        editingTemplate={!!editingTemplate}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        technologies={technologies}
        setTechnologies={setTechnologies}
        templateCategory={templateCategory}
        setTemplateCategory={setTemplateCategory}
        templatePrice={templatePrice}
        setTemplatePrice={setTemplatePrice}
        previewUrl={previewUrl}
        setPreviewUrl={setPreviewUrl}
        htmlContent={htmlContent}
        setHtmlContent={setHtmlContent}
        cssContent={cssContent}
        setCssContent={setCssContent}
        jsContent={jsContent}
        setJsContent={setJsContent}
        displayOrder={displayOrder}
        setDisplayOrder={setDisplayOrder}
        projectStatus={projectStatus}
        setProjectStatus={setProjectStatus}
        onSubmit={handleSubmit}
        onCancel={resetForm}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">{template.title}</CardTitle>
                <Badge className={getStatusColor(template.project_status)}>
                  {getStatusText(template.project_status)}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {template.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{template.template_category}</Badge>
                <span className="font-bold text-green-600">{template.template_price} د.ل</span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {template.technologies.slice(0, 3).map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {template.technologies.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{template.technologies.length - 3}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(template)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  تعديل
                </Button>
                
                {template.preview_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={template.preview_url} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                      <AlertDialogDescription>
                        هل أنت متأكد من حذف هذا القالب؟ هذا الإجراء لا يمكن التراجع عنه.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(template.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        حذف
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground">لا توجد قوالب حالياً</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
