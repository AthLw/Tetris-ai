var ws = new WebSocket('ws://localhost:8081');
var moveData;

ws.onopen = function (e) {
    console.log('connection open ...');
};

ws.onmessage = function(e){
    //console.log('received Message: ' + e.data);
    moveData = e.data;
};

ws.onclose = function(e) {
    console.log('connection closed ...');
};

function sendDataToAI(data){
    ws.send(JSON.stringify(data));
}

function getMove(){
    let data = moveData;
    moveData = null;
    return data;
}