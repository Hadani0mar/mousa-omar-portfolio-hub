
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
  level: number;
  category: string;
  created_at: string;
}

export const SkillsManager: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [name, setName] = useState('');
  const [level, setLevel] = useState(50);
  const [category, setCategory] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      console.error('Error loading skills:', error);
    } else {
      setSkills(data || []);
    }
  };

  const resetForm = () => {
    setName('');
    setLevel(50);
    setCategory('');
    setEditingSkill(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !category.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const skillData = {
      name: name.trim(),
      level,
      category: category.trim(),
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
    setLevel(skill.level);
    setCategory(skill.category);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('skills')
        .delete()
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

  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="skill-category">الفئة *</Label>
                  <Input
                    id="skill-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="مثال: البرمجة، التصميم"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="skill-level">مستوى الإتقان ({level}%)</Label>
                  <Input
                    id="skill-level"
                    type="range"
                    min="0"
                    max="100"
                    value={level}
                    onChange={(e) => setLevel(parseInt(e.target.value))}
                    className="mt-2"
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
      <div className="space-y-6">
        {Object.entries(skillsByCategory).map(([categoryName, categorySkills]) => (
          <Card key={categoryName}>
            <CardHeader>
              <CardTitle className="text-lg">{categoryName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySkills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{skill.name}</span>
                        <Badge variant="outline">{skill.level}%</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-1 mr-2">
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
        ))}
      </div>
    </div>
  );
};
