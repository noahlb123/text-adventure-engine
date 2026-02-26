class CustomGradient {
    constructor(gradient) {
        this.gradient = gradient;
    }

    pickHex(color1, color2, weight) {
        let p = weight;
        let w = p * 2 - 1;
        let w1 = (w/1+1) / 2;
        let w2 = 1 - w1;
        let rgb = [
            Math.round(color1[0] * w1 + color2[0] * w2),
            Math.round(color1[1] * w1 + color2[1] * w2),
            Math.round(color1[2] * w1 + color2[2] * w2)];
        return rgb;
    }

    at(frac) {
        //get nearest colors to frac
        let colorRange = [];
        for(let index=0; index<this.gradient.length; index++) {
            let value = this.gradient[index];
            if(frac<=value[0]) {
                colorRange = [index-1, index];
                break;
            }
        }

        //Get the two closest colors
        let firstcolor = this.gradient[colorRange[0]][1];
        let secondcolor = this.gradient[colorRange[1]][1];

        //Calculate ratio between the two closest colors
        let firstcolor_x = (this.gradient[colorRange[0]][0]/100);
        let secondcolor_x = (this.gradient[colorRange[1]][0]/100)-firstcolor_x;
        let slider_x = (frac/100)-firstcolor_x;
        let ratio = slider_x/secondcolor_x;

        return this.pickHex( secondcolor, firstcolor, ratio );
    }
}

class Background {
    constructor(can) {
        this.can = can;
        this.ctx = can.getContext('2d');
        this.win_width = window.innerWidth;
        this.win_height = window.innerHeight;
        this.star_positions = [];
        for(let i = 0; i < 100; i++) {
            this.star_positions.push([this.win_width * Math.random(), this.win_height * Math.random()]);
        }
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

    componentToHex(c) {
        var hex = Math.floor(c).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    rgbToHex(arr) {
        return "#" + arr.map(this.componentToHex).join("");
    }
    //draw house
    drawHouse(t) {
        let t_day = 10000;
        //sky
        let channels = [Number('0x37'), Number('0x71'), Number('0xed')];
        let sunset_grad = new CustomGradient([
            [0, [0, 0, 0]],
            [0.25, [Number('0x04'), Number('0x14'), Number('0x24')]],
            [0.5, [Number('0xdf'), Number('0x73'), Number('0x9f')]],
            [0.75, [Number('0x37'), Number('0x71'), Number('0xed')]],
            [1, [Number('0x37'), Number('0x71'), Number('0xed')]]
        ]);
        let sky_grad = new CustomGradient([
            [0, [0, 0, 0]],
            [1, [Number('0x37'), Number('0x71'), Number('0xed')]]
        ]);
        let sin_t = Math.sin(t / t_day);
        let sin_n = (-sin_t + 1) / 2;
        //this.ctx.fillStyle = '#000000';//this.rgbToHex(sky_grad.at(sin_n));
        //this.ctx.fillRect(0, 0, this.win_width, this.win_height);
        //sunset
        const horizon = 0.9 * this.win_height;
        let gradient = this.ctx.createLinearGradient(this.win_width/2, horizon, this.win_width/2, this.win_height - horizon);
        gradient.addColorStop(0, this.rgbToHex(sunset_grad.at(sin_n)));
        gradient.addColorStop(0.7, this.rgbToHex(sky_grad.at(sin_n).concat(Math.floor(255 * sin_n))));
        gradient.addColorStop(1, this.rgbToHex(sky_grad.at(sin_n).concat(Math.floor(255 * sin_n))));
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.win_width, this.win_height);
        //stars
        channels = [Number('0xFF'), Number('0xFF'), Number('0xFF')];
        this.ctx.fillStyle = this.rgbToHex([Number('0xFF'), Number('0xFF'), Number('0xFF'), 100 * (10 ** sin_t) / 10]);
        for(let i = 0; i < this.star_positions.length; i++) {
            this.ctx.beginPath();
            this.ctx.ellipse(this.star_positions[i][0], this.star_positions[i][1], 3, 3, 0, 0, 360);
            this.ctx.fill();
        };
        //draw sun
        this.ctx.fillStyle = "#FFFF00";
        //this.ctx.strokeStyle = "#FFFF00";
        this.ctx.beginPath();
        const r = 20;
        const sR = this.win_width / 2 - r;
        const Sx = this.win_width / 2 + horizon * Math.cos(t / t_day);
        const Sy = horizon + horizon * sin_t;
        this.ctx.ellipse(Sx, Sy, r, r, 0, 0, 360);
        this.ctx.fill();
        //hills
        let hillPoints = [
            [0, horizon],
            [this.win_width / 2, horizon - 0.1 * this.win_height],
            [this.win_width, horizon]
        ]
        this.ctx.fillStyle = '#7aa011';
        var path = new Path2D();
        path.moveTo(hillPoints[0][0], hillPoints[0][1]);
        for (let i = 1; i < hillPoints.length; i += 1) {
            path.lineTo(hillPoints[i][0], hillPoints[i][1]);
        }
        this.ctx.fill(path);
        this.ctx.fillRect(0, horizon, this.win_width, this.win_height);
        /*//body
        let hSizeFrac = 0.5;
        let hL = hSizeFrac * Math.min(this.win_width, this.win_height);
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
        this.ctx.fill(path);*/
    }
    //animation
    draw() {
        //resize
        this.win_width = window.innerWidth;
        this.win_height = window.innerHeight;
        this.can.width = this.win_width;
        this.can.height = this.win_height;
        //time
        let t = Date.now();
        this.drawHouse(t);
    }
}