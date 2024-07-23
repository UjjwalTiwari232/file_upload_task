import Cell from "./cell.js";
import Table from "./table.js";
class Header {
    constructor(context, columns, rows, columns_width, canvas) {
        this.context = context;
        this.columns = columns;
        this.columns_width = columns_width;
        this.canvas = canvas;
        this.rows = rows;
    }

    headerHandler(event) {
        console.log("Mouse Scrolled");
        // const { clientX, clientY } = event;
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        var y = window.scrollY;
        // topY = y;
        console.log("ypos =>" + y + " " + rect.top);
        // this.context.clearRect(0,y,this.canvas.width,30)
        this.draw(y);
    }

    handleMouseDown(event) {
        console.log("mouse move down: ");
        const { clientX, clientY } = event;
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (clientY < 30) {
            var temp = 0;
            for (let i = 0; i < this.columns; i++) {
                if (temp > clientX) {
                    temp = i;
                    break;
                }
                temp += this.columns_width[i];
            }

            var columnNumber = Math.floor(temp);
            console.log(Math.floor(columnNumber), clientX, clientY);
            return { columnNumber, clientX, clientX };
        }
        return;
        // let table = new Table(this.context, this.columns, this.rows,this.canvas);
        // table.selectColumn(Math.floor(columnNumber));
    }

    draw(scrollY) {
        let text = "";
        let column_counter = "A";
        let topX = 0;
        let topY = scrollY;
        let width = 130;
        let height = 30;
        console.log("shgbsfgh" + this.columns_width.length);
        this.columns_width[0] = 130;
        // console.log(this.columns)
        for (let i = 0; i < this.columns; i++) {
            this.context.fillStyle = "#EDECEC";
            // console.log(this.columns+" "+i)
            // console.log(this.columns+" "+i+" "+text+" "+column_counter);
            let cell;

            if (i != 0) {
                cell = new Cell(
                    this.context,
                    topX,
                    topY,
                    30,
                    this.columns_width[i],
                    0,
                    i
                );
                text = column_counter;
                column_counter = String.fromCharCode(
                    column_counter.charCodeAt() + 1
                );
            } else {
                cell = new Cell(
                    this.context,
                    topX,
                    topY,
                    30,
                    this.columns_width[i],
                    0,
                    i
                );
            }
            cell.draw();
            this.context.fillStyle = "black";
            cell.AddText(text);

            topX += this.columns_width[i];
        }

        // for (let i = 0; i < this.columns; i++) {
        //   text = column_counter;
        //   column_counter = String.fromCharCode(column_counter.charCodeAt() + 1);
        //   let cell = new Cell(this.context, topX, topY, 30,this.columns_width[i], 0,i);

        //   cell.draw();
        //   cell.AddText(text);
        //   topX += width;
        // }
    }
}

export default Header;
