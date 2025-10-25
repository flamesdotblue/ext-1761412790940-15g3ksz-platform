import Spline from '@splinetool/react-spline';

function Hero() {
  return (
    <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(1200px_600px_at_50%_20%,rgba(168,85,247,0.20),transparent_55%),radial-gradient(800px_400px_at_20%_70%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(800px_400px_at_80%_70%,rgba(251,146,60,0.18),transparent_60%)]" />

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight">
              Create and edit stunning images with AI
            </h1>
            <p className="mt-4 text-white/70 max-w-xl">
              Type a prompt to generate images, or upload your own to enhance, filter, and refine. Download in one click.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
