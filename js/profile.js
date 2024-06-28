"use strict";

document.addEventListener("DOMContentLoaded", function () {// laod the DOM
    const profileForm = document.querySelector("#profileForm"); // get the profle from HTML
    const loginData = getLoginData(); // Get the login data

    function loadProfile() { // Function to load the user's profile data
        // Send a GET request to fetch the user's profile data
        fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/users/${loginData.username}`, {
            method: "GET", // HTTP method
            headers: {
                Authorization: `Bearer ${loginData.token}`, // Authorization header with token
            },
        })
            .then(response => { // Check if the response is not OK
                if (!response.ok) { // Convert the response to JSON
                throw new Error("Failed to fetch user data");
            }
            return response.json();
        })
            .then(user => { // Populate the profile form with the user's data
            profileForm.username.value = user.username;
                profileForm.fullName.value = user.fullName || ''; // Use an empty string if fullName is undefined
                profileForm.bio.value = user.bio || ''; // Use an empty string if bio is undefined
        })
        .catch(error => {// error handling
            console.error("Error:", error);
            alert("Failed to load profile. Please try again.");
        });
    }
    // Attach an event listener to the form's submit event
    profileForm.addEventListener("submit", function (event) {  // Prevent the default
        event.preventDefault();
        updateProfile(); // ignore
    });

    function updateProfile() { // Function to update the user's profile data--
        const formData = new FormData(profileForm);// Create a FormData object from the profile form
        const options = { // Set the options for the fetch request 
            method: "PUT", // HTTP method
            headers: {
                Authorization: `Bearer ${loginData.token}`, // Authorization header with token
            },
            body: formData,
        };
        // Send a PUT request to update the user's profile data
        fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/users/${loginData.username}`, options)
        .then(response => {
            if (!response.ok) { //error handling
                throw new Error("Failed to update profile");
            }
            return response.json(); // Convert the response to JSON
        })
            .then(user => {// Display an alert indicating the profile was updated successfully
            alert("Profile updated successfully!");
                loadProfile(); // Reload the profile data
        })
        .catch(error => { //handle error
            console.error("Error:", error);
            alert("Failed to update profile. Please try again.");
        });
    }
    // Initial load of the user's profile data when the script runs
    loadProfile();
});
