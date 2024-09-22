const unsplashApiKey = 'x-DK0BZuWCwwivajMtT8Fcw4xNBZB2dTd0KwXW6X6gg';
const galleryContainer = document.getElementById('gallery-container');
const detailsContainer = document.getElementById('details-container');
const closeDetailsBtn = document.getElementById('close-details-btn');
const imageSide = document.getElementById('image-side');
const detailsSide = document.getElementById('details-side');
const likedPageBtn = document.getElementById('liked-page-btn');

let likedImages = [];
let dislikedImages = []; // Array to store disliked images

// Load "Modern Art" section on initial page load
loadImages("modern");

document.querySelectorAll('.section-btn').forEach(button => {
    button.addEventListener('click', function() {
        const section = this.dataset.section;
        loadImages(section);
    });
});

closeDetailsBtn.addEventListener('click', () => {
    detailsContainer.style.display = 'none';
});

likedPageBtn.addEventListener('click', () => {
    displayLikedImages();
});

function loadImages(section) {
    galleryContainer.innerHTML = '';

    let query = '';
    if (section === 'modern') query = 'modern+art';
    if (section === 'sculptures') query = 'sculpture';
    if (section === 'classics') query = 'classic+art';

    console.log(`Fetching images for section: ${section}`);

    fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=12&client_id=${unsplashApiKey}`)
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data);
            if (data && data.results) {
                data.results.forEach(image => {
                    const imageCard = createImageCard(image);
                    galleryContainer.appendChild(imageCard);
                });
            } else {
                console.error('No results found', data);
            }
        })
        .catch(error => {
            console.error('Error fetching data from API:', error);
        });
}

function createImageCard(image, isLikedPage = false) {
    const card = document.createElement('div');
    card.classList.add('image-card');

    const imgElement = document.createElement('img');
    imgElement.src = image.urls.small;
    imgElement.alt = image.alt_description;

    // Add heart icon for like/unlike
    const heartIcon = document.createElement('div');
    heartIcon.innerHTML = `<svg class="heart-icon white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>`;

    const dislikeButton = document.createElement('button');
    dislikeButton.textContent = 'Dislike';
    dislikeButton.style.backgroundColor = '#ff0000'; // Red for dislike
    dislikeButton.style.color = 'white';
    dislikeButton.style.border = 'none';
    dislikeButton.style.cursor = 'pointer';

    // Check if this image is liked or disliked
    if (likedImages.some(img => img.id === image.id)) {
        heartIcon.querySelector('.heart-icon').classList.remove('white');
        heartIcon.querySelector('.heart-icon').classList.add('red');
    } else if (dislikedImages.some(img => img.id === image.id)) {
        card.style.border = '2px solid #ff0000'; // Highlight disliked images
    }

    heartIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleLike(image, heartIcon);
    });

    dislikeButton.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleDislike(image, card);
    });

    imgElement.addEventListener('click', () => {
        showImageDetails(image);
    });

    card.appendChild(heartIcon);
    card.appendChild(imgElement);
    card.appendChild(dislikeButton);

    return card;
}

function toggleLike(image, heartIcon) {
    const heartElement = heartIcon.querySelector('.heart-icon');
    const isLiked = heartElement.classList.contains('red');

    if (isLiked) {
        likedImages = likedImages.filter(img => img.id !== image.id);
        heartElement.classList.remove('red');
        heartElement.classList.add('white');
        alert('Like removed!'); 
    } else {
        likedImages.push(image);
        heartElement.classList.remove('white');
        heartElement.classList.add('red');
    }

    // Update local storage
    localStorage.setItem('likedImages', JSON.stringify(likedImages));
}

function toggleDislike(image, card) {
    const isDisliked = dislikedImages.some(img => img.id === image.id);

    if (isDisliked) {
        dislikedImages = dislikedImages.filter(img => img.id !== image.id);
        card.style.border = 'none';
    } else {
        dislikedImages.push(image);
        card.style.border = '2px solid #ff0000'; 
    }

    // Update local storage
    localStorage.setItem('dislikedImages', JSON.stringify(dislikedImages));
}


function showImageDetails(image) {
    // Clear previous content
    imageSide.innerHTML = '';

    // Create a container for the image and the heart icon
    const imageContainer = document.createElement('div');
    imageContainer.style.position = 'relative'; // Make the container relative for absolute positioning

    const imgElement = document.createElement('img');
    imgElement.src = image.urls.regular;
    imgElement.alt = image.alt_description;

    // Create and add the like button in the details view
    const heartIcon = document.createElement('div');
    heartIcon.innerHTML = `<svg class="heart-icon ${likedImages.some(img => img.id === image.id) ? 'red' : 'white'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>`;

    heartIcon.style.position = 'absolute';
    heartIcon.style.top = '10px'; // Position it at the top
    heartIcon.style.right = '10px'; // Position it at the right
    heartIcon.style.cursor = 'pointer'; // Change cursor to pointer

    heartIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the image click event from firing
        toggleLike(image, heartIcon);
    });

    imageContainer.appendChild(imgElement);
    imageContainer.appendChild(heartIcon);
    imageSide.appendChild(imageContainer);

    detailsSide.innerHTML = `
        <p>${image.description || 'No Title'}</p>
        <p>By: ${image.user.name}</p>
        <p>Likes: ${image.likes}</p>
        <p><a href="${image.links.html}" target="_blank">View on Unsplash</a></p>
    `;

    detailsContainer.style.display = 'block';
}

function displayLikedImages() {
    galleryContainer.innerHTML = '';

    if (likedImages.length === 0) {
        galleryContainer.innerHTML = '<p>No liked images yet!</p>';
        return;
    }

    likedImages.forEach(image => {
        const imageCard = createImageCard(image, true);
        galleryContainer.appendChild(imageCard);
    });
}
