document.addEventListener('DOMContentLoaded', () => {
    init3DBackground();
    init3DTiltEffect();
});

/* --- Dynamic 3D Interconnected Mesh Canvas Particle System --- */
function init3DBackground() {
    const canvas = document.getElementById('canvas3d');
    const ctx = canvas.getContext('2d');
    
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    
    const particles = [];
    const maxParticles = 65;
    let mouse = { x: null, y: null, targetX: 0, targetY: 0 };

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
        mouse.targetX = e.clientX;
        mouse.targetY = e.clientY;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.z = Math.random() * 400 + 100; // Depth factor variable
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 2 + 1;
        }

        update() {
            // Smoothly ease mouse coordinates
            mouse.x += (mouse.targetX - mouse.x) * 0.08;
            mouse.y += (mouse.targetY - mouse.y) * 0.08;

            // Apply slight physical shift based on 3D cursor position
            const shiftX = ((mouse.x - width / 2) / width) * (500 / this.z) * -15;
            const shiftY = ((mouse.y - height / 2) / height) * (500 / this.z) * -15;

            this.x += this.vx;
            this.y += this.vy;

            // Simple edge check wrapping
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            this.renderX = this.x + shiftX;
            this.renderY = this.y + shiftY;
        }

        draw() {
            const sizeFactor = 400 / this.z; 
            ctx.beginPath();
            ctx.arc(this.renderX, this.renderY, this.radius * sizeFactor, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(67, 97, 238, ${0.15 + sizeFactor * 0.15})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // Link matching adjacent nodes within threshold range
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].renderX - particles[j].renderX;
                const dy = particles[i].renderY - particles[j].renderY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].renderX, particles[i].renderY);
                    ctx.lineTo(particles[j].renderX, particles[j].renderY);
                    ctx.strokeStyle = `rgba(6, 214, 160, ${0.12 - dist / 120})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

/* --- Real-time Physics-Based Card 3D Tilt Matrix Processing --- */
function init3DTiltEffect() {
    const cards = document.querySelectorAll('.tilt-3d');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const cardWidth = rect.width;
            const cardHeight = rect.height;
            
            // Get normalized mouse position relative to center of the card (-0.5 to 0.5)
            const mouseX = (e.clientX - rect.left) / cardWidth - 0.5;
            const mouseY = (e.clientY - rect.top) / cardHeight - 0.5;
            
            // Calculate rotational values (Max angle tilt limit set to 12 degrees)
            const rotateX = (-mouseY * 12).toFixed(2);
            const rotateY = (mouseX * 12).toFixed(2);

            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
}