document.querySelector(".signin-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.querySelector('input[type="text"]').value;
    const password = document.getElementById("password-field").value;

    if (username === "admin" && password === "123456") {
        alert("Login successful!");
        // window.location.href = "home.html";
    } else {
        alert("Invalid username or password!");
    }
});