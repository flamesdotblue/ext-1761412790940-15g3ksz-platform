import { useState } from 'react';
import Hero from './components/Hero';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import Footer from './components/Footer';

function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/70 bg-neutral-950/60 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-fuchsia-500 via-indigo-500 to-orange-400" />
            <span className="font-semibold tracking-tight">Auralens AI</span>
          </div>
          <nav className="text-sm text-white/70">AI Image Generator & Editor</nav>
        </div>
      </header>

      <main className="flex-1">
        <Hero />

        <section className="max-w-7xl mx-auto px-4 py-10">
          <ImageGenerator
            onGenerated={(src) => {
              setImageSrc(src);
              setIsEditing(true);
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }}
            onUpload={(src) => {
              setImageSrc(src);
              setIsEditing(true);
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }}
          />
        </section>

        <section className="max-w-7xl mx-auto px-4 pb-16">
          <ImageEditor
            src={imageSrc}
            onReset={() => setImageSrc(null)}
            isActive={isEditing}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
