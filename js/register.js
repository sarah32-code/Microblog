"use strict";

// Wait for the DOM to fully load before running the script
document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.querySelector("#registerForm"); // Get the registration form HTML

    registerForm.onsubmit = function (event) {  // Attach an event listener to the form's submit event
        event.preventDefault(); // Prevent the default
        register(); // Call the register function to handle user registration
    };

    function register() { // Function to handle user registration
        // Get the values entered in the registration form
        const username = registerForm.username.value;
        const fullName = registerForm.fullName.value;
        const password = registerForm.password.value;

        const userData = { // Create a user data object with the form values
            username: username,
            fullName: fullName,
            password: password,
        };
        // Set the options for the fetch request
        const options = {
            method: "POST", // HTTP method
            headers: {
                "Content-Type": "application/json", // Specify the content type as JSON
            },
            body: JSON.stringify(userData), // Convert the user data object to a JSON string
        };
        // Send a POST request to register the user
        fetch("http://microbloglite.us-east-2.elasticbeanstalk.com/api/users", options)
            .then(response => {
                if (!response.ok) { // Check if the response is not OK
                    throw new Error("Registration failed");
                }
                return response.json(); // Convert the response to JSON
            })
            .then(data => { // Display an alert indicating registration was successful
                alert("Registration successful! Please login.");
                window.location.replace("./index.html"); // Redirect to the login page
            })
            .catch(error => { // Hhandle the error
                console.error("Error:", error);
                alert("Registration failed. Please try again.");
            });
    }
});
