
class ms_grid{
	constructor(w, h, mines){
		this.width = w;
		this.height = h;
		this.grid = [];
		if(w*h <= mines) throw new Error("Too many mines.");
		this.populate_grid(mines);
	}
	drawHTML(){
		var html = ["<table style='border-collapse:collapse; margin:0; padding:0;'>"];
		for(var y=0; y<this.height; y++){
			html.push("<tr style='border-collapse:collapse; margin:0; padding:0;'>");
			for(var x=0; x<this.width; x++){
				var block = this.grid[y][x];
				html.push("<td style='border-collapse:collapse; margin:0; padding:0; width:2em; height:2em; text-align:center; border:1px solid black;'>");
				if(block.isMine) html.push("*");
				else if(block.touching) html.push(block.touching);
				html.push("</td>");
			}
			html.push("<tr>");
		}
		html.push("</table>");
		document.body.innerHTML = html.join('');
	}
	populate_grid(mines){
		// Create the grid
		for(var h=0; h<this.height; h++){
			var a = [];
			for(var w=0; w<this.width; w++){
				a.push(new ms_block());
			}
			this.grid.push(a);
		}
		// Add mines
		for(var r=0; r<mines; r++){
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