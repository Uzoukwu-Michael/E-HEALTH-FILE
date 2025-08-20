<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect and sanitize inputs
    $name     = htmlspecialchars(trim($_POST['name']));
    $email    = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
    $phone    = htmlspecialchars(trim($_POST['phone']));
    $date     = htmlspecialchars(trim($_POST['date']));
    $time     = htmlspecialchars(trim($_POST['time']));
    $service  = htmlspecialchars(trim($_POST['service']));
    $message  = htmlspecialchars(trim($_POST['message']));

    // Set recipient email
    $to = "your-email@example.com"; // CHANGE THIS TO YOUR EMAIL
    $subject = "New Appointment Request from $name";

    // Email content
    $body = "
    You have received a new appointment request:

    Name: $name
    Email: $email
    Phone: $phone
    Date: $date
    Time: $time
    Service: $service

    Message:
    $message
    ";

    // Email headers
    $headers  = "From: $name <$email>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Send email
    if (mail($to, $subject, $body, $headers)) {
        echo "success";
    } else {
        echo "error";
    }
} else {
    echo "invalid";
}
?>
