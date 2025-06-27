
export const downloadProjectFiles = (project: {
  title: string;
  html_content: string;
  css_content?: string;
  js_content?: string;
}) => {
  const sanitizedTitle = project.title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_');
  
  // Create HTML file with embedded CSS and JS
  const createHtmlContent = () => {
    let htmlContent = project.html_content;
    
    // Add CSS if exists
    if (project.css_content) {
      const cssTag = `<style>\n${project.css_content}\n</style>`;
      if (htmlContent.includes('</head>')) {
        htmlContent = htmlContent.replace('</head>', `${cssTag}\n</head>`);
      } else {
        htmlContent = `<head>\n${cssTag}\n</head>\n${htmlContent}`;
      }
    }
    
    // Add JS if exists
    if (project.js_content) {
      const jsTag = `<script>\n${project.js_content}\n</script>`;
      if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', `${jsTag}\n</body>`);
      } else {
        htmlContent = `${htmlContent}\n${jsTag}`;
      }
    }
    
    return htmlContent;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download complete HTML file
  const completeHtml = createHtmlContent();
  downloadFile(completeHtml, `${sanitizedTitle}.html`, 'text/html');

  // Download separate CSS file if exists
  if (project.css_content) {
    setTimeout(() => {
      downloadFile(project.css_content!, `${sanitizedTitle}.css`, 'text/css');
    }, 100);
  }

  // Download separate JS file if exists
  if (project.js_content) {
    setTimeout(() => {
      downloadFile(project.js_content!, `${sanitizedTitle}.js`, 'text/javascript');
    }, 200);
  }
};
