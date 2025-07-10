
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code, ExternalLink, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TemplateCard } from './TemplateCard';

interface Template {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  template_category: string;
  template_price: number;
  preview_url: string;
  html_content: string;
  css_content?: string;
  js_content?: string;
}

interface Category {
  name: string;
  templates: Template[];
}

export const TemplatesSection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('is_template', true)
        .eq('project_status', 'active')
        .order('display_order', { ascending: true });

      if (data) {
        const templatesData = data as Template[];
        const groupedByCategory = templatesData.reduce((acc, template) => {
          const category = template.template_category || 'غير مصنف';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(template);
          return acc;
        }, {} as Record<string, Template[]>);

        const categoriesArray = Object.entries(groupedByCategory).map(([name, templates]) => ({
          name,
          templates
        }));

        setCategories(categoriesArray);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">جاري تحميل القوالب...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-16">
        <Code className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-foreground">لا توجد قوالب متاحة حالياً</h3>
        <p className="text-muted-foreground">سيتم إضافة قوالب جديدة قريباً</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">القوالب الجاهزة</h2>
        <p className="text-muted-foreground">
          تصفح مجموعة من القوالب الجاهزة المصممة خصيصاً لمختلف الاحتياجات
        </p>
      </div>

      {categories.map((category) => (
        <div key={category.name} className="space-y-6">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-foreground">{category.name}</h3>
            <Badge variant="outline" className="bg-secondary/50">
              {category.templates.length} قالب
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
