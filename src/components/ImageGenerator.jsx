import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, Wand2, Download, Image as ImageIcon } from 'lucide-react';

const DEFAULT_GEMINI_API_KEY = 'AIzaSyD0GkKNCGwBqU9MfKaiO02OA8Eyc5-rTQg';

function classNames(...c) {
  return c.filter(Boolean).join(' ');
}

function ImageGenerator({ onGenerated, onUpload }) {
  const [prompt, setPrompt] = useState('a futuristic neon cityscape at night, cinematic, ultra-detailed, 4k');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastImage, setLastImage] = useState(null);
  const [size, setSize] = useState('768');
  const fileInputRef = useRef(null);

  const sizeNum = useMemo(() => parseInt(size, 10) || 768, [size]);

  async function handleGenerate(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&width=${sizeNum}&height=${sizeNum}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to generate image');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setLastImage(objectUrl);
      onGenerated?.(objectUrl);
    } catch (err) {
      setError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadFile(file) {
    if (!file) return;
    setError('');
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result;
        setLastImage(src);
        onUpload?.(src);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to load image');
    }
  }

  useEffect(() => {
    return () => {
      if (lastImage && lastImage.startsWith('blob:')) URL.revokeObjectURL(lastImage);
    };
  }, [lastImage]);

  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:p-6">
      <div className="flex items-start gap-6 flex-col lg:flex-row">
        <form onSubmit={handleGenerate} className="flex-1 w-full">
          <label className="block text-sm text-white/70 mb-2">Describe your image</label>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. a serene watercolor landscape, pastel tones"
              className="flex-1 rounded-lg bg-neutral-900 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
              required
            />
            <div className="flex gap-3">
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="rounded-lg bg-neutral-900 border border-white/10 px-3 py-3 text-sm"
                title="Size"
              >
                <option value="512">512x512</option>
                <option value="640">640x640</option>
                <option value="768">768x768</option>
                <option value="1024">1024x1024</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className={classNames(
                  'inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-4 py-3 text-sm font-medium shadow hover:opacity-95 transition disabled:opacity-50',
                )}
                aria-label="Generate image"
              >
                <Wand2 className="h-4 w-4" />
                {loading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}

          <p className="mt-3 text-xs text-white/40">
            Tip: You can include styles like "cinematic, photorealistic, watercolor, low-poly, studio lighting".
          </p>
        </form>

        <div className="w-full lg:w-[380px] flex-shrink-0">
          <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-white/80">
                <ImageIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Start with an image</span>
              </div>
            </div>

            <div className="grid gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 text-sm hover:bg-neutral-700/60 transition"
              >
                <Upload className="h-4 w-4" /> Upload image to edit
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUploadFile(e.target.files?.[0])}
              />

              {lastImage && (
                <a
                  href={lastImage}
                  download
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 text-sm hover:bg-neutral-700/60 transition"
                >
                  <Download className="h-4 w-4" /> Download last image
                </a>
              )}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-neutral-800/60 border border-white/10 text-xs text-white/60">
              API key is pre-configured for advanced features. For best results, use detailed prompts and specify styles and lighting.
            </div>
          </div>
        </div>
      </div>

      <input type="hidden" name="geminiApiKey" value={DEFAULT_GEMINI_API_KEY} />
    </div>
  );
}

export default ImageGenerator;
