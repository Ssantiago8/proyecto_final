var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 900,
  height: 700,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  } 
};

var game = new Phaser.Game(config);
var mapa;
var score=0;
var scoreText;
var conectados=0;
var ready = false;


function preload() {

  //Carga de vehiculos
  this.load.image('carro', 'assets/cars/Audi.png');
  this.load.image('one', 'assets/cars/Ambulance.png');
  this.load.image('two', 'assets/cars/Black_viper.png');
  this.load.image('three', 'assets/cars/Car.png');
  this.load.image('four', 'assets/cars/Mini_truck.png');
  this.load.image('five', 'assets/cars/Mini_van.png');
  this.load.image('six', 'assets/cars/Police.png');
  

 
  //Carga del mapa
  this.load.tilemapTiledJSON('mapa', 'assets/mapa/Mapa.json');
  this.load.image('tiles','assets/mapa/tileSets.png');

  //Carga de los bordes del mapa
  
}

function create() { 


  //Creacion del mapa
  mapa = this.make.tilemap({ key: 'mapa' });
  var tilesets = mapa.addTilesetImage('tileSets', 'tiles');
  var solidos = mapa.createDynamicLayer('solidos', tilesets, 0, 0);
  solidos.setCollisionByProperty({ solido: true });




  //Declaracion de socket y otros jugadores
  var self = this;
  this.socket = io();
  this.otherPlayers = this.physics.add.group();

  //Actualizar objeto Jugadores
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });
  this.socket.on('conectados',valor =>{
    if(valor>=2){
      this.ready=true;
      this.socket.emit('listos');
    }
  })

  this.socket.on('bro', ()=>{
    this.ready=true;
  });
  

  //Jugador añadido
  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo);
    
  });

  //Jugador desconectado
  this.socket.on('disconnect', function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });

  //Actualizar informacion de los jugadores
  this.socket.on('playerMoved', function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });
  this.cursors = this.input.keyboard.createCursorKeys();


  //Actualizar los marcadores
    this.maxScoreText = this.add.text(700,480, 'Mayor vueltas: 0', { fontSize: '24px', fill: '#000' ,fontFamily:'Impact'});

    this.socket.on('scoreUpdate', function (scores) {
      self.maxScoreText.setText('Mayor vueltas: ' + scores.max)
      
     });


//  Creacion de Marcador personal
  scoreText = this.add.text(700,420, 'Vueltas: 0', { fontSize: '32px', fill: '#000' ,fontFamily:'Impact'});

 
//Colisiones entre jugador y mapa
 
  this.socket.on('checkpoint_location', function(checkpoint_location){
    if(self.checkpoint) self.checkpoint.destroy();
    self.checkpoint = self.physics;
  });
 

  //Declarar un ganador y reinicio de juego
  this.socket.on('soy ganador', data=>{
    alert('El ganador fue el jugador '+data)
    score=0;
    scoreText.setText('Vueltas: ' + 0);
    this.maxScoreText.setText('Mayor vueltas: ' + 0)
    self.carro.x=70;
    self.carro.y=90;
    self.carro.setVelocity(0);
    self.carro.setAngularVelocity(0);
    self.carro.setAcceleration(0);
    self.otherPlayers.x=70;
    self.otherPlayers.y=90;
    this.socket.emit('nuevoMax');
  });

  this.socket.on('otroGana', function(){
    self.carro.x = 70;
    self.carro.y= 90;
    score = 0;
    console.log("otro gana")
  })

  

}

//Creacion de vehiculo y jugador
function addPlayer(self, playerInfo) {
  self.carro = self.physics.add.image(playerInfo.x, playerInfo.y, 'carro').setOrigin(0.5, 0.5).setDisplaySize(20, 35).setOffset(8, 12)     
  .setOffset(8, 12)     
  self.carro.setDrag(250);
  self.carro.setAngularDrag(250);
  self.carro.setMaxVelocity(200);
  self.carro.setCollideWorldBounds(true);
  self.carro.score = 0;
  
}

//Creacion de los autos de los demas jugadores en el servidor
function addOtherPlayers(self, playerInfo) {
  var number = Math.floor(Math.random() * 9); 
  console.log(number);
  var otherPlayer;
  switch (number){
    case 1:
      otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'one').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
      otherPlayer.playerId = playerInfo.playerId;
      self.otherPlayers.add(otherPlayer);
    break;
    
    case 2:
      otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'two').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
      otherPlayer.playerId = playerInfo.playerId;
      self.otherPlayers.add(otherPlayer);
    break;
    
    case 3:
      otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'three').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
      otherPlayer.playerId = playerInfo.playerId;
      self.otherPlayers.add(otherPlayer);
    break;

    case 4:
      otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'four').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
      otherPlayer.playerId = playerInfo.playerId;
      self.otherPlayers.add(otherPlayer);
    break;

    case 5:
      otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'five').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
      otherPlayer.playerId = playerInfo.playerId;
      self.otherPlayers.add(otherPlayer);
    break;

    case 6:
      otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'six').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
      otherPlayer.playerId = playerInfo.playerId;
      self.otherPlayers.add(otherPlayer);
    break;

    case 7:
      otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'seven').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
      otherPlayer.playerId = playerInfo.playerId;
      self.otherPlayers.add(otherPlayer);
    break;
    case 8:
      otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'nine').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
      otherPlayer.playerId = playerInfo.playerId;
      self.otherPlayers.add(otherPlayer);
    break;
    
    default:
      otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'one').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
      otherPlayer.playerId = playerInfo.playerId;
      self.otherPlayers.add(otherPlayer);
    break;
  }
  
}

function update() {
  
  if(this.ready){
    //Pasa a ser else si ya se completaron las 3 vueltas.
    if (score!=3){
      //Movimiento del carro
    if (this.carro) {
      if (this.cursors.left.isDown) {
        this.carro.setAngularVelocity(-150);
      } else if (this.cursors.right.isDown) {
        this.carro.setAngularVelocity(150);
      } else {
        this.carro.setAngularVelocity(0);
      }
      if (this.cursors.up.isDown) {
        this.physics.velocityFromRotation(this.carro.rotation + 1.5, 50, this.carro.body.acceleration);
      } else {
        this.carro.setAcceleration(0);
      }
      this.physics.world.wrap(this.carro, 5);
       this.physics.add.overlap(this.carro,this.checkpoint,function(){ 
         this.vuelta=true
         this.checkpoint.destroy()
         this.llegada = this.physics.add.image(this.llegada.x=158, this.llegada.y=80, 'llegada');
       },null,this);
      
       // Aumenta el puntaje del jugador y lo compara con el maximo
      if(this.vuelta){
        this.physics.add.overlap(this.carro,this.llegada,function(){ 
          this.llegada.destroy()
          score += 1;
          this.socket.emit('vueltaHecha',score);
          scoreText.setText('Vueltas: ' + score);
          this.checkpoint=this.physics.add.image(this.checkpoint.x=449, this.checkpoint.y=400, 'checkpoint');
        },null,this);
      }
      // emite el movimiento del jugador
      var x = this.carro.x;
      var y = this.carro.y;
      var r = this.carro.rotation;
      if (this.carro.oldPosition && (x !== this.carro.oldPosition.x || y !== this.carro.oldPosition.y || r !== this.carro.oldPosition.rotation)) {
        this.socket.emit('playerMovement', { x: this.carro.x, y: this.carro.y, rotation: this.carro.rotation });
      }
      // guarda la ultima posicion del jugador
      this.carro.oldPosition = {
        x: this.carro.x,
        y: this.carro.y,
        rotation: this.carro.rotation
      };
    } 
   }else{
     //Anuncia un ganador
     this.socket.emit('ganador', this.socket.id);
     this.carro.setVelocity(0);
     this.carro.setAngularVelocity(0);
   }
  
  }else{
    //mensaje en casp de que no hayan dos jugadores conectados
    alert('Se necesitan dos jugadores para empezar')
  }
  
  
}