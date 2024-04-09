# Second Harvest Delivery Helper

I created this simple app while volunteering as a delivery driver for Second Harvest. The app allows delivery drivers to convert their password-protected PDF itenerary into an easy-to-read and helpful UI to improve the delivery experience.

## Features

* Easy to read
* One-click actions:
  * Launch Google Maps directions
  * Call clients
  * Translate your message to the client's language!
* Saves itenerary data, password, and progress on your device and automatically for the duration of your shift. You don't have to worry about navigating away from the app or closing the window and having to start over.
* Secure! The server [processes the PDF in memory](https://github.com/rmcvey/secondharvest-buddy/blob/main/app/index.mjs#L23-L25) and does not store the file or the data contained within it.
* Progressive Web App - save the web app to your desktop to get a more native experience (or not have to remember the URL :P)

## Directions

When you receive your delivery itenerary via email:

* download the PDF attached in the email
* navigate to https://delivery.robmcvey.com (or wherever you are hosting your own instance) 
* Upload the PDF to the app and enter the password for the PDF
* Move through the clients with the left and right arrows on the bottom of the app.

> [!IMPORTANT]
> If the link to the address isn't working or Google Maps is not finding the address: it may be invalid/typo. Try manually entering the address to see if your map provider can find something similar.

> [!NOTE]
> The PDF data, password, and the current client are stored on your device for two hours so you don't have to re-enter the details while you are driving. This data is automatically purged after the two hours.

> [!WARNING]
> Be sure to pay attention to the road while driving! We've found it useful to queue up the next client (directions, phone call) before departing.
