import Cell from "./cell.js";
import Headers from "./header.js";
import Indexing from "./index.js";
class Table {
    constructor(context, columns, rows, canvas, dataFromDb) {
        this.context = context;
        this.columns = columns;
        this.rows = rows;
        this.data = new Array(this.rows);
        this.isResizing = false;
        this.resizeColumnIndex = -1;
        this.startX = 0;
        this.initialWidth = 0;
        this.canvas = canvas;
        this.columns_width = new Array(this.columns.length);
        this.indexing = new Indexing(this.context, this.rows);
        this.selectedCell = [];
        this.isSelecting = false;
        this.isSelectingColumn = false;
        this.endX = 0;
        this.endY = 0;
        this.startX = 0;
        this.startY = 0;
        this.dataFromDb = dataFromDb;
    }

    draw() {
        let width = 130;
        let height = 30;
        let topX = width;
        let topY = height;
        console.log(this.dataFromDb);
        for (let i = 1; i < this.rows; i++) {
            this.data[i] = new Array(this.columns);
            for (let j = 1; j < this.columns; j++) {
                let text = "";
                console.log(this.dataFromDb[i][0]);
                if (this.dataFromDb[i][j] != undefined) {
                    text = this.dataFromDb[i][j];
                }

                let cell = new Cell(
                    this.context,
                    topX,
                    topY,
                    height,
                    width,
                    i,
                    j
                );
                this.columns_width[j] = width;
                this.context.fillStyle = "white";
                cell.draw();
                this.context.fillStyle = "black";
                cell.AddText(text);
                this.data[i][j] = cell;
                topX += width;
            }
            topX = width;
            topY += height;
        }

        this.getData();
    }

    getColumnsWidth() {
        return this.columns_width;
    }

    getData() {
        return this.data;
    }
    redraw() {
        for (let i = 1; i < this.data.length; i++) {
            for (let j = 1; j < this.data[i].length; j++) {
                if (j != 1) {
                    this.data[i][j].topX =
                        this.data[i][j - 1].topX + this.data[i][j - 1].width;
                }
                this.canvas.fillStyle = "white";
                this.data[i][j].draw();
                // this.canvas.fillStyle="black";
                // this.data[i][j].AddText();
            }
        }

        let header = new Headers(
            this.context,
            this.columns,
            this.rows,
            this.columns_width,
            this.canvas
        );

        header.draw(0);
        this.indexing.draw();
    }
    doubleClickHandler(event) {
        console.log("Double clicked");
        const { clientX, clientY } = event;
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        console.log(" " + rect.top);
        for (let i = 1; i < this.rows; i++) {
            for (let j = 1; j < this.columns; j++) {
                let cell = this.data[i][j];
                if (cell.containsPoint(x, y)) {
                    this.createInputField(event, cell);
                    break;
                }
            }
        }
    }

    createInputField(event, cell) {
        console.log("create input field");

        console.log(this.canvas.offsetLeft + " " + this.canvas.offsetTop);
        const input = document.createElement("input");
        input.type = "text";
        input.value = cell.text;
        input.style.position = "absolute";
        input.style.left = `${cell.topX + this.canvas.offsetLeft}px`;
        input.style.top = `${cell.topY + this.canvas.offsetTop}px`;
        input.style.width = `${cell.width}px`;
        input.style.height = `${cell.height}px`;
        input.style.fontSize = "12px";
        input.style.textAlign = "center";
        // input.style.border = "1px solid rgb(10,123,20)";

        input.style.boxSizing = "border-box";
        input.style.outlineColor = "rgb(10,123,20)";

        input.addEventListener("focus", () => {
            console.log("I am in foucs");
        });

        input.addEventListener("blur", () => {
            cell.text = input.value;
            document.body.removeChild(input);
            this.context.fillStyle = "white";
            cell.deselect();
        });

        document.body.appendChild(input);
        input.focus();
        input.select();
    }

    handleMouseDown(event) {
        console.log("mouse move down: ");
        const { clientX, clientY } = event;
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (clientY > 30) {
            console.log(clientX, clientY);
            for (let i = 1; i < this.rows; i++) {
                for (let j = 1; j < this.columns; j++) {
                    let cell = this.data[i][j];
                    if (cell.isPointNearBorder(x, y)) {
                        console.log(cell.isPointNearBorder(x, y));
                        this.canvas.style.cursor = "col-resize";
                        this.isResizing = true;
                        this.resizeColumnIndex = j;
                        this.startX = x;
                        this.initialWidth = cell.width;
                        break;
                    }
                }
                if (this.isResizing) break;
            }
            if (this.isResizing == false) {
                this.clearSelect();
                this.isSelecting = true;
                this.isSelectingColumn = false;
                this.selectedCell = [];
                this.startX = x;
                this.startY = y;
                this.endX = x;
                this.endY = y;
                this.selectCell(x, y);
            }
        }
    }

    handleMouseMove(event) {
        // console.log("is selecting", this.isSelecting);
        // console.log("is resizing", this.isResizing);
        const { clientX } = event;
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (this.isResizing) {
            console.log("mouse moving ");

            const newWidth = this.initialWidth + (x - this.startX);
            console.log("newWidth: " + newWidth);
            if (newWidth > 30) {
                for (let i = 1; i < this.rows; i++) {
                    this.data[i][this.resizeColumnIndex].resize(newWidth);
                }
                this.columns_width[this.resizeColumnIndex] = newWidth;
                this.context.clearRect(
                    0,
                    0,
                    this.canvas.width,
                    this.canvas.height
                );
                this.redraw();
            }
        } else if (this.isSelecting == true) {
            console.log("clear selct was called");
            this.clearSelect();
            this.endX = x;
            this.endY = y;
            this.updateSelect();
        }
    }
    updateSelect() {
        const minX = Math.min(this.startX, this.endX);
        const maxX = Math.max(this.startX, this.endX);
        const minY = Math.min(this.startY, this.endY);
        const maxY = Math.max(this.startY, this.endY);

        for (let i = 1; i < this.rows; i++) {
            for (let j = 1; j < this.columns; j++) {
                let cell = this.data[i][j];
                const cellRight = cell.topX + cell.width;
                const cellBottom = cell.topY + cell.height;

                if (
                    cell.topX < maxX &&
                    cellRight > minX &&
                    cell.topY < maxY &&
                    cellBottom > minY
                ) {
                    this.context.fillStyle = "white";
                    cell.select();
                    // let header = new Headers(
                    //     this.context,
                    //     this.columns,
                    //     this.rows,
                    //     this.columns_width,
                    //     this.canvas
                    // );
                    this.selectedCell.push(cell);
                }
            }
        }
    }

    clearSelect() {
        console.log("clearSelect Called:-" + this.selectedCell.length);
        for (let i = 0; i < this.selectedCell.length; i++) {
            this.context.fillStyle = "white";

            this.selectedCell[i].deselect();
        }
        this.selectedCell = [];
    }
    handleMouseUp(event) {
        console.log("Mouse UP ");
        this.canvas.style.cursor = "default";
        this.isResizing = false;
        this.resizeColumnIndex = -1;
        this.isSelecting = false;
    }
    selectCell(x, y) {
        for (let i = 1; i < this.rows; i++) {
            for (let j = 1; j < this.columns; j++) {
                let cell = this.data[i][j];
                if (cell.containsPoint(x, y)) {
                    cell.select();
                    this.selectedCell.push(cell);
                    console.log(
                        "hellooooooooooooooooooooooooooooooooooooooooooooooooo:-" +
                            cell.topX,
                        cell.topY,
                        x,
                        y
                    );
                    return;
                }
            }
        }
    }

    selectColumn(x) {
        if (!this.isSelectingColumn) {
            this.isSelectingColumn = true;
        } else {
            this.clearSelect();
        }

        console.log("hello");
        for (let i = 1; i < this.rows; i++) {
            let cell = this.data[i][x.columnNumber - 1];

            cell.select();
            this.selectedCell.push(cell);
        }
    }

    keyDownHandler(event) {
        var x = this.selectedCell[0].topX;
        var y = this.selectedCell[0].topY;

        for (let i = 0; i < this.columns_width.length; i++) {
            if (x < this.columns_width[i]) {
                x = i;
                break;
            } else {
                x = x - this.columns_width[i];
            }
        }

        var temp = this.data[y / 30][x];
        console.log("temp  :- " + temp.X, temp.Y);
        var row = 0;
        var col = 0;
        for (let i = 1; i < this.rows; i++) {
            var breakIt = false;
            for (let j = 1; j < this.columns; j++) {
                var cell = this.data[i][j];
                // console.log(temp.X, cell.X, temp.Y, cell.Y);
                if (temp.X == cell.X && temp.Y == cell.Y) {
                    // temp = this.data[i + 1][j];
                    row = i;
                    col = j;
                    console.log("fswefwf" + temp.X, temp.Y);
                    breakIt = true;
                    break;
                }
            }
            if (breakIt) {
                break;
            }
        }
        console.log(event.key);
        if (event.key == "ArrowDown") {
            if (row + 1 >= this.rows) {
                console.log("Please the correct cell inside table");
            } else {
                temp = this.data[row + 1][col];
                console.log(temp);
                this.clearSelect();
                this.selectCell(
                    temp.topX + temp.width,
                    temp.topY + temp.height
                );
            }
        } else if (event.key == "ArrowUp") {
            if (row - 1 <= 0) {
                console.log("Please the correct cell inside table");
            } else {
                temp = this.data[row - 1][col];
                this.clearSelect();
                this.selectCell(
                    temp.topX + temp.width,
                    temp.topY + temp.height
                );
            }
        } else if (event.key == "ArrowRight") {
            // this.clearSelect()
            if (col + 1 >= this.columns) {
                console.log("Please the correct cell inside table");
            } else {
                temp = this.data[row][col + 1];
                this.clearSelect();
                this.selectCell(
                    temp.topX + temp.width,
                    temp.topY + temp.height
                );
            }
        } else if (event.key == "ArrowLeft") {
            // this.clearSelect()
            // console.log(this.selectedCell[0]);
            // var x = this.selectedCell[0].topX;
            // var y = this.selectedCell[0].topY + 30;
            // console.log(x, y);
            // this.clearSelect();
            // this.selectCell(x, y);
            if (col - 1 <= 0) {
                console.log("Please the correct cell inside table");
            } else {
                temp = this.data[row][col - 1];
                this.clearSelect();
                this.selectCell(
                    temp.topX + temp.width,
                    temp.topY + temp.height
                );
            }
        }
    }
}

export default Table;
