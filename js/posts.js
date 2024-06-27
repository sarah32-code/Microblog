

"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const postForm = document.querySelector("#postForm");
    const postsList = document.querySelector("#postsList");

    postForm.addEventListener("submit", function (event) {
        event.preventDefault();
        createPost();
    });

    // Function to create a new post
    function createPost() {
        const postText = postForm.postText.value.trim();

        if (postText === '') {
            alert("Please enter some text.");
            return;
        }

        const loginData = getLoginData(); 
        const postData = {
            text: postText,
        };

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${loginData.token}`,
            },
            body: JSON.stringify(postData),
        };

        fetch("http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to create post");
                }
                return response.json();
            })
            .then(post => {
                // Update local posts array and save to localStorage
                posts.unshift(post);
                savePosts(posts);

                // Update UI
                displayPosts();
                postForm.reset();
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Failed to create post. Please try again.");
            });
    }

    // Function to fetch posts from API
    function loadPosts() {
        const loginData = getLoginData(); 
        const options = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${loginData.token}`,
            },
        };

        fetch("http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch posts");
                }
                return response.json();
            })
            .then(postsData => {
                // Update local posts array with fetched posts
                posts = postsData;
                savePosts(posts);

                // Update UI
                displayPosts();
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Failed to load posts. Please try again.");
            });
    }

    // Function to display posts
    function displayPosts() {
        postsList.innerHTML = '';

        const currentUser = getCurrentUser(); 

        posts.forEach(post => {
            const postDiv = document.createElement('div');
            postDiv.classList.add('post');
            postDiv.setAttribute('data-id', post._id);

            const postText = document.createElement('p');
            postText.textContent = post.text;

            const userInfo = document.createElement('small');
            userInfo.textContent = `By ${post.username} on ${new Date(post.createdAt).toLocaleString()}`;

            const likeBtn = document.createElement('button');
            likeBtn.textContent = 'Like';
            likeBtn.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'me-2');
            likeBtn.addEventListener('click', () => likePost(post._id));

            const unlikeBtn = document.createElement('button');
            unlikeBtn.textContent = 'Unlike';
            unlikeBtn.classList.add('btn', 'btn-sm', 'btn-outline-danger', 'me-2');
            unlikeBtn.addEventListener('click', () => unlikePost(post._id));

            const likesSpan = document.createElement('span');
            likesSpan.textContent = `Likes: ${post.likes.length}`;

            // Append elements to postDiv
            postDiv.appendChild(postText);
            postDiv.appendChild(userInfo);
            postDiv.appendChild(likeBtn);
            postDiv.appendChild(unlikeBtn);
            postDiv.appendChild(likesSpan);

            postsList.appendChild(postDiv);
        });
    }

    // Function to like a post
    function likePost(postId) {
        const post = posts.find(p => p._id === postId);
        if (post && !post.liked) {
            const loginData = getLoginData(); 
            const likeData = {
                postId: postId
            };

            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${loginData.token}`,
                },
                body: JSON.stringify(likeData),
            };

            fetch("http://microbloglite.us-east-2.elasticbeanstalk.com/api/likes", options)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to like post on server");
                    }
                    return response.json();
                })
                .then(like => {
                    post.likes.push(like); 
                    post.liked = true;
                    savePosts(posts); // Save posts to localStorage
                    displayPosts(); 
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("Failed to like post on server. Please try again.");
                });
        }
    }

    // Function to unlike a post
    function unlikePost(postId) {
        const post = posts.find(p => p._id === postId);
        if (post && post.liked) {
            const likeId = post.likes.find(like => like.postId === postId)._id;
            const loginData = getLoginData(); 

            const options = {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${loginData.token}`,
                },
            };

            fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/likes/${likeId}`, options)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to unlike post on server");
                    }
                    return response.json();
                })
                .then(data => {
                    post.likes = post.likes.filter(like => like._id !== likeId);
                    post.liked = false;
                    savePosts(posts); // Save posts to localStorage
                    displayPosts(); 
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("Failed to unlike post on server. Please try again.");
                });
        }
    }

    // Function to save posts to localStorage
    function savePosts(posts) {
        localStorage.setItem('posts', JSON.stringify(posts));
    }

    // Function to fetch posts from localStorage or initialize if not present
    function fetchPosts() {
        let storedPosts = localStorage.getItem('posts');
        return storedPosts ? JSON.parse(storedPosts) : [];
    }

    // Function to get current user 
    function getCurrentUser() {
        
        
        return {
            username: "sm" // Example username
        };
    }

    // Initial load of posts
    let posts = fetchPosts();
    displayPosts();

    // Initial load of posts from API
    loadPosts();
});
