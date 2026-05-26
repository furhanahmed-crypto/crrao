/* ============================================================
   CR Rao AIMSCS — Main JavaScript
   ============================================================ */

   'use strict';

   /* ── Navbar ── */
   (function initNavbar() {
     const header  = document.getElementById('siteHeader');
     const navbar  = document.getElementById('navbar');
     const toggle  = document.getElementById('navToggle');
     const mobileMenu = document.getElementById('mobileMenu');
     const overlay = document.getElementById('mobileOverlay');
     const mobileClose = document.getElementById('mobileClose');
     const backTop = document.getElementById('backToTop');
   
     if (!navbar) return;
   
     /* Scroll state */
     let ticking = false;
     function onScroll() {
       if (!ticking) {
         requestAnimationFrame(() => {
           const scrolled = window.scrollY > 60;
           if (header) header.classList.toggle('scrolled', scrolled);
           else navbar.classList.toggle('scrolled', scrolled);
           if (backTop) backTop.classList.toggle('visible', window.scrollY > 400);
           ticking = false;
         });
         ticking = true;
       }
     }
     window.addEventListener('scroll', onScroll, { passive: true });
   
     /* Mobile menu */
     function openMenu() {
       mobileMenu?.classList.add('open');
       overlay?.classList.add('open');
       toggle?.classList.add('open');
       document.body.style.overflow = 'hidden';
     }
     function closeMenu() {
       mobileMenu?.classList.remove('open');
       overlay?.classList.remove('open');
       toggle?.classList.remove('open');
       document.body.style.overflow = '';
     }
   
     toggle?.addEventListener('click', () => {
       mobileMenu?.classList.contains('open') ? closeMenu() : openMenu();
     });
     mobileClose?.addEventListener('click', closeMenu);
     overlay?.addEventListener('click', closeMenu);
   
     /* Mobile accordion sub-menus */
     document.querySelectorAll('.mobile-nav-link[data-toggle]').forEach(link => {
       link.addEventListener('click', () => {
         const id   = link.dataset.toggle;
         const sub  = document.getElementById(id);
         const icon = link.querySelector('svg');
         if (!sub) return;
         const isOpen = sub.classList.contains('open');
         document.querySelectorAll('.mobile-sub-links').forEach(el => el.classList.remove('open'));
         if (!isOpen) sub.classList.add('open');
       });
     });
   
     /* Back to top */
     backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
   })();
   
   /* ── Counter Animation ── */
   (function initCounters() {
     const counters = document.querySelectorAll('[data-count]');
     if (!counters.length) return;
   
     function animateCount(el) {
       const target   = parseFloat(el.dataset.count);
       const suffix   = el.dataset.suffix || '';
       const prefix   = el.dataset.prefix || '';
       const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
       const duration = 1800;
       const start    = performance.now();
   
       function update(now) {
         const elapsed = now - start;
         const progress = Math.min(elapsed / duration, 1);
         const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
         const current = target * eased;
   
         el.textContent = prefix + current.toFixed(decimals) + suffix;
         if (progress < 1) requestAnimationFrame(update);
         else el.textContent = prefix + target.toFixed(decimals) + suffix;
       }
       requestAnimationFrame(update);
     }
   
     const observer = new IntersectionObserver(entries => {
       entries.forEach(e => {
         if (e.isIntersecting && !e.target.dataset.counted) {
           e.target.dataset.counted = '1';
           animateCount(e.target);
         }
       });
     }, { threshold: 0.5 });
   
     counters.forEach(el => observer.observe(el));
   })();
   
   /* ── News Tabs ── */
   (function initTabs() {
     const tabs   = document.querySelectorAll('.news-tab');
     const panels = document.querySelectorAll('.news-panel');
     if (!tabs.length) return;
   
     tabs.forEach(tab => {
       tab.addEventListener('click', () => {
         const target = tab.dataset.tab;
         tabs.forEach(t   => t.classList.toggle('active', t === tab));
         panels.forEach(p => p.classList.toggle('active', p.id === target));
       });
     });
   })();
   
   /* ── Form Validation ── */
   (function initForms() {
     const forms = document.querySelectorAll('form[data-validate]');
   
     function validateField(input) {
       const val = input.value.trim();
       let msg = '';
   
       if (input.required && !val) {
         msg = 'This field is required.';
       } else if (input.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
         msg = 'Enter a valid email address.';
       } else if (input.type === 'tel' && val && !/^[6-9]\d{9}$/.test(val.replace(/\s/g, ''))) {
         msg = 'Enter a valid 10-digit mobile number.';
       }
   
       const errEl = input.parentElement.querySelector('.form-error');
       if (msg) {
         input.classList.add('error');
         if (!errEl) {
           const span = document.createElement('span');
           span.className = 'form-error';
           span.style.cssText = 'font-size:0.75rem;color:#dc2626;margin-top:4px;display:block;';
           span.textContent = msg;
           input.parentElement.appendChild(span);
         } else {
           errEl.textContent = msg;
         }
       } else {
         input.classList.remove('error');
         errEl?.remove();
       }
       return !msg;
     }
   
     forms.forEach(form => {
       const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
   
       inputs.forEach(input => {
         input.addEventListener('blur', () => validateField(input));
         input.addEventListener('input', () => {
           if (input.classList.contains('error')) validateField(input);
         });
       });
   
       form.addEventListener('submit', e => {
         e.preventDefault();
         let valid = true;
         inputs.forEach(input => { if (!validateField(input)) valid = false; });
         if (!valid) return;
   
         /* Submit to Google Forms / show success */
         const btn = form.querySelector('[type="submit"]');
         const orig = btn.textContent;
         btn.textContent = 'Submitting…';
         btn.disabled = true;
   
         /* Replace with actual Google Forms action URL */
         const gFormURL = form.dataset.action || '#';
         if (gFormURL !== '#') {
           const data = new FormData(form);
           fetch(gFormURL, { method: 'POST', body: data, mode: 'no-cors' })
             .then(() => showSuccess(form, btn, orig))
             .catch(() => showSuccess(form, btn, orig));
         } else {
           setTimeout(() => showSuccess(form, btn, orig), 800);
         }
       });
     });
   
     function showSuccess(form, btn, orig) {
       btn.textContent = orig;
       btn.disabled = false;
       const success = document.createElement('div');
       success.innerHTML = `
         <div style="text-align:center;padding:1.5rem;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;margin-top:1rem;">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" style="margin:0 auto 0.5rem;display:block;">
             <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
           </svg>
           <p style="font-weight:700;color:#15803d;font-family:'Outfit',sans-serif;margin:0 0 0.25rem;">
             Enquiry Submitted!
           </p>
           <p style="font-size:0.85rem;color:#166534;margin:0;">
             Our admissions team will contact you within 24 hours.
           </p>
         </div>`;
       form.parentElement.appendChild(success.firstElementChild);
       form.reset();
       setTimeout(() => {
         success.firstElementChild?.remove();
       }, 6000);
     }
   })();
   
   /* ── Smooth scroll for anchor links ── */
   document.querySelectorAll('a[href^="#"]').forEach(anchor => {
     anchor.addEventListener('click', function(e) {
       const id = this.getAttribute('href').slice(1);
       if (!id) return;
       const target = document.getElementById(id);
       if (target) {
         e.preventDefault();
         const offset = 80;
         const top = target.getBoundingClientRect().top + window.scrollY - offset;
         window.scrollTo({ top, behavior: 'smooth' });
       }
     });
   });
   
   /* ── AOS (Animate On Scroll) init ── */
   document.addEventListener('DOMContentLoaded', () => {
     if (typeof AOS !== 'undefined') {
       AOS.init({
         duration: 700,
         easing: 'ease-out-cubic',
         once: true,
         offset: 60,
         delay: 0,
       });
     }
   });
   
   /* ── Phone number formatter ── */
   document.querySelectorAll('input[type="tel"]').forEach(input => {
     input.addEventListener('input', function() {
       this.value = this.value.replace(/[^\d]/g, '').slice(0, 10);
     });
   });
   
   /* ── Announcement Banner Slider ── */
   (function initBannerSlider() {
     const slider = document.getElementById('bannerSlider');
     if (!slider) return;
   
     const slides   = slider.querySelectorAll('.banner-slide');
     const dots     = slider.querySelectorAll('.banner-dot');
     const prevBtn  = slider.querySelector('.banner-arrow.prev');
     const nextBtn  = slider.querySelector('.banner-arrow.next');
     const progress = slider.querySelector('.banner-progress');
   
     if (!slides.length) return;
   
     const INTERVAL = 6000;
     let current = 0;
     let timer = null;
     let progTimer = null;
     let progStart = 0;
   
     function show(idx) {
       current = (idx + slides.length) % slides.length;
       slides.forEach((s, i) => s.classList.toggle('active', i === current));
       dots.forEach((d, i) => d.classList.toggle('active', i === current));
       resetProgress();
     }
     function next() { show(current + 1); }
     function prev() { show(current - 1); }
   
     function resetProgress() {
       if (!progress) return;
       cancelAnimationFrame(progTimer);
       progStart = performance.now();
       progress.style.width = '0%';
       function step(t) {
         const pct = Math.min(100, ((t - progStart) / INTERVAL) * 100);
         progress.style.width = pct + '%';
         if (pct < 100) progTimer = requestAnimationFrame(step);
       }
       progTimer = requestAnimationFrame(step);
     }
   
     function start() {
       stop();
       timer = setInterval(next, INTERVAL);
       resetProgress();
     }
     function stop() {
       if (timer) clearInterval(timer);
       cancelAnimationFrame(progTimer);
     }
   
     prevBtn?.addEventListener('click', () => { prev(); start(); });
     nextBtn?.addEventListener('click', () => { next(); start(); });
     dots.forEach((d, i) => d.addEventListener('click', () => { show(i); start(); }));
   
     // Pause on hover
     slider.addEventListener('mouseenter', stop);
     slider.addEventListener('mouseleave', start);
   
     // Keyboard nav
     slider.setAttribute('tabindex', '-1');
     slider.addEventListener('keydown', (e) => {
       if (e.key === 'ArrowRight') { next(); start(); }
       if (e.key === 'ArrowLeft')  { prev(); start(); }
     });
   
     // Touch swipe
     let touchX = null;
     slider.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
     slider.addEventListener('touchend',   (e) => {
       if (touchX == null) return;
       const dx = e.changedTouches[0].clientX - touchX;
       if (Math.abs(dx) > 40) { (dx < 0 ? next : prev)(); start(); }
       touchX = null;
     }, { passive: true });
   
     // Pause when off-screen for perf
     if ('IntersectionObserver' in window) {
       const io = new IntersectionObserver(([e]) => { e.isIntersecting ? start() : stop(); }, { threshold: 0.2 });
       io.observe(slider);
     } else {
       start();
     }
   })();
   
   /* ── Sticky CTA visibility ── */
   (function initStickyCTA() {
     const target = document.querySelector('.hero, .banner-hero');
     const floatCTA = document.getElementById('floatCTA');
     if (!target || !floatCTA) return;
   
     const observer = new IntersectionObserver(entries => {
       floatCTA.style.display = entries[0].isIntersecting ? 'none' : 'flex';
     }, { threshold: 0 });
   
     observer.observe(target);
   })();
   
   /* ── Video play buttons ──────────────────────────────────────────
      Click the .video-play button inside a .video-thumb to swap in a
      YouTube iframe. data-video holds the YouTube ID. Avoids loading
      the (heavy) YouTube player until the user actually clicks.    */
   document.querySelectorAll('.video-play').forEach(btn => {
     btn.addEventListener('click', e => {
       const id = btn.dataset.video;
       if (!id) return;
       e.preventDefault();
       const thumb = btn.closest('.video-thumb');
       if (!thumb) return;
       const iframe = document.createElement('iframe');
       iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
       iframe.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
       iframe.allowFullscreen = true;
       iframe.title = 'Campus tour video';
       thumb.innerHTML = '';
       thumb.appendChild(iframe);
     });
   });
   