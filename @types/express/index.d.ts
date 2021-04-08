declare namespace Express {
  interface Application {
    wss: import('ws').Server;
  }
}
