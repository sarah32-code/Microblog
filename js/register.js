"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.querySelector("#registerForm");

    registerForm.onsubmit = function (event) {
        event.preventDefault();
        register();
    };

    function register() {
        const username = registerForm.username.value;
        const fullName = registerForm.fullName.value;
        const password = registerForm.password.value;

        const userData = {
            username: username,
            fullName: fullName,
            password: password,
        };

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        };

        fetch("http://microbloglite.us-east-2.elasticbeanstalk.com/api/users", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Registration failed");
                }
                return response.json();
            })
            .then(data => {
                alert("Registration successful! Please login.");
                window.location.replace("./index.html");
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Registration failed. Please try again.");
            });
    }
});
