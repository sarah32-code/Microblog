"use strict";
// wait for the DOM to load fully before continuing
document.addEventListener("DOMContentLoaded", function () {
    const postForm = document.querySelector("#postForm");// get the post form and posts list element
    const postsList = document.querySelector("#postsList");
    let posts = []; // Initialize posts array
    //attach an event lister to the post form sumbit event
    postForm.addEventListener("submit", function (event) {
        event.preventDefault();// prevent default event submission
        createPost();// Call the createPost function to handle creating a new post
    });

    // Function to create a new post
    function createPost() {
        // Get the post text from the form and trim whitespace
        const postText = postForm.postText.value.trim();

        if (postText === '') {// Check if the post text is empty and alert the user if so
            alert("Please enter some text."); // is so throw this alert
            return;
        }

        const loginData = getLoginData();// Get the login data from a function
        const postData = {// Create an object containing the post data
            text: postText,
        };

        const options = {// Set the options for the fetch request
            method: "POST", // HTTP method
            headers: { // Content type of the request body
                "Content-Type": "application/json",
                Authorization: `Bearer ${loginData.token}`,// Authorization header with token
            },
            body: JSON.stringify(postData),// convert the post data to json
        };
        // Send a POST request to the posts endpoint
        fetch("http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts", options)
            .then(response => {
                if (!response.ok) { // Check if the response is not OK  and throw an error if it is
                    throw new Error("Failed to create post");
                }
                return response.json(); // Convert the response to JSON
            })
            .then(post => {
                // Update local posts array and save 
                posts.unshift(post); // Add the new post to the beginning of the array
                savePosts(posts);// Save updated posts array 

                // Update displayed posts array
                displayPosts();
                postForm.reset();// Reset the form for new posts
            })
            .catch(error => { // Error handling
                console.error("Error:", error);
                alert("Failed to create post. Please try again.");
            });
    }

    // Function to fetch posts from API
    function loadPosts() {
        // Get the login data from a function in login form
        const loginData = getLoginData(); // Set the options for the fetch request
        const options = {
            method: "GET",// HTTP method
            headers: {
                Authorization: `Bearer ${loginData.token}`,// Authorization header with token
            },
        };

        fetch("http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts", options)
            .then(response => {// Send a GET request to the posts endpoint
                if (!response.ok) {
                    throw new Error("Failed to fetch posts");// Check if the response is not OK and throw an error if it is
                }
                return response.json();// Convert the response to JSON
            })
            .then(postsData => {
                // Update local posts array with fetched posts
                posts = postsData;
                savePosts(posts); // Save posts

                displayPosts(); // Display the posts
            })
            .catch(error => { // handle error
                console.error("Error:", error);// Log any errors to the console
                // Display an alert to the user indicating the posts loading failed
                alert("Failed to load posts. Please try again.");
            });
    }

    // Function to display posts
    function displayPosts() {
        postsList.innerHTML = ''; // Clear the current posts list

        posts.forEach(post => { // Iterate over each post and create the  HTML elements
            const postDiv = document.createElement('div');
            postDiv.classList.add('post');// Add the post class for styling
            postDiv.setAttribute('data-id', post._id);// Set the post's ID as a data attribute

            const postText = document.createElement('p');
            postText.textContent = post.text;// Set the post text

            const userInfo = document.createElement('small'); // Set user info
            userInfo.textContent = `By ${post.username} on ${new Date(post.createdAt).toLocaleString()}`;

            const likeBtn = document.createElement('button');
            likeBtn.textContent = 'Like';
            likeBtn.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'me-2'); // Add Bootstrap classes for styling
            likeBtn.addEventListener('click', () => handleLike(post._id)); // Attach event listener for like button

            const unlikeBtn = document.createElement('button');  
            unlikeBtn.textContent = 'Unlike';
            unlikeBtn.classList.add('btn', 'btn-sm', 'btn-outline-danger', 'me-2');// Add Bootstrap classes for styling
            unlikeBtn.addEventListener('click', () => handleUnlike(post._id));// Attach event listener for unlike button

            const likesSpan = document.createElement('span');
            likesSpan.textContent = `Likes: ${post.likes ? post.likes.length : 0}`;// Set the number of likes

            // Append elements to postDiv
            postDiv.appendChild(postText);
            postDiv.appendChild(userInfo);

            //  add like or unlike button based on post.liked property
            if (post.liked) {
                postDiv.appendChild(unlikeBtn);
            } else {
                postDiv.appendChild(likeBtn);
            }

            postDiv.appendChild(likesSpan);
            postsList.appendChild(postDiv); // Append the postDiv to the posts list
        });
    }

    // Function to handle liking a post
    function handleLike(postId) { // Get the login data from a function
        const loginData = getLoginData();
        const likeData = {
            postId: postId // Set the post ID
        };

        const options = { // Set the options for the fetch request
            method: "POST", // HTTP method
            headers: {
                "Content-Type": "application/json",  // Content type of the request body
                Authorization: `Bearer ${loginData.token}`, // Authorization header with token
            },
            body: JSON.stringify(likeData), // Convert the like data to JSON
        };
        // Send a POST request to the likes endpoint
        fetch("http://microbloglite.us-east-2.elasticbeanstalk.com/api/likes", options)
            .then(response => {
                if (!response.ok) { // Check if the response is not OK
                    throw new Error("Failed to like post");
                }
                return response.json(); // Convert the response to JSON
            })
            .then(like => {
                // Find the index of the liked post in the posts array
                const index = posts.findIndex(post => post._id === postId);
                if (index !== -1) {
                    // Update the post's likes and liked status
                    posts[index].likes.push(like);
                    posts[index].liked = true;
                    savePosts(posts); // Save updated posts 
                    displayPosts(); // Update display to reflect changes
                } else {
                    throw new Error("Post not found in local data");
                }
            })
            .catch(error => { //handle error
                console.error("Error liking post:", error);
                alert("Failed to like post. Please try again.");
            });
    }

    // Function to handle unliking a post
    function handleUnlike(postId) { // Get the login data from a function
        const loginData = getLoginData(); // Find the post to unlike
        const post = posts.find(p => p._id === postId);

        if (post) {
            const like = post.likes.find(like => like.userId === loginData.userId);

            if (like) { // Find the like object for the current user
                const likeId = like._id;
                const options = {
                    method: "DELETE", // HTTP method
                    headers: {
                        Authorization: `Bearer ${loginData.token}`, // Authorization header with token
                    },
                };
                // Send a DELETE request to the likes endpoint
                fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/likes/${likeId}`, options)
                    .then(response => {
                        if (!response.ok) { // Check if the response is not OK
                            throw new Error("Failed to unlike post");
                        }
                        return response.json();
                    })
                    .then(() => { // Remove the like from the post's likes array and update liked status
                        post.likes = post.likes.filter(like => like._id !== likeId);
                        post.liked = false;
                        savePosts(posts); // Save updated posts locally
                        displayPosts(); // Update display to reflect changes
                    })
                    .catch(error => { // handle error
                        console.error("Error unliking post:", error);
                        alert("Failed to unlike post. Please try again.");
                    });
            } else {
                console.error("Error: Like not found for the current user on this post.");
            }
        } else {
            console.error("Error: Post not found.");
        }
    }

    // Function to save posts 
    function savePosts(posts) {
        localStorage.setItem('posts', JSON.stringify(posts));
    }

    // Initial load of posts from API
    loadPosts();

    // Function to sort posts by date posted (createdAt)
    function sortByDatePosted() {
        // Sort posts in descending order by createdAt date (newest first) using the Date object and the subtraction operator  -  new Date(b.createdAt) - new Date(a.createdAt)  to compare the dates.
        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // sort
        displayPosts(); // Update Display with sorted posts
    }

    // Event listener for sorting by date posted button
    document.getElementById('sortByDatePostedBtn').addEventListener('click', sortByDatePosted);

    // Function to sort posts by username
    function sortByUsername() { 
        posts.sort((a, b) => { // Sort posts by username in alphabetical order
            const usernameA = a.username.toLowerCase(); 
            const usernameB = b.username.toLowerCase();
            if (usernameA < usernameB) return -1;
            if (usernameA > usernameB) return 1;
            return 0;
        });
        displayPosts(); //update the display
    }

    // Event listener for sorting by username button
    document.getElementById('sortByUsernameBtn').addEventListener('click', sortByUsername);
});
