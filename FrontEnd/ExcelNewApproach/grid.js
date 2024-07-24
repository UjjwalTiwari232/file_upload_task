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
        rowHeights
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
    }

    // Function to draw the grid
    drawGrid() {
        this.ctx.lineWidth = 1;
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.strokeStyle = "#BBB5B5";

        // Set initial positions
        let x = this.indexWidth;
        let y = this.headerHeight;

        //Index Starting Border
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, this.maxHeight);
        // Reset x to 40 for drawing text/horizontal lines (rows)
        x = this.indexWidth;
        y = this.headerHeight;

        // Draw vertical lines (columns)
        this.columnWidths.forEach((width, index) => {
            this.ctx.moveTo(x + 0.5, 0);
            this.ctx.lineTo(x + 0.5, this.maxHeight);
            x += width;
            console.log(width);
        });

        // Draw the rightmost vertical line
        this.ctx.moveTo(x + 0.5, 0);
        this.ctx.lineTo(x + 0.5, this.maxHeight);

        //Index Starting Border
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.maxWidth, 0);
        // Draw horizontal lines (rows)
        this.rowHeights.forEach((height, index) => {
            this.ctx.moveTo(0, y + 0.5);
            this.ctx.lineTo(this.maxWidth, y + 0.5);
            y += height;
        });

        // Draw the bottommost horizontal line
        this.ctx.moveTo(0, y + 0.5);
        this.ctx.lineTo(this.maxWidth, y + 0.5);

        console.log(this.columnWidths);
        // Stroke all lines

        // Clear the canvas
        this.ctx.clearRect(0, 0, this.maxWidth, this.maxWidth);
        this.ctx.stroke();
    }

    //Functionn to Resize the column Width
    checkReizeOrSelect(event) {
        const { clientX, clientY } = event;
        var xpos = clientX - this.indexWidth;
        var ypos = clientY - this.headerHeight;
        console.log(xpos, ypos);
        if (this.isNearBorder(xpos, ypos)) {
            console.log("Edge");
            this.isResizingColumn = true;
            this.isResizingRow = false;
            this.isSelectingMultiple = false;
            this.temp = xpos;
            // this.resizeColumnWidth();
            return;
        } else {
            this.isResizingColumn = false;
            this.isResizingRow = false;
            this.isSelectingMultiple = false;
        }
        if (xpos <= 0) {
            console.log("Index");
            return;
        } else if (ypos <= 0) {
            console.log("Header");
            return;
        }
        var selectStartX = this.indexWidth;
        var selectStartY = this.headerHeight;
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
        var clickedPos = this.temp;
        if (this.isResizingColumn) {
            for (let i = 0; i < this.numberOfColumns; i++) {
                if (clickedPos < this.columnWidths[i]) {
                    clickedPos = i;
                    break;
                }
                clickedPos -= this.columnWidths[i];
            }
            var a = this.temp - event.clientX;
            // this.temp = a;
            // this.columnWidths[clickedPos] -= a;
            this.temp1 = clickedPos;
            this.temp2 = a;
            console.log(
                clickedPos,
                this.temp,
                event.clientX,
                this.columnWidths[clickedPos]
            );
            // this.drawGrid();
            // this.ctx.clearRect(clickedPos, 0,1,this.maxHeight);
        }
    }

    reDraw() {
        if (this.isResizingColumn) {
            this.isResizingColumn = false;
            this.isResizingRow = false;
            this.isSelectingMultiple = false;
            this.columnWidths[this.temp1] -= this.temp2;
            console.log(
                "NewWidth :- ",
                this.columnWidths[this.temp1],
                this.columnWidths
            );
            this.ctx.clearRect(0, 0, this.maxWidth, this.maxHeight);
            this.drawGrid();
        }
    }
    isNearBorder(x, y) {
        const margin = 3;
        // return Math.abs(x - (this.topX + this.width)) < margin;
        for (let i = 0; i < this.numberOfColumns; i++) {
            if (x < this.columnWidths[i]) {
                break;
            }
            x -= this.columnWidths[i];
        }
        return x < margin;
    }
}

export default Grid;
