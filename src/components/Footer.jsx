function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-neutral-950/60">
      <div className="max-w-7xl mx-auto px-4 py-10 grid gap-3 md:flex md:items-center md:justify-between text-sm text-white/60">
        <p>© {new Date().getFullYear()} Auralens AI. All rights reserved.</p>
        <p>
          Built with React + Tailwind. 3D aura by Spline.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
