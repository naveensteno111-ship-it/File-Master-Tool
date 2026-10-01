import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SearchModal } from './components/common/SearchModal';
import { PricingModal } from './components/common/PricingModal';
import { AuthModal } from './components/common/AuthModal';
import { ToolLayout } from './components/tools/ToolLayout';
import { JpgToPdfTool } from './components/tools/JpgToPdfTool';
import { PdfMergeTool } from './components/tools/PdfMergeTool';
import { PdfSplitTool } from './components/tools/PdfSplitTool';
import { PdfToJpgTool } from './components/tools/PdfToJpgTool';
import { PdfPageModifierTool } from './components/tools/PdfPageModifierTool';
import { ImageConverterTool } from './components/tools/ImageConverterTool';
import { ImageCompressorTool } from './components/tools/ImageCompressorTool';
import { ImageResizerTool } from './components/tools/ImageResizerTool';
import { ImageCropperTool } from './components/tools/ImageCropperTool';
import { DocumentConverterTool } from './components/tools/DocumentConverterTool';
import { HomePage } from './pages/HomePage';
import { AllToolsPage } from './pages/AllToolsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';
import { GscGuidePage } from './pages/GscGuidePage';
import { FaqPage } from './pages/FaqPage';
import { TOOLS_DATA } from './data/toolsData';
import { useRecentHistory } from './hooks/useRecentHistory';
import { useFavorites } from './hooks/useFavorites';
import { useTheme } from './hooks/useTheme';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { isDark, toggleTheme } = useTheme();
  const { history, addRecord, removeRecord, clearHistory } = useRecentHistory();
  const { favorites, toggleFavorite } = useFavorites();
  const { user, isAdmin } = useAuth();

  const [route, setRoute] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash) {
      if (TOOLS_DATA.some((t) => t.slug === hash || t.id === hash)) {
        return `tool:${hash}`;
      }
      return hash;
    }
    return 'home';
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Sync hash with route for SEO-friendly URLs
  const navigate = (newRoute: string) => {
    setRoute(newRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (newRoute === 'home') {
      window.location.hash = '';
    } else if (newRoute.startsWith('tool:')) {
      const slug = newRoute.replace('tool:', '');
      window.location.hash = `/${slug}`;
    } else if (newRoute.startsWith('category:')) {
      const cat = newRoute.replace('category:', '');
      window.location.hash = `/category-${cat}`;
    } else {
      window.location.hash = `/${newRoute}`;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) {
        setRoute('home');
      } else if (TOOLS_DATA.some((t) => t.slug === hash || t.id === hash)) {
        setRoute(`tool:${hash}`);
      } else if (hash.startsWith('category-')) {
        setRoute(`category:${hash.replace('category-', '')}`);
      } else {
        setRoute(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dynamic document title
  useEffect(() => {
    if (route.startsWith('tool:')) {
      const slug = route.replace('tool:', '');
      const tool = TOOLS_DATA.find((t) => t.slug === slug || t.id === slug);
      if (tool) {
        document.title = `${tool.metaTitle} | FileMaster Tools`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', tool.metaDescription);
      }
    } else if (route === 'home') {
      document.title = 'FileMaster Tools - Convert, Compress, Merge & Manage Files Online';
    } else if (route === 'admin') {
      document.title = 'Administrator Console | FileMaster Tools';
    } else if (route === 'dashboard') {
      document.title = 'User Workspace Dashboard | FileMaster Tools';
    } else if (route === 'all') {
      document.title = 'All Online File Tools | FileMaster Tools';
    } else if (route.startsWith('category:')) {
      const cat = route.replace('category:', '');
      document.title = `${cat.toUpperCase()} Tools | FileMaster Tools`;
    } else if (route === 'cookies') {
      document.title = 'Cookie Policy | FileMaster Tools';
    } else if (route === 'gsc-guide') {
      document.title = 'Google Search Console Verification Guide | FileMaster Tools';
    } else {
      document.title = `${route.charAt(0).toUpperCase() + route.slice(1)} | FileMaster Tools`;
    }
  }, [route]);

  // Handle files dropped on hero
  const handleHeroFileDrop = (files: File[]) => {
    if (files.length === 0) return;
    const first = files[0];
    const ext = '.' + (first.name.split('.').pop() || '').toLowerCase();

    if (ext === '.pdf') {
      if (files.length > 1) {
        navigate('tool:merge-pdf');
      } else {
        navigate('tool:pdf-to-jpg');
      }
    } else if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      if (files.length > 1) {
        navigate('tool:jpg-to-pdf');
      } else {
        navigate('tool:image-compressor');
      }
    } else if (['.docx', '.doc'].includes(ext)) {
      navigate('tool:word-to-pdf');
    } else if (['.xlsx', '.xls', '.csv'].includes(ext)) {
      navigate('tool:excel-to-pdf');
    } else {
      navigate('tool:jpg-to-pdf');
    }
  };

  const renderContent = () => {
    // 1. Tool Page
    if (route.startsWith('tool:')) {
      const slug = route.replace('tool:', '');
      const tool = TOOLS_DATA.find((t) => t.slug === slug || t.id === slug);

      if (!tool) {
        return (
          <div className="mx-auto max-w-4xl py-20 text-center">
            <h2 className="text-2xl font-bold">Tool Not Found</h2>
            <p className="mt-2 text-sm text-slate-500">The requested tool does not exist.</p>
            <button
              onClick={() => navigate('all')}
              className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white"
            >
              Browse All Tools
            </button>
          </div>
        );
      }

      let toolComponent: React.ReactNode = null;

      switch (tool.id) {
        case 'jpg-to-pdf':
          toolComponent = <JpgToPdfTool acceptedFormats={['.jpg', '.jpeg']} onRecordHistory={addRecord} />;
          break;
        case 'png-to-pdf':
          toolComponent = <JpgToPdfTool acceptedFormats={['.png']} onRecordHistory={addRecord} />;
          break;
        case 'webp-to-pdf':
        case 'images-to-pdf':
        case 'image-to-pdf':
          toolComponent = <JpgToPdfTool acceptedFormats={['.jpg', '.jpeg', '.png', '.webp']} onRecordHistory={addRecord} />;
          break;
        case 'pdf-merge':
        case 'file-merger':
          toolComponent = <PdfMergeTool onRecordHistory={addRecord} />;
          break;
        case 'pdf-split':
        case 'pdf-extract-pages':
        case 'file-splitter':
          toolComponent = <PdfSplitTool onRecordHistory={addRecord} />;
          break;
        case 'pdf-to-jpg':
          toolComponent = <PdfToJpgTool format="image/jpeg" onRecordHistory={addRecord} />;
          break;
        case 'pdf-to-png':
        case 'pdf-to-webp':
          toolComponent = <PdfToJpgTool format="image/png" onRecordHistory={addRecord} />;
          break;
        case 'pdf-rotate':
          toolComponent = <PdfPageModifierTool mode="rotate" title="Rotate PDF" onRecordHistory={addRecord} />;
          break;
        case 'pdf-delete-pages':
          toolComponent = <PdfPageModifierTool mode="delete" title="Delete PDF Pages" onRecordHistory={addRecord} />;
          break;
        case 'pdf-watermark':
          toolComponent = <PdfPageModifierTool mode="watermark" title="Watermark PDF" onRecordHistory={addRecord} />;
          break;
        case 'pdf-reorder':
          toolComponent = <PdfPageModifierTool mode="rotate" title="Reorder PDF Pages" onRecordHistory={addRecord} />;
          break;
        case 'pdf-compress':
        case 'image-compressor':
        case 'general-compressor':
        case 'image-quality-optimizer':
          toolComponent = <ImageCompressorTool onRecordHistory={addRecord} />;
          break;
        case 'jpg-to-png':
          toolComponent = <ImageConverterTool sourceExt="jpg" targetExt="png" toolId="jpg-to-png" toolName="JPG to PNG" onRecordHistory={addRecord} />;
          break;
        case 'png-to-jpg':
          toolComponent = <ImageConverterTool sourceExt="png" targetExt="jpg" toolId="png-to-jpg" toolName="PNG to JPG" onRecordHistory={addRecord} />;
          break;
        case 'jpg-to-webp':
          toolComponent = <ImageConverterTool sourceExt="jpg" targetExt="webp" toolId="jpg-to-webp" toolName="JPG to WEBP" onRecordHistory={addRecord} />;
          break;
        case 'png-to-webp':
          toolComponent = <ImageConverterTool sourceExt="png" targetExt="webp" toolId="png-to-webp" toolName="PNG to WEBP" onRecordHistory={addRecord} />;
          break;
        case 'webp-to-jpg':
          toolComponent = <ImageConverterTool sourceExt="webp" targetExt="jpg" toolId="webp-to-jpg" toolName="WEBP to JPG" onRecordHistory={addRecord} />;
          break;
        case 'webp-to-png':
          toolComponent = <ImageConverterTool sourceExt="webp" targetExt="png" toolId="webp-to-png" toolName="WEBP to PNG" onRecordHistory={addRecord} />;
          break;
        case 'image-format-converter':
        case 'image-color-converter':
        case 'image-metadata-remover':
        case 'image-rotator':
        case 'image-flipper':
          toolComponent = <ImageConverterTool sourceExt="*" targetExt="png" toolId={tool.id} toolName={tool.name} onRecordHistory={addRecord} />;
          break;
        case 'image-resizer':
          toolComponent = <ImageResizerTool onRecordHistory={addRecord} />;
          break;
        case 'image-cropper':
          toolComponent = <ImageCropperTool onRecordHistory={addRecord} />;
          break;
        case 'docx-to-pdf':
        case 'doc-to-pdf':
          toolComponent = <DocumentConverterTool toolId="docx-to-pdf" toolName="Word to PDF" sourceExt={['.docx', '.doc']} targetFormat="PDF" onRecordHistory={addRecord} />;
          break;
        case 'excel-to-pdf':
        case 'xls-to-pdf':
          toolComponent = <DocumentConverterTool toolId="excel-to-pdf" toolName="Excel to PDF" sourceExt={['.xlsx', '.xls']} targetFormat="PDF" onRecordHistory={addRecord} />;
          break;
        case 'pptx-to-pdf':
        case 'ppt-to-pdf':
          toolComponent = <DocumentConverterTool toolId="pptx-to-pdf" toolName="PowerPoint to PDF" sourceExt={['.pptx', '.ppt']} targetFormat="PDF" onRecordHistory={addRecord} />;
          break;
        case 'pdf-to-word':
        case 'pdf-to-docx':
          toolComponent = <DocumentConverterTool toolId="pdf-to-word" toolName="PDF to Word" sourceExt={['.pdf']} targetFormat="DOCX" onRecordHistory={addRecord} />;
          break;
        case 'pdf-to-excel':
        case 'pdf-to-xlsx':
          toolComponent = <DocumentConverterTool toolId="pdf-to-excel" toolName="PDF to Excel" sourceExt={['.pdf']} targetFormat="XLSX" onRecordHistory={addRecord} />;
          break;
        case 'txt-to-pdf':
        case 'markdown-to-pdf':
        case 'pdf-to-text':
          toolComponent = <DocumentConverterTool toolId={tool.id} toolName={tool.name} sourceExt={['.txt', '.md', '.pdf']} targetFormat="PDF" isClientSide={true} onRecordHistory={addRecord} />;
          break;
        case 'csv-to-xlsx':
          toolComponent = <DocumentConverterTool toolId="csv-to-xlsx" toolName="CSV to XLSX" sourceExt={['.csv']} targetFormat="XLSX" isClientSide={true} onRecordHistory={addRecord} />;
          break;
        case 'zip-creator':
        case 'zip-extractor':
        case 'file-renamer':
        case 'file-metadata-viewer':
        case 'file-hash-generator':
        case 'base64-encoder':
        case 'base64-decoder':
          toolComponent = <DocumentConverterTool toolId={tool.id} toolName={tool.name} sourceExt={['*']} targetFormat="ZIP" isClientSide={true} onRecordHistory={addRecord} />;
          break;
        default:
          toolComponent = <JpgToPdfTool onRecordHistory={addRecord} />;
          break;
      }

      return (
        <ToolLayout tool={tool} onNavigate={navigate} onOpenPricing={() => setIsPricingOpen(true)}>
          {toolComponent}
        </ToolLayout>
      );
    }

    // 2. Category Pages
    if (route.startsWith('category:')) {
      const cat = route.replace('category:', '');
      return (
        <AllToolsPage
          onNavigate={navigate}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          initialCategory={cat}
        />
      );
    }

    // 3. Application Pages
    switch (route) {
      case 'all':
        return (
          <AllToolsPage
            onNavigate={navigate}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            initialCategory="all"
          />
        );
      case 'dashboard':
        return (
          <DashboardPage
            history={history}
            onClearHistory={clearHistory}
            onRemoveHistoryItem={removeRecord}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onNavigate={navigate}
            onOpenPricing={() => setIsPricingOpen(true)}
          />
        );
      case 'admin':
        return (
          <AdminPage
            onNavigate={navigate}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        );
      case 'about':
        return <AboutPage onNavigate={navigate} />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'terms':
        return <TermsPage />;
      case 'cookies':
        return <CookiePolicyPage />;
      case 'gsc-guide':
        return <GscGuidePage />;
      case 'faq':
        return <FaqPage />;
      case 'home':
      default:
        return (
          <HomePage
            onNavigate={navigate}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onFileDropToTool={handleHeroFileDrop}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-150">
      <Header
        currentRoute={route}
        onNavigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onQuickUpload={() => navigate('tool:jpg-to-pdf')}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1">
        {renderContent()}
      </main>

      <Footer onNavigate={navigate} />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTool={(slug) => navigate(`tool:${slug}`)}
      />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
