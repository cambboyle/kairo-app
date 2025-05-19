export function startTimer() {}

// 1. On page load, create and display a "Start Timer" button

// 2. When "Start Timer" is clicked:
// Show a popup/modal:
// - Input for duration (minutes)
// - Dropdown for timer type
// "Start" and "Cancel" buttons

// 3. If "Start" is clicked in the popup:
// Hide popup
// Set timerActive = true
// Set countdown to the selected duration in seconds
// Display timer type and countdown on main screen
// Start interval to decrease countdown every 1 second

// 4. If "Cancel" is clicked in the popup:
// Hide popup
// Do nothing

// 5. While timer is running:
// Update countdown display every second
// If countdown reaches 0:
// Stop interval
// Set timerActive = false
// Show popup asking if user wants to reflect and save session
// "Yes" & "No" buttons

// 6. If user clicks "Yes" on reflection popup:
// Show reflection popup:
// Text field for reflection
// "Save" and "Cancel" buttons

// 7. If "Save" is clicked:
// Save session data (type, duration, reflection, timestamp)
// Hide popup
// Reset timer display

// 8. If "Cancel" is clicked in reflection popup:
// Hide popup
// Reset time display

// 9. If user clicks "No" on reflection prompt:
// Hide popup
// Reset timer display
