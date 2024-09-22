const unsplashApiKey = 'x-DK0BZuWCwwivajMtT8Fcw4xNBZB2dTd0KwXW6X6gg';
const galleryContainer = document.getElementById('gallery-container');
const detailsContainer = document.getElementById('details-container');
const closeDetailsBtn = document.getElementById('close-details-btn');
const imageSide = document.getElementById('image-side');
const detailsSide = document.getElementById('details-side');
const likedPageBtn = document.getElementById('liked-page-btn');

// Load liked and disliked images from local storage or initialize as empty arrays
let likedImages = JSON.parse(localStorage.getItem('likedImages')) || [];
let dislikedImages = JSON.parse(localStorage.getItem('dislikedImages')) || [];

// Load the "Modern Art" section on initial page load
loadImages("modern");

// Add event listeners for section buttons to load respective images
document.querySelectorAll('.section-btn').forEach(button => {
    button.addEventListener('click', function() {
        const section = this.dataset.section; // Get the section from the button's data attribute
        loadImages(section); // Load images for the selected section
    });
});

// Event listener to close the details view
closeDetailsBtn.addEventListener('click', () => {
    detailsContainer.style.display = 'none'; // Hide the details container
});

// Event listener to display liked images when the button is clicked
likedPageBtn.addEventListener('click', () => {
    displayLikedImages(); // Call function to display liked images
});

// Function to load images from Unsplash based on the selected section
function loadImages(section) {
    galleryContainer.innerHTML = ''; // Clear the gallery container

    let query = ''; // Variable to hold the query for API
    // Define the query based on the selected section
    if (section === 'modern') query = 'modern+art';
    if (section === 'sculptures') query = 'sculpture';
    if (section === 'classics') query = 'classic+art';

    console.log(`Fetching images for section: ${section}`); // Log the section being fetched

    // Fetch images from Unsplash API
    fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=12&client_id=${unsplashApiKey}`)
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data); // Log the API response
            if (data && data.results) {
                // Loop through each image and create an image card
                data.results.forEach(image => {
                    const imageCard = createImageCard(image);
                    galleryContainer.appendChild(imageCard); // Append the card to the gallery
                });
            } else {
                console.error('No results found', data); // Log an error if no results
            }
        })
        .catch(error => {
            console.error('Error fetching data from API:', error); // Log any fetch errors
        });
}

// Function to create an image card for display
function createImageCard(image, isLikedPage = false) {
    const card = document.createElement('div');
    card.classList.add('image-card'); // Add CSS class for styling

    const imgElement = document.createElement('img');
    imgElement.src = image.urls.small; // Set image source
    imgElement.alt = image.alt_description; // Set alt text

    // Create heart icon for liking
    const heartIcon = document.createElement('div');
    heartIcon.innerHTML = `<svg class="heart-icon white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>`;

    // Create dislike button
    const dislikeButton = document.createElement('button');
    dislikeButton.textContent = 'Dislike'; // Set button text
    dislikeButton.style.backgroundColor = '#ff0000'; // Red for dislike
    dislikeButton.style.color = 'white';
    dislikeButton.style.border = 'none';
    dislikeButton.style.cursor = 'pointer';

    // Check if the image is liked or disliked
    if (likedImages.some(img => img.id === image.id)) {
        heartIcon.querySelector('.heart-icon').classList.remove('white');
        heartIcon.querySelector('.heart-icon').classList.add('red'); // Change icon color if liked
    } else if (dislikedImages.some(img => img.id === image.id)) {
        card.style.border = '2px solid #ff0000'; // Highlight disliked images
    }

    // Event listener to toggle like status
    heartIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent card click event
        toggleLike(image, heartIcon); // Call function to toggle like
    });

    // Event listener to toggle dislike status
    dislikeButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent card click event
        toggleDislike(image, card); // Call function to toggle dislike
    });

    // Event listener to show image details on click
    imgElement.addEventListener('click', () => {
        showImageDetails(image); // Call function to show image details
    });

    // Append elements to the card
    card.appendChild(heartIcon);
    card.appendChild(imgElement);
    card.appendChild(dislikeButton);

    return card; // Return the created image card
}

// Function to toggle the like status of an image
function toggleLike(image, heartIcon) {
    const heartElement = heartIcon.querySelector('.heart-icon');
    const isLiked = heartElement.classList.contains('red'); // Check if already liked

    if (isLiked) {
        // Remove like
        likedImages = likedImages.filter(img => img.id !== image.id);
        heartElement.classList.remove('red');
        heartElement.classList.add('white'); // Change icon color
        alert('Like removed!'); 
    } else {
        // Add like
        likedImages.push(image);
        heartElement.classList.remove('white');
        heartElement.classList.add('red'); // Change icon color
    }

    // Update local storage with new liked images
    localStorage.setItem('likedImages', JSON.stringify(likedImages));
}

// Function to toggle the dislike status of an image
function toggleDislike(image, card) {
    const isDisliked = dislikedImages.some(img => img.id === image.id); // Check if already disliked

    if (isDisliked) {
        // Remove dislike
        dislikedImages = dislikedImages.filter(img => img.id !== image.id);
        card.style.border = 'none'; // Remove border for undiscussed images
    } else {
        // Add dislike
        dislikedImages.push(image);
        card.style.border = '2px solid #ff0000'; // Highlight disliked images
    }

    // Update local storage with new disliked images
    localStorage.setItem('dislikedImages', JSON.stringify(dislikedImages));
}

// Function to show details of a clicked image
function showImageDetails(image) {
    imageSide.innerHTML = ''; // Clear previous details

    const imageContainer = document.createElement('div');
    imageContainer.style.position = 'relative'; // Set relative positioning for absolute child elements

    const imgElement = document.createElement('img');
    imgElement.src = image.urls.regular; // Set the larger image source
    imgElement.alt = image.alt_description; // Set alt text

    // Create heart icon for liking in the details view
    const heartIcon = document.createElement('div');
    heartIcon.innerHTML = `<svg class="heart-icon ${likedImages.some(img => img.id === image.id) ? 'red' : 'white'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>`;

    heartIcon.style.position = 'absolute'; // Set absolute positioning
    heartIcon.style.top = '10px'; // Position it at the top
    heartIcon.style.right = '10px'; // Position it at the right
    heartIcon.style.cursor = 'pointer'; // Change cursor to pointer on hover

    // Event listener to toggle like status in the details view
    heartIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the image click event from firing
        toggleLike(image, heartIcon); // Call function to toggle like
    });

    // Append the image and heart icon to the details view
    imageContainer.appendChild(imgElement);
    imageContainer.appendChild(heartIcon);
    imageSide.appendChild(imageContainer);

    // Display image details
    detailsSide.innerHTML = `
        <p>${image.description || 'No Title'}</p>
        <p>By: ${image.user.name}</p>
        <p>Likes: ${image.likes}</p>
        <p><a href="${image.links.html}" target="_blank">View on Unsplash</a></p>
    `;

    detailsContainer.style.display = 'block'; // Show the details container
}

// Function to display all liked images
function displayLikedImages() {
    galleryContainer.innerHTML = ''; // Clear the gallery container

    if (likedImages.length === 0) {
        galleryContainer.innerHTML = '<p>No liked images yet!</p>'; // Message if no liked images
        return;
    }

    // Loop through liked images and create image cards for display
    likedImages.forEach(image => {
        const imageCard = createImageCard(image, true);
        galleryContainer.appendChild(imageCard); // Append each card to the gallery
    });
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
