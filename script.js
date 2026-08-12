/**
 * Avinash Singh Portfolio - Custom Interactive Logic
 * Fully custom particle systems, CLI terminal, scroll reveal, and tilt effects.
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeaderAndScroll();
    initTypewriter();
    initParticleCanvas();
    initSkillsSystem();
    initProjectsSystem();
    initTerminalCLI();
    initScrollReveal();
    initContactForm();
});

/* ==========================================================================
   1. HEADER, MOBILE NAV & SCROLL INDICATOR
   ========================================================================== */
function initHeaderAndScroll() {
    const header = document.getElementById('main-header');
    const scrollProgress = document.getElementById('scroll-progress');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link, .nav-link-btn');

    // Page Scroll Effects
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        // Progress Bar
        scrollProgress.style.width = scrollPercent + '%';
        
        // Header background transition
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Scroll Spy - Highlight active section in nav
        const sections = document.querySelectorAll('section[id]');
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 150;
            const sectionId = current.getAttribute('id');
            const targetNavLink = document.querySelector(`.nav-links a[href*=${sectionId}]`);
            
            if (targetNavLink) {
                if (scrollTop > sectionTop && scrollTop <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    targetNavLink.classList.add('active');
                }
            }
        });
    });

    // Mobile Hamburger Toggle
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close Mobile Menu on Link Click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

/* ==========================================================================
   2. HERO TYPEWRITER ANIMATION
   ========================================================================== */
function initTypewriter() {
    const typewriterElement = document.getElementById('typewriter-text');
    const words = ["Software Development Engineer", "MERN Stack Specialist", "GenAI Developer"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Delete faster
        } else {
            typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 120; // Type standard speed
        }

        if (!isDeleting && charIndex === currentWord.length) {
            // Wait at the end of the word
            typingSpeed = 1800; 
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 500; // Pause before starting next word
        }

        setTimeout(type, typingSpeed);
    }

    // Start typing loop
    setTimeout(type, 800);
}

/* ==========================================================================
   3. HIGH-PERFORMANCE INTERACTIVE CANVAS PARTICLES
   ========================================================================== */
function initParticleCanvas() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particlesArray = [];
    let animationFrameId;
    
    // Mouse Coordinates
    const mouse = {
        x: null,
        y: null,
        radius: 140 // Interaction distance
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Resize Handling
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }
    window.addEventListener('resize', resizeCanvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle Object
    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        // Draw particle
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        // Update particle positions with smooth forces
        update() {
            // Bounce off boundaries with slight damping
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX * 0.95;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY * 0.95;
            }

            // Mouse interaction (fluid repulsion effect)
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Apply smooth velocity changes
                    this.directionX -= (dx / distance) * force * 0.05;
                    this.directionY -= (dy / distance) * force * 0.05;
                }
            }

            // Damping & speed cap for premium fluid movement
            const speed = Math.sqrt(this.directionX * this.directionX + this.directionY * this.directionY);
            const maxSpeed = 1.0;
            if (speed > maxSpeed) {
                this.directionX = (this.directionX / speed) * maxSpeed;
                this.directionY = (this.directionY / speed) * maxSpeed;
            }
            // Add a tiny random Brownian motion drift to avoid static nodes
            if (speed < 0.1) {
                this.directionX += (Math.random() * 0.05) - 0.025;
                this.directionY += (Math.random() * 0.05) - 0.025;
            }

            // Apply friction/drag
            this.directionX *= 0.99;
            this.directionY *= 0.99;

            // Move particle
            this.x += this.directionX;
            this.y += this.directionY;
            
            this.draw();
        }
    }

    // Initialize Particle Pool
    function initParticles() {
        particlesArray = [];
        // Scale number of particles by screen area, with a lower max limit to prevent visual clutter and lag
        let numberOfParticles = Math.floor((canvas.width * canvas.height) / 28000);
        if (numberOfParticles > 45) numberOfParticles = 45; 
        if (numberOfParticles < 15) numberOfParticles = 15;

        const colors = [
            'rgba(0, 242, 254, 0.25)', // Glow Cyan
            'rgba(157, 78, 221, 0.22)'  // Glow Purple
        ];

        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 1.5) + 1; // slightly smaller refined nodes
            let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
            
            let directionX = (Math.random() * 0.3) - 0.15;
            let directionY = (Math.random() * 0.3) - 0.15;
            
            let color = colors[Math.floor(Math.random() * colors.length)];
            
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    // Connect Particles within distance (Optimized batching in single paths)
    function connect() {
        const maxDist = 95;
        
        // 1. Draw connection lines between particles in a single path
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.04)';
        ctx.lineWidth = 0.7;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a + 1; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distSq = dx * dx + dy * dy;
                
                if (distSq < maxDist * maxDist) {
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                }
            }
        }
        ctx.stroke();
        
        // 2. Draw connection lines to mouse cursor in a single path
        if (mouse.x !== null && mouse.y !== null) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(157, 78, 221, 0.08)';
            ctx.lineWidth = 1.0;
            for (let a = 0; a < particlesArray.length; a++) {
                let dxMouse = particlesArray[a].x - mouse.x;
                let dyMouse = particlesArray[a].y - mouse.y;
                let distMouseSq = dxMouse * dxMouse + dyMouse * dyMouse;
                
                if (distMouseSq < mouse.radius * mouse.radius) {
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(mouse.x, mouse.y);
                }
            }
            ctx.stroke();
        }
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
        
        animationFrameId = requestAnimationFrame(animate);
    }

    initParticles();
    animate();
}

/* ==========================================================================
   4. SKILLS MANAGEMENT & INTERACTIVE TAB SWITCHING
   ========================================================================== */
const skillsData = [
    // Languages
    { name: 'JavaScript', level: 90, category: 'languages', icon: `<path d="M3 3h18v18H3z M12 17v-4h2a2 2 0 0 1 0 4z"/>` },
    { name: 'SQL', level: 85, category: 'languages', icon: `<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>` },
    { name: 'C#', level: 80, category: 'languages', icon: `<path d="M12 2H2v10h10V2z M22 12h-10v10h10V12z"/>` },
    { name: 'Java (Basic)', level: 65, category: 'languages', icon: `<path d="M6 22h12M12 2v16M8 8h8"/>` },
    { name: 'HTML5 & CSS3', level: 95, category: 'languages', icon: `<path d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5"/>` },
    
    // Frontend (Web)
    { name: 'React.js', level: 90, category: 'web', icon: `<ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(90 12 12)"/><ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(150 12 12)"/>` },
    { name: 'Next.js', level: 80, category: 'web', icon: `<circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 7.54 16.59L12 12V6"/>` },
    { name: 'Tailwind CSS', level: 90, category: 'web', icon: `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>` },
    { name: 'Redux Toolkit', level: 85, category: 'web', icon: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>` },
    { name: 'Context API', level: 85, category: 'web', icon: `<circle cx="12" cy="12" r="6"/>` },
    
    // Backend & DB
    { name: 'Node.js & Express', level: 85, category: 'backend', icon: `<path d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5"/>` },
    { name: 'MongoDB & MySQL', level: 85, category: 'backend', icon: `<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/>` },
    { name: 'FastAPI', level: 75, category: 'backend', icon: `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>` },
    { name: 'REST APIs & Auth', level: 90, category: 'backend', icon: `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>` },
    
    // Tools & practices
    { name: 'OpenAI API', level: 80, category: 'tools', icon: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>` },
    { name: 'API Testing (Postman)', level: 90, category: 'tools', icon: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>` },
    { name: 'Unit Testing (Jest)', level: 80, category: 'tools', icon: `<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>` },
    { name: 'Git & GitHub', level: 90, category: 'tools', icon: `<path d="M9 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6-12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0a3 3 0 1 0 0 6m-6 0h6"/>` },
    { name: 'Vercel Deployment', level: 85, category: 'tools', icon: `<path d="M12 2L2 22h20L12 2z"/>` },
    { name: 'Razorpay Integration', level: 80, category: 'tools', icon: `<path d="M20 7h-9m0 0a4 4 0 1 0 0 1m0-1a4 4 0 1 1 0 1"/>` },
    { name: 'OOP & Agile SDLC', level: 85, category: 'tools', icon: `<path d="M4 4h16v16H4z M9 9h6v6H9z"/>` }
];

function initSkillsSystem() {
    const grid = document.getElementById('skills-grid');
    const tabs = document.querySelectorAll('.skills-tab-btn');
    if (!grid) return;

    // Render active category
    function renderSkills(category) {
        grid.innerHTML = '';
        
        const filtered = category === 'all' 
            ? skillsData 
            : skillsData.filter(s => s.category === category);
            
        const isParentActive = document.getElementById('skills').classList.contains('active');
        const cardActive = isParentActive ? 'active' : '';

        filtered.forEach((skill, index) => {
            const card = document.createElement('div');
            card.className = `skill-card glass-card scroll-reveal-item ${cardActive} delay-${(index % 4) + 1}`;
            card.innerHTML = `
                <div class="card-glow"></div>
                <div class="skill-card-header">
                    <div class="skill-name-container">
                        <svg class="skill-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            ${skill.icon}
                        </svg>
                        <span class="skill-title">${skill.name}</span>
                    </div>
                    <span class="skill-percentage">${skill.level}%</span>
                </div>
                <div class="skill-track">
                    <div class="skill-fill" data-level="${skill.level}"></div>
                </div>
            `;
            grid.appendChild(card);
            
            // Trigger local mouse moving listeners for glass dynamic hover glowing
            initCardGlow(card);
        });

        // Trigger progression width fills asynchronously
        setTimeout(() => {
            const fills = grid.querySelectorAll('.skill-fill');
            fills.forEach(fill => {
                const targetLevel = fill.getAttribute('data-level');
                fill.style.width = targetLevel + '%';
            });
        }, 50);
    }

    // Toggle click listeners on tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderSkills(tab.getAttribute('data-category'));
        });
    });

    // Default Render All
    renderSkills('all');
}

/* ==========================================================================
   5. PROJECTS SHOWCASE & PERSPECTIVE HOVER GLOWS
   ========================================================================== */
const projectsData = [
    {
        id: 'text-to-image',
        name: 'Text-to-Image AI Web Application',
        category: 'fullstack',
        subtag: 'React.js + REST APIs + MongoDB',
        summary: 'A responsive React-based web application integrated directly with backend REST APIs to convert natural text prompts into custom generated graphics.',
        tags: ['React.js', 'REST APIs', 'MongoDB', 'JavaScript', 'GenAI', 'Postman'],
        problem: 'Establishing an efficient pipeline for users to interact with text-to-image AI networks and save outputs in a structured NoSQL database.',
        role: 'Full Stack SDE. Managed database schemas, wrote clean integration APIs, and conducted automated API contract testing using Postman Collections to validate payload structures.',
        challenges: 'Optimizing frontend-backend communication latency. Resolved by profiling API requests, which reduced image rendering latency by 35%.',
        git: 'https://github.com/iavinaxh',
        demo: '#'
    },
    {
        id: 'vehicle-damage',
        name: 'Vehicle Damage Assessment App',
        category: 'fullstack',
        subtag: 'Flask + Java/Python + MySQL',
        summary: 'A full-stack web solution designed to assess damaged automobile parts from uploaded photographs and estimate repair costings with 88% accuracy.',
        tags: ['Flask', 'MySQL', 'Python', 'Java Logic', 'Image Processing', 'Performance Testing'],
        problem: 'Simplifying damage appraisals and cost predictions for vehicular insurance and repair networks.',
        role: 'Backend SDE. Developed server-side parts processing logic, built a MySQL schema matching security practices, and performed latency/load testing on JSON gateways.',
        challenges: 'Optimizing server-side image processing pipelines to achieve an average response time of under 1.5 seconds.',
        git: 'https://github.com/iavinaxh',
        demo: '#'
    },
    {
        id: 'second-hand-bookstore',
        name: 'Second-Hand Book Store Platform',
        category: 'frontend',
        subtag: 'Agile SDLC + SQL & MongoDB',
        summary: 'An administrative web console designed to manage user records, evaluate reviews, and track book inventory.',
        tags: ['JavaScript', 'HTML5', 'CSS3', 'SQL', 'MongoDB', 'Agile SDLC', 'Integration Testing'],
        problem: 'Fostering clean inventory visibility and feedback review moderation under high database write conditions.',
        role: 'Database & Frontend Coordinator. Crafted standard SQL queries and NoSQL structures, performing integration tests to verify database write consistency.',
        challenges: 'Designing UI grids that update instantaneously when items are sold or re-stocked. Solved via dynamic DOM states and AJAX queries.',
        git: 'https://github.com/iavinaxh',
        demo: '#'
    }
];

function initProjectsSystem() {
    const grid = document.getElementById('projects-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-project-body');
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = document.getElementById('modal-overlay');
    
    if (!grid) return;

    function renderProjects(filter) {
        grid.innerHTML = '';
        
        // Filter elements
        const filtered = filter === 'all' 
            ? projectsData 
            : projectsData.filter(p => p.category === filter || (filter === 'ai' && p.id === 'text-to-image'));
            
        const isParentActive = document.getElementById('projects').classList.contains('active');
        const cardActive = isParentActive ? 'active' : '';

        filtered.forEach((proj, idx) => {
            const card = document.createElement('div');
            card.className = `project-card glass-card scroll-reveal-item ${cardActive} delay-${(idx % 3) + 1}`;
            card.setAttribute('data-id', proj.id);
            
            // Build custom project card structure
            card.innerHTML = `
                <div class="card-glow"></div>
                <div class="project-card-inner">
                    <div class="project-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <h3 class="project-name">${proj.name}</h3>
                    <p class="project-summary">${proj.summary}</p>
                    <div class="project-tags">
                        ${proj.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
                    </div>
                    <div class="project-footer">
                        <a href="#" class="project-link-more" data-target="${proj.id}">
                            Explore Details
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </a>
                        <a href="${proj.git}" target="_blank" class="project-git-link" aria-label="GitHub Repo">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                        </a>
                    </div>
                </div>
            `;
            
            grid.appendChild(card);
            
            // Set up 3D perspective tilt effect
            init3DTilt(card);
            initCardGlow(card);
        });

        // Modal triggers on clicking details
        const detailsButtons = grid.querySelectorAll('.project-link-more');
        detailsButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const pid = btn.getAttribute('data-target');
                const project = projectsData.find(p => p.id === pid);
                if (project) openProjectModal(project);
            });
        });
    }

    // Modal Operations
    function openProjectModal(project) {
        modalBody.innerHTML = `
            <h3 class="modal-project-title">${project.name}</h3>
            <div class="modal-section-title">Overview</div>
            <p class="modal-project-desc">${project.summary}</p>
            
            <div class="modal-section-title">Problem Statement</div>
            <p class="modal-section-content">${project.problem}</p>
            
            <div class="modal-section-title">My Contributions & Role</div>
            <p class="modal-section-content">${project.role}</p>
            
            <div class="modal-section-title">Key Challenges & Learnings</div>
            <p class="modal-section-content">${project.challenges}</p>
            
            <div class="modal-section-title">Stack Details</div>
            <div class="project-tags" style="margin-bottom: 25px;">
                ${project.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
            </div>
            
            <div class="modal-actions">
                <a href="${project.git}" target="_blank" class="btn-secondary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle; margin-right:6px;"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                    Source Code
                </a>
                ${project.demo && project.demo !== '#' ? `
                <a href="${project.demo}" target="_blank" class="btn-primary">
                    Launch App
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-left:6px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                </a>
                ` : ''}
            </div>
        `;
        
        modal.classList.add('visible');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Stop background scroll
    }

    function closeModal() {
        modal.classList.remove('visible');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    // Close modal on escape press
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('visible')) {
            closeModal();
        }
    });

    // Toggle filter listeners
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProjects(btn.getAttribute('data-filter'));
        });
    });

    // Default Render
    renderProjects('all');
}

// 3D Perspective rotation on mousemove
function init3DTilt(element) {
    element.addEventListener('mousemove', (e) => {
        const cardInner = element.querySelector('.project-card-inner');
        const box = element.getBoundingClientRect();
        
        // Compute relative positions
        const x = e.clientX - box.left;
        const y = e.clientY - box.top;
        
        // Map to angle limit (-7deg to 7deg)
        const angleLimit = 7;
        const rotateY = ((x / box.width) * (angleLimit * 2) - angleLimit).toFixed(2);
        const rotateX = (angleLimit - (y / box.height) * (angleLimit * 2)).toFixed(2);
        
        cardInner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });

    element.addEventListener('mouseleave', () => {
        const cardInner = element.querySelector('.project-card-inner');
        cardInner.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)';
    });
}

// Glassmorphic cards light reflection updates
function initCardGlow(element) {
    element.addEventListener('mousemove', (e) => {
        const box = element.getBoundingClientRect();
        const x = e.clientX - box.left;
        const y = e.clientY - box.top;
        element.style.setProperty('--mouse-x', `${x}px`);
        element.style.setProperty('--mouse-y', `${y}px`);
    });
}

/* ==========================================================================
   6. INTERACTIVE DEVELOPER CONSOLE (CLI TERMINAL WIDGET)
   ========================================================================== */
function initTerminalCLI() {
    const input = document.getElementById('terminal-input');
    const historyContainer = document.getElementById('terminal-history');
    const terminalBody = document.getElementById('terminal-body');
    
    if (!input || !historyContainer) return;

    // Available CLI Console Command Maps
    const commands = {
        help: () => `
<span class="text-cyan">Available interactive commands:</span>
  <span class="text-purple">about</span>      - Prints professional overview biography.
  <span class="text-purple">skills</span>     - Lists full-stack programming proficiencies.
  <span class="text-purple">projects</span>   - Shows highlights of engineered apps.
  <span class="text-purple">education</span>  - Displays academic credentials.
  <span class="text-purple">experience</span> - Showcases volunteering timeline records.
  <span class="text-purple">contact</span>    - Outputs active communication options.
  <span class="text-purple">resume</span>     - Triggers resume PDF download stream.
  <span class="text-purple">clear</span>      - Wipes console logs.
        `,
        about: () => `
<span class="text-cyan">Biography Overview:</span>
  Results-driven Software Development Engineer specializing in the MERN stack with a strong foundation 
  in robust system design and low-latency web applications. Adept at developing production-grade 
  solutions with clean architecture, improved backend services, and seamless user experiences. 
  Demonstrates strong problem-solving ability through consistent algorithmic practice.
        `,
        skills: () => `
<span class="text-cyan">Technical Proficiency Matrix:</span>
  * <span class="text-purple">Languages:</span> JavaScript, SQL, C#, Java (basic), HTML5, CSS3
  * <span class="text-purple">Frontend:</span> React.js, Next.js, Tailwind CSS, Redux Toolkit, Context API
  * <span class="text-purple">Backend:</span> Node.js, Express.js, FastAPI, RESTful APIs, JWT Authentication
  * <span class="text-purple">AI/GenAI:</span> OpenAI API, Prompt Engineering, AI-based Systems
  * <span class="text-purple">Databases:</span> MySQL, MongoDB
  * <span class="text-purple">Testing & QA:</span> API Testing, Postman Test Suites, Unit Testing (Jest), Integration Testing
  * <span class="text-purple">Tools & Tech:</span> Git, GitHub, Postman, Vercel, VS Code, Razorpay, OOP, Agile, SDLC
        `,
        projects: () => `
<span class="text-cyan">Featured Software Projects:</span>
  [1] <span class="text-purple">Text-to-Image AI Web Application</span>: React + REST APIs + MongoDB.
  [2] <span class="text-purple">Vehicle Damage Assessment App</span>: Flask + Java/Python + MySQL.
  [3] <span class="text-purple">Second-Hand Book Store Platform</span>: Agile SDLC + SQL & MongoDB.
  * Hint: scroll down to the Projects section to check out detailed modals!
        `,
        education: () => `
<span class="text-cyan">Academic History:</span>
  * <span class="text-purple">B.Tech in Information Technology</span> (CGPA: 7.2/10)
    GLA University, Mathura | 2022 - 2026
    Coursework: Data Structures & Algorithms, Operating Systems, Computer Networks, DBMS, Software Testing
        `,
        experience: () => `
<span class="text-cyan">Volunteering & Leadership Achievements:</span>
  * <span class="text-purple">Volunteer Tutor</span> at Shining Bird Foundation (NGO) | 2022 - Present
    - Tutored underprivileged students, creating an inclusive and motivating learning environment.
    - Guided and influenced students to achieve high-quality outcomes through collaboration.
        `,
        contact: () => `
<span class="text-cyan">Direct Connections:</span>
  * Email: <a href="mailto:avisingh21122003@gmail.com" class="text-cyan" style="text-decoration: underline;">avisingh21122003@gmail.com</a>
  * GitHub: <a href="https://github.com/iavinaxh" target="_blank" class="text-purple" style="text-decoration: underline;">github.com/iavinaxh</a>
  * LinkedIn: <a href="https://linkedin.com/in/avinash-singh-232522254" target="_blank" class="text-purple" style="text-decoration: underline;">linkedin.com/in/avinash-singh-232522254</a>
        `,
        resume: () => {
            const link = document.createElement('a');
            link.href = 'Avinash_singh.docx';
            link.download = 'Avinash_singh.docx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return `<span class="text-success">✔ Resume file download initialized. Check your downloads folder.</span>`;
        },
        clear: () => {
            historyContainer.innerHTML = '';
            return '';
        }
    };

    // Input command listener
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const rawCommand = input.value.trim();
            const cmd = rawCommand.toLowerCase();
            input.value = '';

            // Print the typed prompt line in history
            const promptLine = document.createElement('div');
            promptLine.className = 'terminal-line';
            promptLine.innerHTML = `<span class="terminal-prompt">guest@avinash-sh:~$</span> <span>${rawCommand}</span>`;
            historyContainer.appendChild(promptLine);

            if (cmd === '') return;

            // Generate output response
            const responseLine = document.createElement('div');
            responseLine.className = 'terminal-line';
            
            if (commands[cmd]) {
                const output = commands[cmd]();
                if (cmd !== 'clear') {
                    responseLine.innerHTML = output;
                    historyContainer.appendChild(responseLine);
                }
            } else {
                responseLine.innerHTML = `<span class="text-error">sh: command not found: ${rawCommand}. Type <span class="text-cyan">help</span> to view lists.</span>`;
                historyContainer.appendChild(responseLine);
            }

            // Scroll terminal content to bottom
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    });

    // Make clicking the terminal card trigger focus on input
    terminalBody.addEventListener('click', () => {
        input.focus();
    });
}

/* ==========================================================================
   7. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.scroll-reveal, .scroll-reveal-item');
    
    if (reveals.length === 0) return;

    const observerOptions = {
        root: null,
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries, self) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                self.unobserve(entry.target); // Trigger only once
            }
        });
    }, observerOptions);

    reveals.forEach(el => {
        observer.observe(el);
    });
}

/* ==========================================================================
   8. CONTACT FORM SIMULATOR
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('btn-submit-message');
    const outputConsole = document.getElementById('form-terminal-output');
    
    if (!form) return;

    // Helper for command logging
    function logConsole(message, type = 'muted') {
        const line = document.createElement('div');
        line.className = `terminal-line text-${type}`;
        line.innerHTML = message;
        outputConsole.appendChild(line);
        outputConsole.scrollTop = outputConsole.scrollHeight;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Reset validation errors
        let isValid = true;
        const groups = form.querySelectorAll('.form-group');
        groups.forEach(g => g.classList.remove('invalid'));

        // Validate fields
        const nameInput = document.getElementById('form-name');
        const emailInput = document.getElementById('form-email');
        const subjectInput = document.getElementById('form-subject');
        const messageInput = document.getElementById('form-message');

        if (nameInput.value.trim() === '') {
            nameInput.closest('.form-group').classList.add('invalid');
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            emailInput.closest('.form-group').classList.add('invalid');
            isValid = false;
        }

        if (subjectInput.value.trim() === '') {
            subjectInput.closest('.form-group').classList.add('invalid');
            isValid = false;
        }

        if (messageInput.value.trim() === '') {
            messageInput.closest('.form-group').classList.add('invalid');
            isValid = false;
        }

        if (!isValid) return;

        // Perform real submission of sending package logs
        submitBtn.disabled = true;
        outputConsole.innerHTML = '';
        outputConsole.classList.add('visible');

        logConsole('guest@avinash-sh:~$ ./send_message.sh', 'purple');
        logConsole('Packaging secure message payload...', 'muted');
        logConsole('Routing package via Web3Forms gateway...', 'muted');

        const web3Key = document.getElementById('web3forms-key').value;

        // Submit via Web3Forms AJAX API
        fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                access_key: web3Key,
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                subject: subjectInput.value.trim(),
                message: messageInput.value.trim(),
                botcheck: form.querySelector('input[name="botcheck"]').checked
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success === "true" || data.success === true) {
                logConsole('✔ Message successfully routed to avisingh21122003@gmail.com!', 'success');
                logConsole('Response code: 200 OK. Thank you! I will get back to you shortly.', 'cyan');
                form.reset();
            } else {
                logConsole('✖ Error dispatching mail payload via gateway.', 'error');
                logConsole(data.message || 'Please verify your Access Key or try again.', 'muted');
            }
            submitBtn.disabled = false;
        })
        .catch(err => {
            logConsole('✖ Network connection error during SSH routing.', 'error');
            logConsole('Please email directly to avisingh21122003@gmail.com.', 'muted');
            submitBtn.disabled = false;
        });
    });
}
