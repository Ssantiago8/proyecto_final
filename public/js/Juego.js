class Juego extends Phaser.Scene {
    constructor(){
        super("juego");
    }
    
    preload(){
       this.load.image('start', 'assets\mapa\start.png');
    }

    create(){
        this.add.image(655, 341, 'start');
    }

    update(){

    }
     
}