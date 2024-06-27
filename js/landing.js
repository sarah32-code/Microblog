"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector("#loginForm");

    loginForm.onsubmit = function (event) {
        event.preventDefault();
        login();
    };

    function login() {
        const username = loginForm.username.value;
        const password = loginForm.password.value;

        const loginData = {
            username: username,
            password: password,
        };

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData),
        };

        fetch("http://microbloglite.us-east-2.elasticbeanstalk.com/auth/login", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Login failed");
                }
                return response.json();
            })
            .then(data => {
                saveLoginData(data);
                window.location.replace("./posts.html");
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Login failed. Please try again.");
            });
    }
});
