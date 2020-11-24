var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var conectados = 0;
var i = 0;
var ladron;
var coorX = 150;
var coorY = 90 + Math.floor(Math.random() * 40);
var desconectados = 0;
var confirmacion;

//Objeto jugadores
var players = {};



app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  conectados++;
  socket.emit('conectados', conectados);
  socket.on('listos', () => {
  socket.broadcast.emit('bro');
  });


  console.log('a user connected: ', socket.id);
  if (i === 0) {
    i++;
    ladron = true;
   
  } else {
    ladron = false;
    coorX = coorX + 80;
    coorY = coorY;
  }

  //Crea un nuevo jugador y lo añade al objeto de jugadores
  players[socket.id] = {
    rotation: 0,
    x: coorX,
    y: coorY,
    isLadron: ladron,
    playerId: socket.id,
    
    
    
  };
  // Actualiza los jugadores 
  socket.emit('currentPlayers', players);
  

  /*Manda el ganador a todos los jugadores.
  socket.on('ganador', data => {
    console.log('hola chicos')
    socket.broadcast.emit('soy ganador', data)
    socket.emit('soy ganador', data)
    socket.emit('otroGana')
  });*/



  
  // actualiza a todos los jugadores sobre el nuevo jugador
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // Cuando se desconecta un jugador se remueve del objeto jugadores
  socket.on('disconnect', function () {
    desconectados++;
    console.log('user disconnected: ', socket.id);
    delete players[socket.id];
    //manda un mensaje de jugador desconectado
    io.emit('disconnect', socket.id);
  /*  io.emit('¿SoyLadron?', players[socket.id]);
    socket.on('Si', confirmacion) ;
    console.log('confirmacion estado:');
    if(confirmacion){
      i = 0;
    }*/
    if(desconectados === conectados){
      i = 0;
    }
  });

  // cuando se mueve un jugador se acualiza su informacion de posicion.
  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].rotation = movementData.rotation;
    
    // emite el movimiento del jugador a todos los jugadores
    socket.emit('collisionBetweenPlayers', players[socket.id]);
    socket.broadcast.emit('playerMoved', players[socket.id]);
    
  });



  //reinicia el maximo de vueltas
  socket.on('nuevoMax', function () {
    scores.max = 0;
    io.emit('redo', players);
  });

});

server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});

