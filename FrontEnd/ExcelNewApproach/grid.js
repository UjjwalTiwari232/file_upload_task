class Grid {
    constructor(
        numberOfColumns,
        numberofRows,
        indexWidth,
        headerHeight,
        maxWith,
        maxHeight,
        ctx,
        columnWidths,
        rowHeights,
        canvas
    ) {
        this.numberOfColumns = numberOfColumns;
        this.numberofRows = numberofRows;
        this.indexWidth = indexWidth;
        this.headerHeight = headerHeight;
        this.maxWidth = maxWith;
        this.maxHeight = maxHeight;
        this.ctx = ctx;
        this.columnWidths = columnWidths;
        this.rowHeights = rowHeights;
        this.isSelectingMultiple = false;
        this.isResizingColumn = false;
        this.isResizingRow = false;
        this.temp = 0;
        this.temp1 = 0;
        this.temp2 = 0;
        this.temp3 = 0;
        this.canvas = canvas;
    }

    drawGrid() {
        console.log("Draw was called");
        this.ctx.lineWidth = 1;
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.strokeStyle = "#BBB5B5";

        // Set initial positions
        let x = this.indexWidth;
        let y = this.headerHeight;

        // Clear the entire canvas
        this.ctx.clearRect(0, 0, this.maxWidth, this.maxHeight);

        // Draw vertical lines (columns)
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, this.maxHeight);
        x = this.indexWidth;

        this.columnWidths.forEach((width, index) => {
            this.ctx.moveTo(x + 0.5, 0);
            this.ctx.lineTo(x + 0.5, this.maxHeight);
            x += width;
        });

        // Draw the rightmost vertical line
        this.ctx.moveTo(x + 0.5, 0);
        this.ctx.lineTo(x + 0.5, this.maxHeight);

        // Draw horizontal lines (rows)
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.maxWidth, 0);
        y = this.headerHeight;
        this.rowHeights.forEach((height) => {
            this.ctx.moveTo(0, y + 0.5);
            this.ctx.lineTo(this.maxWidth, y + 0.5);
            y += height;
        });

        // Draw the bottommost horizontal line
        this.ctx.moveTo(0, y + 0.5);
        this.ctx.lineTo(this.maxWidth, y + 0.5);

        // Stroke all lines
        this.ctx.stroke();
    }

    checkReizeOrSelect(event) {
        const { clientX, clientY } = event;
        const rect = this.canvas.getBoundingClientRect();
        let xpos = clientX - rect.left;
        let ypos = clientY - rect.top;
        xpos -= this.indexWidth;
        ypos -= this.headerHeight;

        //Checking for Column Width Resize Condition
        if (ypos <= 0 && this.isNearColumnBorder(xpos, ypos)) {
            console.log(" Col Edge");
            this.isResizingColumn = true;
            this.isResizingRow = false;

            //Storing Initial X-axis Position
            this.temp = xpos;

            for (let i = 0; i < this.numberOfColumns; i++) {
                if (xpos < this.columnWidths[i]) {
                    this.temp2 = i;
                    this.temp3 = this.columnWidths[i];
                    break;
                }
                xpos -= this.columnWidths[i];
            }
            return;
        }
        //Checking for the Row Height Resize Condition
        else if (xpos <= 0 && this.isNearRowBorder(xpos, ypos)) {
            console.log(" Row Edge");
            this.isResizingColumn = false;
            this.isResizingRow = true;

            // Storing Initial Y-axis Position
            this.temp = ypos;

            for (let i = 0; i < this.numberofRows; i++) {
                if (ypos < this.rowHeights[i]) {
                    this.temp2 = i;
                    this.temp3 = this.rowHeights[i];
                    break;
                }
                ypos -= this.rowHeights[i];
            }
            return;
        } else {
            this.isResizingColumn = false;
            this.isResizingRow = false;
        }

        if (xpos <= 0 || ypos <= 0) {
            console.log("Index or Header");
            return;
        }

        let selectStartX = this.indexWidth;
        let selectStartY = this.headerHeight;
        for (let i = 0; i < this.numberOfColumns; i++) {
            if (xpos <= this.columnWidths[i]) {
                xpos = this.columnWidths[i];
                break;
            }
            xpos -= this.columnWidths[i];
            selectStartX += this.columnWidths[i];
        }

        for (let j = 0; j < this.numberofRows; j++) {
            if (ypos <= this.rowHeights[j]) {
                ypos = this.rowHeights[j];
                break;
            }
            ypos -= this.rowHeights[j];
            selectStartY += this.rowHeights[j];
        }

        console.log(xpos, selectStartX, ypos, selectStartY);

        this.ctx.strokeStyle = "#0A7214";
        this.ctx.strokeRect(selectStartX + 0.5, selectStartY + 0.5, xpos, ypos);
        this.ctx.strokeStyle = "#BBB5B5";
    }

    resizeColumnWidth(event) {
        if (this.isResizingColumn) {
            this.canvas.style.cursor = "col-resize";
            let clickedPos = this.temp;

            let delta = Math.abs(event.clientX - this.temp) + this.temp3;

            // Adjust column width
            if (this.temp2 >= 0 && this.temp2 < this.columnWidths.length) {
                this.columnWidths[this.temp2 - 1] = delta;

                // Ensure the new column width is positive
                if (this.columnWidths[this.temp2 - 1] < 0) {
                    this.columnWidths[this.temp2 - 1] = 30;
                }
            }
            // Log for debugging
            console.log(
                clickedPos,
                this.temp,
                event.clientX,
                this.columnWidths[this.temp2 - 1]
            );
            // Clear the entire canvas
            this.ctx.clearRect(0, 0, this.maxWidth, this.maxHeight);
            this.drawGrid(); // Redraw with updated column widths
        }
    }

    resizeRowHeight(event) {
        if (this.isResizingRow) {
            this.canvas.style.cursor = "row-resize";
            let clickedPos = this.temp;

            let delta = Math.abs(event.clientY - this.temp) + this.temp3;

            // Adjust column width
            if (this.temp2 >= 0 && this.temp2 < this.rowHeights.length) {
                this.rowHeights[this.temp2 - 1] = delta;

                // Ensure the new column width is positive
                if (this.rowHeights[this.temp2 - 1] < 0) {
                    this.rowHeights[this.temp2 - 1] = 30;
                }
            }

            // Clear the entire canvas
            this.ctx.clearRect(0, 0, this.maxWidth, this.maxHeight);
            this.drawGrid(); // Redraw with updated column widths
        }
    }

    reDraw(event) {
        if (this.isResizingColumn || this.isResizingRow) {
            this.isResizingColumn = false;
            this.isResizingRow = false;
            this.isSelectingMultiple = false;
            this.canvas.style.cursor = "default";

            // Clear the entire canvas
            this.ctx.clearRect(0, 0, this.maxWidth, this.maxHeight);

            // Redraw the grid with updated column widths
            this.drawGrid();
        }
    }

    isNearColumnBorder(x, y) {
        const margin = 5;
        for (let i = 0; i < this.numberOfColumns; i++) {
            if (x < this.columnWidths[i]) {
                return x < margin;
            }
            x -= this.columnWidths[i];
        }
        return false;
    }
    isNearRowBorder(x, y) {
        const margin = 5;
        for (let i = 0; i < this.numberofRows; i++) {
            if (y < this.rowHeights[i]) {
                return y < margin;
            }
            y -= this.rowHeights[i];
        }
        return false;
    }
}

export default Grid;
