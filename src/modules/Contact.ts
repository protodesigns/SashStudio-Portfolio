import { AppConfig } from '../config';

export class ContactForm {
  private btn = document.getElementById('send-btn') as HTMLButtonElement;
  private name = document.getElementById('f-name') as HTMLInputElement;
  private email = document.getElementById('f-email') as HTMLInputElement;
  private msg = document.getElementById('f-msg') as HTMLTextAreaElement;
  private consent = document.getElementById('f-consent') as HTMLInputElement;
  private status = document.getElementById('form-status') as HTMLDivElement;

  private blockedDomains = [
    'mailinator.com', 'yopmail.com', 'tempmail.com', '10minutemail.com',
    'guerrillamail.com', 'sharklasers.com', 'dropmail.me', 'throwawaymail.com',
    'temp-mail.org', 'fakeinbox.com', 'trashmail.com', 'dispostable.com',
    'getairmail.com', 'tempmailaddress.com', 'nada.ltd'
  ];

  private readonly MAX_STRIKES = 3;
  private readonly LOCKOUT_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  init(): void {
    if (!this.btn || !this.name || !this.email || !this.msg || !this.consent || !this.status) return;

    // Check if the user is already locked out when they load the page
    this.checkLockoutStatus();

    this.btn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      // 1. Enforce Lockout
      if (this.isLockedOut()) {
        this.setStatus('var(--pink)', 'SECURITY LOCK: You have been blocked for 24 hours due to repeated spam attempts.');
        return;
      }

      // 2. Extract values
      const nameVal = this.name.value.trim();
      const emailVal = this.email.value.trim().toLowerCase();
      const msgVal = this.msg.value.trim();

      // 3. Basic Validation
      if (!nameVal || !emailVal || !msgVal) {
        this.setStatus('var(--pink)', 'Please fill in all text fields.');
        return;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        this.setStatus('var(--pink)', 'Please enter a valid email address.');
        return;
      }

      // 4. Strict Consent Validation
      if (!this.consent.checked) {
        this.setStatus('var(--pink)', 'You must agree to the anti-spam policy to proceed.');
        return;
      }

      // 5. reCAPTCHA Validation
      // @ts-ignore - Ignoring TS error for global grecaptcha object
      const recaptchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';
      if (!recaptchaResponse) {
        this.setStatus('var(--pink)', 'Please complete the reCAPTCHA verification.');
        return;
      }

      // 6. Fake Email Domain Check & Strike System
      const domain = emailVal.split('@')[1];
      if (this.blockedDomains.includes(domain)) {
        this.addStrike();
        const strikes = this.getStrikes();
        
        if (strikes >= this.MAX_STRIKES) {
          this.lockUserOut();
          this.setStatus('var(--pink)', 'SECURITY LOCK ACTIVATED: You are blocked for 24 hours for violating anti-spam policies.');
          this.disableForm();
        } else {
          this.setStatus('var(--pink)', `WARNING: Fake/temp emails are banned. Strike ${strikes}/${this.MAX_STRIKES}. Continued attempts will result in a 24-hour block.`);
        }
        
        // @ts-ignore - Reset recaptcha so they have to do it again
        if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        return;
      }

      // 7. Proceed to Send
      this.btn.textContent = 'Sending...';
      this.btn.style.opacity = '0.65';
      this.btn.disabled = true;
      this.status.textContent = '';

      try {
        const res = await fetch(AppConfig.endpoints.contactForm, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name: nameVal, email: emailVal, message: msgVal })
        });

        if (!res.ok) throw new Error('Server error');

        this.setStatus('var(--cyan)', 'Message sent securely. I will be in touch shortly.');
        this.name.value = ''; this.email.value = ''; this.msg.value = ''; this.consent.checked = false;
        // @ts-ignore
        if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        
        this.btn.textContent = 'Sent';
        this.btn.style.background = 'linear-gradient(135deg, var(--teal), var(--cyan))';
        
      } catch {
        this.setStatus('var(--pink)', 'Server error. Please try again later.');
        this.btn.textContent = 'Send Message';
        this.btn.style.opacity = '1';
        this.btn.disabled = false;
      }
    });
  }

  // --- SECURITY LOGIC ---

  private setStatus(color: string, text: string): void {
    this.status.style.color = color;
    this.status.textContent = text;
  }

  private getStrikes(): number {
    return parseInt(localStorage.getItem('sash_spam_strikes') || '0', 10);
  }

  private addStrike(): void {
    const current = this.getStrikes();
    localStorage.setItem('sash_spam_strikes', (current + 1).toString());
  }

  private lockUserOut(): void {
    const unlockTime = new Date().getTime() + this.LOCKOUT_TIME;
    localStorage.setItem('sash_spam_lock', unlockTime.toString());
  }

  private isLockedOut(): boolean {
    const lockTime = localStorage.getItem('sash_spam_lock');
    if (!lockTime) return false;

    if (new Date().getTime() > parseInt(lockTime, 10)) {
      // Time has passed, lift the ban and reset strikes
      localStorage.removeItem('sash_spam_lock');
      localStorage.setItem('sash_spam_strikes', '0');
      return false;
    }
    return true;
  }

  private checkLockoutStatus(): void {
    if (this.isLockedOut()) {
      this.setStatus('var(--pink)', 'SECURITY LOCK: You are currently blocked for 24 hours.');
      this.disableForm();
    }
  }

  private disableForm(): void {
    this.name.disabled = true;
    this.email.disabled = true;
    this.msg.disabled = true;
    this.consent.disabled = true;
    this.btn.disabled = true;
    this.btn.style.opacity = '0.3';
    this.btn.style.cursor = 'not-allowed';
  }
}