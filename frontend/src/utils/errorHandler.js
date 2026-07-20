export const handleAuthError = (err) => {
  if (!err.response)
    return "Unable to reach SnapChecker. Check your connection.";
  switch (err.response.status) {
    case 401:
      return "Incorrect email or password.";
    case 400:
      return "Email already registered or invalid request.";
    case 404:
      return "User not found.";
    case 429:
      return "Too many attempts. Please wait one minute.";
    default:
      return err.response.data?.message || "An unexpected error occurred.";
  }
};
