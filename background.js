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
        this.setupStars();
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
    //setup stars
    setupStars() {
        this.star_positions = [];
        for(let i = 0; i < 500; i++) {
            this.star_positions.push([
                this.win_width * Math.random(),
                this.win_height * Math.random(),
                255 * Math.random()
            ])
        }
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
        //sunset
        const horizon = 0.9 * this.win_height;
        let gradient = this.ctx.createLinearGradient(this.win_width/2, horizon, this.win_width/2, this.win_height - horizon);
        let sunset_color = sunset_grad.at(sin_n);
        gradient.addColorStop(0, this.rgbToHex(sunset_color));
        gradient.addColorStop(0.7, this.rgbToHex(sky_grad.at(sin_n).concat(Math.floor(255 * sin_n))));
        gradient.addColorStop(1, this.rgbToHex(sky_grad.at(sin_n).concat(Math.floor(255 * sin_n))));
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.win_width, this.win_height);
        //stars
        for(let i = 0; i < this.star_positions.length; i++) {
            let [x, y, brightness] = this.star_positions[i];
            this.ctx.fillStyle = this.rgbToHex([brightness, brightness, brightness, 100 * (10 ** sin_t) / 10]);
            this.ctx.beginPath();
            this.ctx.ellipse(this.star_positions[i][0], this.star_positions[i][1], 3, 3, 0, 0, 360);
            this.ctx.fill();
        };
        //draw sun
        this.ctx.fillStyle = "#FFFF00";
        this.ctx.beginPath();
        const r = 20;
        const sR = this.win_width / 2 - r;
        let Sx = this.win_width / 2 + horizon * Math.cos(t / t_day);
        let Sy = horizon + horizon * sin_t;
        this.ctx.ellipse(Sx, Sy, r, r, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        //draw moon
        let opacity = 100 * (10 ** sin_t) / 10;
        Sx = this.win_width / 2 + horizon * Math.cos(t / t_day + Math.PI);
        Sy = horizon + horizon * Math.sin(t / t_day + Math.PI);
        this.ctx.fillStyle = '#bababa';
        this.ctx.beginPath();
        this.ctx.ellipse(Sx, Sy, r, r, (t / t_day + Math.PI) % (2 * Math.PI), 0, Math.PI);
        this.ctx.fill();
    }
    //animation
    draw() {
        //resize
        this.win_width = window.innerWidth;
        let tempH = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            window.innerHeight,
            document.documentElement.scrollHeight);
        if (this.win_height != tempH) {
            this.setupStars();
        }
        this.win_height = tempH;
        this.can.width = this.win_width;
        this.can.height = this.win_height;
        //time
        let t = Date.now();
        this.drawHouse(t);
    }
}