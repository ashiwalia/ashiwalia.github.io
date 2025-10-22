// Load resume data and populate the page
let resumeData = null;

// Fetch resume data
async function loadResumeData() {
    try {
        const response = await fetch('data/resume-data.json');
        resumeData = await response.json();
        populatePage();
        initializeInteractions();
    } catch (error) {
        console.error('Error loading resume data:', error);
    }
}

// Populate page with data
function populatePage() {
    if (!resumeData) return;

    // Update hero section
    document.getElementById('hero-greeting').textContent = `Hi, I'm`;
    document.getElementById('hero-name').textContent = resumeData.personalInfo.name;
    document.getElementById('hero-title').textContent = resumeData.personalInfo.title;
    document.getElementById('hero-description').textContent = resumeData.personalInfo.subtitle;
    document.getElementById('contact-email').href = `mailto:${resumeData.personalInfo.email}`;

    // Update about section
    const aboutText = document.getElementById('about-text');
    resumeData.personalInfo.bio.forEach(paragraph => {
        const p = document.createElement('p');
        p.textContent = paragraph;
        aboutText.appendChild(p);
    });

    // Update profile image
    document.getElementById('profile-image').src = resumeData.personalInfo.profileImage;

    // Update tech stack
    updateTechStack();

    // Update experience
    updateExperience();

    // Update projects
    updateProjects();

    // Update social links
    document.getElementById('github-link').href = resumeData.personalInfo.socialLinks.github;
    document.getElementById('stackoverflow-link').href = resumeData.personalInfo.socialLinks.stackoverflow;
    document.getElementById('email-link').href = `mailto:${resumeData.personalInfo.email}`;
}

// Update tech stack
function updateTechStack() {
    const techStackGrid = document.getElementById('tech-stack-grid');
    techStackGrid.innerHTML = '';

    const techCategories = [
        { name: 'Mobile', key: 'mobile' },
        { name: 'Frontend', key: 'frontend' },
        { name: 'Backend', key: 'backend' },
        { name: 'Database', key: 'database' },
        { name: 'Cloud', key: 'cloud' },
        { name: 'Tools', key: 'tools' }
    ];

    techCategories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'tech-category';
        
        const heading = document.createElement('h4');
        heading.textContent = category.name;
        
        const ul = document.createElement('ul');
        
        resumeData.techStack[category.key].forEach(tech => {
            const li = document.createElement('li');
            li.textContent = tech;
            ul.appendChild(li);
        });
        
        categoryDiv.appendChild(heading);
        categoryDiv.appendChild(ul);
        techStackGrid.appendChild(categoryDiv);
    });
}

// Update experience
function updateExperience() {
    const timeline = document.getElementById('experience-timeline');
    timeline.innerHTML = '';

    // Reverse to show most recent first
    const experiences = [...resumeData.experience].reverse();

    experiences.forEach(exp => {
        const item = document.createElement('div');
        item.className = 'timeline-item scroll-reveal';
        
        item.innerHTML = `
            <h3 class="timeline-company">${exp.company}</h3>
            <div class="timeline-position">${exp.position}</div>
            <div class="timeline-period">${exp.period}</div>
        `;
        
        timeline.appendChild(item);
    });
}

// Update projects
function updateProjects(filter = 'all') {
    const projectsGrid = document.getElementById('projects-grid');
    projectsGrid.innerHTML = '';

    let filteredProjects = resumeData.projects;
    
    if (filter === 'featured') {
        filteredProjects = resumeData.projects.filter(p => p.featured);
    } else if (filter !== 'all') {
        filteredProjects = resumeData.projects.filter(p => p.category === filter);
    }

    filteredProjects.forEach(project => {
        const card = document.createElement('div');
        card.className = `project-card scroll-reveal ${project.featured ? 'project-featured' : ''}`;
        
        // Determine icon based on category
        const icon = project.category === 'mobile' ? '📱' : '🌐';
        
        // Build links HTML
        let linksHTML = '';
        if (project.links.playStore) {
            linksHTML += `<a href="${project.links.playStore}" target="_blank" class="project-link" title="Play Store">
                <i class="fab fa-google-play"></i>
            </a>`;
        }
        if (project.links.appStore) {
            linksHTML += `<a href="${project.links.appStore}" target="_blank" class="project-link" title="App Store">
                <i class="fab fa-app-store-ios"></i>
            </a>`;
        }
        if (project.links.website) {
            linksHTML += `<a href="${project.links.website}" target="_blank" class="project-link" title="Website">
                <i class="fas fa-external-link-alt"></i>
            </a>`;
        }
        
        // Build tags HTML
        const tagsHTML = project.tags.map(tag => 
            `<span class="project-tag">${tag}</span>`
        ).join('');
        
        // Build metrics HTML
        const metricsHTML = project.metrics ? 
            `<div class="project-metrics">📊 ${project.metrics}</div>` : '';
        
        card.innerHTML = `
            <div class="project-header">
                <div class="project-icon">${icon}</div>
                <div class="project-links">
                    ${linksHTML}
                </div>
            </div>
            <h3 class="project-title">${project.name}</h3>
            <p class="project-description">${project.description}</p>
            ${metricsHTML}
            <div class="project-tags">
                ${tagsHTML}
            </div>
        `;
        
        projectsGrid.appendChild(card);
    });

    // Re-apply scroll reveal to new elements
    observeScrollReveal();
}

// Project filter functionality
function initializeProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter projects
            const filter = button.dataset.filter;
            updateProjects(filter);
        });
    });
}

// Smooth scroll for navigation links
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll reveal animation
function observeScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1
    });
    
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}

// Navbar background on scroll
function initializeNavbarScroll() {
    const nav = document.querySelector('nav');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.backgroundColor = 'rgba(10, 25, 47, 0.98)';
            nav.style.boxShadow = '0 10px 30px -10px rgba(2, 12, 27, 0.7)';
        } else {
            nav.style.backgroundColor = 'rgba(10, 25, 47, 0.95)';
            nav.style.boxShadow = '0 10px 30px -10px rgba(2, 12, 27, 0.7)';
        }
    });
}

// Initialize all interactions
function initializeInteractions() {
    initializeProjectFilters();
    initializeSmoothScroll();
    observeScrollReveal();
    initializeNavbarScroll();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadResumeData);

// Add fade-in class to hero section
window.addEventListener('load', () => {
    document.querySelector('.hero-section').classList.add('fade-in');
});
