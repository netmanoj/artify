const unsplashApiKey = 'x-DK0BZuWCwwivajMtT8Fcw4xNBZB2dTd0KwXW6X6gg';
const galleryContainer = document.getElementById('gallery-container');
const detailsContainer = document.getElementById('details-container');
const closeDetailsBtn = document.getElementById('close-details-btn');
const imageSide = document.getElementById('image-side');
const detailsSide = document.getElementById('details-side');
const likedPageBtn = document.getElementById('liked-page-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const collectionsBtn = document.getElementById('collections-btn');
const collectionsModal = document.getElementById('collections-modal');
const createCollectionModal = document.getElementById('create-collection-modal');
const createCollectionBtn = document.getElementById('create-collection-btn');
const collectionForm = document.getElementById('collection-form');
const collectionsList = document.getElementById('collections-list');

// Load liked and disliked images from local storage or initialize as empty arrays
let likedImages = JSON.parse(localStorage.getItem('likedImages')) || [];
let dislikedImages = JSON.parse(localStorage.getItem('dislikedImages')) || [];

// Variables for pagination
let currentPage = 1;
let currentSection = 'modern';
let isLoading = false;
let hasMoreImages = true;
let currentSearchQuery = '';

// Load collections from local storage or initialize as empty array
let collections = JSON.parse(localStorage.getItem('collections')) || [];

// Add event listeners for search
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
        currentSearchQuery = query;
        currentPage = 1;
        hasMoreImages = true;
        galleryContainer.innerHTML = '';
        loadImages('search');
    }
}

// Load the "Explore" section on initial page load
loadImages("explore");

// Add event listeners for section buttons to load respective images
document.querySelectorAll('.section-btn').forEach(button => {
    button.addEventListener('click', function() {
        const section = this.dataset.section;
        currentSection = section;
        currentPage = 1;
        hasMoreImages = true;
        currentSearchQuery = '';
        searchInput.value = '';
        loadImages(section);
    });
});

// Add scroll event listener for infinite scroll
window.addEventListener('scroll', () => {
    if (isLoading || !hasMoreImages) return;
    
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
        loadMoreImages();
    }
});

// Event listener to close the details view
closeDetailsBtn.addEventListener('click', () => {
    detailsContainer.style.display = 'none'; // Hide the details container
});

// Event listener to display liked images when the button is clicked
likedPageBtn.addEventListener('click', () => {
    displayLikedImages(); // Call function to display liked images
});

// Add scroll-to-top button functionality
const scrollTopBtn = document.getElementById('scroll-top-btn');
const loadingIndicator = document.getElementById('loading-indicator');

// Show/hide scroll-to-top button based on scroll position
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

// Scroll to top when button is clicked
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Function to load more images
function loadMoreImages() {
    if (isLoading || !hasMoreImages) return;
    
    isLoading = true;
    loadingIndicator.classList.add('show');
    currentPage++;
    loadImages(currentSection, true);
}

// Function to load images from Unsplash based on the selected section
function loadImages(section, loadMore = false) {
    if (!loadMore) {
        galleryContainer.innerHTML = ''; // Clear the gallery container
    }
    
    const likedPageBtn = document.getElementById('liked-page-btn');
    
    // Update active state of buttons
    document.querySelectorAll('.section-btn').forEach(btn => btn.classList.remove('active'));
    if (section !== 'search') {
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
    }
    likedPageBtn.classList.remove('active');

    let query = ''; // Variable to hold the query for API
    // Define the query based on the selected section
    if (section === 'search') query = currentSearchQuery;
    else if (section === 'explore') query = 'art+gallery';
    else if (section === 'modern') query = 'modern+art';
    else if (section === 'sculptures') query = 'sculpture';
    else if (section === 'classics') query = 'classic+art';

    console.log(`Fetching images for section: ${section}`); // Log the section being fetched

    // Fetch images from Unsplash API
    fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=12&page=${currentPage}&client_id=${unsplashApiKey}`)
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data); // Log the API response
            if (data && data.results) {
                // Loop through each image and create an image card
                data.results.forEach(image => {
                    const imageCard = createImageCard(image);
                    galleryContainer.appendChild(imageCard);
                });
                
                // Check if we have more images to load
                hasMoreImages = data.total_pages > currentPage;
            } else {
                console.error('No results found', data);
                hasMoreImages = false;
            }
        })
        .catch(error => {
            console.error('Error fetching data from API:', error);
            hasMoreImages = false;
        })
        .finally(() => {
            isLoading = false;
            loadingIndicator.classList.remove('show');
        });
}

// Function to create an image card for display
function createImageCard(image, isLikedPage = false) {
    const card = document.createElement('div');
    card.classList.add('image-card');
    card.setAttribute('data-image-id', image.id);

    const imgElement = document.createElement('img');
    imgElement.src = image.urls.small;
    imgElement.alt = image.alt_description;

    // Create heart icon for liking
    const heartIcon = document.createElement('div');
    heartIcon.className = 'heart-icon-container';
    heartIcon.innerHTML = `<svg class="heart-icon ${likedImages.some(img => img.id === image.id) ? 'purple' : 'white'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>`;

    // Event listener to toggle like status
    heartIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        const heartElement = heartIcon.querySelector('.heart-icon');
        const isLiked = heartElement.classList.contains('purple');

        if (isLiked) {
            showUnlikeConfirmation(image.id);
        } else {
            // Add like
            likedImages.push(image);
            heartElement.classList.remove('white');
            heartElement.classList.add('purple');
            localStorage.setItem('likedImages', JSON.stringify(likedImages));
            showFeedback('Image added to liked collection!');
        }
    });

    // Event listener to show image details on click
    imgElement.addEventListener('click', () => {
        showImageDetails(image);
    });

    // Append elements to the card
    card.appendChild(heartIcon);
    card.appendChild(imgElement);

    return card;
}

function showUnlikeConfirmation(imageId) {
    const confirmationAlert = document.getElementById('unlike-confirmation');
    const confirmBtn = document.getElementById('confirm-unlike');
    const cancelBtn = document.getElementById('cancel-unlike');
    
    // Remove any existing event listeners
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    
    // Get fresh references after cloning
    const newConfirmBtn = document.getElementById('confirm-unlike');
    const newCancelBtn = document.getElementById('cancel-unlike');
    
    // Show the confirmation alert
    confirmationAlert.style.display = 'block';
    
    // Handle confirm button click
    newConfirmBtn.addEventListener('click', () => {
        // Add removing class for fade out animation
        const imageCard = document.querySelector(`[data-image-id="${imageId}"]`);
        if (imageCard) {
            // Only remove from DOM if we're in the liked images view
            if (document.getElementById('liked-page-btn').classList.contains('active')) {
                imageCard.classList.add('removing');
                setTimeout(() => {
                    imageCard.remove();
                }, 300);
            }
            
            // Remove from localStorage
            likedImages = likedImages.filter(img => img.id !== imageId);
            localStorage.setItem('likedImages', JSON.stringify(likedImages));
            
            // Update heart icon state in all instances of this image
            const heartIcons = document.querySelectorAll(`[data-image-id="${imageId}"] .heart-icon, [data-image-id="${imageId}"] .fa-heart`);
            heartIcons.forEach(icon => {
                if (icon.classList.contains('heart-icon')) {
                    icon.classList.remove('purple');
                    icon.classList.add('white');
                } else {
                    icon.classList.remove('purple');
                }
            });
            
            // Show feedback message
            showFeedback('Image removed from liked collection!');
            
            // Hide confirmation alert
            confirmationAlert.style.display = 'none';
        }
    });
    
    // Handle cancel button click
    newCancelBtn.addEventListener('click', () => {
        confirmationAlert.style.display = 'none';
    });

    // Close alert when clicking outside
    const closeAlert = (e) => {
        if (e.target === confirmationAlert) {
            confirmationAlert.style.display = 'none';
        }
    };
    
    confirmationAlert.addEventListener('click', closeAlert);

    // Prevent event propagation when clicking inside the alert
    confirmationAlert.querySelector('.confirmation-alert-buttons').addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Function to toggle the dislike status of an image
function toggleDislike(image, card) {
    const isDisliked = dislikedImages.some(img => img.id === image.id);
    const isLiked = likedImages.some(img => img.id === image.id);

    if (isDisliked) {
        // Remove dislike
        dislikedImages = dislikedImages.filter(img => img.id !== image.id);
        card.style.border = 'none';
    } else {
        // Add dislike and remove from liked if present
        dislikedImages.push(image);
        if (isLiked) {
            likedImages = likedImages.filter(img => img.id !== image.id);
            localStorage.setItem('likedImages', JSON.stringify(likedImages));
            // If we're in the liked images tab, remove the card
            if (document.getElementById('liked-page-btn').classList.contains('active')) {
                card.remove();
            }
        }
        card.style.border = '2px solid #ff0000';
    }

    localStorage.setItem('dislikedImages', JSON.stringify(dislikedImages));
}

// Function to show details of a clicked image
function showImageDetails(image) {
    imageSide.innerHTML = ''; // Clear previous details
    detailsContainer.style.display = 'block';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'details-image-container';

    const imgElement = document.createElement('img');
    imgElement.src = image.urls.regular;
    imgElement.alt = image.alt_description;
    imgElement.className = 'details-image';

    // Create heart icon for liking in the details view
    const heartIcon = document.createElement('div');
    heartIcon.className = 'details-like-btn';
    heartIcon.innerHTML = `
        <i class="fas fa-heart ${likedImages.some(img => img.id === image.id) ? 'purple' : ''}"></i>
        <span class="likes-count">${image.likes}</span>
    `;

    heartIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        const isLiked = heartIcon.querySelector('i').classList.contains('purple');
        if (isLiked) {
            showUnlikeConfirmation(image.id);
        } else {
            likedImages.push(image);
            heartIcon.querySelector('i').classList.add('purple');
            localStorage.setItem('likedImages', JSON.stringify(likedImages));
            showFeedback('Image added to liked collection!');
        }
    });

    // Append the image and heart icon to the details view
    imageContainer.appendChild(imgElement);
    imageSide.appendChild(imageContainer);

    // Display image details
    detailsSide.innerHTML = `
        <div class="details-content">
            <h2 class="details-title">${image.description || 'Untitled Artwork'}</h2>
            <div class="details-info">
                <p class="artist-name">By: ${image.user.name}</p>
                <div class="details-actions">
                    ${heartIcon.outerHTML}
                    <a href="${image.links.html}" target="_blank" class="unsplash-link">
                        View on Unsplash <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
            ${image.location?.title ? `<p class="location">📍 ${image.location.title}</p>` : ''}
            ${image.exif?.make ? `<p class="camera">📸 ${image.exif.make} ${image.exif.model || ''}</p>` : ''}
        </div>
    `;

    // Add the "Add to Collection" button
    const addToCollectionBtn = addToCollection(image);
    detailsSide.querySelector('.details-content').appendChild(addToCollectionBtn);
}

// Function to display all liked images
function displayLikedImages() {
    galleryContainer.innerHTML = '';
    const likedPageBtn = document.getElementById('liked-page-btn');
    
    // Update active state of buttons
    document.querySelectorAll('.section-btn').forEach(btn => btn.classList.remove('active'));
    likedPageBtn.classList.add('active');

    if (likedImages.length === 0) {
        galleryContainer.innerHTML = '<p class="no-images-message">No liked images yet!</p>';
        return;
    }

    // Loop through liked images and create image cards for display
    likedImages.forEach(image => {
        const imageCard = createImageCard(image, true);
        galleryContainer.appendChild(imageCard);
    });
    
    // Disable infinite scroll for liked images
    hasMoreImages = false;
}

// Function to show the welcome message with animation
function showWelcomeMessage() {
    const welcomeMessage = document.getElementById('welcome-message');
    
    // Check if the welcome message has already been shown
    if (localStorage.getItem('welcomeDisplayed')) {
        return; // Exit if already displayed
    }

    // Show the message immediately
    welcomeMessage.classList.remove('hidden'); // Remove hidden class
    setTimeout(() => {
        welcomeMessage.classList.add('show'); // Add show class to trigger fade-in
    }, 100); // Short delay for better effect

    // Hide the message after a few seconds
    setTimeout(() => {
        welcomeMessage.classList.remove('show'); // Fade out
        setTimeout(() => {
            welcomeMessage.classList.add('hidden'); // Hide completely
        }, 500); // Wait for fade-out to finish
    }, 1000); // Show for 1 s

    // Set a flag in localStorage to indicate the message has been displayed
    localStorage.setItem('welcomeDisplayed', 'true');
}

// Call the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', showWelcomeMessage);

// Collections Modal Event Listeners
collectionsBtn.addEventListener('click', () => {
    // Update active state of buttons
    document.querySelectorAll('.section-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#liked-page-btn, #collections-btn').forEach(btn => btn.classList.remove('active'));
    collectionsBtn.classList.add('active');
    
    // Show collections modal
    collectionsModal.style.display = 'flex';
    renderCollections();
});

// Update close button event listeners
document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.closest('#collections-modal')) {
            collectionsModal.style.display = 'none';
            collectionsModal.classList.remove('add-to-collection-mode');
        } else if (btn.closest('#create-collection-modal')) {
            createCollectionModal.style.display = 'none';
        }
    });
});

createCollectionBtn.addEventListener('click', () => {
    collectionsModal.style.display = 'none';
    createCollectionModal.style.display = 'flex';
});

collectionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('collection-name').value.trim();
    const description = document.getElementById('collection-description').value.trim();
    
    if (name) {
        const newCollection = {
            id: Date.now().toString(),
            name,
            description,
            images: [],
            createdAt: new Date().toISOString()
        };
        
        collections.push(newCollection);
        localStorage.setItem('collections', JSON.stringify(collections));
        
        // Show success feedback
        showFeedback('Collection created successfully!');
        
        createCollectionModal.style.display = 'none';
        collectionsModal.style.display = 'flex';
        renderCollections();
        collectionForm.reset();
    }
});

// Function to render collections
function renderCollections() {
    collectionsList.innerHTML = '';
    
    if (collections.length === 0) {
        collectionsList.innerHTML = '<p class="no-collections">No collections yet. Create one to get started!</p>';
        return;
    }
    
    collections.forEach(collection => {
        const collectionCard = document.createElement('div');
        collectionCard.className = 'collection-card';
        collectionCard.dataset.id = collection.id;
        collectionCard.innerHTML = `
            <div class="collection-header">
                <h3>${collection.name}</h3>
                <button class="delete-collection-btn" aria-label="Delete collection">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <p>${collection.description || 'No description'}</p>
            <p class="image-count">${collection.images.length} images</p>
        `;
        
        // Add click handler for collection card
        collectionCard.addEventListener('click', (e) => {
            // Prevent click if clicking delete button
            if (!e.target.closest('.delete-collection-btn')) {
                displayCollectionImages(collection);
            }
        });
        
        // Add delete button handler
        const deleteBtn = collectionCard.querySelector('.delete-collection-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
                collections = collections.filter(c => c.id !== collection.id);
                localStorage.setItem('collections', JSON.stringify(collections));
                renderCollections();
                showFeedback('Collection deleted successfully!');
            }
        });
        
        collectionsList.appendChild(collectionCard);
    });
}

// Function to display collection images
function displayCollectionImages(collection) {
    galleryContainer.innerHTML = '';
    
    // Update active state of buttons
    document.querySelectorAll('.section-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#liked-page-btn, #collections-btn').forEach(btn => btn.classList.remove('active'));
    collectionsBtn.classList.add('active');
    
    if (collection.images.length === 0) {
        galleryContainer.innerHTML = '<p class="no-images-message">No images in this collection yet!</p>';
        return;
    }
    
    // Show loading state
    galleryContainer.innerHTML = '<div class="loading-state">Loading collection...</div>';
    
    // Simulate loading for better UX
    setTimeout(() => {
        galleryContainer.innerHTML = '';
        collection.images.forEach(image => {
            const imageCard = createImageCard(image, true);
            
            // Add remove from collection button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-from-collection-btn';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.title = 'Remove from collection';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                collection.images = collection.images.filter(img => img.id !== image.id);
                localStorage.setItem('collections', JSON.stringify(collections));
                displayCollectionImages(collection);
                showFeedback('Image removed from collection!');
            });
            
            imageCard.appendChild(removeBtn);
            galleryContainer.appendChild(imageCard);
        });
    }, 500);
    
    collectionsModal.style.display = 'none';
    hasMoreImages = false;
}

// Function to add image to collection
function addToCollection(image) {
    const addToCollectionBtn = document.createElement('button');
    addToCollectionBtn.className = 'add-to-collection-btn';
    addToCollectionBtn.innerHTML = '<i class="fas fa-folder-plus"></i> Add to Collection';
    
    addToCollectionBtn.addEventListener('click', () => {
        // Close the details modal first
        detailsContainer.style.display = 'none';
        
        // Add mode indicator to collections modal
        collectionsModal.classList.add('add-to-collection-mode');
        collectionsModal.style.display = 'flex';
        renderCollections();
        
        // Add click handlers to collection cards
        const collectionCards = document.querySelectorAll('.collection-card');
        collectionCards.forEach(card => {
            card.addEventListener('click', () => {
                const collectionId = card.dataset.id;
                const collection = collections.find(c => c.id === collectionId);
                
                if (collection) {
                    if (!collection.images.some(img => img.id === image.id)) {
                        collection.images.push(image);
                        localStorage.setItem('collections', JSON.stringify(collections));
                        
                        // Show success feedback
                        showFeedback('Image added to collection!');
                        
                        // Reset modal state
                        collectionsModal.classList.remove('add-to-collection-mode');
                        collectionsModal.style.display = 'none';
                        
                        // Re-render collections
                        renderCollections();
                    } else {
                        showFeedback('Image already in collection!', 'warning');
                    }
                }
            });
        });
    });
    
    return addToCollectionBtn;
}

// Function to show feedback messages
function showFeedback(message, type = 'success') {
    const feedback = document.createElement('div');
    feedback.className = `feedback-message ${type}`;
    feedback.textContent = message;
    
    document.body.appendChild(feedback);
    
    // Trigger animation
    setTimeout(() => feedback.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        feedback.classList.remove('show');
        setTimeout(() => feedback.remove(), 300);
    }, 3000);
}
