var canvasWidth, canvasHeight;

// собственно виртуальная машина
function executeCreature(creature, world) {
    var ip = 0;
    while (ip < creature.code) {
        var op = creature.code[ip];
        switch (op) {
            // движение по направлениям
            case 1:
                // вверх
                creature.move(creature.x, creature.y + 1);
                break;
            case 2:
                // вверх-вправо
                creature.move(creature.x + 1, creature.y + 1);
                break;
            case 3:
                // вправо
                creature.move(creature.x + 1, creature.y);
                break;
            case 4:
                // вниз-вправо
                creature.move(creature.x + 1, creature.y - 1);
                break;
            case 5:
                // вниз
                creature.move(creature.x, creature.y - 1);
                break;
            case 6:
                // вниз-влево
                creature.move(creature.x - 1, creature.y - 1);
                break;
            case 7:
                // влево
                creature.move(creature.x - 1, creature.y);
                break;
            case 8:
                // вверх-влево
                creature.move(creature.x - 1, creature.y + 1);
                break;
        }
    }
}

function Creature(x, y, world) {
    var code = [];
    for (var i = 0; i < 100; i++) {
        code[i] = 90;
    }

    this.x = x;
    this.y = y;
    this.code = code;
    this.energy = 1;
    this.world = world;

    this.move = function(x, y) {
        if (this.world.getCell(x, y)) {
            return;
        }

        this.world.setCell(this.x, this.y, null);
        this.world.setCell(x, y, this);
        this.x = x;
        this.y = y;
    }
}

function World() {
    var data = [];
    for (var y = 0; y < canvasHeight; y++) {
        data[y] = [];
        for (var x = 0; x < canvasWidth; x++) {
            data[y][x] = null;
        }
    }

    this.data = data;

    this.getCell = function(x, y) {
        return this.data[y][x];
    };

    this.setCell = function(x, y, val) {
        this.data[y][x] = val
    };
}

function render(world, ctx) {
    var img = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

    for (var i = 0; i < img.data.length; i += 4) {
        var di = i / 4,
            y = Math.floor(di / canvasWidth),
            x = Math.floor(di - y * canvasWidth);

        if (world.getCell(x, y)) {
            img.data[i] = 0;
            img.data[i + 1] = 0;
            img.data[i + 2] = 0;
            img.data[i + 3] = 255;
        } else {
            img.data[i + 3] = 0;
        }
    }
    ctx.putImageData(img, 0, 0)
}

function life(world) {

}

function init() {
    var w = new World();
    for (var i = 0; i < 1000; i++) {
        var x = Math.floor(Math.random() * canvasWidth),
            y = Math.floor(Math.random() * canvasHeight);

        if (!w.getCell(x, y)) {
            var c = new Creature(x, y, w);
            w.setCell(x, y, c);
        }
    }
    return w;
}

window.onload = function () {
    var canvas = document.getElementById("life"),
        ctx = canvas.getContext("2d"),
        world;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    world = init();
    setInterval(render, 1000, world, ctx);
    setInterval(life, 100, world);
};