"use strict";
// wait for the DOM to fully load before continuing
document.addEventListener("DOMContentLoaded", function () {
    // get the login form element
    const loginForm = document.querySelector("#loginForm");
    // attach an event lister for when sumbiting the login form 
    loginForm.onsubmit = function (event) {// prevent default
        event.preventDefault();// call the login function to handle the login process
        login();
    };

    function login() {// function to handle the login process
        const username = loginForm.username.value;
        const password = loginForm.password.value;

        const loginData = {// create the login data
            username: username,
            password: password,
        };

        const options = {// fetch request using HTTP request POST
            method: "POST",
            headers: {
                "Content-Type": "application/json", // content data to json
            },
            body: JSON.stringify(loginData),
        };
            // send the POST request to the login endpoint
        fetch("http://microbloglite.us-east-2.elasticbeanstalk.com/auth/login", options)
            .then(response => {
                if (!response.ok) {// check if the response is OK
                    throw new Error("Login failed"); // if not correct send this Error 
                }
                return response.json();// convert the response to jason
            })
            .then(data => {
                saveLoginData(data);// save data and redierct to posts.html
                window.location.replace("./posts.html");
            })
            .catch(error => { // handle error
                console.error("Error:", error);
                alert("Login failed. Please try again.");
            });
    }
});
