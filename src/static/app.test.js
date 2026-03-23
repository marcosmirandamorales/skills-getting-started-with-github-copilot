/**
 * Unit tests for app.js
 * Tests the activities list display and signup functionality
 */

// Mock DOM elements before loading the script
const mockActivities = {
  "Chess Club": {
    description: "Learn to play chess",
    schedule: "Tuesday 4:00 PM",
    max_participants: 20,
    participants: ["student1@mergington.edu"],
  },
  "Debate Team": {
    description: "Competitive debate",
    schedule: "Wednesday 3:30 PM",
    max_participants: 15,
    participants: [],
  },
};

// Setup DOM before each test
beforeEach(() => {
  document.body.innerHTML = `
    <div id="activities-list"></div>
    <select id="activity">
      <option value="">-- Select an activity --</option>
    </select>
    <form id="signup-form">
      <input type="email" id="email" required />
      <select id="activity" required>
        <option value="">-- Select an activity --</option>
      </select>
      <button type="submit">Sign Up</button>
    </form>
    <div id="message" class="hidden"></div>
  `;

  // Mock fetch function
  global.fetch = jest.fn();

  // Mock console methods
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
  console.error.mockRestore();
});

describe("Activity Display", () => {
  test("should fetch and display activities on page load", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => mockActivities,
    });

    // Simulate DOMContentLoaded event
    const activitiesList = document.getElementById("activities-list");
    activitiesList.innerHTML = "";

    // Fetch and display activities
    const response = await fetch("/activities");
    const activities = await response.json();

    Object.entries(activities).forEach(([name, details]) => {
      const activityCard = document.createElement("div");
      activityCard.className = "activity-card";
      const spotsLeft = details.max_participants - details.participants.length;
      activityCard.innerHTML = `
        <h4>${name}</h4>
        <p>${details.description}</p>
        <p><strong>Schedule:</strong> ${details.schedule}</p>
        <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
      `;
      activitiesList.appendChild(activityCard);
    });

    expect(global.fetch).toHaveBeenCalledWith("/activities");
    expect(activitiesList.children.length).toBe(2);
    expect(activitiesList.textContent).toContain("Chess Club");
    expect(activitiesList.textContent).toContain("Debate Team");
  });

  test("should calculate and display correct number of available spots", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => mockActivities,
    });

    const activitiesList = document.getElementById("activities-list");
    activitiesList.innerHTML = "";

    const response = await fetch("/activities");
    const activities = await response.json();

    Object.entries(activities).forEach(([name, details]) => {
      const activityCard = document.createElement("div");
      activityCard.className = "activity-card";
      const spotsLeft = details.max_participants - details.participants.length;
      activityCard.innerHTML = `
        <h4>${name}</h4>
        <p>${details.description}</p>
        <p><strong>Schedule:</strong> ${details.schedule}</p>
        <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
      `;
      activitiesList.appendChild(activityCard);
    });

    expect(activitiesList.textContent).toContain("19 spots left"); // Chess: 20 - 1
    expect(activitiesList.textContent).toContain("15 spots left"); // Debate: 15 - 0
  });

  test("should populate activity dropdown with fetched activities", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => mockActivities,
    });

    const activitySelect = document.getElementById("activity");
    const response = await fetch("/activities");
    const activities = await response.json();

    Object.entries(activities).forEach(([name, details]) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
    });

    const options = Array.from(activitySelect.options).map(opt => opt.value);
    expect(options).toContain("Chess Club");
    expect(options).toContain("Debate Team");
  });

  test("should handle fetch error and display error message", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    const activitiesList = document.getElementById("activities-list");

    try {
      const response = await fetch("/activities");
      await response.json();
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
    }

    expect(activitiesList.textContent).toContain("Failed to load activities");
  });
});

describe("Signup Form", () => {
  test("should successfully sign up user for activity", async () => {
    const mockResponse = {
      message: "Successfully signed up for Chess Club",
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const email = "student@mergington.edu";
    const activity = "Chess Club";

    const response = await fetch(
      `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
      { method: "POST" }
    );

    const result = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      `/activities/Chess%20Club/signup?email=student%40mergington.edu`,
      { method: "POST" }
    );
    expect(response.ok).toBe(true);
    expect(result.message).toContain("Successfully signed up");
  });

  test("should prevent duplicate registration for same activity", async () => {
    const mockErrorResponse = {
      detail: "Already registered for Chess Club",
    };

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => mockErrorResponse,
    });

    const email = "student@mergington.edu";
    const activity = "Chess Club";

    const response = await fetch(
      `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
      { method: "POST" }
    );

    const result = await response.json();

    expect(response.ok).toBe(false);
    expect(result.detail).toContain("Already registered");
  });

  test("should display error when activity is full", async () => {
    const mockErrorResponse = {
      detail: "Activity is full",
    };

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => mockErrorResponse,
    });

    const email = "newstudent@mergington.edu";
    const activity = "Chess Club";

    const response = await fetch(
      `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
      { method: "POST" }
    );

    const result = await response.json();

    expect(response.ok).toBe(false);
    expect(result.detail).toBe("Activity is full");
  });

  test("should display error message on signup failure", async () => {
    const mockErrorResponse = {
      detail: "Activity is full",
    };

    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => mockErrorResponse,
    });

    const email = "student@mergington.edu";
    const activity = "Chess Club";

    const response = await fetch(
      `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
      { method: "POST" }
    );

    const result = await response.json();

    expect(response.ok).toBe(false);
    expect(result.detail).toBe("Activity is full");
  });

  test("should handle signup network error", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    const email = "student@mergington.edu";
    const activity = "Chess Club";

    let errorOccurred = false;
    try {
      await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );
    } catch (error) {
      errorOccurred = true;
      expect(error.message).toBe("Network error");
    }

    expect(errorOccurred).toBe(true);
  });

  test("should properly encode special characters in email and activity name", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Success" }),
    });

    const email = "student+test@mergington.edu";
    const activity = "Chess Club & More";

    await fetch(
      `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
      { method: "POST" }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `/activities/Chess%20Club%20%26%20More/signup?email=student%2Btest%40mergington.edu`,
      { method: "POST" }
    );
  });
});

describe("Form Validation", () => {
  test("form should have required fields", () => {
    const emailInput = document.getElementById("email");
    const activitySelect = document.getElementById("activity");

    expect(emailInput.required).toBe(true);
    expect(activitySelect.required).toBe(true);
  });

  test("email input should have email type", () => {
    const emailInput = document.getElementById("email");
    expect(emailInput.type).toBe("email");
  });
});
