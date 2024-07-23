import Cell from "./cell.js";
class Indexing {
    constructor(context, row) {
        this.context = context;
        this.row = row;
    }
    draw() {
        let text = "";
        let row_counter = 1;
        let height = 30;
        let width = 130;
        let topX = 0;
        let topY = height;

        for (let i = 0; i < this.row; i++) {
            text = row_counter;
            row_counter += 1;
            let cell = new Cell(this.context, topX, topY, 30, 130, i, 0);
            this.context.fillStyle = "#EDECEC";
            cell.draw();

            this.context.fillStyle = "black";
            cell.AddText(text);
            topY += height;
        }
    }
}
export default Indexing;
