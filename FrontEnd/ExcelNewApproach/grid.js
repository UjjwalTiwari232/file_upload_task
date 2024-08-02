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
        canvas,
        arrayOfObjectValues
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
        this.isSelectingCel = false;
        this.isSelectingMultiple = false;
        this.isResizingColumn = false;
        this.isResizingRow = false;
        this.isSelectingColumn = false;
        this.isSelectingRow = false;
        this.temp = 0;
        this.temp1 = 0;
        this.temp2 = 0;
        this.temp3 = 0;
        this.temp4 = 0;
        this.temp5 = 0;
        this.endX = 0;
        this.endY = 0;
        this.canvas = canvas;
        this.arrayOfObjectValues = arrayOfObjectValues;

        // Initialize cellData array
        this.cellData = [];
        this.selectedcell = [];
        this.scrollRow = 1;
        this.scrollColumn = 1;
    }

    // Call this method whenever grid data is updated or needs redrawing
    updateCellData() {
        this.cellData = this.createCellData();
    }
    drawGrid() {
        // Clear the entire canvas
        this.ctx.clearRect(0, 0, this.maxWidth, this.maxHeight);
        console.log("scrollRow:-", this.scrollRow);
        console.log("Draw was called");
        this.ctx.lineWidth = 1;
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.strokeStyle = "#BBB5B5";

        let upper = this.headerHeight;

        for (let i = this.scrollRow; i < this.numberofRows; i++) {
            this.ctx.fillStyle = "#CECECE";
            this.ctx.fillRect(0, upper, this.indexWidth, this.rowHeights[i]);
            this.ctx.fillStyle = "black";
            this.ctx.fillText(
                i,
                this.indexWidth / 2,
                upper + this.rowHeights[i] / 2
            );
            upper += this.rowHeights[i];
        }
        upper = this.indexWidth;
        let column_counter = "A";
        for (let i = this.scrollColumn; i < this.numberOfColumns; i++) {
            this.ctx.fillStyle = "#CECECE";
            this.ctx.fillRect(
                upper,
                0,
                this.columnWidths[i],
                this.headerHeight
            );

            let text = column_counter;
            column_counter = String.fromCharCode(
                column_counter.charCodeAt() + 1
            );
            console.log(text);
            this.ctx.fillStyle = "black";
            this.ctx.fillText(
                text,
                upper + this.columnWidths[i] / 2,
                this.headerHeight / 2
            );
            upper += this.columnWidths[i];
            // console.log(0, upper, this.indexWidth, this.rowHeights[i]);
        }
        // this.ctx.fillStyle = "black";

        // Set initial positions
        let x = this.indexWidth;
        let y = this.headerHeight;

        for (let i = this.scrollRow; i < this.numberofRows; i++) {
            this.cellData[i] = [];
            for (let j = this.scrollColumn; j < this.numberOfColumns; j++) {
                let text = "";
                if (this.arrayOfObjectValues[i - 1][j - 1] != undefined) {
                    text = this.arrayOfObjectValues[i - 1][j - 1];
                }
                // Calculate the maximum width that the text can occupy in the cell
                let maxWidth = this.columnWidths[j - 1] - 10; // 10px padding on each side

                // Measure the text width so that I can Avoid the Overlapping problem
                let textWidth = this.ctx.measureText(text).width;
                if (textWidth > maxWidth) {
                    // Adjust text to fit within maxWidth
                    while (textWidth > maxWidth && text.length > 0) {
                        text = text.slice(0, -1); // Remove one character from the end
                        textWidth = this.ctx.measureText(text + "...").width;
                    }
                    text += "...";
                }

                this.cellData[i][j] = {
                    startX: x,
                    startY: y,
                    width: this.columnWidths[j - 1],
                    height: this.rowHeights[i - 1],
                    data: text,
                };
                this.ctx.fillText(
                    text,
                    x + this.columnWidths[j - 1] / 2,
                    y + this.rowHeights[i - 1] / 2
                );
                x += this.columnWidths[j - 1];
            }
            y += this.rowHeights[i - 1];
            x = this.indexWidth;
        }

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

    scrollHandler(event) {
        // if (event.deltaY > 0) {
        //     if (this.scrollRow < this.numberofRows) {
        //         this.scrollRow += 2;
        //     }
        // } else {
        //     if (this.scrollRow > 1) {
        //         this.scrollRow -= 2;
        //     }
        // }
        if (this.scrollRow <= 0 && event.deltaY < 0) {
            this.scrollRow = 0;
        } else {
            this.scrollRow += event.deltaY;
        }
        console.log(event.deltaY, this.scrollRow);
        let scrollNum = Math.floor(this.scrollRow / event.deltaY);
        console.log(this.scrollRow, event.deltaY, scrollNum, scrollNum);
        // if (this.st + 24 >= this.checkPoint) {
        //     this.checkPoint += 40;
        //     console.log("fetch called");
        //     this.fetchData();
        // }
        this.scrollRow = 1;
        this.scrollRow += scrollNum;
        this.drawGrid();
    }
    checkReizeOrSelect(event) {
        const { clientX, clientY } = event;
        const rect = this.canvas.getBoundingClientRect();
        let xpos = clientX - rect.left;
        let ypos = clientY - rect.top;
        this.temp4 = xpos;
        this.temp5 = ypos;
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
        //For Selecting a Column
        else if (ypos <= 0) {
            this.isSelectingColumn = true;
            this.temp = this.indexWidth;
            for (let i = 0; i < this.numberOfColumns; i++) {
                if (xpos < this.columnWidths[i]) {
                    this.temp2 = i;
                    this.temp3 = this.columnWidths[i];
                    break;
                }
                xpos -= this.columnWidths[i];
                this.temp += this.columnWidths[i];
            }
            this.selectingColumn();
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
        }
        //For Selecting a Row
        else if (xpos <= 0) {
            this.isSelectingRow = true;
            this.temp = this.headerHeight;
            console.log(ypos);
            for (let i = 0; i < this.numberofRows; i++) {
                if (ypos < this.rowHeights[i]) {
                    this.temp2 = i;
                    this.temp3 = this.rowHeights[i];
                    break;
                }
                ypos -= this.rowHeights[i];
                this.temp += this.rowHeights[i];
            }
            this.selectingRow();
            return;
        } else {
            if (xpos > 0 && ypos > 0) {
                this.isResizingColumn = false;
                this.isResizingRow = false;
                this.isSelectingCel = true;
                this.selectedcell = [];

                if (xpos <= 0 || ypos <= 0) {
                    console.log("Index or Header");
                    return;
                }

                let selectStartX = this.indexWidth;
                let selectStartY = this.headerHeight;
                for (let i = 0; i < this.numberOfColumns; i++) {
                    if (xpos <= this.columnWidths[i]) {
                        xpos = this.columnWidths[i];
                        this.temp2 = this.columnWidths[i];
                        this.temp = selectStartX;
                        break;
                    }
                    xpos -= this.columnWidths[i];
                    selectStartX += this.columnWidths[i];
                }

                for (let j = 0; j < this.numberofRows; j++) {
                    if (ypos <= this.rowHeights[j]) {
                        ypos = this.rowHeights[j];
                        this.temp3 = this.rowHeights[j];
                        this.temp1 = selectStartY;
                        break;
                    }
                    ypos -= this.rowHeights[j];
                    selectStartY += this.rowHeights[j];
                }

                console.log(xpos, selectStartX, ypos, selectStartY);
                for (let row = 1; row < this.numberofRows; row++) {
                    for (let col = 1; col < this.numberOfColumns; col++) {
                        if (
                            this.cellData[row][col].startY == selectStartY &&
                            this.cellData[row][col].startX == selectStartX
                        ) {
                            this.selectedcell.push(this.cellData[row][col]);
                        }
                    }
                }
                this.ctx.strokeStyle = "rgb(14,101,235)";
                this.ctx.strokeRect(
                    selectStartX + 0.5,
                    selectStartY + 0.5,
                    xpos,
                    ypos
                );
                this.ctx.strokeStyle = "#BBB5B5";
                // this.ctx.strokeRect(
                //     selectStartX + 0.5,
                //     0 + 0.5,
                //     xpos,
                //     this.headerHeight
                // );
                // this.ctx.strokeRect(
                //     0 + 0.5,
                //     selectStartY + 0.5,
                //     this.indexWidth,
                //     ypos
                // );
                // this.ctx.strokeStyle = "#BBB5B5";
            }
        }
    }

    selectingRow() {
        // this.ctx.fillStyle = "rgba(14,101,235,0.1)";
        // this.ctx.fillRect(this.temp, 0, this.temp3, this.maxHeight);
        // this.ctx.strokeStyle = "rgb(60, 189, 8)";
        // this.ctx.strokeRect(this.temp, 0, this.temp3, this.maxHeight);

        // this.ctx.fillStyle = "black";
        // this.ctx.strokeStyle = "#BBB5B5";
        console.log(this.temp, 0, this.temp3, this.maxHeight, this.temp2);
        this.selectedcell = [];
        for (let i = 1; i < this.numberOfColumns; i++) {
            this.selectedcell.push(this.cellData[this.temp2 + 1][i]);
        }
        console.log("FROM SELECTING ROW", this.selectedcell);
    }

    selectingColumn() {
        // this.ctx.fillStyle = "rgba(14,101,235,0.1)";
        // this.ctx.fillRect(this.temp, 0, this.temp3, this.maxHeight);
        // this.ctx.strokeStyle = "rgb(60, 189, 8)";
        // this.ctx.strokeRect(this.temp, 0, this.temp3, this.maxHeight);

        // this.ctx.fillStyle = "black";
        // this.ctx.strokeStyle = "#BBB5B5";
        console.log(this.temp, 0, this.temp3, this.maxHeight);
        this.selectedcell = [];
        for (let i = 1; i < this.numberofRows; i++) {
            this.selectedcell.push(this.cellData[i][this.temp2 + 1]);
        }
        console.log("FROM SELECTING COLUMN", this.selectedcell);
    }
    selectingMultiple(event) {
        if (this.isSelectingCel) {
            this.isSelectingMultiple = true;
            let deltaX = event.clientX - this.temp;
            let deltaY = event.clientY - this.temp1;
            this.drawGrid();
            this.ctx.fillStyle = "rgba(14,101,235,0.1)";
            this.ctx.strokeStyle = "rgb(14,101,235)";
            // this.ctx.strokeRect(
            //     this.selectedcell[0].startX,
            //     this.selectedcell[0].startY,
            //     this.selectedcell[0].width,
            //     this.selectedcell[0].height
            // );
            this.ctx.strokeRect(
                this.temp + 0.5,
                this.temp1 + 0.5,
                deltaX,
                deltaY
            );
            this.ctx.fillRect(
                this.temp + 0.5,
                this.temp1 + 0.5,
                deltaX,
                deltaY
            );
            this.ctx.fillStyle = "black";
            this.ctx.strokeStyle = "#BBB5B5";
            this.endX = event.clientX;
            this.endY = event.clientY;
        }
    }

    resizeColumnWidth(event) {
        if (this.isResizingColumn) {
            this.canvas.style.cursor = "col-resize";
            let clickedPos = this.temp;

            let delta = Math.abs(event.clientX - this.temp) + this.temp3;
            let updatedCol = 0;
            // Adjust column width
            if (this.temp2 >= 0 && this.temp2 < this.columnWidths.length) {
                this.columnWidths[this.temp2 - 1] = delta;

                // Ensure the new column width is positive
                if (this.columnWidths[this.temp2 - 1] < 0) {
                    this.columnWidths[this.temp2 - 1] = 30;
                }
                updatedCol = this.temp2 - 1;
            }

            // Log for debugging
            console.log(
                "FROM resizeColumnWidth",
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
            this.canvas.style.cursor = "default";
            // Clear the entire canvas
            this.ctx.clearRect(0, 0, this.maxWidth, this.maxHeight);

            // Redraw the grid with updated column widths
            this.drawGrid();
        }
        // Drawing the selected Column
        else if (this.isSelectingColumn) {
            // Clear the entire canvas
            this.ctx.clearRect(0, 0, this.maxWidth, this.maxHeight);

            // Redraw the grid with updated column widths
            this.drawGrid();
            this.ctx.fillStyle = "rgba(14,101,235,0.1)";
            this.ctx.fillRect(this.temp, 0, this.temp3, this.maxHeight);
            this.ctx.strokeStyle = "rgb(60, 189, 8)";
            this.ctx.strokeRect(this.temp, 0, this.temp3, this.maxHeight);

            this.ctx.fillStyle = "black";
            this.ctx.strokeStyle = "#BBB5B5";
        }
        // Drawing the selected Row
        else if (this.isSelectingRow) {
            // Clear the entire canvas
            this.ctx.clearRect(0, 0, this.maxWidth, this.maxHeight);

            // Redraw the grid with updated column widths
            this.drawGrid();
            console.log(this.temp, 0, this.temp3, this.maxWidth, this.temp2);
            this.ctx.fillStyle = "rgba(14,101,235,0.1)";
            this.ctx.fillRect(0, this.temp, this.maxWidth, this.temp3);
            this.ctx.strokeStyle = "rgb(60, 189, 8)";
            this.ctx.strokeRect(0, this.temp, this.maxWidth, this.temp3);

            this.ctx.fillStyle = "black";
            this.ctx.strokeStyle = "#BBB5B5";
        } else if (this.isSelectingCel && this.isSelectingMultiple == false) {
            this.isSelectingCel = false;

            // Redraw the grid with updated column widths
            this.drawGrid();
            this.ctx.fillStyle = "rgba(14,101,235,0.1)";
            this.ctx.strokeStyle = "rgb(14,101,235";
            this.ctx.strokeRect(
                this.selectedcell[0].startX,
                this.selectedcell[0].startY,
                this.selectedcell[0].width,
                this.selectedcell[0].height
            );
            this.ctx.fillRect(
                this.selectedcell[0].startX,
                this.selectedcell[0].startY,
                this.selectedcell[0].width,
                this.selectedcell[0].height
            );
            this.ctx.fillStyle = "black";
            this.ctx.strokeStyle = "#BBB5B5";
        } else if (this.isSelectingMultiple) {
            this.isSelectingCel = false;
            this.isSelectingMultiple = false;
            this.selectedcell = [];
            this.temp2 = 0;
            this.temp3 = 0;
            console.log("hll", this.temp, this.endX, this.temp1, this.endY);
            let x = this.temp,
                y = this.temp1;
            for (let row = this.scrollRow; row < this.numberofRows; row++) {
                for (
                    let col = this.scrollColumn;
                    col < this.numberOfColumns;
                    col++
                ) {
                    if (
                        (this.cellData[row][col].startX >= this.temp &&
                            this.cellData[row][col].startX <= this.endX &&
                            this.cellData[row][col].startY >= this.temp1 &&
                            this.cellData[row][col].startY <= this.endY) ||
                        (this.cellData[row][col].startX <= this.temp &&
                            this.cellData[row][col].startX +
                                this.cellData[row][col].width >=
                                this.endX &&
                            this.cellData[row][col].startY >= this.temp1 &&
                            this.cellData[row][col].startY <= this.endY)
                        // ||
                        // (this.cellData[row][col].startX <= this.temp &&
                        //     this.cellData[row][col].startX >= this.endX &&
                        //     this.cellData[row][col].startY <= this.temp1 &&
                        //     this.cellData[row][col].startY >= this.endY)
                    ) {
                        x = Math.min(x, this.cellData[row][col].startX);
                        y = Math.min(y, this.cellData[row][col].startY);
                        this.temp2 = Math.max(
                            this.temp2,
                            this.cellData[row][col].startX +
                                this.cellData[row][col].width
                        );
                        this.temp3 = Math.max(
                            this.temp3,
                            this.cellData[row][col].startY +
                                this.cellData[row][col].height
                        );
                        this.selectedcell.push(this.cellData[row][col]);
                    } else if (
                        this.cellData[row][col].startY >= this.endY &&
                        this.cellData[row][col].startY <= this.temp1 &&
                        this.cellData[row][col].startX +
                            this.cellData[row][col].width >=
                            this.endX &&
                        this.cellData[row][col].startX <= this.temp
                    ) {
                        x = Math.min(x, this.cellData[row][col].startX);
                        y = Math.min(y, this.cellData[row][col].startY);

                        this.temp2 = Math.max(
                            this.temp2,
                            this.cellData[row][col].startX +
                                this.cellData[row][col].width
                        );
                        this.temp3 = Math.max(
                            this.temp3,
                            this.cellData[row][col].startY +
                                this.cellData[row][col].height
                        );
                        this.selectedcell.push(this.cellData[row][col]);
                    }
                }
            }
            this.drawGrid();
            this.ctx.fillStyle = "rgba(14,101,235,0.1)";
            this.ctx.strokeStyle = "rgb(14,101,235";

            this.ctx.strokeRect(
                x,
                y,
                Math.abs(this.temp2 - x),
                Math.abs(this.temp3 - y)
            );
            this.ctx.fillRect(
                x,
                y,
                Math.abs(this.temp2 - x),
                Math.abs(this.temp3 - y)
            );
            this.ctx.fillStyle = "black";
            this.ctx.strokeStyle = "#BBB5B5";
            console.log(
                "From Redraw isSelectingMultiple",
                this.selectedcell,
                x,
                y,
                this.temp2,
                this.temp3
            );
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
