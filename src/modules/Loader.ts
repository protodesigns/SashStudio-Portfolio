export class Loader {
  private el = document.getElementById('loader');
  private pctEl = document.getElementById('loader-pct');
  private barEl = document.getElementById('loader-bar');
  private statEl = document.getElementById('loader-status');
  private waterRect = document.getElementById('waterRect');
  private lensWRect = document.getElementById('lensWaterRect');
  
  private displayPct = 0;
  private targetPct = 0;
  private rafId: number | null = null;
  private dismissed = false;
  private startTime = performance.now();
  private readonly statuses = ['Initialising', 'Loading assets', 'Rendering frames', 'Compositing', 'Almost ready'];
  private statIdx = 0;

  constructor() {
    this.tick();
  }

  public updateProgress(target: number): void {
    this.targetPct = Math.min(100, Math.max(this.targetPct, target));
  }

  public requestDismiss(minDuration: number): void {
    if (this.dismissed) return;
    const elapsed = performance.now() - this.startTime;
    if (elapsed >= minDuration) {
      this.runDismiss();
    } else {
      this.animateToHundred(minDuration - elapsed);
    }
  }

  private setDisplay(pct: number): void {
    if (!this.pctEl || !this.barEl) return;
    const p = Math.round(Math.max(0, Math.min(100, pct)));
    this.pctEl.textContent = `${p}%`;
    this.barEl.style.width = `${p}%`;
    
    if (this.waterRect && this.lensWRect) {
      const bH = (135 * p / 100);
      this.waterRect.setAttribute('y', String(180 - bH));
      this.waterRect.setAttribute('height', String(bH));
      const lH = (104 * p / 100);
      this.lensWRect.setAttribute('y', String(167 - lH));
      this.lensWRect.setAttribute('height', String(lH));
    }

    if (this.statEl) {
      const newIdx = Math.min(this.statuses.length - 1, Math.floor(p / 22));
      if (newIdx !== this.statIdx) {
        this.statIdx = newIdx;
        this.statEl.style.opacity = '0';
        setTimeout(() => {
          if(this.statEl) {
            this.statEl.textContent = this.statuses[this.statIdx];
            this.statEl.style.opacity = '1';
          }
        }, 200);
      }
    }
  }

  private tick = (): void => {
    const gap = this.targetPct - this.displayPct;
    if (gap > 0.05) {
      const speed = Math.max(0.08, Math.min(1.2, gap * 0.045));
      this.displayPct = Math.min(this.displayPct + speed, this.targetPct);
      this.setDisplay(this.displayPct);
    }
    this.rafId = requestAnimationFrame(this.tick);
  }

  private animateToHundred(duration: number): void {
    const startPct = this.displayPct;
    const startT = performance.now();
    if (this.rafId) cancelAnimationFrame(this.rafId);
    
    const tickHundred = () => {
      const t = Math.min(1, (performance.now() - startT) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      this.setDisplay(startPct + (100 - startPct) * ease);
      if (t < 1) requestAnimationFrame(tickHundred);
      else { this.setDisplay(100); setTimeout(() => this.runDismiss(), 200); }
    };
    requestAnimationFrame(tickHundred);
  }

  public runDismiss(): void {
    if (this.dismissed) return;
    this.dismissed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.setDisplay(100);
    
    if (this.statEl) {
      this.statEl.style.opacity = '0';
      setTimeout(() => { if(this.statEl) { this.statEl.textContent = 'Ready'; this.statEl.style.opacity = '1'; } }, 150);
    }
    setTimeout(() => {
      if (this.el) this.el.classList.add('done');
      document.body.classList.remove('loading');
      setTimeout(() => this.el?.remove(), 1000);
    }, 500);
  }
}