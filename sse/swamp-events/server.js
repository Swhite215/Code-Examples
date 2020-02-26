// Require needed modules and initialize Express app
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware for GET /events endpoint
function eventsHandler(req, res, next) {
  // Mandatory headers and http status to keep connection open - IMPORTANT NECESSARY HEADERS
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  res.writeHead(200, headers);

  // After client opens connection send all nests as string - IMPORTANT NECESSARY FORMAT
  const data = `data: ${JSON.stringify(nests)}\n\n`;
  res.write(data);

  // Generate an id based on timestamp and save res
  // object of client connection on clients list
  // Later we'll iterate it and send updates to each client
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };
  clients.push(newClient);

  // When client closes connection we update the clients list
  // avoiding the disconnected one
  req.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter(c => c.id !== clientId);
    res.end();
  });
}

// Iterate clients list and use write res object method to send new nest
function sendEventsToAll(nest, event) {
  clients.forEach(c => {
    c.res.write(`event: ${event}\n`)
    c.res.write(`data: ${JSON.stringify(nest)}\n\n`)
  })
}

// Middleware for POST /nest endpoint
async function addNest(req, res, next) {
  const newNest = req.body;
  nests.push(newNest);

  // Send recently added nest as POST result
  res.json(newNest)

  // Invoke iterate and send function
  return sendEventsToAll(newNest, "addNest");
}

// Middleware for POST /nest endpoint
async function deleteNest(req, res, next) {
  const nestToDelete = req.query.nest;

  res.json(nestToDelete);

  console.log(nests)

  nests = nests.filter((nest) => {
    if (nest.momma != nestToDelete) {
      return true
    } else {
      return false
    }
      
  });

  console.log(nests)

  return sendEventsToAll(nestToDelete, "deleteNest")
}

// Set cors and bodyParser middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Define endpoints
app.post('/nest', addNest);
app.delete('/nest', deleteNest);
app.get('/events', eventsHandler);
app.get('/status', (req, res) => res.json({clients: clients.length}));

const PORT = 3000;

let clients = [];
let nests = [];

// Start server on 3000 port
app.listen(PORT, () => console.log(`Swamp Events service listening on port ${PORT}`));