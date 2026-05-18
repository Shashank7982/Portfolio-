document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Icons
    lucide.createIcons();

    // 2. Set Current Year
    document.getElementById('year').textContent = new Date().getFullYear();

    // 3. Custom Cursor (Dot + Ring)
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');

    if (cursorDot && cursorRing) {
        gsap.set([cursorDot, cursorRing], { xPercent: -50, yPercent: -50 });

        const xToDot = gsap.quickTo(cursorDot, "x", {duration: 0, ease: "none"});
        const yToDot = gsap.quickTo(cursorDot, "y", {duration: 0, ease: "none"});
        
        const xToRing = gsap.quickTo(cursorRing, "x", {duration: 0.4, ease: "power3"});
        const yToRing = gsap.quickTo(cursorRing, "y", {duration: 0.4, ease: "power3"});

        window.addEventListener("mousemove", (e) => {
            xToDot(e.clientX);
            yToDot(e.clientY);
            xToRing(e.clientX);
            yToRing(e.clientY);
        });

        const interactables = document.querySelectorAll('a, button, .bento-card');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
        });
    }

    // 4. GSAP Scroll Animations
    gsap.registerPlugin(ScrollTrigger);

    // Hero Reveal
    gsap.fromTo(".gs-reveal", 
        { y: 50, opacity: 0 },
        { 
            y: 0, 
            opacity: 1, 
            duration: 1, 
            stagger: 0.15, 
            ease: "power4.out",
            delay: 0.2
        }
    );

    // Scroll Reveal Up
    const revealUpElements = document.querySelectorAll(".gs-reveal-up");
    revealUpElements.forEach((el) => {
        gsap.fromTo(el, 
            { y: 60, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%", // Trigger when top of element hits 85% of viewport
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // 5. Three.js Background Particle System
    initThreeJsBackground();

    // 6. Project Modals & Charts
    initProjectModals();

    // 7. Typewriter Effect for Hero
    initTypewriter();
});

function initTypewriter() {
    const roles = ["Full Stack Developer", "Data Analyst", "Creative Engineer", "Problem Solver"];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typewriterEl = document.getElementById('typewriter');

    if(!typewriterEl) return;

    function typeWriter() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            typewriterEl.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typewriterEl.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentRole.length) {
            typeSpeed = 2000; // Pause at the end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500; // Pause before typing next
        }

        setTimeout(typeWriter, typeSpeed);
    }
    
    setTimeout(typeWriter, 1000);
}

function initThreeJsBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 400;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particles setup
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    const color1 = new THREE.Color(0xFF4F00); // Mango Orange
    const color2 = new THREE.Color(0x3366FF); // Space Blue
    const color3 = new THREE.Color(0xFFFFFF); // White

    for(let i = 0; i < particlesCount * 3; i+=3) {
        // Spread particles over a large area
        posArray[i] = (Math.random() - 0.5) * 2000;     // x
        posArray[i+1] = (Math.random() - 0.5) * 2000;   // y
        posArray[i+2] = (Math.random() - 0.5) * 2000;   // z

        // Mix colors randomly
        const mixedColor = color3.clone();
        const rand = Math.random();
        if(rand < 0.3) mixedColor.lerp(color1, Math.random());
        else if(rand < 0.6) mixedColor.lerp(color2, Math.random());

        colorsArray[i] = mixedColor.r;
        colorsArray[i+1] = mixedColor.g;
        colorsArray[i+2] = mixedColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    // Material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Slowly rotate the entire particle system
        particlesMesh.rotation.y = elapsedTime * 0.05;
        particlesMesh.rotation.x = elapsedTime * 0.02;

        // Smooth mouse follow
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
        particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

        renderer.render(scene, camera);
    }

    animate();

    // Resize Handling
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Project Modal Logic
const projectData = {
    degreefyd: {
        title: "DegreeFYD",
        subtitle: "Advanced College Discovery Platform",
        techStack: ["React.js", "Tailwind CSS", "Node.js", "Express.js", "MongoDB"],
        features: [
            "Engineered a comparison system to evaluate college ROI, infrastructure, and fees.",
            "Built a full-stack architecture ensuring seamless data flow and high performance.",
            "Designed modern, responsive UI components for intuitive user navigation."
        ]
    },
    hireverse: {
        title: "HireVerse",
        subtitle: "Enterprise Job Portal",
        techStack: ["React.js", "Node.js", "Express.js", "MongoDB"],
        features: [
            "Developed a full-stack job portal with secure authentication and Role-Based Access Control.",
            "Implemented robust RESTful APIs for job postings, applications, and resume uploads.",
            "Designed an applicant tracking system using advanced database aggregations."
        ]
    },
    staysphere: {
        title: "StaySphere",
        subtitle: "Global Rental Architecture",
        techStack: ["Node.js", "Express.js", "MongoDB", "EJS"],
        features: [
            "Developed a full-stack rental booking platform optimized for performance.",
            "Designed RESTful APIs with comprehensive CRUD operations for property management.",
            "Implemented server-side rendering for improved SEO and initial load times."
        ]
    },
    spotify: {
        title: "Spotify Trends Analysis",
        subtitle: "Deep Dive into 176k Tracks",
        techStack: ["Tableau", "Data Analytics", "Python"],
        features: [
            "Analyzed the Ultimate Spotify Tracks dataset encompassing over 176k songs.",
            "Explored and visualized relationships between song energy, tempo, and valence.",
            "Created interactive dashboards to uncover deep musical trends and listener preferences."
        ]
    }
};

function initProjectModals() {
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('close-modal');
    const modalBody = document.getElementById('modal-body');
    const bentoCards = document.querySelectorAll('.bento-card[data-project]');

    bentoCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if(e.target.closest('a') || e.target.closest('.bento-btn-icon')) return;
            const projectKey = card.getAttribute('data-project');
            openModal(projectKey);
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    function openModal(key) {
        const data = projectData[key];
        if(!data) return;

        modalBody.innerHTML = `
            <div class="modal-header">
                <h2>${data.title}</h2>
                <p>${data.subtitle}</p>
            </div>
            <div class="modal-grid">
                <div class="modal-section">
                    <h3>Key Features</h3>
                    <ul class="features-list">
                        ${data.features.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>
                <div class="modal-section">
                    <h3>Tech Stack</h3>
                    <div class="tech-stack-tags">
                        ${data.techStack.map(t => `<span>${t}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}
