// Flow Field Particle System with Mouse Interaction
(function() {
  const canvasContainer = document.getElementById("canvas-container");
  const canvas = document.createElement('canvas');
  canvas.id = 'flowfield-canvas';
  if (canvasContainer) {
    canvasContainer.appendChild(canvas);
  } else {
    document.body.prepend(canvas);
  }

  const ctx = canvas.getContext('2d');
  
  // Configuration
  const config = {
    particleCount: 800,
    scale: 0.008,
    speed: 2,
    fadeAlpha: 0.08,
    flowStrength: 1,
    mouseRadius: 200,
    mouseForce: 3
  };

  // Theme Colors
  const colors = [
    { r: 0, g: 255, b: 255 },     // Cyan
    { r: 141, g: 68, b: 252 },    // Purple
    { r: 255, g: 51, b: 102 }     // Pink/Red
  ];

  let particles = [];
  let mouse = { x: null, y: null, vx: 0, vy: 0, lastX: null, lastY: null };
  let time = 0;

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = 0;
      this.vy = 0;
      this.life = 1;
      this.decay = Math.random() * 0.005 + 0.002;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.size = Math.random() * 2 + 0.5;
    }

    getFlowAngle(x, y) {
      // Multi-layered noise for more interesting patterns
      const scale1 = config.scale;
      const scale2 = config.scale * 2;
      const scale3 = config.scale * 0.5;
      
      const n1 = Math.sin(x * scale1 + time * 0.3) * Math.cos(y * scale1 + time * 0.2);
      const n2 = Math.sin(x * scale2 - time * 0.4) * 0.5;
      const n3 = Math.cos((x + y) * scale3 + time * 0.1) * 0.3;
      
      return (n1 + n2 + n3) * Math.PI * 2;
    }

    update() {
      // Get flow field angle at current position
      const angle = this.getFlowAngle(this.x, this.y);
      
      // Flow field force
      const flowVx = Math.cos(angle) * config.speed * config.flowStrength;
      const flowVy = Math.sin(angle) * config.speed * config.flowStrength;

      // Mouse interaction
      let mouseVx = 0;
      let mouseVy = 0;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.mouseRadius && dist > 0) {
          // Mouse movement influence
          const force = (1 - dist / config.mouseRadius) * config.mouseForce;
          
          // Push away from mouse with some turbulence
          const pushAngle = Math.atan2(dy, dx);
          mouseVx += Math.cos(pushAngle) * force;
          mouseVy += Math.sin(pushAngle) * force;
          
          // Add mouse velocity influence for more dynamic interaction
          mouseVx += mouse.vx * force * 0.5;
          mouseVy += mouse.vy * force * 0.5;
        }
      }

      // Apply forces with smoothing
      this.vx += (flowVx + mouseVx - this.vx) * 0.1;
      this.vy += (flowVy + mouseVy - this.vy) * 0.1;

      // Update position
      this.x += this.vx;
      this.y += this.vy;

      // Life decay
      this.life -= this.decay;

      // Reset if out of bounds or dead
      if (this.life <= 0 || 
          this.x < -10 || this.x > canvas.width + 10 ||
          this.y < -10 || this.y > canvas.height + 10) {
        this.reset();
      }
    }

    draw() {
      const alpha = this.life * 0.8;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`;
      ctx.fill();

      // Trail effect
      if (Math.abs(this.vx) > 0.5 || Math.abs(this.vy) > 0.5) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.5})`;
        ctx.lineWidth = this.size * 0.5;
        ctx.stroke();
      }
    }
  }

  function init() {
    if (canvasContainer) {
      canvas.width = canvasContainer.clientWidth;
      canvas.height = canvasContainer.clientHeight;
    } else {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    // Fade effect for trails
    ctx.fillStyle = `rgba(6, 2, 4, ${config.fadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    time += 0.01;

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    requestAnimationFrame(animate);
  }

  // Event Listeners
  window.addEventListener('resize', () => {
    init();
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    // Calculate mouse velocity
    if (mouse.lastX !== null && mouse.lastY !== null) {
      mouse.vx = currentX - mouse.lastX;
      mouse.vy = currentY - mouse.lastY;
    }
    mouse.lastX = currentX;
    mouse.lastY = currentY;
    mouse.x = currentX;
    mouse.y = currentY;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
    mouse.lastX = null;
    mouse.lastY = null;
    mouse.vx = 0;
    mouse.vy = 0;
  });

  // Start Animation
  init();
  animate();
})();
