mstr = `
using Turing

@model function gdemo(x, y)
  s ~ InverseGamma(2, 3)
  m ~ Normal(0, sqrt(s))
  x ~ Normal(m, sqrt(s))
  y ~ Normal(m, sqrt(s))
end;

function model(_input)
    _model = gdemo(1.5, 2)
    return _model
end
`;

function response_data(response){
    if (response.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        var json = response.json();
        return json;
    } else {
        console.log("HTTP-Error: " + response.status);
    }
}

var url = "http://test.withdata.io"
var userName = "gp500@cam.ac.uk" 
var password = "Bayes4Gemma"
var  base64 = require('base-64');

async function serverSideCode() {
    let headers = new Headers();
    headers.append('Authorization', 'Basic' + base64.encode(userName + ":" + password));

    console.log("Login");
    //await fetch("http://test.withdata.io/api/login", {method:'GET', headers: headers})   //credentials: 'user:passwd'
    //.then(response => response_data(response));

    //create string-model

    var modelCreation = await fetch("http://test.withdata.io/turing/api/object", {
        method: 'POST',
        headers: {
            'Authorization' : 'Basic' + base64.encode(userName + ":" + password),
        },
        body: JSON.stringify({
            "object_type": "model",
            "name": "S-Model for test",
            "env": "EJULIA_1.8",
            "stype": "string",
            "code": mstr,
            })
    })
    .then(response => response.json())
    var rdata = modelCreation.data;
    var model_id = rdata.short_id;
    console.log("model_id:" + model_id);

    console.log("Run the model");
    var input_id = "";

    modelRun = await fetch("http://test.withdata.io/turing/api/object", {
        method: 'POST',
        headers: {
            'Authorization' : 'Basic' + base64.encode(userName + ":" + password),
        },
        body: JSON.stringify(
        {"object_type": "task",
        "model_id": model_id,
        "input_id": input_id})
    })
    //.then(response => response_data(response))
    .then(response => response.json())
    var rdata = modelRun.data;
    var task_id = rdata.short_id;
    console.log("task_id:" + task_id);

    var URL = "http://test.withdata.io/turing/api/object/" + task_id;
    var tester = true;
    while(tester){
        checkStatus = await fetch(URL)
        .then(response => response.json())
        var rdata = checkStatus.data;
        var status = rdata.status;
        console.log("status: " + status);
    }
  }

serverSideCode();
