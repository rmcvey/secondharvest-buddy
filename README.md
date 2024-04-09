# Second Harvest Delivery Helper

I created this while volunteering for Second Harvest delivering groceries to homebound clients (you should sign up!).

When you receive your delivery itenerary via email:

* download the PDF attached in the email
* navigate to https://delivery.robmcvey.com (or wherever you are hosting your own instance) 
* Upload the PDF, if it is password protected (it should be!) enter the password.
* Voila!

> [!IMPORTANT]
> If the link to the address isn't working or Google Maps is not finding the address: it may be invalid/typo. Try manually entering the address to see if your map provider can find something similar.

> [!WARNING]
> Be sure to pay attention to the road while driving! We've found it useful to queue up the next client (directions, phone call) before departing.

> [!NOTE]
> The server processes the PDF in memory and does not store the file or the data contained within it. Ideally this would all take place client-side but I've been striking out on getting this working so far - 
contributions welcomed!

> [!NOTE]
> The PDF data, password, and the current client are stored on your device for two hours so you don't have to re-enter the details while you are driving. This data is automatically purged after the two hours.