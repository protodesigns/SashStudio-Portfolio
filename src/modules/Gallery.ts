import { AppConfig } from '../config';

interface CloudinaryResource { public_id: string; }
interface CloudinaryResponse { resources: CloudinaryResource[]; }

export class Gallery {
  private container = document.getElementById('collage');
  public images: string[] = [];

  async init(onLoadComplete: () => void, onImageLoadTick: () => void): Promise<void> {
    if (!this.container) return;

    try {
      const res = await fetch(AppConfig.endpoints.galleryList());
      if (!res.ok) throw new Error('Network error');
      
      const data: CloudinaryResponse = await res.json();
      this.images = (data.resources || []).map(r => AppConfig.endpoints.galleryImg(r.public_id));

      if (this.images.length === 0) { onLoadComplete(); return; }

      const fragment = document.createDocumentFragment();
      this.images.forEach((src, i) => {
        const item = this.createItem(src, i, onImageLoadTick);
        fragment.appendChild(item);
      });
      this.container.appendChild(fragment);

    } catch (err) {
      console.warn('Gallery initialization failed.', err);
      this.container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--muted); padding: 2rem; border: 1px dashed var(--glass-b); border-radius: 12px;">Unable to load gallery. Please try again later.</div>`;
      onLoadComplete();
    }
  }

  private createItem(src: string, index: number, onTick: () => void): HTMLDivElement {
    const div = document.createElement('div');
    div.className = 'collage-item';
    div.tabIndex = 0;
    div.setAttribute('aria-label', `View image ${index + 1}`);

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.draggable = false;
    img.src = src;
    img.onload = () => { div.classList.add('loaded'); onTick(); };
    img.onerror = () => { div.classList.add('loaded'); onTick(); };

    const overlay = document.createElement('div');
    overlay.className = 'collage-overlay';
    
    div.append(img, overlay);
    return div;
  }
}