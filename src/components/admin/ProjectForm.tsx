diff --git a/src/components/admin/ProjectForm.tsx b/src/components/admin/ProjectForm.tsx
index 6b07bd2391afaffe1f4bce0bced9f726260ebbd1..2e15013a03c4aabb649f5bd70350c387bf7e44f4 100644
--- a/src/components/admin/ProjectForm.tsx
+++ b/src/components/admin/ProjectForm.tsx
@@ -49,50 +49,65 @@ export const ProjectForm: React.FC<ProjectFormProps> = ({
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
 
+  const handleFileChange = (
+    e: React.ChangeEvent<HTMLInputElement>,
+    setter: (value: string) => void,
+  ) => {
+    const file = e.target.files?.[0];
+    if (!file) return;
+    const reader = new FileReader();
+    reader.onload = (event) => {
+      if (typeof event.target?.result === 'string') {
+        setter(event.target.result);
+      }
+    };
+    reader.readAsText(file);
+  };
+
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
diff --git a/src/components/admin/ProjectForm.tsx b/src/components/admin/ProjectForm.tsx
index 6b07bd2391afaffe1f4bce0bced9f726260ebbd1..2e15013a03c4aabb649f5bd70350c387bf7e44f4 100644
--- a/src/components/admin/ProjectForm.tsx
+++ b/src/components/admin/ProjectForm.tsx
@@ -108,74 +123,92 @@ export const ProjectForm: React.FC<ProjectFormProps> = ({
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
+            <Input
+              type="file"
+              accept=".html"
+              onChange={(e) => handleFileChange(e, setHtmlContent)}
+              className="mt-2"
+            />
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
+              <Input
+                type="file"
+                accept=".css"
+                onChange={(e) => handleFileChange(e, setCssContent)}
+                className="mt-2"
+              />
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
+              <Input
+                type="file"
+                accept=".js"
+                onChange={(e) => handleFileChange(e, setJsContent)}
+                className="mt-2"
+              />
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
