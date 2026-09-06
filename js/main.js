(function(){
  "use strict";

  /* ==========================================================
     1) BẦU TRỜI SAO — canvas lấp lánh + sao băng ngẫu nhiên
  ========================================================== */
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const count = Math.min(160, Math.floor((W*H)/9000));
    stars = Array.from({length: count}, () => ({
      x: Math.random()*W,
      y: Math.random()*H,
      r: Math.random()*1.4 + .3,
      phase: Math.random()*Math.PI*2,
      speed: Math.random()*.02 + .01
    }));
  }
  window.addEventListener('resize', resize);
  resize();

  let shootingStar = null;
  function maybeSpawnShootingStar(){
    if (Math.random() < .006 && !shootingStar){
      const startX = Math.random()*W*0.6 + W*0.2;
      shootingStar = { x:startX, y:-10, vx:-3.2, vy:3.2, life:0, maxLife:60 };
    }
  }

  let t = 0;
  function draw(){
    t += 1;
    ctx.clearRect(0,0,W,H);
    for (const s of stars){
      const twinkle = .5 + .5*Math.sin(t*s.speed + s.phase);
      ctx.globalAlpha = .35 + twinkle*.65;
      ctx.fillStyle = '#f7f1e8';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (!prefersReducedMotion){
      maybeSpawnShootingStar();
      if (shootingStar){
        const ss = shootingStar;
        ss.x += ss.vx; ss.y += ss.vy; ss.life++;
        const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx*12, ss.y - ss.vy*12);
        grad.addColorStop(0, 'rgba(247,241,232,0.95)');
        grad.addColorStop(1, 'rgba(247,241,232,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx*12, ss.y - ss.vy*12);
        ctx.stroke();
        if (ss.life > ss.maxLife || ss.y > H || ss.x < -20) shootingStar = null;
      }
    }
    requestAnimationFrame(draw);
  }
  draw();

  /* ==========================================================
     2) ĐOM ĐÓM TRÔI NHẸ TRONG NỀN
  ========================================================== */
  if (!prefersReducedMotion){
    const wrap = document.getElementById('fireflies');
    const N = 16;
    for (let i=0;i<N;i++){
      const f = document.createElement('div');
      f.className = 'firefly';
      const startX = Math.random()*100, startY = Math.random()*100;
      const dur = 8 + Math.random()*10;
      const delay = Math.random()*6;
      f.style.left = startX+'vw';
      f.style.top = startY+'vh';
      f.style.animation = `drift${i%4} ${dur}s ease-in-out ${delay}s infinite alternate`;
      wrap.appendChild(f);
    }
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      @keyframes drift0{ to{ transform:translate(40px,-30px); opacity:.2; } }
      @keyframes drift1{ to{ transform:translate(-35px,25px); opacity:.15; } }
      @keyframes drift2{ to{ transform:translate(25px,35px); opacity:.25; } }
      @keyframes drift3{ to{ transform:translate(-30px,-25px); opacity:.2; } }
    `;
    document.head.appendChild(styleTag);
  }

  /* ==========================================================
     3) TRÁI TIM & BÁNH KEM RƠI TỪ TRÊN XUỐNG
  ========================================================== */
  const fallingWrap = document.getElementById('fallingIcons');
  const ICONS = ['❤️','💕','💗','🎂','🧁'];
  let fallingCount = 0;
  const MAX_FALLING = 26;

  function spawnFallingItem(){
    if (fallingCount >= MAX_FALLING) return;
    const el = document.createElement('span');
    el.className = 'falling-item';
    el.textContent = ICONS[Math.floor(Math.random()*ICONS.length)];

    const size = 1.1 + Math.random()*1.3;         // 1.1rem - 2.4rem
    const left = Math.random()*100;                 // vw
    const duration = 7 + Math.random()*6;            // 7s - 13s
    const drift = (Math.random()*140 - 70) + 'px';    // trôi ngang nhẹ
    const spin = (Math.random()*360 - 180) + 'deg';

    el.style.left = left + 'vw';
    el.style.fontSize = size + 'rem';
    el.style.setProperty('--drift', drift);
    el.style.setProperty('--spin', spin);
    el.style.animationDuration = duration + 's';

    el.addEventListener('animationend', () => {
      el.remove();
      fallingCount--;
    });

    fallingWrap.appendChild(el);
    fallingCount++;
  }

  if (!prefersReducedMotion){
    // Rơi liên tục trong suốt thời gian ở trên trang
    setInterval(spawnFallingItem, 650);
    // Thả sẵn vài icon ngay khi vào trang cho sống động
    for (let i=0;i<6;i++) setTimeout(spawnFallingItem, i*220);
  }

  /* ==========================================================
     4) PHONG THƯ — mở seal, hiện lá thư
  ========================================================== */
  const envelopeBtn = document.getElementById('envelopeBtn');
  const overlay = document.getElementById('letterOverlay');
  const closeBtn = document.getElementById('closeLetter');

  envelopeBtn.addEventListener('click', () => {
    envelopeBtn.classList.add('open');
    setTimeout(() => {
      overlay.classList.add('show');
    }, 380);
  });

  function closeLetter(){
    overlay.classList.remove('show');
    setTimeout(() => envelopeBtn.classList.remove('open'), 300);
  }
  closeBtn.addEventListener('click', closeLetter);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLetter(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLetter(); });

  /* ==========================================================
     5) NHẠC NỀN — tự phát khi vào trang, bấm icon để tắt/mở
  ========================================================== */
  const musicBtn = document.getElementById('musicToggle');
  const audio = document.getElementById('bgMusic');
  const muteSlash = document.getElementById('muteSlash');
  let userMuted = false; // trạng thái người dùng chủ động tắt

  function updateMusicIcon(){
    const showAsOff = userMuted || audio.paused;
    musicBtn.classList.toggle('playing', !showAsOff);
    muteSlash.style.display = showAsOff ? '' : 'none';
    musicBtn.setAttribute('aria-pressed', String(!showAsOff));
    musicBtn.setAttribute('aria-label', showAsOff ? 'Mở nhạc nền' : 'Tắt nhạc nền');
  }

  function tryAutoplay(){
    audio.play().then(updateMusicIcon).catch(() => {
      // Nhiều trình duyệt chặn tự phát nhạc có tiếng khi chưa có tương tác.
      // Nhạc sẽ tự bắt đầu ngay khi người dùng chạm/click lần đầu vào trang.
      updateMusicIcon();
      const resumeOnFirstInteraction = () => {
        if (!userMuted && audio.paused){
          audio.play().then(updateMusicIcon).catch(()=>{});
        }
        document.removeEventListener('pointerdown', resumeOnFirstInteraction);
        document.removeEventListener('keydown', resumeOnFirstInteraction);
      };
      document.addEventListener('pointerdown', resumeOnFirstInteraction, { once:true });
      document.addEventListener('keydown', resumeOnFirstInteraction, { once:true });
    });
  }
  tryAutoplay();

  musicBtn.addEventListener('click', () => {
    if (audio.paused){
      userMuted = false;
      audio.play().then(updateMusicIcon).catch(()=>updateMusicIcon());
    } else {
      userMuted = true;
      audio.pause();
      updateMusicIcon();
    }
  });

  /* Ẩn dòng chữ placeholder nếu ảnh tải thành công */
  document.querySelector('.photo-frame img').addEventListener('load', function(){
    const ph = document.getElementById('photoPlaceholder');
    if (ph) ph.style.display = 'none';
  });
})();