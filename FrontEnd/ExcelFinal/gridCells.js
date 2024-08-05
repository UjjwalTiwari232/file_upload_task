class GridCell {
    constructor(
      context,
      xPosition,
      yPosition,
      cellHeight,
      cellWidth,
      gridRow,
      gridColumn,
      columnWidths,
      rowHeights
    ) {
      this.context = context;
      this.xPosition = xPosition;
      this.yPosition = yPosition;
      this.cellHeight = cellHeight;
      this.cellWidth = cellWidth;
      this.gridRow = gridRow;
      this.gridColumn = gridColumn;
      this.text = "";
      this.isRowHeader = false;
      this.isColumnHeader = false;
      this.columnWidths = columnWidths;
      this.rowHeights = rowHeights;
      this.isSelected = false;
    }
  
    // Method to draw the cell, including selection highlighting if selected
    drawCell() {
      if (this.isSelected) {


            this.context.fillStyle = "#D2D2D2";
            this.context.fillRect(
            this.xPosition,
            this.yPosition,
            this.columnWidths[this.gridColumn],
            this.rowHeights[this.gridRow]
            );
            this.context.strokeStyle = "#C3C3C3";
            this.context.strokeRect(
            this.xPosition,
            this.yPosition,
            this.columnWidths[this.gridColumn],
            this.rowHeights[this.gridRow]
            );
            if(this.gridRow == 0){
                this.context.strokeStyle = "#307750";
                // Column headers bottom border
                
                this.context.beginPath();
                this.context.moveTo(this.xPosition, this.rowHeights[this.gridRow]);
                this.context.lineTo(this.xPosition+this.columnWidths[this.gridColumn], this.rowHeights[this.gridRow]);
                this.context.stroke();
            }
            else if(this.gridColumn == 0){
                this.context.strokeStyle = "#307750";
                // Column headers bottom border
               
                this.context.beginPath();
                this.context.moveTo(this.columnWidths[this.gridColumn], this.yPosition);
                this.context.lineTo(this.columnWidths[this.gridColumn],this.yPosition + this.rowHeights[this.gridRow]);
                this.context.stroke();
            }
            
                

            
        }
        else if(this.gridColumn == 0 || this.gridRow == 0){
        
            // #E6E6E6
            this.context.fillStyle = "#E6E6E6";
            this.context.strokeStyle = "#C3C3C3";
            this.context.fillRect(
                this.xPosition,
                this.yPosition,
                this.columnWidths[this.gridColumn],
                this.rowHeights[this.gridRow])

            this.context.strokeRect(
                this.xPosition,
                this.yPosition,
                this.columnWidths[this.gridColumn],
                this.rowHeights[this.gridRow])


        }
  
        this.context.fillStyle = "black";
        this.context.strokeStyle = "#C3C3C3";
      
      this.renderText();
    }
  
    // Method to check if a point (x, y) is inside this cell
    containsPoint(x, y) {
      return (
        x >= this.xPosition &&
        x <= this.xPosition + this.cellWidth &&
        y >= this.yPosition &&
        y <= this.yPosition + this.cellHeight
      );
    }
  
    // Method to add text to the cell
    addText(cellText) {
      this.text = cellText;
      this.context.font = "12px Arial";
      this.context.fillText(
        this.getWrappedText(cellText, this.columnWidths[this.gridColumn]),
        this.xPosition + this.columnWidths[this.gridColumn] / 2 - this.text.length,
        this.yPosition + this.rowHeights[this.gridRow] / 2 + 5  // Adjusted the y position to center the text vertically
      );
    }
  
    // Method to wrap text if it exceeds the cell width
    getWrappedText(text, availableWidth) {
      const fontSize = 12;
      const textWidth = text.length * fontSize;
      if (textWidth >= availableWidth) {
        return text.substring(0, availableWidth / fontSize);
      }
      return text;
    }
  
    // Method to render the text inside the cell
    renderText() {
      this.context.font = "12px Arial";
      this.context.fillText(
        this.getWrappedText(this.text, this.columnWidths[this.gridColumn]),
    
        this.xPosition + this.columnWidths[this.gridColumn] / 2 ,
        this.yPosition + this.rowHeights[this.gridRow] / 2 + 5
      );
    }
  
    // Method to check if a point is near the right border of the cell (for resizing)
    isPointNearRightBorder(x, y) {
      const borderMargin = 2;
      return Math.abs(x - (this.xPosition + this.cellWidth)) < borderMargin;
    }
  
    // Method to resize the cell width
    resizeCell(newWidth) {
      this.cellWidth = newWidth;
    }
  
    // Method to mark the cell as selected
    selectCell() {
      this.isSelected = true;
    }
  
    // Method to deselect the cell
    deselectCell() {
      this.isSelected = false;
    }
  }
  
  export default GridCell;
  