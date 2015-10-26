simulator = (function () {

    var socket = io("http://localhost:8000");

    return {
        onChange: function(callback) {
            socket.on('data', callback);
        },
        onConnect : function (callback){
            socket.on('connected',callback);
        },
        onDisconnect : function(callback){
            socket.on('disconnect',callback);
        }
    };
}());