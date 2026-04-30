import './style.css'; 
import { AppConfig } from './config';
import { Loader } from './modules/Loader';
import { Gallery } from './modules/Gallery';
import { Lightbox } from './modules/Lightbox';
import { ContactForm } from './modules/Contact';
import { initUI } from './modules/UI';

document.addEventListener('DOMContentLoaded', () => {
  const loader = new Loader();
  const gallery = new Gallery();
  const lightbox = new Lightbox(gallery);
  const contact = new ContactForm();

  let loadedCount = 0;
  
  const triggerFailsafeDismiss = () => {
    loader.requestDismiss(AppConfig.timeouts.loaderMin);
  };

  const handleImageLoadTick = () => {
    loadedCount++;
    if (gallery.images.length > 0) {
      loader.updateProgress((loadedCount / gallery.images.length) * 95);
    }
    if (loadedCount >= gallery.images.length) {
      triggerFailsafeDismiss();
    }
  };

  setTimeout(triggerFailsafeDismiss, AppConfig.timeouts.loaderFailsafe);

  gallery.init(triggerFailsafeDismiss, handleImageLoadTick).then(() => {
    lightbox.init();
  });
  
  initUI();
  contact.init();
});