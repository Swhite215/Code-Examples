const EventEmitter = require("events");
const emitter = new EventEmitter();

emitter.on("test", data => {
    process.stdout.write("Test Event Emitted");
    console.log("Test Event Emitted");
});

let myInterval = setInterval(() => {
    emitter.emit("test", { name: "Spencer" });
}, 1000);

//One Method for Stopping Emitter
process.stdin.on("data", data => {
    clearInterval(myInterval);
    console.log("Emitter is being stopped.");
    process.exit();
});
