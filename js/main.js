var worldLargeur = 1024;
var worldHauter = 750
var game = new Phaser.Game(worldLargeur, worldHauter, Phaser.CANVAS, 'game');

var play = {
    preload: function () {
        //constantes globale
        this.nbColonnes = 4;
        this.nbLignes = 5 + 1;
        this.taillePicoHauteur = 150;
        this.taillePicoLargeur = 150;
        this.startX = 0;
        this.startY = 0;
        this.speed = 0;
        this.score = 0;
        this.bonus = 1;
        this.oldBonus = 0;
        this.clickOk = 0;
        this.startGame = false;
        this.gameOverStatus = false;
        this.activeLine = 0;
        this.tabImage = [
            'andy',
            'at0mium',
            'cyprien',
            'enjoyphoenix',
            'natoo',
            'norman',
            'redFanny',
            'squeezie',
        ];
        this.goodImage = this.randomYoutuber('');
        this.badImage = this.randomYoutuber(this.goodImage);

        //chargement des images
        game.load.image('caseBlanche', './images/caseBlanche.jpg');
        game.load.image('caseNoire', './images/caseNoire.jpg');
        game.load.image('andy', './images/andy150.jpg');
        game.load.image('at0mium', './images/at0mium150.jpg');
        game.load.image('cyprien', './images/cyprien150.jpg');
        game.load.image('enjoyphoenix', './images/enjoyphoenix150.jpg');
        game.load.image('natoo', './images/natoo150.jpg');
        game.load.image('norman', './images/norman150.jpg');
        game.load.image('redFanny', './images/redFanny150.jpg');
        game.load.image('squeezie', './images/squeezie150.jpg');
    },
    create: function () {
        //fixe le framerate a 30 fps
        game.desiredFps = 30;
        //changement de la couleur du background par defaut
        game.stage.backgroundColor = '#000';

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
                    this.badImage
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

        //texte score etc...
        var scoreTexte = game.add.text(10, 10, "Views:", {
            font: "24px Trebuchet MS"
            , fill: "white"
            , align: "center"
        });
        this.scoreNbTxt = game.add.text(10, 35, this.score, {
            font: "24px Trebuchet MS"
            , fill: "white"
            , align: "center"
        });
        var tapTexte = game.add.text(10, 80, "ValidateTap:", {
            font: "24px Trebuchet MS"
            , fill: "white"
            , align: "center"
        });
        this.tapNbTxt = game.add.text(10, 105, this.clickOk, {
            font: "24px Trebuchet MS"
            , fill: "white"
            , align: "center"
        });

        //interception de l'event click et double click
        game.input.onTap.add(this.onTap, this);
    },
    update: function () {

        //start game
        if (game.input.activePointer.leftButton.isDown && !this.startGame) {
            this.startGame = true;
            this.speed = 1;
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
                    if (this.tiles[lignes][colonnes].good === true) {
                        this.gameOver();
                    }
                    this.tiles[lignes][colonnes].y -= this.nbLignes * this.taillePicoHauteur;
                }
                // je re-chosie une tuile noire sur cette ligne
                this.chooseTheBlackTile(lignes);
            }
        }
        //si le jeu a commencé j'accelère petite a petit
        if (this.speed > 0 && this.speed <= 7.5) {
            this.speed += 0.007;
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
                this.tiles[plignes][index].loadTexture(this.goodImage);
                this.tiles[plignes][index].good = true;
            } else {
                this.tiles[plignes][index].loadTexture(this.badImage);
            }

        }
    },
    checkTile: function (pSprite, pGame) {
        if (pSprite.lineNumber == this.activeLine && pSprite.good == true) {
            //ok
            pSprite.good = false;
            pSprite.loadTexture(this.badImage);
            if (this.activeLine == 0) {
                this.activeLine = this.tiles.length - 1;
            } else {
                this.activeLine -= 1;
            }
            //calcul point
            var result = this.oldBonus + this.bonus
            this.score += result;
            this.scoreNbTxt.setText(this.score.format());
            this.oldBonus = this.bonus;
            this.bonus = result;
            this.clickOk += 1;
            this.tapNbTxt.setText(this.clickOk);
        } else {
            //reset bonus
            this.oldBonus = 0;
            this.bonus = 1;
        }
    },
    gameOver: function () {
        //on arrete le défilement des tiles
        this.speed = 0;
        //on met le message de gameOver
        this.gameOverString = 'GAME OVER';
        this.gameOverTexte = game.add.text(worldLargeur / 2, worldHauter / 2, this.gameOverString, {
            font: "bold 64px Arial"
            , fill: "red"
            , align: "center"
        });
        //centrage du texte
        this.gameOverTexte.anchor.set(0.5, 0.5);
        this.gameOverStatus = true;
    },
    onTap: function (pointer, doubleTap) {
        if (doubleTap && this.gameOverStatus == true) {
            //double tap
            this.gameOverTexte.kill();
            game.state.restart();
        }
        else {
            //  A single tap (tap duration was < game.input.tapRate)
        }
    },
    randomYoutuber: function (pName) {
        var youtuber = '';
        do {
            youtuber = this.tabImage[this.random(0, this.tabImage.length - 1)];
        } while (youtuber == pName);
        
        return youtuber;
    }
};

game.state.add('play', play);

game.state.start('play');

Number.prototype.format = function (n, x) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$& ');
};