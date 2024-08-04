import GridCell from "./gridCells.js";

class GridHeader {
  constructor(context, totalColumns, columnWidths, gridData) {
    this.context = context;
    this.totalColumns = totalColumns;
    this.columnWidths = columnWidths;
    this.gridData = gridData;
  }

  // Method to draw the table header with column labels
//   drawHeader(scrollY) {
//     let columnLabel = "a";
//     let startX = 0;
//     let startY = scrollY;
//     const cellHeight = 30;

//     // Ensure the first column width is set to a default value
//     this.columnWidths[0] = 130;

//     for (let i = 0; i < this.totalColumns; i++) {
//       let cellText = columnLabel;
//       let cell;

//       if (i !== 0) {
//         // Create a new Cell object for each header column
//         cell = new GridCell(this.context, startX, startY, cellHeight, this.columnWidths[i], 0, i);
//         columnLabel = String.fromCharCode(columnLabel.charCodeAt() + 1); // Move to the next letter
//       } else {
//         cell = new GridCell(this.context, startX, startY, cellHeight, this.columnWidths[i], 0, i);
//         cellText = ""; // The first cell is empty (header cell)
//         columnLabel = "a"; // Reset column label
//       }

//       // Draw the cell and add the column label text
//       cell.draw();
//       cell.isColumn = true; // Mark the cell as a column header
//       cell.addText(cellText);

//       // Update grid data structure with the cell
//       this.gridData[0][i] = cell;

//       // Move to the next column position
//       startX += this.columnWidths[i];
//     }
//   }

  // Method to redraw the table header (used when refreshing the view)
  redrawHeader() {
    let columnLabel = "a";

    // Ensure the first column width is set to a default value
    this.columnWidths[0] = 130;

    for (let i = 0; i < this.totalColumns; i++) {
      const cell = this.gridData[0][i];

      // Redraw the existing cell
      cell.draw();
    }
  }
}

export default GridHeader;
