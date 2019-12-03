
class Minesweeper{
	
	constructor(canvas, width, height, mine_count){
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.mine_count = +mine_count;
		this.width = +width;
		this.height = +height;
		this.gameover = false;
		this.started = false;
		this.start_time = null;
		this.end_time = null;
		this.won = false;
		this.grid = [];
		this.emoji = 'neutral';
		this.isTouchGame = false;
		
		this.lastMousePos = null;
		this.move_over_cell = null;
		this.mouse_down_time = null;
		canvas.addEventListener('mousedown', this._onmousedown.bind(this));
		canvas.addEventListener('touchstart', this._onmousedown.bind(this));
		canvas.addEventListener('mouseup', this._onmouseup.bind(this));
		canvas.addEventListener('touchend', this._onmouseup.bind(this));
		canvas.addEventListener('touchend', this._getClientPos.bind(this));
		
		if(!Minesweeper.isValidConfig(width, height, mine_count)){
			throw new Error("Mines can only occupy 95% of the cells and the board must be at least 8 cells wide.");
		}
		
		(async ()=>{
			this._touchFixes();
			await MinesweeperBlock.loadImages();
			this._populateGrid();
			this._UILoop();
		})();
		
	}
	
	resetGame(){
		this.won = false;
		this.gameover = false;
		this.end_time = null;
		this.started = false;
		this.start_time = null;
		this.grid = [];
		this.emoji = 'neutral';
		this.move_over_cell = null;
		this.mouse_down_time = null;
		this._populateGrid();
	}
	
	getGameTime(){
		var end_time = this.end_time || new Date().getTime();
		var seconds = this.start_time ? 
			Math.floor(end_time-this.start_time) : 
			99999999;
		seconds = Math.floor(seconds/1000);
		var minutes = Math.floor(seconds / 60);
		seconds -= minutes * 60;
		seconds = (''+seconds).padStart(2, '0');
		minutes = (''+minutes).padStart(2, '0');
		if(minutes.length > 2){
			minutes = '99';
			seconds = '99';
		}
		return [...minutes, ':', ...seconds].join('');
	}
	
	_touchFixes(){
		this.canvas.style['-webkit-touch-callout'] = 'none';
		this.canvas.style['-webkit-user-select'] = 'none';
		this.canvas.style['-khtml-user-select'] = 'none';
		this.canvas.style['-moz-user-select'] = 'none';
		this.canvas.style['-ms-user-select'] = 'none';
		this.canvas.style['user-select'] = 'none';
		this.canvas.addEventListener('contextmenu', e=>e.preventDefault());
	}
	
	_UILoop(){
		requestAnimationFrame(()=>{
			this._draw();
			this._UILoop();
		});
	}
	
	_getClientPos(e){
		var pos = {clientX: 0, clientY: 0};
		if(e.type.indexOf('touch') === 0){
			this.isTouchGame = true;
			if(e.touches.length){
				for(var i=e.touches.length; i--;){
					pos.clientX += e.touches.item(i).clientX;
					pos.clientY += e.touches.item(i).clientY;
				}
				pos.clientX /= e.touches.length;
				pos.clientY /= e.touches.length;
			}else{
				return this.lastMousePos;
			}
		}else if(!this.isTouchGame){
			pos.clientX = e.clientX;
			pos.clientY = e.clientY;
		}
		this.lastMousePos = pos;
		return pos;
	}
	
	_fireEvent(type){
		var event = new CustomEvent(type, {detail: this, cancelable: true, bubbles: true});
		return this.canvas.dispatchEvent(event);
	}
	
	_onmousedown(e){
		this.move_over_cell = this._getCellAt(e) || null;
		this.mouse_down_time = new Date().getTime();
		if(this.move_over_cell && !this.gameover) this.emoji = 'nervous';
	}
	
	_onmouseup(e){
		if(!this.gameover) this.emoji = 'neutral';
		if(this._getCellAt(e) === this.move_over_cell){
			if(this.move_over_cell !== 'emoji' && this.gameover) return;
			if(this.move_over_cell.isClicked) return;
			if(!this.started){
				this.started = true;
				this.start_time = new Date().getTime();
			}
			var md_time = new Date().getTime() - this.mouse_down_time;
			if(this.move_over_cell === 'emoji'){
				this.move_over_cell = null;
				this.resetGame();
			}else if(md_time > 499){
				this.move_over_cell.isFlagged = !this.move_over_cell.isFlagged;
			}else{
				this._onCellClick(this.move_over_cell);
			}
			this.move_over_cell = null;
		}
	}
	
	_adjacentCells(x, y, blocks=[]){
		var str = JSON.stringify([x, y]);
		if(!blocks.includes(str)) blocks.push(str);
		var cells = this._touchingCells(x,y);
		for(var i=0; i<cells.length; i++){
			str = JSON.stringify(cells[i]);
			var [xx, yy] = cells[i];
			var cell = this.grid[yy][xx];
			if(cell.isMine) continue;
			if(blocks.includes(str)) continue;
			if(cell.touching === 0){
				blocks = this._adjacentCells(xx, yy, blocks);
			}else{
				blocks.push(JSON.stringify([xx,yy]));
			}
		}
		return blocks;
	}
	
	_touchingCells(x, y){
		var blocks = [];
		if(this.grid[y-1] && this.grid[y-1][x-1]) blocks.push([x-1, y-1]);
		if(this.grid[y-1] && this.grid[y-1][x]) blocks.push([x, y-1]);
		if(this.grid[y-1] && this.grid[y-1][x+1]) blocks.push([x+1, y-1]);
		if(this.grid[y] && this.grid[y][x-1]) blocks.push([x-1, y]);
		if(this.grid[y] && this.grid[y][x+1]) blocks.push([x+1, y]);
		if(this.grid[y+1] && this.grid[y+1][x-1]) blocks.push([x-1, y+1]);
		if(this.grid[y+1] && this.grid[y+1][x]) blocks.push([x, y+1]);
		if(this.grid[y+1] && this.grid[y+1][x+1]) blocks.push([x+1, y+1]);
		return blocks;
	}
	
	_onCellClick(cell){
		if(cell.isFlagged) return;
		cell.isClicked = true;
		if(cell.isMine){
			this.gameover = true;
			this.end_time = new Date().getTime();
			this._fireEvent('ms-game-end');
			this.emoji = 'angry';
		}else{
			this.emoji = 'neutral';
			var adjacent_cells = this._adjacentCells(cell.x, cell.y);
			for(var i=0; i<adjacent_cells.length; i++){
				var coords = JSON.parse(adjacent_cells[i]);
				this.grid[coords[1]][coords[0]].isClicked = true;
			}
			
			// check for win
			var blocks = (this.width * this.height) - this.mine_count;
			if(this._totalCleared() == blocks){
				this.gameover = true;
				this.end_time = new Date().getTime();
				this.won = true;
				this.emoji = 'happy';
				for(let y=0; y<this.height; y++){
					for(let x=0; x<this.width; x++){
						if(!this.grid[y][x].isClicked) this.grid[y][x].isFlagged = true;
					}
				}
				this._fireEvent('ms-game-end');
			}
		}
	}
	
	_countFlags(){
		var i = 0;
		for(let y=0; y<this.height; y++){
			for(let x=0; x<this.width; x++){
				if(this.grid[y][x].isFlagged) i++;
			}
		}
		return i;
	}
	
	_totalCleared(){
		var i = 0;
		for(let y=0; y<this.height; y++){
			for(let x=0; x<this.width; x++){
				if(this.grid[y][x].isClicked) i++;
			}
		}
		return i;
	}
	
	_drawEmoji(){
		var x = (this.canvas.width/2)-15;
		var y = 10;
		this.ctx.drawImage(MinesweeperBlock.Images['e-'+this.emoji], x, y, 30, 30);
	}
	
	_drawTimer(){
		var [minutes, seconds] = this.getGameTime().split(':');
		minutes = minutes.split('').map(d=>'d'+d);
		seconds = seconds.split('').map(d=>'d'+d);
		var chars = [...minutes, 'colon', ...seconds];
		this.ctx.fillStyle = '#010900';
		this.ctx.fillRect(this.canvas.width-82, 10, 72, 30);
		var overlap = 2;
		var y = 14;
		var x = this.canvas.width - (10 + overlap + 3);
		for(var i=chars.length; i--;){
			var img = MinesweeperBlock.Images[chars[i]];
			var scale = 23 / img.height;
			x -= img.width*scale;
			x += overlap;
			this.ctx.drawImage(img, x, y, img.width*scale, img.height*scale);
		}
	}
	
	_drawMineCount(){
		var mineCount = Math.max(this.mine_count - this._countFlags(), 0);
		var chars = (''+mineCount).padStart(4, '0').split('').map(d=>'d'+d);
		this.ctx.fillStyle = '#010900';
		this.ctx.fillRect(10, 10, 68, 30);
		var overlap = 2;
		var y = 14;
		var x = 13;
		for(var i=0; i<chars.length; i++){
			var img = MinesweeperBlock.Images[chars[i]];
			var scale = 23 / img.height;
			this.ctx.drawImage(img, x, y, img.width*scale, img.height*scale);
			x += img.width*scale;
			x -= overlap;
		}
	}
	
	_draw(){
		this.canvas.width = 32 * this.width + (10 * 2);
		this.canvas.height = 32 * this.height + (10 * 2) + 35;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = '#fbfbfb';
		this.ctx.strokeStyle = '#a8a8a8';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
		
		// draw header
		this._drawEmoji();
		this._drawTimer();
		this._drawMineCount();
		
		for(let y=0; y<this.height; y++){
			for(let x=0; x<this.width; x++){
				let block = this.grid[y][x];
				block.draw(this.ctx);
			}
		}
	}
	
	_getRandomBlock(){
		var x = Math.floor(Math.random()*this.width);
		var y = Math.floor(Math.random()*this.height);
		return this.grid[y][x];
	}
	
	_populateGrid(){
		
		// Create the grid
		for(var h=0; h<this.height; h++){
			var a = [];
			for(var w=0; w<this.width; w++){
				a.push(new MinesweeperBlock(w, h));
			}
			this.grid.push(a);
		}
		
		// Add mines
		for(var r=0; r<this.mine_count; r++){
			var block = this._getRandomBlock();
			while(block.isMine) block = this._getRandomBlock();
			block.isMine = true;
		}
		
		// Add numbers
		for(var y=0; y<this.height; y++){
			for(var x=0; x<this.width; x++){
				var block = this.grid[y][x];
				var t = 0;
				if(this.grid[y-1] && this.grid[y-1][x-1] && this.grid[y-1][x-1].isMine) t++;
				if(this.grid[y-1] && this.grid[y-1][x] && this.grid[y-1][x].isMine) t++;
				if(this.grid[y-1] && this.grid[y-1][x+1] && this.grid[y-1][x+1].isMine) t++;
				if(this.grid[y] && this.grid[y][x-1] && this.grid[y][x-1].isMine) t++;
				if(this.grid[y] && this.grid[y][x+1] && this.grid[y][x+1].isMine) t++;
				if(this.grid[y+1] && this.grid[y+1][x-1] && this.grid[y+1][x-1].isMine) t++;
				if(this.grid[y+1] && this.grid[y+1][x] && this.grid[y+1][x].isMine) t++;
				if(this.grid[y+1] && this.grid[y+1][x+1] && this.grid[y+1][x+1].isMine) t++;
				block.touching = t;
			}
		}
		
	}
	
	_getCellAt(e){
		var pos = this._canvasMousePos(e);
		
		var ex = (this.canvas.width/2)-15;
		var ey = 10;
		if(pos.x > ex && pos.x < ex+30 && pos.y > ey && pos.y < ey+30){
			return "emoji";
		}
		
		var x, y, i, s, f;
		for(i=0; i*32<this.canvas.width; i++){
			s = (i*32)+10;
			f = (i*32)+32+10;
			if(pos.x > s && pos.x < f){
				x = i; 
				break;
			}
		}
		for(i=0; i*32<this.canvas.height; i++){
			s = (i*32)+10+35;
			f = (i*32)+32+10+35;
			if(pos.y > s && pos.y < f){
				y = i; 
				break;
			}
		}
		return x !== undefined && y !== undefined ? this.grid[y][x] : false;
	}
	
	_canvasMousePos(e) {
		var {clientX, clientY} = this._getClientPos(e);
		var rect = this.canvas.getBoundingClientRect();
		var x = clientX - rect.left;
		var y = clientY - rect.top;
		var wfactor = this.canvas.width / rect.width;
		var hfactor = this.canvas.height / rect.height;
		x = x*wfactor;
		y = y*hfactor;
		return {x, y};
	}
}

Minesweeper.isValidConfig = function(width, height, mine_count){
	if(+width < 8 || mine_count > 9999) return false;
	return +width * +height * .95 > +mine_count;
};

class MinesweeperBlock{
	
	constructor(x, y){
		this.isClicked = false;
		this.isMine = false;
		this.touching = 0;
		this.isFlagged = false;
		this.x = +x;
		this.y = +y;
	}
	
	async draw(ctx){
		await MinesweeperBlock.loadImages();
		var x = (this.x*32)+10;
		var y = (this.y*32)+10+35;
		var im = MinesweeperBlock.Images;
		if(!this.isClicked){
			ctx.drawImage(im.Tile, x, y);
			if(this.isFlagged){
				ctx.drawImage(im.Flag, x, y);
			}
		}else{
			ctx.drawImage(im.Blank, x, y);
			if(this.isMine){
				ctx.drawImage(im.Mine, x, y);
			}else if(this.touching){
				ctx.drawImage(im[this.touching], x, y);
			}
		}
	}

}

MinesweeperBlock.Images = null;

MinesweeperBlock.loadImages = async function(){
	if(MinesweeperBlock.Images) return;
	MinesweeperBlock.Images = {};
	var imgs = [
		'1', '2', '3', '4', '5', '6', '7', '8', 'Flag', 'Mine', 'Tile', 'Blank',
		'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'colon',
		'e-neutral', 'e-happy', 'e-nervous', 'e-angry'
	];
	var promises = imgs.map(img=>new Promise(done=>{
		var image = new Image;
		image.onload = ()=>{
			MinesweeperBlock.Images[img] = image;
			done();
		};
		image.src = `icons/${img}.png`;
	}));
	await Promise.all(promises);
};