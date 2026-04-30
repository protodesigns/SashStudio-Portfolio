import { Gallery } from './Gallery';

export class Lightbox {
  private lb = document.getElementById('lb');
  private img = document.getElementById('lb-img') as HTMLImageElement;
  private ctr = document.getElementById('lb-ctr');
  private currentIndex = 0;
  private tsx = 0;
  private tsy = 0;

  constructor(private gallery: Gallery) {}

  init(): void {
    if (!this.lb || !this.img) return;
    this.img.style.transition = 'opacity .15s';
    
    document.getElementById('lb-close')?.addEventListener('click', () => this.close());
    document.getElementById('lb-prev')?.addEventListener('click', (e) => { e.stopPropagation(); this.go(-1); });
    document.getElementById('lb-next')?.addEventListener('click', (e) => { e.stopPropagation(); this.go(1); });
    this.lb.addEventListener('click', e => { if (e.target === this.lb) this.close(); });
    this.img.addEventListener('contextmenu', e => e.preventDefault());

    document.querySelectorAll('.collage-item').forEach((item, i) => {
      item.addEventListener('click', () => this.open(i));
      item.addEventListener('keydown', (e: any) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.open(i); } });
    });

    this.bindKeyboardAndTouch();
  }

  private open(i: number): void {
    if (!this.lb || !this.img || this.gallery.images.length === 0) return;
    this.currentIndex = i;
    this.updateContent();
    this.lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  private close(): void {
    if (!this.lb) return;
    this.lb.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { if (this.img) { this.img.src = ''; this.img.alt = ''; } }, 400);
  }

  private go(dir: number): void {
    const total = this.gallery.images.length;
    if (total === 0) return;
    this.currentIndex = (this.currentIndex + dir + total) % total;
    this.img.style.opacity = '0';
    setTimeout(() => { this.updateContent(); this.img.style.opacity = '1'; }, 150);
  }

  private updateContent(): void {
    const total = this.gallery.images.length;
    this.img.src = this.gallery.images[this.currentIndex];
    this.img.alt = `Portfolio piece ${this.currentIndex + 1} of ${total}`;
    if (this.ctr) this.ctr.textContent = `${this.currentIndex + 1} / ${total}`;
  }

  private bindKeyboardAndTouch(): void {
    document.addEventListener('keydown', e => {
      if (!this.lb?.classList.contains('open')) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.go(-1);
      if (e.key === 'ArrowRight') this.go(1);
    });

    this.lb?.addEventListener('touchstart', e => { this.tsx = e.touches[0].clientX; this.tsy = e.touches[0].clientY; }, { passive: true });
    this.lb?.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - this.tsx;
      const dy = e.changedTouches[0].clientY - this.tsy;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) this.go(dx < 0 ? 1 : -1);
      else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) this.close();
    }, { passive: true });
  }
}