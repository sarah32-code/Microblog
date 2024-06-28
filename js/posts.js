"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const postForm = document.querySelector("#postForm");
    const postsList = document.querySelector("#postsList");
    let posts = []; // Initialize posts array

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
            likeBtn.addEventListener('click', () => handleLike(post._id));

            const unlikeBtn = document.createElement('button');
            unlikeBtn.textContent = 'Unlike';
            unlikeBtn.classList.add('btn', 'btn-sm', 'btn-outline-danger', 'me-2');
            unlikeBtn.addEventListener('click', () => handleUnlike(post._id));

            const likesSpan = document.createElement('span');
            likesSpan.textContent = `Likes: ${post.likes ? post.likes.length : 0}`; // Check if post.likes is defined

            // Append elements to postDiv
            postDiv.appendChild(postText);
            postDiv.appendChild(userInfo);

            // Conditionally add like or unlike button based on post.liked property
            if (post.liked) {
                postDiv.appendChild(unlikeBtn);
            } else {
                postDiv.appendChild(likeBtn);
            }

            postDiv.appendChild(likesSpan);
            postsList.appendChild(postDiv);
        });
    }

    // Function to handle liking a post
    function handleLike(postId) {
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
                    throw new Error("Failed to like post");
                }
                return response.json();
            })
            .then(like => {
                const index = posts.findIndex(post => post._id === postId);
                if (index !== -1) {
                    posts[index].likes.push(like);
                    posts[index].liked = true;
                    savePosts(posts); // Save updated posts locally
                    displayPosts(); // Update UI to reflect changes
                } else {
                    throw new Error("Post not found in local data");
                }
            })
            .catch(error => {
                console.error("Error liking post:", error);
                alert("Failed to like post. Please try again.");
            });
    }

    // Function to handle unliking a post
    function handleUnlike(postId) {
        const loginData = getLoginData();
        const post = posts.find(p => p._id === postId);

        if (post) {
            const like = post.likes.find(like => like.userId === loginData.userId);

            if (like) {
                const likeId = like._id;
                const options = {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${loginData.token}`,
                    },
                };

                fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/likes/${likeId}`, options)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Failed to unlike post");
                        }
                        return response.json();
                    })
                    .then(() => {
                        post.likes = post.likes.filter(like => like._id !== likeId);
                        post.liked = false;
                        savePosts(posts); // Save updated posts locally
                        displayPosts(); // Update UI to reflect changes
                    })
                    .catch(error => {
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

    // Function to save posts to localStorage
    function savePosts(posts) {
        localStorage.setItem('posts', JSON.stringify(posts));
    }

    // Initial load of posts from API
    loadPosts();

    // Function to sort posts by date posted (createdAt)
    function sortByDatePosted() {
        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        displayPosts(); // Update UI with sorted posts
    }

    // Event listener for sorting by date posted button
    document.getElementById('sortByDatePostedBtn').addEventListener('click', sortByDatePosted);

    // Function to sort posts by username
    function sortByUsername() {
        posts.sort((a, b) => {
            const usernameA = a.username.toLowerCase();
            const usernameB = b.username.toLowerCase();
            if (usernameA < usernameB) return -1;
            if (usernameA > usernameB) return 1;
            return 0;
        });
        displayPosts(); // Update UI with sorted posts
    }

    // Event listener for sorting by username button
    document.getElementById('sortByUsernameBtn').addEventListener('click', sortByUsername);
});
