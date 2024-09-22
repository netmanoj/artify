# Artify Art Gallery 

Welcome to the **Artify Art Gallery**! This project showcases art images from various categories, allowing users to like, dislike, and view detailed information for each image. A welcome animation greets users on their first visit.

## Live Preview
  https://artify-manoj.netlify.app/

## Features

- **Dynamic Image Gallery**: Displays art images from categories like Modern, Sculptures, and Classics.
- **Like/Dislike Functionality**: Users can like or dislike images, and their preferences are stored locally.
- **Image Details**: Clicking on an image reveals detailed information, including artist name and Unsplash link.
- **Welcome Animation**: A one-time welcome message animation appears when users visit the site for the first time.

## Technologies Used

- **HTML**
- **CSS**
- **JavaScript**
- **Unsplash API**: Fetches art images dynamically based on the selected category.

## Getting Started

To run the project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
2. **Go To the Folder**:
   ```bash
   cd artify
3. **Install Node Modules**:
   ```bash
   npm i
4. **Run **:
   ```bash
   npm run dev

## Code Snippets
```bash
1. Welcome Animation and Local Storage

function showWelcomeMessage() {
    const welcomeMessage = document.getElementById('welcome-message');

    // Check if the welcome message has been shown before
    if (localStorage.getItem('welcomeDisplayed')) return;

    // Display the welcome message
    welcomeMessage.classList.remove('hidden');
    setTimeout(() => welcomeMessage.classList.add('show'), 100);

    // Hide the message after a few seconds
    setTimeout(() => {
        welcomeMessage.classList.remove('show');
        setTimeout(() => welcomeMessage.classList.add('hidden'), 1000);
    }, 3000);

    // Mark the message as displayed in localStorage
    localStorage.setItem('welcomeDisplayed', 'true');
}

2. Liking an Image

function toggleLike(image, heartIcon) {
    const heartElement = heartIcon.querySelector('.heart-icon');
    const isLiked = heartElement.classList.contains('red');

    if (isLiked) {
        likedImages = likedImages.filter(img => img.id !== image.id);
        heartElement.classList.remove('red');
        heartElement.classList.add('white');
    } else {
        likedImages.push(image);
        heartElement.classList.remove('white');
        heartElement.classList.add('red');
    }

    // Update local storage with liked images
    localStorage.setItem('likedImages', JSON.stringify(likedImages));
}

3. Disliking an Image

function toggleDislike(image, card) {
    const isDisliked = dislikedImages.some(img => img.id === image.id);

    if (isDisliked) {
        dislikedImages = dislikedImages.filter(img => img.id !== image.id);
        card.style.border = 'none';
    } else {
        dislikedImages.push(image);
        card.style.border = '2px solid #ff0000'; 
    }

    // Update local storage with disliked images
    localStorage.setItem('dislikedImages', JSON.stringify(dislikedImages));
}
