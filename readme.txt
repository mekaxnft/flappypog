How to start the server locally.
Download NodeJS
Open the folder and inside Shift+Right click
Select open powershell here
Type in the blue window node server.js and hit enter
Open the browser and in the top search bar type in localhost:3000
Now your game runs on a local server and you can test it out
In order for other people to play it you'll need to put it online

Inside the folder you'll see two files important to you
phones.json and highscores.json
Open phones.js in any text editor. Here you put in your numbers.
There are already some test numbers there you can delete them
It's important that the file starts with [ and ends with ] and that every number is n between ""
and that each number except for the last one has a , at the end
If you edit the list while the server is runninng you nee to restart the server for the changes to take effect
You do this by clicking CTRL+C on the powershell window and the typing node server.js again

Inside the highscores.json you'll see the list of highscores sorted from top down. When you decide to end the contest just read the first name and you'll have your winner.

When you want to empty the highscores simply delete everything in between the []. Those are needed a the start and end of the file