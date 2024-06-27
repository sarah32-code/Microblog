"use strict";

function saveLoginData(loginData) {
    localStorage.setItem("loginData", JSON.stringify(loginData));
}

function getLoginData() {
    const loginData = localStorage.getItem("loginData");
    return loginData ? JSON.parse(loginData) : null;
}

function logout() {
    const loginData = getLoginData();
    if (!loginData) {
        window.location.replace("./index.html");
        return;
    }

    fetch("http://microbloglite.us-east-2.elasticbeanstalk.com/auth/logout", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${loginData.token}`,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to logout");
            }
            localStorage.removeItem("loginData");
            window.location.replace("./index.html");
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to logout. Please try again.");
        });
}
