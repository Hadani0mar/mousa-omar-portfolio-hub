
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Skill {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const SkillsManager: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [name, setName] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error loading skills:', error);
    } else {
      setSkills(data || []);
    }
  };

  const resetForm = () => {
    setName('');
    setDisplayOrder(0);
    setEditingSkill(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المهارة",
        variant: "destructive",
      });
      return;
    }

    const skillData = {
      name: name.trim(),
      display_order: displayOrder || skills.length + 1,
      is_active: true,
    };

    try {
      if (editingSkill) {
        const { error } = await supabase
          .from('skills')
          .update(skillData)
          .eq('id', editingSkill.id);

        if (error) throw error;

        toast({
          title: "تم التحديث",
          description: "تم تحديث المهارة بنجاح",
        });
      } else {
        const { error } = await supabase
          .from('skills')
          .insert([skillData]);

        if (error) throw error;

        toast({
          title: "تم الإنشاء",
          description: "تم إنشاء المهارة بنجاح",
        });
      }

      resetForm();
      loadSkills();
    } catch (error) {
      console.error('Error saving skill:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ المهارة",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setName(skill.name);
    setDisplayOrder(skill.display_order);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المهارة؟')) return;

    try {
      const { error } = await supabase
        .from('skills')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف المهارة بنجاح",
      });
      loadSkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المهارة",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة المهارات</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          إضافة مهارة جديدة
        </Button>
      </div>

      {/* Skills Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingSkill ? 'تعديل المهارة' : 'إضافة مهارة جديدة'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="skill-name">اسم المهارة *</Label>
                  <Input
                    id="skill-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="display-order">ترتيب العرض</Label>
                  <Input
                    id="display-order"
                    type="number"
                    min="0"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingSkill ? 'تحديث المهارة' : 'إضافة المهارة'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Skills List */}
      <Card>
        <CardHeader>
          <CardTitle>المهارات الحالية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{skill.display_order}</Badge>
                  <span className="font-medium">{skill.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(skill)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(skill.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
