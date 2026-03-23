"""
Tests for the GET /activities endpoint.

Uses the AAA (Arrange-Act-Assert) pattern to structure each test.
"""

import pytest


def test_get_activities_returns_dict(client):
    """
    Test that GET /activities returns the activities dictionary.
    
    AAA Pattern:
    - Arrange: Use the client fixture (pre-configured by conftest.py)
    - Act: Make GET request to /activities
    - Assert: Verify response status and structure
    """
    # Arrange
    expected_status = 200
    
    # Act
    response = client.get("/activities")
    
    # Assert
    assert response.status_code == expected_status
    assert isinstance(response.json(), dict)


def test_get_activities_contains_all_activities(client):
    """
    Test that GET /activities returns all three activities.
    
    AAA Pattern:
    - Arrange: Define expected activities
    - Act: Make GET request to /activities
    - Assert: Verify all activities are present
    """
    # Arrange
    expected_activities = ["Chess Club", "Programming Class", "Gym Class"]
    
    # Act
    response = client.get("/activities")
    activities_data = response.json()
    
    # Assert
    assert len(activities_data) == 3
    for activity_name in expected_activities:
        assert activity_name in activities_data


def test_activity_has_required_fields(client):
    """
    Test that each activity has required fields.
    
    AAA Pattern:
    - Arrange: Define required fields
    - Act: Get activities response
    - Assert: Verify structure of each activity
    """
    # Arrange
    required_fields = ["description", "schedule", "max_participants", "participants"]
    
    # Act
    response = client.get("/activities")
    activities_data = response.json()
    
    # Assert
    for activity_name, activity_data in activities_data.items():
        for field in required_fields:
            assert field in activity_data, f"Missing '{field}' in {activity_name}"


def test_initial_participants_correct(client):
    """
    Test that activities have correct initial participants.
    
    AAA Pattern:
    - Arrange: Define expected initial state
    - Act: Get activities response
    - Assert: Verify participant list matches expectations
    """
    # Arrange
    expected_participants = {
        "Chess Club": ["michael@mergington.edu", "daniel@mergington.edu"],
        "Programming Class": ["emma@mergington.edu", "sophia@mergington.edu"],
        "Gym Class": ["john@mergington.edu", "olivia@mergington.edu"]
    }
    
    # Act
    response = client.get("/activities")
    activities_data = response.json()
    
    # Assert
    for activity_name, expected_list in expected_participants.items():
        actual_participants = activities_data[activity_name]["participants"]
        assert actual_participants == expected_list, \
            f"{activity_name} participants mismatch"
