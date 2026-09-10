/**
 * Cyberpunk Canvas Background Engine
 * Renders interactive particle neural networks, cyber grid lines, and Matrix rain mode.
 */
class CyberCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.mode = 'network'; // 'network' or 'matrix'
    this.particles = [];
    this.particleCount = 65;
    this.maxDistance = 140;
    this.mouse = { x: null, y: null, radius: 160 };

    // Matrix Rain properties
    this.matrixChars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ';
    this.fontSize = 14;
    this.drops = [];

    this.resize();
    this.initParticles();
    this.initMatrix();
    this.initEvents();
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.columns = Math.floor(this.width / this.fontSize);
    this.initMatrix();
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.75,
        vy: (Math.random() - 0.5) * 0.75,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.3 ? 'rgba(0, 240, 255, ' : 'rgba(255, 0, 85, '
      });
    }
  }

  initMatrix() {
    this.drops = [];
    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = Math.floor(Math.random() * -100);
    }
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === 'matrix') {
      this.initMatrix();
    }
  }

  drawNetwork() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Subtle cyber grid background lines
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.025)';
    this.ctx.lineWidth = 1;
    const gridSize = 60;
    for (let x = 0; x < this.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    // Connect particles
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];

      // Update position
      p1.x += p1.vx;
      p1.y += p1.vy;

      if (p1.x < 0 || p1.x > this.width) p1.vx *= -1;
      if (p1.y < 0 || p1.y > this.height) p1.vy *= -1;

      // Mouse repulsion / attraction
      if (this.mouse.x !== null) {
        const dx = this.mouse.x - p1.x;
        const dy = this.mouse.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p1.x -= (dx / dist) * force * 2;
          p1.y -= (dy / dist) * force * 2;
        }
      }

      // Draw particle node
      this.ctx.beginPath();
      this.ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p1.color + '0.8)';
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p1.color === 'rgba(0, 240, 255, ' ? '#00f0ff' : '#ff0055';
      this.ctx.fill();
      this.ctx.shadowBlur = 0; // reset

      // Draw connecting lines
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.maxDistance) {
          const alpha = (1 - dist / this.maxDistance) * 0.25;
          this.ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }
  }

  drawMatrix() {
    this.ctx.fillStyle = 'rgba(8, 9, 13, 0.08)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#00ff66';
    this.ctx.font = `${this.fontSize}px monospace`;

    for (let i = 0; i < this.drops.length; i++) {
      const char = this.matrixChars.charAt(Math.floor(Math.random() * this.matrixChars.length));
      const x = i * this.fontSize;
      const y = this.drops[i] * this.fontSize;

      // Glow top character white/bright cyan
      if (Math.random() > 0.85) {
        this.ctx.fillStyle = '#00f0ff';
      } else {
        this.ctx.fillStyle = '#00ff66';
      }

      this.ctx.fillText(char, x, y);

      if (y > this.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      this.drops[i]++;
    }
  }

  animate() {
    if (this.mode === 'network') {
      this.drawNetwork();
    } else if (this.mode === 'matrix') {
      this.drawMatrix();
    }
    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.cyberCanvas = new CyberCanvas('cyber-bg-canvas');
});
