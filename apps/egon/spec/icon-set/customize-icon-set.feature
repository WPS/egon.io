Feature: Icon Configuration

  In order to model different domains, the icon set needs to be configurable.

  Scenario: Add pre-built icon to icon set
    Given The icon set is in default configuration
    When I add the "Business" icon as an actor between "Group" and "System"
    And I save the icon set
    Then The pallet contains 4 icons for actors
    And the order of these icons is "Person", "Group", "Business", and "System".

  Scenario: Add custom icon to icon set
    Given The icon set is in default configuration
    And A custom icon named "my-icon.svg" in my available icons
    When I add "my-icon" as a work object to the icon set
    And I save the icon set
    Then the pallet contains 1 more work object than before
    And "my-icon" is at the bottom of the pallet's work objects


  Scenario: Make custom icon available
    Given I have a SVG file named "my-icon.svg" on my harddrive
    And the icon has a square outline
    When I upload "my-icon.svg"
    Then there is 1 more icon available than before
    And the uploaded icon is included in the available icons as "my-icon"
    And the available icons are sorted alphabetically
    And the "my-icon" is not selected for the icon set


  Scenario: Replace available custom icon
    Given The available icons include a custom icon named "my-icon"
    And "my-icon" is not selected for the icon set
    And I have a different icon with the same name "my-icon.svg" on my harddrive
    When I upload "my-icon.svg"
    Then there is the same number of icons available as before
    And the uploaded icon is included in the available icons as "my-icon"
    And the available icons are sorted alphabetically
    And the "my-icon" is not selected for the icon set

