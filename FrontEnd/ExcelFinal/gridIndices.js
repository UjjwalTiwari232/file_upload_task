import GridCell from "./gridCells.js";

class GridIndex {
  constructor(context, totalRows, gridData,columnWidths,rowHeights) {
    this.context = context;
    this.totalRows = totalRows;
    this.gridData = gridData;
    this.columnWidths = columnWidths;
    this.rowHeights = rowHeights;
  }

  // Method to draw the row index column
//   drawRowIndices() {
//     let rowIndex = 1;
//     // const cellHeight = 30;
//     // const cellWidth = 130;
//     let currentX = 0;
//     let currentY = 0;

//     for (let i = 0; i < this.totalRows; i++) {
//       let cellText = rowIndex.toString();
      
//       // Create a new Cell object for each row index
//       const cell = new GridCell(this.context, currentX, currentY, cellHeight, cellWidth, i, 0);

//       // Skip the first row index (used as a header)
//       if (i === 0) {
//         cellText = "";
//         rowIndex = 1;
//       }

//       // Draw the cell and add the row index text
//       cell.draw();
//       cell.isRow = true; // Mark the cell as a row index
//       cell.addText(cellText);

//       // Update grid data structure with the cell
//       this.gridData[i][0] = cell;

//       // Move to the next row position
//       currentY += this.rowHeights[i];

//       // Increment the row index
//       rowIndex++;
//     }
//   }
}

export default GridIndex;
