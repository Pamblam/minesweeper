
class ms_grid{
	constructor(w, h, mines){
		this.mines = mines;
		this.started = false;
		this.gameover = false;
		this.won = false;
		this.onFirstClick = ()=>{};
		this.onGameFinished = ()=>{};
		this.width = w;
		this.height = h;
		this.grid = [];
		this.total_cleared = 0;
		if(w*h <= mines) throw new Error("Too many mines.");
		this.populate_grid();
	}
	getGame(){
		var table = document.createElement('table');
		table.setAttribute('style', 'border-collapse:collapse;margin:0;padding:0;');
		for(let y=0; y<this.height; y++){
			let tr = document.createElement('tr');
			tr.setAttribute('style', 'border-collapse:collapse;margin:0;padding:0;');
			table.appendChild(tr);
			for(let x=0; x<this.width; x++){
				let block = this.grid[y][x];
				let td = document.createElement('td');
				td.setAttribute('style', 'border-collapse:collapse;margin:0;padding:0;width:2em;height:2em;text-align:center;border:1px solid black;background:grey;');
				td.setAttribute('data-touching', block.touching);
				td.setAttribute('data-mine', block.isMine?"1":"0");
				td.setAttribute('data-clicked', "0");
				td.setAttribute('data-flagged', "0");
				tr.appendChild(td);
				td.onclick = ()=>this.onTDClick(td);
				td.addEventListener('contextmenu', (ev)=>{
					ev.preventDefault();
					this.onTDRightClick(td);
				});
			}
		}
		return table;
	}
	onTDRightClick(td){
		if(this.gameover) return;
		if(!this.started){
			this.started = true;
			this.onFirstClick();
		}
		if(td.getAttribute('data-flagged') == '1'){
			td.setAttribute('data-flagged', '0');
			while(td.firstChild) td.removeChild(td.firstChild);
		}else{
			td.setAttribute('data-flagged', '1');
			td.appendChild(document.createTextNode('⊗'));
		}
	}
	onTDClick(td){
		if(this.gameover) return;
		if(!this.started){
			this.started = true;
			this.onFirstClick();
		}
		if(td.getAttribute('data-clicked') == '1') return;
		td.style.background = "white";
		if(td.getAttribute('data-mine') == '1'){
			td.appendChild(document.createTextNode('✶'));
			this.gameover = true;
			return this.onGameFinished();
		}else if(td.getAttribute('data-touching') != '0'){
			var span = document.createElement('span');
			switch(td.getAttribute('data-touching')){
				case '1': span.setAttribute('style', 'color:#4286f4'); break;
				case '2': span.setAttribute('style', 'color:#6241f4'); break;
				case '3': span.setAttribute('style', 'color:#d341f4'); break;
				case '4': span.setAttribute('style', 'color:#41f46d'); break;
				case '5': span.setAttribute('style', 'color:#b8f441'); break;
				case '6': span.setAttribute('style', 'color:#b8f441'); break;
				case '7': span.setAttribute('style', 'color:#f4b541'); break;
				case '8': span.setAttribute('style', 'color:#f44141'); break;
			}
			span.appendChild(document.createTextNode(td.getAttribute('data-touching')));
			td.appendChild(span);
			this.total_cleared++
		}else{
			this.total_cleared++;
		}
		var blocks = (this.width * this.height) - this.mines;
		if(this.total_cleared == blocks){
			this.gameover = true;
			this.won = true;
			this.onGameFinished();
		}
	}
	populate_grid(){
		// Create the grid
		for(var h=0; h<this.height; h++){
			var a = [];
			for(var w=0; w<this.width; w++){
				a.push(new ms_block());
			}
			this.grid.push(a);
		}
		// Add mines
		for(var r=0; r<this.mines; r++){
			var block = this.getRandomBlock();
			while(block.isMine) block = this.getRandomBlock();
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
	getRandomBlock(){
		var x = Math.floor(Math.random()*this.width);
		var y = Math.floor(Math.random()*this.height);
		return this.grid[y][x];
	}
}

class ms_block{
	constructor(x, y){
		this.isClicked = false;
		this.isMine = false;
		this.touching = 0;
	}
}