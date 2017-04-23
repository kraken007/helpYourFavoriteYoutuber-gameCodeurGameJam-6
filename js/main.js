var worldLargeur = 1024;
var worldHauter = 750
var game = new Phaser.Game(worldLargeur, worldHauter, Phaser.CANVAS, 'game');

var play = {
    preload: function () {
        console.log('preload');
        //constantes globale
        this.nbColonnes = 4;
        this.nbLignes = 5 + 1;
        this.taillePicoHauteur = 150;
        this.taillePicoLargeur = 100;
        this.startX = 0;
        this.startY = 0;
        this.speed = 0;
        this.startGame = false;
        this.gameOverStatus = false;
        this.activeLine = 0;

        //chargement des images
        game.load.image('caseBlanche', './images/caseBlanche.jpg');
        game.load.image('caseNoire', './images/caseNoire.jpg');
        console.log(' fin preload');
    },
    create: function () {
        console.log('create');
        //changement de la couleur du background par defaut
        game.stage.backgroundColor = '#e29836';

        //calcul des coordonnées de départ pour centre la grille
        this.startX = (game.world.width - (this.nbColonnes * this.taillePicoLargeur)) / 2;
        this.startY -= this.taillePicoHauteur;

        //creation et stockage des tuiles dans un tableau
        this.tiles = [];
        for (var lignes = 0; lignes < this.nbLignes; lignes++) {
            this.tiles.push(Array(this.nbColonnes));
            var indexCaseNoire = this.random(0, this.nbColonnes - 1);
            for (var colonnes = 0; colonnes < this.nbColonnes; colonnes++) {
                this.tiles[lignes][colonnes] = game.add.sprite(
                    this.startX + (colonnes * this.taillePicoLargeur),
                    this.startY + (lignes * this.taillePicoHauteur),
                    'caseBlanche'
                );
                this.tiles[lignes][colonnes].setScaleMinMax(0.98, 0.98);
                this.tiles[lignes][colonnes].inputEnabled = true;
                this.tiles[lignes][colonnes].events.onInputDown.add(this.checkTile, this);
                this.tiles[lignes][colonnes].good = false;
                this.tiles[lignes][colonnes].lineNumber = lignes;

            }
            if (lignes < this.nbLignes - 1) {
                this.chooseTheBlackTile(lignes);
                this.activeLine = lignes;
            }
        }

        console.log('fin create');
    },
    update: function () {

        //start game
        if (game.input.activePointer.leftButton.isDown && !this.startGame) {
            this.startGame = true;
            this.speed = 1;
        }
        //restart game
        if (game.input.activePointer.leftButton.isDown && this.gameOverStatus == true) {
            this.gameOverTexte.kill();
            game.state.restart();
        }
        //déplacement des tuiles
        for (var lignes = 0; lignes < this.nbLignes; lignes++) {
            for (var colonnes = 0; colonnes < this.nbColonnes; colonnes++) {
                this.tiles[lignes][colonnes].y += this.speed;
            }
            //est que la tuile est sortie de l'ecrant ?
            if (this.tiles[lignes][0].y > worldHauter - 1) {
                //alors je remet la ligne de tuile en haut
                for (var colonnes = 0; colonnes < this.nbColonnes; colonnes++) {
                    //conditon de gameOver
                    if(this.tiles[lignes][colonnes].good === true){
                        this.gameOver();
                    }
                    this.tiles[lignes][colonnes].y -= this.nbLignes * this.taillePicoHauteur;
                }
                // je re-chosie une tuile noire sur cette ligne
                this.chooseTheBlackTile(lignes);
            }
        }
        //si le jeu a commencé j'accelère petite a petit
        if (this.speed > 0) {
            this.speed += 0.01;
        }
    },
    render: function () {

    },
    test: function () {

    },
    random: function (pmin, pmax) {
        var min = Math.ceil(pmin);
        var max = Math.floor(pmax);

        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    chooseTheBlackTile: function (plignes) {
        var indexCaseNoire = this.random(0, this.nbColonnes - 1);
        for (var index = 0; index < this.nbColonnes; index++) {
            if (indexCaseNoire === index) {
                this.tiles[plignes][index].loadTexture('caseNoire');
                this.tiles[plignes][index].good = true;
            } else {
                this.tiles[plignes][index].loadTexture('caseBlanche');
            }

        }
    },
    checkTile: function(pSprite, pGame){
        console.log(pSprite);
        if(pSprite.lineNumber == this.activeLine && pSprite.good == true){
            //ok
            pSprite.good = false;
            pSprite.loadTexture('caseBlanche');
            if(this.activeLine == 0){
                this.activeLine = this.tiles.length - 1;
            }else{
                this.activeLine -= 1;
            }
            
        }else {
            //reset bonus
        }
        console.log(pSprite);
        console.log(this.activeLine);
    },
    gameOver: function () {
        //on arrete le défilement des tiles
        this.speed = 0;
        //on met le message de gameOver
        this.gameOverString = 'GAME OVER';
        this.gameOverTexte = game.add.text(worldLargeur / 2 , worldHauter / 2 , this.gameOverString, {
            font: "32px Arial"
            , fill: "red"
            , align: "center"
        });
        this.gameOverStatus = true;
    }
};

var toolBox = {

};

game.state.add('play', play);

game.state.start('play');