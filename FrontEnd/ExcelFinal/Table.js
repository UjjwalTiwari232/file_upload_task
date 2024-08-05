import GridCell from "./gridCells.js";
import GridHeader from "./gridHeader.js";
import GridIndex from "./gridIndices.js";
import GridLine from "./DrawLines.js";

class SpreadsheetGrid {
    constructor(context, columns, rows, canvas) {
      this.context = context;
      this.columns = columns;
      this.rows = rows;
  
      this.isResizing = false;
      this.resizeColumnIndex = -1;
      this.resizeRowIndex = -1;
    //   this.startX = 0;
      this.initialWidth = 0;
      this.canvas = canvas;
      this.columnsWidth = new Array(this.columns).fill(130);
      this.rowsHeight = new Array(this.rows).fill(30);
      this.indexing = new GridIndex(this.context, this.rows, this.data,this.columnsWidth,this.rowsHeight);
      this.header = new GridHeader(this.context, this.columns, this.columnsWidth, this.data);
      this.selectedCells = [];
      this.isSelecting = false;
      this.verticalLines = new Array(this.columns).fill(30);
      this.horizontalLines = new Array(this.rows).fill(30);
      this.endX = 0;
      this.endY = 0;
      this.startX = 0;
      this.startY = 0;
      this.scrollY = 0;
      this.scrollX = 0;
      this.currentRow = 0;
      this.currentColumn = 0;
      this.data = Array.from({ length: this.rows }, () =>
        Array.from({ length: this.columns }, () =>
          new GridCell(
            this.context,
            0,
            0,
            0,
            0,
            0,
            0,
            this.columnsWidth,
            this.rowsHeight
          )
        )
      );
  
      this.metaData = {
        sum: 0,
        average: 0,
        min: Infinity,
        max: -Infinity,
        count: 0,
        countNumbers: 0,
      };
      this.isCtrlPressed = false;
      this.isShiftPressed = false;
      this.isFileUploaded = false;
      this.csvData = [];
      this.dataMark = 0;
      this.currentPage = 1;
      this.searchInput = "none";
      this.sortInput = "none";
      this.isDataPresent = true;
      this.isDeleteValid = false;
      this.isSortValid = false;
      this.headerCodes = {};
    }
  
    resetGrid() {
      this.columnsWidth = new Array(this.columns).fill(130);
      this.rowsHeight = new Array(this.rows).fill(30);
  
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.data[i][j].text = "";
        }
      }
      this.currentPage = 1;
      this.scrollY = 0;
      this.scrollX = 0;
      this.isDataPresent = true;
      this.dataMark = 0;
    }
  
    // Draw Functions
    drawGrid() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawVerticalLines();
      this.drawHorizontalLines();
      this.drawIndex();
      this.drawHeaders();
      this.drawCells();
    }
  
    async fetchCsvData() {
      console.log("Fetching CSV data");
      let url =
        "http://localhost:5139/api/User/GetAll/" +
        this.currentPage +
        "/" +
        this.sortInput +
        "/" +
        this.searchInput;
      try {
        const response = await fetch(url, {
          method: "GET",
        });
        const data = await response.json();
  
        this.drawCsvData(data);
      } catch (error) {
        console.log(error);
      }
    }
  
    async handleSearch() {
      console.log("Handling search");
      const input = document.getElementsByClassName("input-email")[0];
      this.searchInput = input.value || "none";
      this.resetGrid();
      this.fetchCsvData();
    }
  
    async handleDelete() {
      if (this.isDeleteValid) {
        let topCell = this.selectedCells[0];
        let userId = this.data[topCell.gridRow][1].text;
        let url = "http://localhost:5139/api/User/Delete/" + userId;
        try {
          const response = await fetch(url, {
            method: "GET",
          });
          const data = await response.json();
          console.log(data);
          alert(data.msg);
          this.resetGrid();
          this.fetchCsvData();
        } catch (error) {
          alert(data.msg);
        }
        console.log("Can be deleted");
      } else {
        alert("Please select single row");
      }
    }
  
    async handleSort() {
      if (this.isSortValid) {
        console.log("Can be sorted");
        let topCell = this.selectedCells[0];
        let columnName = this.data[1][topCell.gridColumn].text;
  
        this.sortInput = columnName;
        console.log("Sorting by " + columnName);
        this.resetGrid();
        this.fetchCsvData();
      } else {
        alert("Please select single column");
      }
    }
  
    drawCsvData(csvData) {
      console.log("Drawing CSV data: " + this.dataMark, csvData.length);
      this.isFileUploaded = true;
  
      if (csvData.length !== 0) {
        this.csvData = csvData;
        let keys = Object.keys(csvData[0]);
  
        // Adding column names
        if (this.currentPage === 1) {
          for (let j = 1; j <= keys.length; j++) {
            let text = keys[j - 1];
            this.data[this.dataMark + 1][j].text = text;
          }
          this.dataMark++;
        }
        for (let i = 1; i <= csvData.length; i++) {
          for (let j = 1; j <= keys.length; j++) {
            let text = csvData[i - 1][keys[j - 1]];
  
            if (i + this.dataMark >= this.data.length) {
              console.log(i, this.data.length);
              this.appendRows();
              this.drawGrid();
            }
            this.data[i + this.dataMark][j].text = text;
          }
        }
      } else {
        this.isDataPresent = false;
      }
      this.currentPage++;
      this.dataMark += csvData.length;
      this.drawGrid();
    }
  
    getVisibleHeight() {
      let canvasHeight = this.canvas.height;
      let temp = 0;
      for (let i = this.currentRow; i < this.rows; i++) {
        if (temp > canvasHeight) {
          return i;
        }
        temp += this.rowsHeight[i];
      }
      return Infinity;
    }
  
    drawHeaders() {
      for (let i = this.currentColumn + 1; i < this.columns; i++) {
        if (this.headerCodes[i] === undefined) {
          this.calculateHeaderCode(i);
        }
        let text = this.headerCodes[i];
        this.data[0][i].text = text;
        this.data[0][i].xPosition = this.verticalLines[i].startX;
        this.data[0][i].yPosition = this.horizontalLines[0].startY;
        this.data[0][i].gridRow = 0;
        this.data[0][i].gridColumn = i;
        this.data[0][i].drawCell();
      }
    }
  
    calculateHeaderCode(columnNumber) {
      let columnName = [];
      let temp = columnNumber;
      while (columnNumber > 0) {
        let rem = columnNumber % 26;
        if (rem === 0) {
          columnName.push("Z");
          columnNumber = Math.floor(columnNumber / 26) - 1;
        } else {
          columnName.push(String.fromCharCode((rem - 1) + 'A'.charCodeAt(0)));
          columnNumber = Math.floor(columnNumber / 26);
        }
      }
  
      this.headerCodes[temp] = columnName.reverse().join("");
      console.log(this.headerCodes[temp]);
    }
  
    drawIndex() {
      const endRow = Math.min(this.getVisibleHeight(), this.rows);
      for (let i = this.currentRow + 1; i < endRow; i++) {
        this.data[i][0].text = i;
        this.data[i][0].xPosition = this.verticalLines[0].startX;
        this.data[i][0].yPosition = this.horizontalLines[i].startY;
        this.data[i][0].gridRow = i;
        this.data[i][0].gridColumn = 0;
        this.data[i][0].drawCell();
      }
    }
  
    drawCells() {
      const endRow = Math.min(this.getVisibleHeight(), this.rows);
      for (let i = this.currentRow + 1; i < endRow; i++) {
        for (let j = this.currentColumn + 1; j < this.columns; j++) {
          this.data[i][j].xPosition = this.verticalLines[j].startX;
          this.data[i][j].yPosition = this.horizontalLines[i].startY;
          this.data[i][j].gridRow = i;
          this.data[i][j].gridColumn = j;
          this.data[i][j].drawCell();
        }
      }
    }
  
    appendRows() {
      let rowsToAdd = 500;
      this.rows += rowsToAdd;
      while (rowsToAdd > 0) {
        this.data.push(new Array(this.columns).fill().map(() =>
          new GridCell(
            this.context,
            0,
            0,
            0,
            0,
            0,
            0,
            this.columnsWidth,
            this.rowsHeight
          )
        ));
        this.rowsHeight.push(30);
        this.horizontalLines.push(30);
        rowsToAdd--;
      }
    }
  
    appendColumns() {
      let columnsToAdd = 50;
      this.columns += columnsToAdd;
    
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < columnsToAdd; j++) {
          this.data[i].push(
            new GridCell(
              this.context,
              0,
              0,
              0,
              0,
              0,
              0,
              this.columnsWidth,
              this.rowsHeight
            )
          );
        }
        if (i === 0) {
          this.columnsWidth.push(...new Array(columnsToAdd).fill(130));
          this.verticalLines.push(...new Array(columnsToAdd).fill(30));
        }
      }
      console.log(this.data);
    }
  
    drawHorizontalLines() {
      let temp = 0;
      for (let i = this.currentRow; i < this.rowsHeight.length; i++) {
        let line = new GridLine(this.context, this.canvas, 5, temp, this.canvas.width, temp);
        temp += this.rowsHeight[i];
        line.isHorizontal = true;
        this.horizontalLines[i] = line;
        line.draw();
      }
    }
  
    drawVerticalLines() {
      let temp = 0;
      for (let i = this.currentColumn; i < this.columnsWidth.length; i++) {
        let line = new GridLine(
          this.context,
          this.canvas,
          temp,
          0,
          temp,
          this.canvas.height
        );
        temp = temp + this.columnsWidth[i];
        this.verticalLines[i] = line;
        line.draw();
      }
    }
  
    handleMouseDown(event) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
  
      // Checking for a line
      let flag = false;
      for (let i = 1; i < this.verticalLines.length; i++) {
        if (this.verticalLines[i].isCloseToBorder(x, y)) {
          this.canvas.style.cursor = "col-resize";
          flag = true;
          this.resizeColumnIndex = i;
          this.isResizing = true;
          this.startX = x;
          this.initialWidth = this.columnsWidth[this.resizeColumnIndex - 1];
          break;
        }
      }
      if (!flag) {
        for (let i = this.currentRow + 1; i < this.horizontalLines.length; i++) {
          if (this.horizontalLines[i].isCloseToBorder(x, y)) {
            this.canvas.style.cursor = "row-resize";
            this.isResizing = true;
            this.resizeRowIndex = i;
            this.startY = y;
            this.initialHeight = this.rowsHeight[this.resizeRowIndex - 1];
            break;
          }
        }
      }
      if (!this.isResizing) {
        this.clearSelect();
        this.isSelecting = true;
  
        this.startX = x;
        this.startY = y;
        this.endX = x;
        this.endY = y;
        this.selectCell(x, y);
      }
    }
  
    handleMouseMove(event) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
  
      if (this.isResizing) {
        if (this.resizeColumnIndex !== -1) {
          const newWidth = this.initialWidth + (x - this.startX);
          if (newWidth > 30) {
            this.columnsWidth[this.resizeColumnIndex - 1] = newWidth;
            this.drawGrid();
          }
        }
        if (this.resizeRowIndex !== -1) {
          const newHeight = this.initialHeight + (y - this.startY);
          if (newHeight > 30) {
            this.rowsHeight[this.resizeRowIndex - 1] = newHeight;
            this.drawGrid();
          }
        }
      } else if (this.isSelecting) {
        this.clearMetaData();
        this.clearSelect();
        this.endX = x;
        this.endY = y;
  
        this.updateSelect();
      }
    }
  
    handleDoubleClick(event) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
  
      let { rowIndex, colIndex } = this.searchCell(x, y);
      if (rowIndex !== 0 && colIndex !== 0) {
        let cell = this.data[rowIndex][colIndex];
        this.createInputField(event, cell);
      }
    }
  
    createInputField(event, cell) {
        console.log("Creating input field",this.canvas.offsetLeft);
      const input = document.createElement("input");
      input.type = "text";
      input.value = cell.text;
      input.style.position = "absolute";
      input.style.left = `${cell.xPosition + this.canvas.offsetLeft}px`;
      input.style.top = `${cell.yPosition + this.canvas.offsetTop}px`;
      input.style.width = `${this.columnsWidth[cell.gridColumn] }px`;
    //   input.style.left = "${cell.xPosition + this.canvas.offsetLeft}px";
    //   input.style.top = "${cell.yPosition + this.canvas.offsetTop}px";
    //   input.style.width = "${this.columnsWidth[cell.gridColumn] - 2}px";
      input.style.height = `${this.rowsHeight[cell.gridRow] }px`;
      input.style.fontSize = "12px";
      input.style.border = "0";
        input.style.outline = "0";
      input.style.boxSizing = "border-box";
  
      input.addEventListener("blur", () => {
        const formObject = {};
        const self = this; // Store reference to 'this'
  
        if (this.isFileUploaded) {
          let text = input.value;
          let csv_columns = Object.keys(this.csvData[0]).length;
          if (this.data[1][cell.gridColumn].text == "email") {
            for (let i = 1; i < csv_columns; i++) {
              if (cell.gridColumn == i) {
                formObject[this.data[1][i].text] = text;
              } else {
                formObject[this.data[1][i].text] = this.data[cell.gridRow][i].text;
              }
            }
            UpdateEmail(formObject);
          } else {
            for (let i = 2; i < csv_columns; i++) {
              console.log("hello world ");
              if (cell.gridColumn == i) {
                formObject[this.data[1][i].text] = text;
                console.log(this.data[1][i].text, text);
              } else {
                formObject[this.data[1][i].text] = this.data[cell.gridRow][i].text;
                console.log(this.data[1][i].text, this.data[cell.gridRow][i].text);
              }
            }
  
            UpdateData(formObject);
          }
        } else {
          cell.text = input.value;
          document.body.removeChild(input);
          cell.deselectCell();
          self.drawGrid();
        }
  
        async function UpdateData(formObject) {
          try {
            const response = await fetch(
              "http://localhost:5139/api/User/Create",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify(formObject),
              }
            );
            const data = await response.json();
            console.log(data);
  
            if (response.status === 200) {
              cell.text = input.value;
            } else {
              alert(data.msg);
            }
            document.body.removeChild(input);
            cell.deselectCell();
            self.drawGrid();
          } catch (error) {
            console.log("Error while updating data", error);
          }
        }
  
        async function UpdateEmail(formObject) {
          try {
            const response = await fetch(
              "http://localhost:5139/api/User/UpdateEmail",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify(formObject),
              }
            );
            const data = await response.json();
            console.log(data);
  
            if (response.status === 200) {
              cell.text = input.value;
            } else {
              alert(data.msg);
            }
            document.body.removeChild(input);
            cell.deselectCell();
            self.drawGrid();
          } catch (error) {
            console.log("Error while updating data", error);
          }
        }
      });
      document.body.appendChild(input);
      input.focus();
      input.select();
    }
    handleMouseUp(event) {
      this.canvas.style.cursor = "default";
      this.isResizing = false;
      this.resizeColumnIndex = -1;
      this.resizeRowIndex = -1;
      this.startX = 0;
      this.isSelecting = false;
      console.log(this.metaData);
    }
    handleKeyUp(event) {
      const keyUp = event.key;
      if (keyUp == "Control") {
        this.ctrlPressed = false;
      }
      if (keyUp == "Shift") {
        this.isShftPressed = false;
      }
    }
    handleResize(event) {
      const rect = document.getElementById("navbar").getBoundingClientRect();
      this.canvas.width = window.innerWidth - 20;
      this.canvas.height = window.innerHeight - rect.height - 20;
      this.drawGrid();
    }
    handleScroll(event) {
      const deltaY = event.deltaY;
      if (!this.isShftPressed) {
        this.scrollY += deltaY;
        this.scrollY = Math.max(0, this.scrollY);
        let temp = 0;
        for (let i = 0; i < this.rowsHeight.length; i++) {
          temp += this.rowsHeight[i];
          if (this.scrollY < temp) {
            console.log(this.data.length, this.dataMark);
            if (
              this.isFileUploaded &&
              this.isDataThere &&
              this.dataMark - this.currentRow <= 100
            ) {
              console.log(
                "dataLength is " +
                  this.data.length +
                  " dataMark is " +
                  this.dataMark
              );
              this.fetchCsv();
            } else if (this.data.length - this.currentRow <= 30) {
              console.log("append rows");
              this.appendRows();
            }
  
            this.currentRow = i;
            this.drawGrid();
  
            break;
          }
        }
      } else {
        console.log("horizontally scrolling ");
        this.scrollX += deltaY;
        this.scrollX = Math.max(0, this.scrollX);
        let temp = 0;
        for (let i = 0; i < this.columnsWidth.length; i++) {
          temp += this.columnsWidth[i];
          if (this.scrollX < temp) {
            if (this.data[0].length - this.currentColumn <= 10) {
              console.log("append columns");
              this.appendColumns();
            }
  
            this.currentColumn = i;
            console.log("currentcolumn is " + this.currentColumn)
            this.drawGrid();
  
            break;
          }
        }
      }
    }
    async handleKeyPress(event) {
      const keyPressed = event.key;
      if (keyPressed == "Control") {
        this.ctrlPressed = true;
      }
      if (keyPressed == "Shift") {
        this.isShftPressed = true;
      }
      if (this.isSelecting == false && this.selectedCells.length <= 3) {
        let current_cell = this.selectedCells[0];
        let next_cell = null;
        let row_cell;
        let col_cell;
        if (this.ctrlPressed) {
          if (keyPressed == "c") {
            navigator.clipboard.writeText(current_cell.text);
          } else if (keyPressed == "v") {
            const pastedValue = await navigator.clipboard.readText();
            current_cell.text = pastedValue;
            this.drawGrid();
          }
          return;
        }
        if (keyPressed == "ArrowRight") {
          console.log(current_cell.gridColumn + " " + this.columns);
          if (current_cell.gridColumn + 1 < this.columns) {
            console.log("ArrowRight");
            next_cell = this.data[current_cell.gridRow][current_cell.gridColumn + 1];
            row_cell = this.data[current_cell.gridRow][0];
            col_cell = this.data[0][current_cell.gridColumn + 1];
          }
        }
        if (keyPressed == "ArrowLeft") {
          if (current_cell.gridColumn - 1 >= 0) {
            next_cell = this.data[current_cell.gridRow][current_cell.gridColumn - 1];
            row_cell = this.data[current_cell.gridRow][0];
            col_cell = this.data[0][current_cell.gridColumn - 1];
          }
        }
        if (keyPressed == "ArrowUp") {
          if (current_cell.gridRow - 1 >= 0) {
            next_cell = this.data[current_cell.gridRow - 1][current_cell.gridColumn];
            row_cell = this.data[current_cell.gridRow - 1][0];
            col_cell = this.data[0][current_cell.gridColumn];
          }
        }
        if (keyPressed == "ArrowDown") {
          if (current_cell.gridRow + 1 <= this.rows) {
            next_cell = this.data[current_cell.gridRow + 1][current_cell.gridColumn];
            row_cell = this.data[current_cell.gridRow + 1][0];
            col_cell = this.data[0][current_cell.gridColumn];
          }
        }
        if (next_cell != null) {
          this.clearSelect();
          this.selectedCells.push(next_cell);
          this.selectedCells.push(row_cell);
          this.selectedCells.push(col_cell);
          next_cell.selectCell();
          row_cell.selectCell();
          col_cell.selectCell();
          this.drawGrid();
        }
      }
    }
  
    updateMetaData(cell) {
      let text = cell.text;
      if (text !== "") this.metaData.count += 1;
      text = Number(text);
  
      if (text) {
        this.metaData.max = Math.max(this.metaData.max, text);
        this.metaData.min = Math.min(this.metaData.min, text);
        this.metaData.sum += text;
        this.metaData.count_numbers += 1;
        this.metaData.average = (this.metaData.sum / this.metaData.count).toFixed(
          2
        );
      }
    }
    clearMetaData() {
      this.metaData = {
        sum: 0,
        average: 0,
        min: Infinity,
        max: -Infinity,
        count: 0,
        count_numbers: 0,
      };
    }
    // Selection Functions
    updateSelect() {
      const minX = Math.min(this.startX, this.endX);
      const maxX = Math.max(this.startX, this.endX);
      const minY = Math.min(this.startY, this.endY);
      const maxY = Math.max(this.startY, this.endY);
  
      for (let i = this.currentRow; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          let cell = this.data[i][j];
          const cellRight = cell.xPosition + this.columnsWidth[cell.gridColumn];
          const cellBottom = cell.yPosition + this.rowsHeight[cell.gridRow];
  
          if (
            cell.xPosition < maxX &&
            cellRight > minX &&
            cell.yPosition < maxY &&
            cellBottom > minY
          ) {
            if (cell.gridRow == 0) {
              this.updateColumnSelect(cell.gridColumn);
            } else if (cell.gridColumn == 0) {
              this.updateRowSelect(cell.gridRow);
            } else {
              let row_cell = this.data[0][cell.gridColumn];
              let col_cell = this.data[cell.gridRow][0];
  
              cell.selectCell();
              row_cell.selectCell();
              col_cell.selectCell();
  
              this.updateMetaData(cell);
  
              this.selectedCells.push(cell);
              this.selectedCells.push(row_cell);
              this.selectedCells.push(col_cell);
            }
          }
        }
      }
      this.drawGrid();
      this.addMetaDataToFrontend();
    }
  
    addMetaDataToFrontend() {
      let select = document.getElementById("dropdownMenu");
      select.innerHTML = "";
      for (const [key, value] of Object.entries(this.metaData)) {
        let option = document.createElement("option");
        option.text = "${key}:  ${value}";
        select.appendChild(option);
      }
    }
    clearSelect() {
      for (let i = 0; i < this.selectedCells.length; i++) {
        this.selectedCells[i].deselectCell();
      }
      this.selectedCells = [];
      this.isDeleteValid = false;
      this.isSortValid = false;
    }
  
    updateColumnSelect(column) {
      if (this.selectedCells.length == 0) {
        this.isSortValid = true;
      } else {
        this.isSortValid = false;
      }
      for (let i = 1; i < this.rows; i++) {
        this.data[i][column].selectCell();
        this.updateMetaData(this.data[i][column]);
        this.addMetaDataToFrontend();
        this.selectedCells.push(this.data[i][column]);
      }
    }
    updateRowSelect(rowIndex) {
      console.log(this.selectedCells.length + " is");
      if (this.selectedCells.length == 0) {
        this.isDeleteValid = true;
      } else {
        this.isDeleteValid = false;
      }
      for (let i = 0; i < this.columns; i++) {
        this.data[rowIndex][i].selectCell();
        if (i != 0) {
          this.updateMetaData(this.data[rowIndex][i]);
          this.addMetaDataToFrontend();
        }
        this.selectedCells.push(this.data[rowIndex][i]);
      }
    }
    selectCell(x, y) {
      this.clearMetaData();
      let { rowIndex, colIndex } = this.searchCell(x, y);
      if (rowIndex == 0 && colIndex == 0) return;
      console.log(colIndex, rowIndex);
      if (rowIndex == 0) {
        this.updateColumnSelect(colIndex);
      } else if (colIndex == 0) {
        this.updateRowSelect(rowIndex);
      } else if (
        rowIndex >= this.currentRow + 1 &&
        rowIndex < this.rows &&
        colIndex >= 1 &&
        colIndex < this.columns
      ) {
        let cell = this.data[rowIndex][colIndex];
        let row_cell = this.data[rowIndex][0];
        let col_cell = this.data[0][colIndex];
        this.updateMetaData(cell);
        this.addMetaDataToFrontend();
        cell.selectCell();
        row_cell.selectCell();
        col_cell.selectCell();
  
        this.selectedCells.push(cell);
        this.selectedCells.push(row_cell);
        this.selectedCells.push(col_cell);
      }
      this.drawGrid();
    }
  
    // Helper function
    searchCell(x, y) {
      let colIndex = 0;
      let rowIndex = 0;
  
      // Find the column index based on x coordinate
      for (let j = 0; j < this.columns; j++) {
        let colStartX = this.data[0][j].xPosition;
        let colEndX = colStartX + this.columnsWidth[j];
        if (x >= colStartX && x < colEndX) {
          colIndex = j;
          break;
        }
      }
      const endRow = Math.min(this.getVisibleHeight(), this.rows);
      // Find the row index based on y coordinate
      for (let i = this.currentRow; i < endRow; i++) {
        let rowStartY = this.data[i][0].yPosition;
        let rowEndY = rowStartY + this.rowsHeight[i];
        if (y >= rowStartY && y < rowEndY) {
          rowIndex = i;
          break;
        }
      }
  
      return { rowIndex, colIndex };
    }
  
    getData() {
      return this.data;
    }
  
    getColumnsWidth() {
      return this.columnsWidth;
    }
  }
  
  export default SpreadsheetGrid;

