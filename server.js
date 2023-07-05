const express = require('express');
const cron = require('node-cron');
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs');
const schedule = require('node-schedule')

app.use(express.static(__dirname));
app.get("/",(req, res)=>{res.sendFile(__dirname+"/index.html")});
// server.listen(process.env.PORT,()=>{console.log("Running at Port 3000",process.env.PORT)});
server.listen(3000,()=>{console.log("Running at Port 3000")});

let highscores;

// Reset  highest score every week 
function resetHighscores() {
    console.log("Reset is going to happen")
    highscores = [];
    fs.writeFile('./highscores.json', JSON.stringify(highscores), (error) => {
      if (error) console.log('Error resetting highscores:', error);
      else console.log('Highscores reset successful.');
    });
}


const rule = new schedule.RecurrenceRule();

// Set the timezone to UTC
rule.tz = 'UTC';

// Set the schedule to run at 14:00:00 (2:00 PM) every Sunday (day of the week 0)
rule.second = 0;
rule.minute = 0;
rule.hour = 14;
rule.dayOfWeek = 0;

// Schedule the job
schedule.scheduleJob(rule, function () {
    resetHighscores();
});

// schedule.scheduleJob('0 14 * * 0','UTC', () => {
//     resetHighscores();
// });


fs.readFile("./highscores.json",(error,data)=>{
    if(error) console.log("Error reading data from dist\n"+error);
    else{
        try{
            highscores = JSON.parse(data);
            if(!highscores){
                highscores = [];
                fs.writeFile("./highscores.json",JSON.stringify(highscores),(error)=>{
                    if(error) console.log("Error reading data from dist\n"+error);
                });
            }
        }
        catch{
            highscores = [];
            fs.writeFile("./highscores.json",JSON.stringify(highscores),(error)=>{
                if(error) console.log("Error reading data from dist\n"+error);
            });
        }
    }
});

io.on("connection",(client)=>{
    client.emit("highscores-update",highscores);
    client.on("open-scores-request",()=>{
        highscores = highscores.sort((a,b)=>{return b.score - a.score});
        client.emit("open-scores",highscores);
    });

    client.on("new-score",(newScore)=>{
            let placedIn = false, highscoresChanged = false, nameFound = false;
            for(let i = 0; i < highscores.length; i++){
                if(highscores[i].name == newScore.name){
                    nameFound = true;
                    if(newScore.score > highscores[i].score){
                        highscores[i].score = newScore.score;
                        highscoresChanged = true;
                        highscores = highscores.sort((a,b)=>{return b.score - a.score});
                        break;
                    }
                }
            }
            if(!placedIn && !nameFound){

                highscores.push(newScore);
                highscores = highscores.sort((a,b)=>{return b.score - a.score});
                highscoresChanged = true;
            }
            if(highscoresChanged){
                io.emit("highscores-update",highscores);
                fs.writeFile("./highscores.json",JSON.stringify(highscores,null,4),(error)=>{
                    if(error) console.log("Error reading data from dist\n"+error);
                });
            }
    });

});