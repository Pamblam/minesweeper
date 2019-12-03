# Minesweeper

Minesweeper on canvas. Mobile (touch) friendly!

# Usage

`new Minesweeper(canvasElement, cellsWide, cellsTall, mineCount)`

 - Board must be at lest 8 cells wide. 
 - Mine count cannot be greater than 95% of all cells, and it can't be greater than 9999.

# Example

```html
<canvas id="gameboard"></canvas>
<script src="minesweeper.js"></script>
<script>
	var canvas = document.getElementById('gameboard');
	var ms = new Minesweeper(canvas, 10, 7, 5);

	canvas.addEventListener('ms-game-end', function(e){
		var ms = e.detail;
		var status = ms.won ? "won" : "lost";
		var mines = ms.mine_count;
		var time = ms.getGameTime();
		var restart = confirm(`You ${status} this ${mines}-mine game in ${time}. Would you like to play again?`);
		if(restart) ms.resetGame();
	});
</script>
```

# Try it

http://pamblam.github.io/minesweeper/