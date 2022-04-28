const express = require('express');
const app = express();
const { PORT,WHATCONVERTS_API_SECRET, WHATCONVERTS_API_TOKEN } = require("./config");
const cors = require("cors");
const axios = require('axios');
const { salesforceConn } = require("./helpers/salesforceConnection")
const nodemailer = require('nodemailer');

app.use(express.json())
app.use(cors());


// const transporter = nodemailer.createTransport({
//   port: 465,               // true for 465, false for other ports
//   host: "smtp.gmail.com",
//      auth: {
//           user: 'menesesrandy33@gmail.com',
//           pass: 'Saxxy333',
//        },
//   secure: true,
//   });
  
//   const mailData = {
//     from: 'support@randym3.com',  // sender address
//       to: 'menesesrandy@gmail.com',   // list of receivers
//       subject: 'Sending Email using Node.js',
//       text: 'That was easy!',
//       html: `leadName: ${lead.Name}`,
//     };

// transporter.sendMail(mailData, function (err, info) {
//     if(err)
//     console.log(err)
//     else
//     console.log(info);
// });

app.all('/', function(req, res){
    console.log("connected");
    res.sendFile(__dirname + '/views/form.html');
});

app.post('/webhook/whatconverts/create', function(req, res){
    let whatconvertsLead = req.body;
    console.log(`lead received (id: ${whatconvertsLead.lead_id}), now send to salesforce`);
    // "additional_fields": {
    //     "SalesForce": "Pending",
    //     "Company Name": "finally",
    //     "Email": "new@gmail.com",
    //     "Message": "this worked",
    //     "Name": "RANDY NEW TEST"
    //   },

    let leadDetails = {
        LastName: whatconvertsLead.additional_fields['Name'],
        Company: whatconvertsLead.additional_fields['Company Name'],
        Email: whatconvertsLead.additional_fields['Email'],
        Description: whatconvertsLead.additional_fields['Message'],
        whatconverts_lead_id: whatconvertsLead.lead_id
    }
    salesforceConn.sobject("Lead").create(leadDetails, function(err, ret) {
        if (err || !ret.success) {
            console.log(err);
            return res.status(500).json(err);
        }
        console.log("Created record id : " + ret.id);
        return res.json(ret);
    });
    res.json(200);
});

app.get('/webhook/whatconverts/update', function(req, res){
    
    // axios.get('https://app.whatconverts.com/api/v1/leads/72142024', {
    //     auth: {
    //         username: WHATCONVERTS_API_TOKEN,
    //         password: WHATCONVERTS_API_SECRET
    //     }
    // }).then(data => {
    //     console.log(data.data);
    //     res.json(data.data);
    // }).catch(err=>console.log(err))
});
    
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}!`)
})

