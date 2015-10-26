var interval,
    onChangeHandler;

var members = [
    {title: "GM", number: 38.87},
    {title: "GM2", number: 38.87}
];


function simulateChange() {
    var member,
        index = Math.floor(Math.random() * members.length);
    member = members [index];
    member.number = member.number + Math.floor(Math.random() * members.length);
    onChangeHandler(member.title, 'data', member);
}

function start(onChange) {
    onChangeHandler = onChange;
    interval = setInterval(simulateChange, 1000);
}

function stop() {
    clearInterval(interval);
}

exports.start = start;
exports.stop = stop;