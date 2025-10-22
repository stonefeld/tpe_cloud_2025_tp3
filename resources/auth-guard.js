// auth-guard.js - Authentication guard for protected pages
(function () {
  // List of public pages that don't require authentication
  const publicPages = ["index.html", "login.html", "signup.html", "callback.html", "/", ""];

  // Get current page name
  const currentPage = window.location.pathname.split("/").pop();

  // If we're on a public page, no need to check authentication
  if (publicPages.includes(currentPage)) {
    console.log("Public page, no auth required:", currentPage);
    return;
  }

  console.log("Protected page detected:", currentPage);

  // Function to redirect to login
  function redirectToLogin() {
    console.log("Redirecting to login page...");
    // Save the current URL to redirect back after login
    localStorage.setItem("redirect_after_login", window.location.href);
    window.location.href = "login.html";
  }

  // Function to check authentication directly from localStorage (synchronous)
  function checkAuthFromStorage() {
    console.log("Checking authentication from localStorage...");
    
    const accessToken = localStorage.getItem('cognito_access_token');
    const timestamp = localStorage.getItem('cognito_timestamp');
    const expiresIn = localStorage.getItem('cognito_expires_in');

    console.log("Access token:", accessToken ? "Present" : "Missing");
    console.log("Timestamp:", timestamp);
    console.log("Expires in:", expiresIn);

    // If any required item is missing, not authenticated
    if (!accessToken || !timestamp || !expiresIn) {
      console.log("Missing authentication data in localStorage");
      return false;
    }

    // Check if token has expired
    const now = Date.now();
    const tokenTime = parseInt(timestamp);
    const tokenExpiry = tokenTime + (parseInt(expiresIn) * 1000);

    console.log("Current time:", now);
    console.log("Token expiry:", tokenExpiry);
    console.log("Time remaining (seconds):", Math.floor((tokenExpiry - now) / 1000));

    if (now >= tokenExpiry) {
      console.log("Token has expired");
      return false;
    }

    console.log("Token is valid");
    return true;
  }

  // Check authentication immediately (synchronously)
  const isAuthenticated = checkAuthFromStorage();
  
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting immediately...");
    redirectToLogin();
  } else {
    console.log("User authenticated, access granted");
  }
})();

