// ATS-Friendly Resume PDF Generator
// This creates a clean, parseable PDF that automated resume systems can read

// Check URL parameters on page load
function checkAutoDownload() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('download') === 'resume') {
        // Wait for resume data to load, then download
        const checkDataInterval = setInterval(() => {
            if (resumeData) {
                clearInterval(checkDataInterval);
                setTimeout(() => generateResumePDF(true), 500);
            }
        }, 100);
    }
}

// Call on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAutoDownload);
} else {
    checkAutoDownload();
}

async function generateResumePDF(isAutoDownload = false) {
    if (!resumeData) {
        alert('Resume data is still loading. Please try again in a moment.');
        return;
    }

    // Show loading state
    const downloadBtn = document.getElementById('download-resume-btn');
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    downloadBtn.disabled = true;

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        let yPos = 20;
        const pageWidth = 210; // A4 width in mm
        const margin = 20;
        const contentWidth = pageWidth - (2 * margin);
        
        // Helper function to add text with word wrap
        function addText(text, x, y, maxWidth, fontSize = 10, isBold = false) {
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');
            const lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, x, y);
            return lines.length * fontSize * 0.4; // Return height used
        }
        
        // Helper to add section divider
        function addDivider(y) {
            doc.setDrawColor(100, 255, 218);
            doc.setLineWidth(0.5);
            doc.line(margin, y, pageWidth - margin, y);
            return 5;
        }
        
        // 1. HEADER SECTION
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(resumeData.personalInfo.name, margin, yPos);
        yPos += 8;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(resumeData.personalInfo.title, margin, yPos);
        yPos += 8;
        
        // Contact Information
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Email: ${resumeData.personalInfo.email}`, margin, yPos);
        yPos += 5;
        doc.text(`GitHub: ${resumeData.personalInfo.socialLinks.github}`, margin, yPos);
        yPos += 5;
        doc.text(`StackOverflow: ${resumeData.personalInfo.socialLinks.stackoverflow}`, margin, yPos);
        yPos += 8;
        
        yPos += addDivider(yPos);
        yPos += 5;
        
        // 2. PROFESSIONAL SUMMARY
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PROFESSIONAL SUMMARY', margin, yPos);
        yPos += 7;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        resumeData.personalInfo.bio.forEach(paragraph => {
            const height = addText(paragraph, margin, yPos, contentWidth, 10, false);
            yPos += height + 3;
        });
        yPos += 5;
        
        // 3. TECHNICAL SKILLS
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TECHNICAL SKILLS', margin, yPos);
        yPos += 7;
        
        // Format skills(comma-separated within categories)
        const skillCategories = [
            { name: 'Mobile Development', key: 'mobile' },
            { name: 'Frontend Development', key: 'frontend' },
            { name: 'Backend Development', key: 'backend' },
            { name: 'Databases', key: 'database' },
            { name: 'Cloud & DevOps', key: 'cloud' },
            { name: 'Tools & Technologies', key: 'tools' }
        ];
        
        doc.setFontSize(10);
        skillCategories.forEach(category => {
            if (resumeData.techStack[category.key] && resumeData.techStack[category.key].length > 0) {
                doc.setFont('helvetica', 'bold');
                doc.text(`${category.name}:`, margin, yPos);
                yPos += 5;
                
                doc.setFont('helvetica', 'normal');
                const skills = resumeData.techStack[category.key].join(', ');
                const height = addText(skills, margin + 5, yPos, contentWidth - 5, 10, false);
                yPos += height + 4;
            }
        });
        yPos += 3;
        
        // Check if we need a new page
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        yPos += addDivider(yPos);
        yPos += 5;
        
        // 4. PROFESSIONAL EXPERIENCE
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PROFESSIONAL EXPERIENCE', margin, yPos);
        yPos += 7;
        
        // Reverse to show most recent first
        const experiences = [...resumeData.experience].reverse();
        experiences.forEach((exp, index) => {
            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }
            
            // Company and Position
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(exp.position, margin, yPos);
            yPos += 5;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`${exp.company} | ${exp.location}`, margin, yPos);
            yPos += 5;
            
            doc.setFont('helvetica', 'italic');
            doc.text(exp.period, margin, yPos);
            yPos += 7;
            
            // Add responsibilities if available
            if (exp.responsibilities && exp.responsibilities.length > 0) {
                doc.setFont('helvetica', 'normal');
                exp.responsibilities.forEach(resp => {
                    const height = addText(`• ${resp}`, margin + 5, yPos, contentWidth - 5, 9, false);
                    yPos += height + 2;
                });
            }
            
            yPos += 5;
        });
        
        // Check if we need a new page for projects
        if (yPos > 230) {
            doc.addPage();
            yPos = 20;
        }
        
        yPos += addDivider(yPos);
        yPos += 5;
        
        // 5. KEY PROJECTS
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('KEY PROJECTS', margin, yPos);
        yPos += 7;
        
        // Show featured projects first, then others
        const featuredProjects = resumeData.projects.filter(p => p.featured);
        const otherProjects = resumeData.projects.filter(p => !p.featured).slice(0, 5); // Limit to 5 other projects
        const allProjects = [...featuredProjects, ...otherProjects];
        
        allProjects.forEach((project, index) => {
            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }
            
            // Project name
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(project.name, margin, yPos);
            yPos += 5;
            
            // Technologies used (comma-separated)
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            const techs = project.tags.join(', ');
            const height1 = addText(`Technologies: ${techs}`, margin, yPos, contentWidth, 9, false);
            yPos += height1 + 3;
            
            // Description
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            const height2 = addText(project.description, margin, yPos, contentWidth, 9, false);
            yPos += height2 + 2;
            
            // Metrics if available
            if (project.metrics) {
                doc.setFont('helvetica', 'bold');
                doc.text(`Impact: ${project.metrics}`, margin, yPos);
                yPos += 4;
            }
            
            yPos += 5;
        });
        
        // 6. FOOTER - Add generation date
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(128, 128, 128);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 287, { align: 'center' });
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, 287, { align: 'right' });
        }
        
        // Save the PDF
        const fileName = `${resumeData.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
        doc.save(fileName);
        
        // Show success message
        if (!isAutoDownload) {
            showNotification('Resume downloaded successfully!', 'success');
        }
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        showNotification('Error generating resume. Please try again.', 'error');
    } finally {
        // Restore button state
        if (!isAutoDownload) {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }
    }
}

// Copy resume download link to clipboard
async function copyResumeLink() {
    const baseUrl = window.location.origin + window.location.pathname;
    const resumeLink = `${baseUrl}?download=resume`;
    
    try {
        await navigator.clipboard.writeText(resumeLink);
        showNotification('Resume link copied to clipboard!', 'success');
        
        // Change button text temporarily
        const copyBtn = document.getElementById('copy-resume-link-btn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Link Copied!';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 3000);
    } catch (error) {
        console.error('Failed to copy link:', error);
        
        // Fallback: Show the link in a prompt
        prompt('Copy this link to share your resume:', resumeLink);
        showNotification('Please copy the link manually', 'info');
    }
}

// Simple notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: ${type === 'success' ? '#27c93f' : '#ff5f56'};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
