const express = require('express');
const app = express();
const { PORT } = require("./config");
const cors = require("cors");

app.use(express.json())
app.use(cors());



app.all('/', function(req, res){
    console.log("connected");
    res.sendFile(__dirname + '/views/form.html');
});
    
app.post('/webhook/whatconverts/create', function(req, res){
    console.log(req.body);
    res.json(200);
});

app.post('/webhook/whatconverts/update', function(req, res){
    res.json("nice!");
});
    
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}!`)
})

