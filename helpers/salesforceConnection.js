const jsforce = require("jsforce");
var username = "randy@test-whatconverts.com";
var password = "Saxxy333sVeOh0p93J7W9LnTAsF6vNxD";
var conn = new jsforce.Connection({
    instanceUrl : 'https://test391-dev-ed.lightning.force.com',
    loginUrl : 'https://login.salesforce.com'
});

conn.login(username, password, function(err, userInfo) {
    if (err) { 
        return console.error(err); 
    }
    console.log("connected to salesforce");
    // console.log(conn.accessToken);
    // console.log(conn.instanceUrl);
    // logged in user property
    // console.log("User ID: " + userInfo.id);
    // console.log("Org ID: " + userInfo.organizationId);
});



//   conn.query("SELECT Id, Name, Company, Title FROM Lead WHERE Id = '00Q8b00001vWDOBEA4'", function(err, result) {
//     if (err) { return console.error(err); }
//     console.log(result);
//     console.log("total : " + result.totalSize);
//     console.log("fetched : " + result.records.length);
//   });


module.exports = { 
    salesforceConn: conn
}