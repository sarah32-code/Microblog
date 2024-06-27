"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const profileForm = document.querySelector("#profileForm");
    const loginData = getLoginData();

    function loadProfile() {
        fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/users/${loginData.username}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${loginData.token}`,
            },
        })
            .then(response => response.json())
            .then(user => {
                profileForm.username.value = user.username;
                profileForm.fullName.value = user.fullName;
                profileForm.bio.value = user.bio;

                // // Optionally set profile picture preview if available
                // if (user.profilePicUrl) {
                //     const profilePicPreview = document.querySelector("#profilePicPreview");
                //     profilePicPreview.src = user.profilePicUrl;
                //     profilePicPreview.alt = `Profile Picture of ${user.username}`;
                // }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Failed to load profile. Please try again.");
            });
    }

    profileForm.addEventListener("submit", function (event) {
        event.preventDefault();
        updateProfile();
    });

    function updateProfile() {
        const formData = new FormData(profileForm);
        const options = {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${loginData.token}`,
            },
            body: formData,
        };

        fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/users/${loginData.username}`, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to update profile");
                }
                return response.json();
            })
            .then(user => {
                alert("Profile updated successfully!");
                loadProfile();
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Failed to update profile. Please try again.");
            });
    }

    loadProfile();
});
