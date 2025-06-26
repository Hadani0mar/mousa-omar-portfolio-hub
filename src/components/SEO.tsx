
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
  title = "موسى عمر هداني - مطور مواقع ليبي | Hadani Libya Web Developer",
  description = "موسى عمر هاداني، مطور مواقع ليبي متخصص في تطوير واجهات المستخدم الحديثة والتفاعلية باستخدام React, Next.js, TypeScript. أقدم خدمات تطوير الويب الاحترافية في ليبيا، بما في ذلك المشاريع المتعلقة بـ Hadani Libya.",
  keywords = "مطور مواقع, ليبيا, React, Next.js, TypeScript, تطوير واجهات, مواقع احترافية, hadani libya, hadani, libya, هاداني ليبيا, هاداني, ليبيا, موسى عمر هاداني, موسى هاداني",
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
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};



