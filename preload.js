
const { contextBridge, ipcRenderer } = require('electron');
const { io } = require('socket.io-client');

const socket = io('http://localhost:3000');

contextBridge.exposeInMainWorld('electronAPI', {
  socketEmit: (event, data) => socket.emit(event, data),
  socketOn: (event, callback) => socket.on(event, callback),
});

