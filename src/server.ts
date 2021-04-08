import { Server } from 'ws';
import app from './app';

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});

const wss = new Server({ server });

app.wss = wss;

wss.on('listening', () => {
  console.log(`🌀 WebSocket listening for ws://localhost:${port}`);
});

wss.on('connection', () => {
  console.log(`Online users: ${wss.clients.size}`);

  setInterval(() => {
    wss.clients.forEach((client) => {
      client.send(
        JSON.stringify({
          type: ['ping'],
        }),
      );
    });
  }, 25000);
});
