Feature: Icon Configuration

In order to model different domains, the icon set needs to be configurable.

Scenario: Add pre-built icon to icon set
Given The icon set is in default configuration
When I add the "Business" icon as an actor between "Group" and "System"
And I save the icon set
Then The pallet contains 4 icons for actors
And the order of these icons is "Person", "Group", "Business", and "System".

Scenario: Add custom icon to icon set
Given I have a SVG file named "my-icon.svg" on my harddrive
And the icon has a square outline
When I upload "my-icon.svg"
Then the icon is included in the available icons
And the icon is named "my-icon"
And the available icons are sorted alphabetically
When I add "my-icon" as a work object to the icon set
And I save the icon set
Then the pallet contains 1 more work object than before

Scenario: Export icon set

Scenario: Import icon set
