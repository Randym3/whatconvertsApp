const jsforce = require("jsforce");

var username = process.env.SF_USERNAME;
var password = process.env.SF_PASSWORD;
var salesforceConn = new jsforce.Connection({
    instanceUrl : 'https://test391-dev-ed.lightning.force.com',
    loginUrl : 'https://login.salesforce.com'
});

salesforceConn.login(username, password, function(err, userInfo) {
    if (err) { 
        return console.error(err); 
    }
    console.log("connected to salesforce");
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


module.exports = { 
    salesforceConn,
    createSalesForceObject,
    updateSalesForceObject,
    findSalesForceLeadByEmail,
    findSalesForceObjectById
}