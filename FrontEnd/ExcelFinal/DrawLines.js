class GridLine {
    constructor(context, canvas, startX, startY, endX, endY) {
      this.context = context;
      this.canvas = canvas;
      this.startX = startX;
      this.startY = startY;
      this.endX = endX;
      this.endY = endY;
      this.isVertical = false;
      this.isHorizontal = false;
    }
  
    draw() {
      this.context.strokeStyle = "#E1E1E1"; // Light gray color for the grid lines
      this.context.lineWidth = 1;
      this.context.beginPath();
    //   console.log(this.startX, this.startY, this.endX);
      this.context.moveTo(this.startX + 0.5, this.startY);
      this.context.lineTo(this.endX + 0.5, this.endY);
      this.context.stroke();
    }
  
    isCloseToBorder(x, y) {
      const tolerance = 3; // Defines how close the point needs to be to the line to be considered "near"
  
      return Math.abs(x - this.startX) <= tolerance || Math.abs(y - this.startY) <= tolerance;
    }
  }
  
  export default GridLine;
  