class Background {
    constructor(can) {
        this.can = can;
        this.ctx = can.getContext('2d');
        this.win_width = window.innerWidth;
        this.win_height = window.innerHeight;
        this.fontSize;
    }
    //cross product
    cross(a, b) {
        return  [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
    }
    //dot product
    dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
    //vector multiplcation
    mult(v, c) {
        return [v[0] * c, v[1] * c, v[2] * c];
    }
    //vector addition
    add(a, b) {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    }
    //vector subtraction
    sub(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }
    pointIntersect(La, Lb, P0, P1, P2) {
        let cross012 = this.cross(this.sub(P1, P0), this.sub(P2, P0));
        let Lab = this.sub(Lb, La);
        let t = this.dot(cross012, this.sub(La, P0)) / this.dot(this.mult(Lab, -1), cross012);
        return this.add(La, this.mult(Lab, t));
    }
    //intersection between sun, roof points, and plane at p=y_bottom-house
    shadow(xy, Sx, Sy, p) {
        let [x, y] = xy;
        const Sz = -100/798 * this.win_height;
        Sy -= 1000/798 * this.win_height;
        const z = 0;
        let point = this.pointIntersect([Sx, Sy, Sz], [x, y, z], [0, p, 0], [0, p, 1], [1, p, 0]);
        return [point[0], point[2]];
    }
    //draw house
    drawHouse(t) {
        //sky
        const gradient = this.ctx.createLinearGradient(0, this.win_height * (Math.sin(t / 1000 + Math.PI) + 1) / 2, 0, this.win_height);
        gradient.addColorStop(0, 'blue');
        gradient.addColorStop(0.5, 'red');
        gradient.addColorStop(1, '#e87836');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.win_width, this.win_height);
        //text
        this.ctx.fillStyle = "#4C4CFF";
        this.fontSize = this.win_width / 14.6;
        this.ctx.font = 'bold ' + String(this.fontSize) + "px Arial";
        for (let y = this.fontSize; y < this.win_height + this.fontSize; y += this.fontSize ) {
            this.ctx.fillText("THE ONLY HOME YOULL OWN", 0, y);
        }
        //body
        let hSizeFrac = 0.5;
        let hL = this.hSizeFrac * Math.min(this.win_width, this.win_height);
        let rPeak = hL / (1.5 * Math.sqrt(3));
        const gb = this.ctx.createLinearGradient(0, this.win_height * (Math.sin(t / 1000 + Math.PI) + 1) / 2, 0, this.win_height);
        gb.addColorStop(0, '#DDDDFF');
        gb.addColorStop(0.5, '#FFDDDD');
        gb.addColorStop(1, '#e87836');
        this.ctx.fillStyle = gb;
        this.ctx.fillRect(this.win_width / 2 - hL / 2, rPeak, hL, hL);
        //roof
        let roofPoints = [
            [this.win_width / 2 - hL / 2, rPeak],
            [this.win_width / 2 - hL / 2 - 0.1 * hL, rPeak],
            [this.win_width / 2, 0],
            [this.win_width / 2 + hL / 2 + 0.1 * hL, rPeak],
            [this.win_width / 2 + hL / 2, rPeak]
        ];
        const gr = this.ctx.createLinearGradient(0, this.win_height * (Math.sin(t / 1000 + Math.PI) + 1) / 2, 0, this.win_height);
        gr.addColorStop(0, '#777799');
        gr.addColorStop(0.5, '#997777');
        gr.addColorStop(1, '#e87836');
        this.ctx.fillStyle = gr;
        var path = new Path2D();
        path.moveTo(roofPoints[0][0], roofPoints[0][1]);
        for (let i = 1; i < 5; i += 1) {
            path.lineTo(roofPoints[i][0], roofPoints[i][1]);
        }
        this.ctx.fill(path);
        //draw sun
        this.ctx.fillStyle = "#FFFF00";
        this.ctx.beginPath();
        const sR = 1 * hL;
        const Sx = this.win_width / 2 + sR * Math.cos(t / 1000);
        const Sy = hL / 2 + rPeak + sR * Math.sin(t / 1000);
        this.ctx.ellipse(Sx, Sy, 20, 20, 0, 0, 360);
        this.ctx.fill();
        //shadow
        this.ctx.fillStyle = "#00000050";
        var path = new Path2D();
        path.moveTo(this.win_width / 2 - hL / 2, rPeak + hL);
        for (let i = 0; i < 5; i += 1) {
            let s = this.shadow(roofPoints[i], Sx, Sy, rPeak + hL);
            path.lineTo(s[0], s[1] + rPeak + hL);
        }
        path.lineTo(this.win_width / 2 + hL / 2, rPeak + hL);
        this.ctx.fill(path);
    }
    //animation
    anim() {
        //resize
        this.win_width = window.innerWidth;
        this.win_height = window.innerHeight;
        this.can.width = this.win_width;
        this.can.height = this.win_height;
        //time
        let t = Date.now();
        this.drawHouse(t);
        requestAnimationFrame(this.anim);
    }
}