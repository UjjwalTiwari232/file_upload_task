class Cell {
    constructor(context, topX, topY, height, width, X, Y) {
        this.context = context;
        this.topX = topX;
        this.topY = topY;
        this.height = height;
        this.width = width;
        this.X = X;
        this.Y = Y;
        this.text = "";
    }

    draw() {
        if (this.selected) {
            this.context.clearRect(
                this.topX,
                this.topY,
                this.width,
                this.height
            );
            this.context.strokeStyle = "#BBB5B5";
            // this.context.fillStyle = "rgba(0,125,215,0.3)";
            this.context.fillStyle = "white";
            this.context.fillRect(
                this.topX,
                this.topY,
                this.width,
                this.height
            );

            this.context.strokeStyle = "#0A7214";
            this.context.strokeRect(
                this.topX,
                this.topY,
                this.width,
                this.height
            );
            this.context.fillStyle = "black";
            this.context.strokeStyle = "#BBB5B5";
        } else if (this.topX == 0 || this.topY == 0) {
            this.context.clearRect(
                this.topX,
                this.topY,
                this.width,
                this.height
            );
            // this.context.strokeStyle = "black";
            this.context.strokeStyle = "#BBB5B5";
            this.context.strokeRect(
                this.topX,
                this.topY,
                this.width,
                this.height
            );
            // this.context.strokeStyle = "#BBB5B5";
            this.context.fillStyle = this.context.fillStyle;
            this.context.fillRect(
                this.topX,
                this.topY,
                this.width,
                this.height
            );
        } else {
            // this.context.clearRect(
            //     this.topX - 1,
            //     this.topY - 1,
            //     this.width + 2,
            //     this.height + 2
            // );
            // this.context.strokeStyle = "#BBB5B5";
            // this.context.strokeRect(
            //     this.topX,
            //     this.topY,
            //     this.width,
            //     this.height
            // );
            // this.context.fillStyle = "black";
            //   this.context.fillRect(this.topX, this.topY, this.width, this.height);
        }
        this.DrawText();
    }
    containsPoint(x, y) {
        return (
            x >= this.topX &&
            x <= this.topX + this.width &&
            y >= this.topY &&
            y <= this.topY + this.height
        );
    }
    AddText(text) {
        this.text = text;
        this.context.font = "12px Arial";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillText(
            text,
            this.topX + this.width / 2,
            this.topY + this.height / 2
        );
    }
    DrawText() {
        this.context.font = "12px Arial";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillText(
            this.text,
            this.topX + this.width / 2,
            this.topY + this.height / 2
        );
    }

    isPointNearBorder(x, y) {
        const margin = 3;
        return Math.abs(x - (this.topX + this.width)) < margin;
    }

    resize(newWidth) {
        this.width = newWidth;
    }
    select() {
        this.selected = true;
        // this.context.clearRect(this.topX,this.topY,this.width,this.height);

        this.draw();
        this.context.fillStyle = "black";
        this.DrawText();
    }

    deselect() {
        console.log("deselect has been called");
        this.selected = false;
        this.context.clearRect(this.topX, this.topY, this.width, this.height);
        this.draw();
        // this.context.fillStyle = "black";
        // this.DrawText();
    }
}

export default Cell;
