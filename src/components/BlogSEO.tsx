
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  published_at: string;
  blog_categories?: {
    name: string;
  };
}

interface Project {
  title: string;
  description: string;
  technologies: string[];
}

interface Skill {
  name: string;
}

interface BlogCategory {
  name: string;
  slug: string;
}

export const BlogSEO = () => {
  const [seoData, setSeoData] = useState({
    posts: [] as BlogPost[],
    projects: [] as Project[],
    skills: [] as Skill[],
    categories: [] as BlogCategory[]
  });

  useEffect(() => {
    loadSEOData();
  }, []);

  const loadSEOData = async () => {
    try {
      // جلب آخر التدوينات
      const { data: posts } = await supabase
        .from('blog_posts')
        .select(`
          title,
          slug,
          excerpt,
          published_at,
          blog_categories (name)
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(10);

      // جلب المشاريع
      const { data: projects } = await supabase
        .from('projects')
        .select('title, description, technologies')
        .eq('project_status', 'active')
        .limit(10);

      // جلب المهارات
      const { data: skills } = await supabase
        .from('skills')
        .select('name')
        .eq('is_active', true);

      // جلب التصنيفات
      const { data: categories } = await supabase
        .from('blog_categories')
        .select('name, slug')
        .eq('is_active', true);

      setSeoData({
        posts: posts || [],
        projects: projects || [],
        skills: skills || [],
        categories: categories || []
      });
    } catch (error) {
      console.error('Error loading SEO data:', error);
    }
  };

  const generateStructuredData = () => {
    const baseUrl = 'https://www.m0usa.ly';
    
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          "@id": `${baseUrl}/#person`,
          "name": "موسى عمر",
          "alternateName": "Moussa Omar",
          "description": "مطور مواقع ليبي محترف متخصص في إنشاء مشاريع تخرج الويب",
          "url": baseUrl,
          "sameAs": [
            "https://www.facebook.com/mousa.0mar",
            "https://github.com/moussa-omar"
          ],
          "jobTitle": "مطور مواقع ومطور واجهات المستخدم",
          "knowsAbout": seoData.skills.map(skill => skill.name),
          "hasCredential": seoData.projects.map(project => ({
            "@type": "CreativeWork",
            "name": project.title,
            "description": project.description,
            "keywords": project.technologies?.join(', ')
          }))
        },
        {
          "@type": "Website",
          "@id": `${baseUrl}/#website`,
          "url": baseUrl,
          "name": "موسى عمر - مطور مواقع ليبي",
          "description": "موقع موسى عمر مطور مواقع ليبي محترف متخصص في إنشاء مشاريع تخرج الويب",
          "publisher": {
            "@id": `${baseUrl}/#person`
          },
          "inLanguage": "ar-LY"
        },
        {
          "@type": "Blog",
          "@id": `${baseUrl}/blog#blog`,
          "url": `${baseUrl}/blog`,
          "name": "مدونة موسى عمر التقنية",
          "description": "مدونة تقنية تحتوي على مقالات ونصائح حول تطوير الويب والتقنيات الحديثة",
          "publisher": {
            "@id": `${baseUrl}/#person`
          },
          "blogPost": seoData.posts.map(post => ({
            "@type": "BlogPosting",
            "@id": `${baseUrl}/blog/${post.slug}`,
            "url": `${baseUrl}/blog/${post.slug}`,
            "headline": post.title,
            "description": post.excerpt,
            "datePublished": post.published_at,
            "author": {
              "@id": `${baseUrl}/#person`
            },
            "publisher": {
              "@id": `${baseUrl}/#person`
            },
            "articleSection": post.blog_categories?.name
          }))
        },
        ...seoData.categories.map(category => ({
          "@type": "CollectionPage",
          "@id": `${baseUrl}/blog/category/${category.slug}`,
          "url": `${baseUrl}/blog/category/${category.slug}`,
          "name": `تصنيف: ${category.name}`,
          "description": `جميع المقالات في تصنيف ${category.name}`,
          "isPartOf": {
            "@id": `${baseUrl}/blog#blog`
          }
        }))
      ]
    };
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(generateStructuredData(), null, 2)}
      </script>
    </Helmet>
  );
};
