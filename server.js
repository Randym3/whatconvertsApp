const express = require('express');
const app = express();
const { PORT,WHATCONVERTS_API_SECRET, WHATCONVERTS_API_TOKEN, WHATCONVERS_API_URL } = require("./config");
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
async function findSalesForceLeadByEmail(email) {
    var records = await salesforceConn.sobject("Lead")
        .find({Email: email})
        .execute(function(err, records) {
            if (err) { return res.status(500).json(err) }
            return records
        });
    return records.length
}

app.all('/', function(req, res){
    console.log("connected");
    res.sendFile(__dirname + '/views/form.html');
});

app.post('/webhook/whatconverts/create', async function(req, res) {
    let whatconvertsLead = req.body;

    //lets form the lead object to send over to salesforce
    let leadDetails = {
        LastName: whatconvertsLead.additional_fields['Name'],
        Company: whatconvertsLead.additional_fields['Company Name'],
        Email: whatconvertsLead.additional_fields['Email'],
        Description: whatconvertsLead.additional_fields['Message'],
        whatconverts_lead_id__c: whatconvertsLead.lead_id
    }

    var createRes = await salesforceConn.sobject("Lead").create(leadDetails, function(err, ret) {
        if (err || !ret.success) {
            console.log(err);
            return res.status(500).json(err);
        }
        //Lead was succesfully created on Salesforce
        return ret
    });
    var salesForceRes = await findSalesForceLeadByEmail(whatconvertsLead.additional_fields['Email']);

    //lead found on salesforce by email, update whatconverts lead salesforce additional field to "connected"
    if (salesForceRes) {
        try {
            var whatconvertsRes = await axios.post(`${WHATCONVERS_API_URL}/api/v1/leads/${whatconvertsLead.lead_id}`,
                'additional_fields[SalesForce]=Connected',
                {auth: {
                    username: WHATCONVERTS_API_TOKEN,
                    password: WHATCONVERTS_API_SECRET
                }}
            );
            return res.status(200)
        } catch (error) {
            console.log(error)
            return res.status(500)
        }    
    }
});

app.get('/webhook/salesforce/update', function(req, res){
    
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

