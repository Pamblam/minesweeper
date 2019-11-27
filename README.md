# Minesweeper

Minesweeper on canvas.

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
</script>
```

# Try it

http://pamblam.github.io/minesweeper/