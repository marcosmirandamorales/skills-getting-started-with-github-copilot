"""
Tests for the POST /activities/{activity_name}/signup endpoint.

Uses the AAA (Arrange-Act-Assert) pattern to structure each test.
"""

import pytest


def test_signup_for_existing_activity_succeeds(client):
    """
    Test that a student can successfully sign up for an existing activity.
    
    AAA Pattern:
    - Arrange: Prepare new student email and activity name
    - Act: POST signup request
    - Assert: Verify success response
    """
    # Arrange
    activity_name = "Chess Club"
    new_email = "alice@mergington.edu"
    
    # Act
    response = client.post(
        f"/activities/{activity_name}/signup",
        params={"email": new_email}
    )
    
    # Assert
    assert response.status_code == 200
    assert "message" in response.json()
    assert new_email in response.json()["message"]


def test_signup_adds_email_to_participants(client):
    """
    Test that signup actually adds the email to the activity's participants.
    
    AAA Pattern:
    - Arrange: Prepare signup data and get initial participant count
    - Act: Post signup request, then fetch activities
    - Assert: Verify email was added to participants list
    """
    # Arrange
    activity_name = "Programming Class"
    new_email = "bob@mergington.edu"
    initial_response = client.get("/activities")
    initial_participants = initial_response.json()[activity_name]["participants"]
    initial_count = len(initial_participants)
    
    # Act
    client.post(f"/activities/{activity_name}/signup", params={"email": new_email})
    updated_response = client.get("/activities")
    updated_participants = updated_response.json()[activity_name]["participants"]
    
    # Assert
    assert len(updated_participants) == initial_count + 1
    assert new_email in updated_participants


def test_signup_for_nonexistent_activity_returns_404(client):
    """
    Test that signup for non-existent activity returns 404 error.
    
    AAA Pattern:
    - Arrange: Prepare non-existent activity name and email
    - Act: POST signup request to non-existent activity
    - Assert: Verify 404 status code and error detail
    """
    # Arrange
    nonexistent_activity = "Nonexistent Club"
    email = "student@mergington.edu"
    
    # Act
    response = client.post(
        f"/activities/{nonexistent_activity}/signup",
        params={"email": email}
    )
    
    # Assert
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_signup_response_format(client):
    """
    Test that signup response has expected format.
    
    AAA Pattern:
    - Arrange: Prepare valid signup data
    - Act: POST signup request
    - Assert: Verify response contains expected message format
    """
    # Arrange
    activity_name = "Gym Class"
    email = "charlie@mergington.edu"
    expected_message_parts = [email, "Signed up", activity_name]
    
    # Act
    response = client.post(
        f"/activities/{activity_name}/signup",
        params={"email": email}
    )
    
    # Assert
    response_json = response.json()
    assert "message" in response_json
    message = response_json["message"]
    for part in expected_message_parts:
        assert part in message, f"Expected '{part}' in response message"


def test_multiple_signups_to_same_activity(client):
    """
    Test that multiple different students can sign up for the same activity.
    
    AAA Pattern:
    - Arrange: Prepare multiple student emails
    - Act: Sign up multiple students to same activity
    - Assert: Verify all students are in participants list
    """
    # Arrange
    activity_name = "Chess Club"
    new_emails = ["student1@mergington.edu", "student2@mergington.edu"]
    
    # Act
    for email in new_emails:
        client.post(f"/activities/{activity_name}/signup", params={"email": email})
    
    # Assert
    response = client.get("/activities")
    participants = response.json()[activity_name]["participants"]
    for email in new_emails:
        assert email in participants
