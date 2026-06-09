// Interactive Plexus Particle System using Canvas API
(function() {
  const canvas = document.createElement('canvas');
  canvas.id = 'plexus-canvas';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };

  // Theme Colors
  const colors = [
    'rgba(0, 255, 255, ',   // Neon Red
    'rgba(141, 68, 252, ',  // Purple
    'rgba(255, 51, 102, '   // Pink/Red
  ];

  class Particle {
    constructor(x, y) {
      this.x = x || Math.random() * canvas.width;
      this.y = y || Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.radius = Math.random() * 8+ 1;
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.5 + 0.3;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.colorBase + this.alpha + ')';
      ctx.shadowBlur = 4;
      ctx.shadowColor = this.colorBase + '0.5)';
      ctx.fill();
    }

    update() {
      // Bounce on edges
      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

      this.x += this.vx;
      this.y += this.vy;

      // Mouse interactive effect (gentle attraction)
      if (mouse.x !== null && mouse.y !== null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          let force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 0.4;
          this.y -= (dy / dist) * force * 0.4;
        }
      }
    }
  }

  function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Density-based particle count
    const count = Math.min(100, Math.floor((canvas.width * canvas.height) / 12000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function connect() {
    let maxDistance = 120;
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        let dx = particles[a].x - particles[b].x;
        let dy = particles[a].y - particles[b].y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          let alpha = (1 - (dist / maxDistance)) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          
          // Gradient line between the two base colors
          ctx.strokeStyle = `rgba(255, 51, 102, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Connect to mouse
      if (mouse.x !== null && mouse.y !== null) {
        let dx = particles[a].x - mouse.x;
        let dy = particles[a].y - mouse.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          let alpha = (1 - (dist / mouse.radius)) * 0.25;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(255, 8, 68, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.shadowBlur = 0; // reset shadow for clear rect
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    connect();
    requestAnimationFrame(animate);
  }

  // Event Listeners
  window.addEventListener('resize', () => {
    init();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Clicking spawns dynamic temporary particles
  window.addEventListener('click', (e) => {
    // Spawns 3 particles at click point
    for(let i=0; i<3; i++) {
      let p = new Particle(e.clientX, e.clientY);
      // Give them higher speed in random directions
      p.vx = (Math.random() - 0.5) * 4;
      p.vy = (Math.random() - 0.5) * 4;
      p.alpha = 1;
      particles.push(p);
      
      // Remove a particle from the beginning if it exceeds safety limit
      if (particles.length > 150) {
        particles.shift();
      }
    }
  });

  // Start Animation
  init();
  animate();
})();
