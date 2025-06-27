
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NotificationFormProps {
  showForm: boolean;
  title: string;
  setTitle: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  type: 'info' | 'success' | 'warning';
  setType: (value: 'info' | 'success' | 'warning') => void;
  expirationHours: string;
  setExpirationHours: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const NotificationForm: React.FC<NotificationFormProps> = ({
  showForm,
  title,
  setTitle,
  message,
  setMessage,
  type,
  setType,
  expirationHours,
  setExpirationHours,
  onSubmit,
  onCancel,
}) => {
  if (!showForm) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>إضافة تحديث جديد</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="notif-title">عنوان التحديث</Label>
            <Input
              id="notif-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="notif-message">نص التحديث</Label>
            <Textarea
              id="notif-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none min-h-[100px] break-words whitespace-pre-wrap"
              style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="notif-type">نوع التحديث</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">معلومة</SelectItem>
                  <SelectItem value="success">نجاح</SelectItem>
                  <SelectItem value="warning">تحذير</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expiration">مدة العرض (ساعات)</Label>
              <Select value={expirationHours} onValueChange={setExpirationHours}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">ساعة واحدة</SelectItem>
                  <SelectItem value="6">6 ساعات</SelectItem>
                  <SelectItem value="12">12 ساعة</SelectItem>
                  <SelectItem value="24">24 ساعة</SelectItem>
                  <SelectItem value="48">48 ساعة</SelectItem>
                  <SelectItem value="168">أسبوع</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">نشر التحديث</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
