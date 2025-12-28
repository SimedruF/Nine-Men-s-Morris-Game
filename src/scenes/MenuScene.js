export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    create() {
        // Fundal
        this.add.rectangle(400, 450, 800, 900, 0x2d3436);
        
        // Titlu
        this.add.text(400, 150, 'NINE MEN\'S MORRIS', {
            fontSize: '50px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.add.text(400, 210, 'Mill Game', {
            fontSize: '24px',
            color: '#b2bec3'
        }).setOrigin(0.5);
        
        // Descriere
        this.add.text(400, 280, 'Choose game mode:', {
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Buton PvP
        const pvpButton = this.add.rectangle(400, 380, 400, 80, 0x667eea);
        pvpButton.setStrokeStyle(3, 0xffffff);
        pvpButton.setInteractive();
        
        const pvpText = this.add.text(400, 380, 'PLAYER vs PLAYER', {
            fontSize: '26px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        pvpButton.on('pointerover', () => {
            pvpButton.setFillStyle(0x7c8ef5);
            this.game.canvas.style.cursor = 'pointer';
        });
        
        pvpButton.on('pointerout', () => {
            pvpButton.setFillStyle(0x667eea);
            this.game.canvas.style.cursor = 'default';
        });
        
        pvpButton.on('pointerdown', () => {
            this.scene.start('GameScene', { gameMode: 'pvp' });
        });
        
        // Buton PvAI
        const pvaiButton = this.add.rectangle(400, 500, 400, 80, 0xe17055);
        pvaiButton.setStrokeStyle(3, 0xffffff);
        pvaiButton.setInteractive();
        
        const pvaiText = this.add.text(400, 500, 'PLAYER vs COMPUTER', {
            fontSize: '26px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        pvaiButton.on('pointerover', () => {
            pvaiButton.setFillStyle(0xf39c7a);
            this.game.canvas.style.cursor = 'pointer';
        });
        
        pvaiButton.on('pointerout', () => {
            pvaiButton.setFillStyle(0xe17055);
            this.game.canvas.style.cursor = 'default';
        });
        
        pvaiButton.on('pointerdown', () => {
            this.scene.start('GameScene', { gameMode: 'pvai' });
        });
        
        // Instrucțiuni
        const instructions = [
            'How to play:',
            '1. Place 9 pieces on the board',
            '2. Form mills (3 pieces in a row) to remove opponent pieces',
            '3. Move pieces strategically to win',
            '4. Win when opponent has <3 pieces or cannot move'
        ];
        
        let yPos = 620;
        instructions.forEach((line, index) => {
            this.add.text(400, yPos, line, {
                fontSize: index === 0 ? '20px' : '16px',
                fontStyle: index === 0 ? 'bold' : 'normal',
                color: '#dfe6e9'
            }).setOrigin(0.5);
            yPos += index === 0 ? 35 : 25;
        });
    }
}
