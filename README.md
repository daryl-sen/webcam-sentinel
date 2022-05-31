# webcam-sentinel (WIP)
WORK IN PROGRESS, this is a proof of concept only. Needs major refactoring and rewriting for readability and modularity.

A configurable, browser-based motion detection system that can be used to trigger other actions like API calls.


Added micro flask backend to integrate with Twilio
- Sends a text message when movement threshold is reached
- Possible to incorporate other actions

A standalone without a backend server will be made available.
## Use cases

- Current iteration (POC): send a SMS alert using Twilio whenever motion is detected
  - Package arrival alert
  - A makeshift alarm system when you're stepping away
- Set this up on an old laptop to use as a motion-triggered camera (does not require backend)
  - Animal feeders
  - Catch your lunch thief
- Motion-triggered API calls
  - Controll Philips Hue smart lights using the API
