const express = require('express');
const app = express();
const { PORT,WHATCONVERTS_API_SECRET, WHATCONVERTS_API_TOKEN, WHATCONVERS_API_URL } = require("./config");
const cors = require("cors");
const axios = require('axios');
const { salesforceConn } = require("./helpers/salesforceConnection")

app.use(express.json())
app.use(cors());


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
    var createRes = await createSalesForceObject("Lead", leadDetails);
    if (!createRes) return res.status(500).json({message: "something went wrong while creating salesforce object"});

    var salesForceRecords = await findSalesForceLeadByEmail(whatconvertsLead.additional_fields['Email']);
    if (!salesForceRecords.length) return res.status(404).json({message: "Not found"});

    //lead found on salesforce by email, update whatconverts lead salesforce additional field to "connected"
    try {
        var whatconvertsRes = await axios.post(`${WHATCONVERS_API_URL}/api/v1/leads/${whatconvertsLead.lead_id}`,
            'additional_fields[SalesForce]=Connected',
            {auth: {
                username: WHATCONVERTS_API_TOKEN,
                password: WHATCONVERTS_API_SECRET
            }}
        );
        return res.json(200)
    } catch (error) {
        console.log(error)
        return res.json(500);
    }    
});

app.post('/webhook/salesforce/lead/update', async function(req, res) {
    let newLead = req.body.new;
    let oldLead = req.body.old;

    //If the lead has a new field relating to the Contact object, lets update WhatConverts lead here.
    var newContactId = !oldLead[0].ConvertedContactId && newLead[0].ConvertedContactId 
        ? newLead[0].ConvertedContactId : null;

    var newOpportunityId = !oldLead[0].ConvertedOpportunityId && newLead[0].ConvertedOpportunityId 
        ? newLead[0].ConvertedOpportunityId : null;
        
    if (!newContactId && !newOpportunityId) {
        return res.status(200).json({message: "no action required"});
    }
    try {
        if (newOpportunityId) {
            let updateFields = {
                whatconverts_lead_id__c: oldLead[0].whatconverts_lead_id__c
            }
            //associate converted opportunity to whatconverts lead
            var updatedOpportunity = await updateSalesForceObject("Opportunity", newOpportunityId, updateFields)
        }
        
        //if there is a new contact or opportunity associated to this lead on salesforce, lets update whatconverts lead with relevant info.
        const data = new URLSearchParams({
            'quotable': "yes"
        });

        var whatconvertsRes = await axios.post(`${WHATCONVERS_API_URL}/api/v1/leads/${oldLead[0].whatconverts_lead_id__c}`,
            data,
            {auth: {
                username: WHATCONVERTS_API_TOKEN,
                password: WHATCONVERTS_API_SECRET
            }}
        );
        return res.json(200)
    } catch (error) {
        console.log(error)
        return res.json(500)
    }

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

// runs every time an opportunity is created or updated
app.post("/webhook/salesforce/opportunity", async function(req, res) {
    let opportunity = req.body.new[0];
    let amount = opportunity.Amount;
    let whatConvertsId = opportunity.whatconverts_lead_id__c;
    console.log(whatConvertsId);
    console.log(typeof whatConvertsId);
    if (!whatConvertsId) return res.status(500).json({message: "whatConvertsId not set"});
    if (!amount) return res.status(500).json({message: "amount not set"});
    try {
        const data = new URLSearchParams({
            'quote_value': amount
        });
    
        var whatconvertsRes = await axios.post(`${WHATCONVERS_API_URL}/api/v1/leads/${opportunity.whatConvertsId}`,
            data,
            {auth: {
                username: WHATCONVERTS_API_TOKEN,
                password: WHATCONVERTS_API_SECRET
            }}
        );
        console.log(whatconvertsRes);
        return res.json(200)
    } catch (error) {
        console.log(error);
        return res.json(500)
    }
});

async function createSalesForceObject(object, data) {
    try {
        var record = await salesforceConn.sobject(object).create(data);
        if (!record.success) return false;
        return record;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function updateSalesForceObject(object, id, data) {
    try {
        var record = await salesforceConn.sobject(object).update({
            Id: id,
            ...data
        });
        if (!record.success) return false;
        return record;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function findSalesForceLeadByEmail(email) {
    try {
        var records = await salesforceConn.sobject("Lead").find({
            Email: email
        }).execute();
        return records
        
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function findSalesForceObjectById(object, id) {
    try {
        var record = await salesforceConn.sobject(object).retrieve(id);
        return record;
    } catch (error) {
        console.log(error);
        return false;
    }
}



app.listen(PORT, () => {
  console.log(`Running on port ${PORT}!`)
})
// ConvertedAccountId
// ConvertedOpportunityId
// ConvertedContactId