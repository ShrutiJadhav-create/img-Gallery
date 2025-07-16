// Image Gallery Application
class ImageGallery {
    constructor() {
        this.images = [];
        this.currentModalImage = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeAnimations();
    }

    /**
     * Initialize GSAP animations for page load
     */
    initializeAnimations() {
        // Create timeline for entrance animations
        const tl = gsap.timeline();

        // Animate header
        tl.to('.header', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out'
        });

        // Animate upload section
        tl.to('.upload-section', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.4');

        // Animate empty state or gallery
        tl.to('.empty-state', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.3');

        // Animate footer
        tl.to('.footer', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.2');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        const imageUpload = document.getElementById('imageUpload');
        const uploadButton = document.querySelector('.upload-button');
        const modal = document.getElementById('imageModal');
        const modalClose = document.getElementById('modalClose');
        const modalBackdrop = document.querySelector('.modal__backdrop');

        // File upload events
        imageUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Upload button keyboard accessibility
        uploadButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                imageUpload.click();
            }
        });

        // Modal close events
        modalClose.addEventListener('click', () => this.closeModal());
        modalBackdrop.addEventListener('click', () => this.closeModal());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeModal();
            }
        });

        // Prevent default drag behaviors
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleDrop(e);
        });
    }

    /**
     * Handle file upload via input
     */
    handleFileUpload(event) {
        const files = Array.from(event.target.files);
        this.processFiles(files);
    }

    /**
     * Handle drag and drop file upload
     */
    handleDrop(event) {
        const files = Array.from(event.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length > 0) {
            this.processFiles(imageFiles);
        }
    }

    /**
     * Process uploaded files
     */
    processFiles(files) {
        if (files.length === 0) return;

        // Show loading state
        document.body.classList.add('loading');

        files.forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                this.readFile(file, index === files.length - 1);
            }
        });
    }

    /**
     * Read file using FileReader API
     */
    readFile(file, isLast) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const imageData = {
                src: e.target.result,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            };
            
            this.images.push(imageData);
            this.addImageToGallery(imageData);
            
            if (isLast) {
                // Remove loading state after last image
                document.body.classList.remove('loading');
                this.hideEmptyState();
            }
        };

        reader.onerror = () => {
            console.error('Error reading file:', file.name);
            if (isLast) {
                document.body.classList.remove('loading');
            }
        };

        reader.readAsDataURL(file);
    }

    /**
     * Add image to gallery with animation
     */
    addImageToGallery(imageData) {
        const galleryGrid = document.getElementById('galleryGrid');
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('tabindex', '0');
        galleryItem.setAttribute('role', 'button');
        galleryItem.setAttribute('aria-label', `View ${imageData.name}`);

        galleryItem.innerHTML = `
            <img src="${imageData.src}" alt="${imageData.name}" loading="lazy">
            <div class="gallery-item__info">
                <p class="gallery-item__filename">${imageData.name}</p>
            </div>
        `;

        // Add click event to open modal
        galleryItem.addEventListener('click', () => this.openModal(imageData));
        
        // Add keyboard navigation
        galleryItem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openModal(imageData);
            }
        });

        galleryGrid.appendChild(galleryItem);

        // Animate the new item
        gsap.fromTo(galleryItem, {
            opacity: 0,
            y: 30,
            scale: 0.8
        }, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out'
        });
    }

    /**
     * Hide empty state with animation
     */
    hideEmptyState() {
        const emptyState = document.getElementById('emptyState');
        if (!emptyState.classList.contains('hidden')) {
            gsap.to(emptyState, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                ease: 'power2.out',
                onComplete: () => {
                    emptyState.classList.add('hidden');
                }
            });
        }
    }

    /**
     * Show empty state with animation
     */
    showEmptyState() {
        const emptyState = document.getElementById('emptyState');
        if (emptyState.classList.contains('hidden')) {
            emptyState.classList.remove('hidden');
            gsap.fromTo(emptyState, {
                opacity: 0,
                y: 20
            }, {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: 'power2.out'
            });
        }
    }

    /**
     * Open modal with image
     */
    openModal(imageData) {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalFilename = document.getElementById('modalFilename');

        // Set modal content
        modalImage.src = imageData.src;
        modalImage.alt = imageData.name;
        modalFilename.textContent = imageData.name;

        // Store current image reference
        this.currentModalImage = imageData;

        // Show modal with animation
        modal.classList.add('active');
        
        // Focus management for accessibility
        modal.focus();
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';

        // Animate modal entrance
        gsap.fromTo(modal.querySelector('.modal__content'), {
            scale: 0.8,
            opacity: 0
        }, {
            scale: 1,
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out'
        });
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('imageModal');
        
        // Animate modal exit
        gsap.to(modal.querySelector('.modal__content'), {
            scale: 0.8,
            opacity: 0,
            duration: 0.2,
            ease: 'power2.in',
            onComplete: () => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
                this.currentModalImage = null;
            }
        });
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Clear all images from gallery
     */
    clearGallery() {
        const galleryGrid = document.getElementById('galleryGrid');
        const galleryItems = galleryGrid.querySelectorAll('.gallery-item');
        
        // Animate items out
        gsap.to(galleryItems, {
            opacity: 0,
            y: -20,
            scale: 0.8,
            duration: 0.3,
            stagger: 0.1,
            ease: 'power2.in',
            onComplete: () => {
                galleryGrid.innerHTML = '';
                this.images = [];
                this.showEmptyState();
            }
        });
    }
}

// Initialize the gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageGallery();
});

// Add some utility functions for enhanced user experience
window.addEventListener('load', () => {
    // Add smooth hover effects to buttons
    const buttons = document.querySelectorAll('.upload-button, .modal__close');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            gsap.to(button, {
                scale: 1.05,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
        
        button.addEventListener('mouseleave', () => {
            gsap.to(button, {
                scale: 1,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
    });
});

// Performance optimization: Lazy loading for images
const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
};

const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        }
    });
}, observerOptions);

// Error handling for image loading
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        console.error('Image failed to load:', e.target.src);
        // You could add a fallback image here
    }
}, true);
