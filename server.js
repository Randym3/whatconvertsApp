const express = require('express');
const app = express();
const { PORT,WHATCONVERTS_API_SECRET, WHATCONVERTS_API_TOKEN } = require("./config");
const cors = require("cors");
const axios = require('axios');
const { salesforceConn } = require("./helpers/salesforceConnection")
const nodemailer = require('nodemailer');

app.use(express.json())
app.use(cors());


const transporter = nodemailer.createTransport({
  port: 465,               // true for 465, false for other ports
  host: "smtp.gmail.com",
     auth: {
          user: 'menesesrandy33@gmail.com',
          pass: 'Saxxy333',
       },
  secure: true,
  });
  



app.all('/', function(req, res){
    console.log("connected");
    res.sendFile(__dirname + '/views/form.html');
});
    
app.get("/test-jsforce", function(req, res){

    // console.log(salesforceConn);
    salesforceConn.sobject("Lead").retrieve("00Q8b00001vWDOREA4", function(err, lead) {
        if (err) { return console.error(err); }
        console.log("Name : " + lead.Name);

        const mailData = {
            from: 'support@randym3.com',  // sender address
              to: 'menesesrandy@gmail.com',   // list of receivers
              subject: 'Sending Email using Node.js',
              text: 'That was easy!',
              html: `leadName: ${lead.Name}`,
            };
        
        transporter.sendMail(mailData, function (err, info) {
            if(err)
            console.log(err)
            else
            console.log(info);
        });
        
        res.json(lead);
        // ...
      });
      
})
app.post('/webhook/whatconverts/create', function(req, res){
    console.log(req.body.lead_id);
    res.json(200);
});

app.get('/webhook/whatconverts/update', function(req, res){
    res.json("nice!");
    
    // axios.get('https://app.whatconverts.com/api/v1/leads/71952990', {
    //     auth: {
    //         username: WHATCONVERTS_API_TOKEN,
    //         password: WHATCONVERTS_API_SECRET
    //     }
    // }).then(data => {
    //     console.log(data.data);
    // }).catch(err=>console.log(err))
    
});
    
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}!`)
})

