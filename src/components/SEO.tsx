
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO = ({
  title = "موسى عمر - مطور مواقع ليبي | إنشاء مشاريع تخرج الويب HTML CSS JS Next.js خبير n8n",
  description = "موسى عمر مطور مواقع ليبي محترف متخصص في إنشاء مشاريع تخرج الويب باستخدام HTML, CSS, JavaScript, React, Next.js. خبير في n8n وأتمتة المهام. أقدم خدمات تطوير الويب الاحترافية وإنشاء مشاريع التخرج التقنية في ليبيا مع أحدث التقنيات والأدوات",
  keywords = "موسى عمر, مطور مواقع ليبي, إنشاء مشاريع تخرج الويب, HTML CSS JS, Next.js, خبير n8n, React Developer Libya, تطوير واجهات المستخدم, مشاريع تخرج تقنية, برمجة مواقع ليبيا, أتمتة المهام, تطوير تطبيقات الويب, موسى عمر ليبيا, web developer libya, graduation projects, frontend development libya, TypeScript, Tailwind CSS, Node.js, database design, UI/UX, responsive design, mobile development, e-commerce websites, portfolio websites, business websites, SEO optimization, web performance, modern web technologies, full stack developer, API integration, CMS development, WordPress developer, Shopify developer, digital solutions libya, tech consultant libya, freelance developer libya, libya programmer, سبها ليبيا, تطوير مواقع سبها, مبرمج ليبي, استشارات تقنية ليبيا, حلول رقمية ليبيا, تصميم مواقع احترافية, برمجة تطبيقات, تطوير متاجر إلكترونية, تحسين محركات البحث, أداء المواقع, التقنيات الحديثة, مطور فول ستاك, تكامل APIs, إدارة المحتوى, WordPress, Shopify, حلول رقمية",
  image = "https://www.m0usa.ly/og-image.jpg",
  url = "https://www.m0usa.ly/",
  type = "website"
}: SEOProps) => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="موسى عمر - مطور مواقع ليبي" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Arabic" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="موسى عمر - مطور مواقع ليبي" />
      <meta property="og:locale" content="ar_LY" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:creator" content="@moussa_omar" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="geo.region" content="LY" />
      <meta name="geo.placename" content="Libya" />
      <meta name="geo.position" content="26.3351;17.2283" />
      <meta name="ICBM" content="26.3351, 17.2283" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "موسى عمر",
          "alternateName": "Moussa Omar",
          "description": "مطور مواقع ليبي محترف متخصص في إنشاء مشاريع تخرج الويب",
          "url": url,
          "image": image,
          "sameAs": [
            "https://www.facebook.com/mousa.0mar",
            "https://github.com/moussa-omar"
          ],
          "jobTitle": "مطور مواقع ومطور واجهات المستخدم",
          "worksFor": {
            "@type": "Organization",
            "name": "مطور مستقل"
          },
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "LY",
            "addressRegion": "Libya"
          },
          "knowsAbout": [
            "HTML", "CSS", "JavaScript", "React", "Next.js", "TypeScript",
            "Node.js", "n8n", "Web Development", "Frontend Development",
            "UI/UX Design", "Responsive Design", "SEO", "Web Performance"
          ],
          "offers": {
            "@type": "Service",
            "name": "خدمات تطوير المواقع وإنشاء مشاريع التخرج",
            "description": "تطوير مواقع احترافية وإنشاء مشاريع تخرج تقنية باستخدام أحدث التقنيات"
          }
        })}
      </script>
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
};
