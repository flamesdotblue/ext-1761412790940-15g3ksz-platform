import { useEffect, useRef, useState } from 'react';
import { Brush, Eraser, RotateCcw, Download } from 'lucide-react';

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function ImageEditor({ src, onReset, isActive }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const [imgEl] = useState(() => new Image());
  const [dims, setDims] = useState({ w: 768, h: 768 });

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);

  const [brushColor, setBrushColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(10);
  const [isErasing, setIsErasing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!src) return;
    imgEl.crossOrigin = 'anonymous';
    imgEl.onload = () => {
      const maxSide = 1024;
      const ratio = imgEl.width / imgEl.height;
      let w = imgEl.width;
      let h = imgEl.height;
      if (w > h && w > maxSide) { h = Math.round((maxSide / w) * h); w = maxSide; }
      if (h >= w && h > maxSide) { w = Math.round((maxSide / h) * w); h = maxSide; }
      setDims({ w, h });
      drawBase(w, h);
    };
    imgEl.src = src;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    if (!src) return;
    drawBase(dims.w, dims.h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brightness, contrast, saturation, blur, dims.w, dims.h]);

  function getCtx() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }

  function drawBase(w, h) {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay || !imgEl) return;
    canvas.width = w; canvas.height = h; overlay.width = w; overlay.height = h;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    const filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
    ctx.filter = filter;
    ctx.drawImage(imgEl, 0, 0, w, h);
    // reset filter for overlay
    overlay.getContext('2d').globalCompositeOperation = 'source-over';
  }

  function pointerPos(e) {
    const rect = overlayRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (overlayRef.current.width / rect.width);
    const y = (e.clientY - rect.top) * (overlayRef.current.height / rect.height);
    return { x, y };
  }

  function onPointerDown(e) {
    if (!src) return;
    setIsDrawing(true);
    const ctx = overlayRef.current.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = clamp(brushSize, 1, 200);
    ctx.strokeStyle = isErasing ? 'rgba(0,0,0,1)' : brushColor;
    ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
    const { x, y } = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function onPointerMove(e) {
    if (!isDrawing) return;
    const ctx = overlayRef.current.getContext('2d');
    const { x, y } = pointerPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function onPointerUp() { setIsDrawing(false); }

  function resetEdits() {
    setBrightness(100); setContrast(100); setSaturation(100); setBlur(0);
    setBrushColor('#ffffff'); setBrushSize(10); setIsErasing(false);
    if (src) drawBase(dims.w, dims.h);
    const octx = overlayRef.current?.getContext('2d');
    if (octx) octx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    onReset?.();
  }

  function download() {
    if (!src) return;
    const out = document.createElement('canvas');
    out.width = dims.w; out.height = dims.h;
    const ctx = out.getContext('2d');

    // base with filters
    const base = canvasRef.current;
    ctx.drawImage(base, 0, 0);
    // overlay strokes
    const overlay = overlayRef.current;
    ctx.drawImage(overlay, 0, 0);

    const link = document.createElement('a');
    link.download = 'ai-image.png';
    link.href = out.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-white/80 font-medium">Editor</div>
        <div className="flex items-center gap-2">
          <button
            onClick={download}
            disabled={!src}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700/60 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Download image
          </button>
          <button
            onClick={resetEdits}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700/60"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      {!src && (
        <div className="aspect-video w-full rounded-xl border border-dashed border-white/10 grid place-items-center text-white/50">
          Upload or generate an image to start editing.
        </div>
      )}

      {src && (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="w-full overflow-auto">
            <div className="inline-block rounded-xl border border-white/10 bg-neutral-900/50 p-2">
              <div className="relative" style={{ width: dims.w + 'px' }}>
                <canvas ref={canvasRef} className="block max-w-full rounded-lg" />
                <canvas
                  ref={overlayRef}
                  className="absolute inset-0 cursor-crosshair"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerLeave={onPointerUp}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
            <div className="text-sm font-medium text-white/80 mb-4">Adjustments</div>
            <div className="space-y-4">
              <Control label="Brightness" value={brightness} min={0} max={200} onChange={setBrightness} />
              <Control label="Contrast" value={contrast} min={0} max={200} onChange={setContrast} />
              <Control label="Saturation" value={saturation} min={0} max={200} onChange={setSaturation} />
              <Control label="Blur" value={blur} min={0} max={20} onChange={setBlur} />
            </div>

            <div className="h-px bg-white/10 my-4" />

            <div className="text-sm font-medium text-white/80 mb-3">Brush</div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-white/60 flex flex-col gap-2">
                Color
                <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="h-10 w-full rounded border border-white/10 bg-neutral-800 p-1" />
              </label>
              <label className="text-xs text-white/60 flex flex-col gap-2">
                Size
                <input type="range" min={1} max={80} value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value, 10))} />
              </label>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => setIsErasing(false)}
                className={`inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm ${!isErasing ? 'bg-fuchsia-600/20' : 'bg-neutral-800 hover:bg-neutral-700/60'}`}
              >
                <Brush className="h-4 w-4" /> Draw
              </button>
              <button
                onClick={() => setIsErasing(true)}
                className={`inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm ${isErasing ? 'bg-fuchsia-600/20' : 'bg-neutral-800 hover:bg-neutral-700/60'}`}
              >
                <Eraser className="h-4 w-4" /> Erase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Control({ label, value, min, max, onChange }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between text-xs text-white/60 mb-1">
        <span>{label}</span>
        <span className="text-white/50">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full"
      />
    </label>
  );
}

export default ImageEditor;
