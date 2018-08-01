var worldWidth, worldHeight, dnaLenth = 100;

// собственно виртуальная машина
function executeCreature(creature, world) {
    var ip = 0;
    creature.upEnergy();
    creature.divide();
    while (ip < creature.code.length) {
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
        ip++;
    }
    creature.ageing();
}

function Creature(x, y, world) {
    var code = [];
    for (var i = 0; i < dnaLenth; i++) {
        code[i] = 90;
    }

    this.x = x;
    this.y = y;
    this.code = code;
    this.energy = 1;
    this.world = world;
    this.cycles = 0;

    // движение
    this.move = function(x, y) {
        if (this.world.getCell(x, y) !== null) {
            return;
        }

        this.world.setCell(this.x, this.y, null);
        this.world.setCell(x, y, this);
        this.x = x;
        this.y = y;
    };

    // кормление
    this.upEnergy = function() {
        // пока только от солнца
        this.energy += 1 / (this.y + 1);
    };

    // размножение
    this.divide = function() {
        if (this.energy < 5) {
            return;
        }

        var cell = this.world.findNearestEmptyCell(this.x, this.y);
        if (cell === undefined) {
            // печаль... перенаселение
            this.world.setCell(this.x, this.y);
        } else {
            var child = new Creature(cell[0], cell[1], this.world);
            child.code = mutate(this.code);
            this.world.setCell(child.x, child.y, child)
        }
        this.energy = 2.5;
    };

    // взросление и смерть
    this.ageing = function() {
        this.cycles += 1;
        if (this.cycles == 100) {
            this.world.setCell(this.x, this.y, null);
        }
    };
}

function mutate(code) {
    var offset = Math.floor(Math.random() * dnaLenth),
        op = Math.floor(Math.random() * 100); // пока пусть будет 100 команд

    var res = [];
    for (var i = 0; i < code.length; i++) {
        res[i] = code[i];
    }

    res[offset] = op;

    return res;
}

function World() {
    var data = [];
    for (var y = 0; y < worldHeight; y++) {
        data[y] = [];
        for (var x = 0; x < worldWidth; x++) {
            data[y][x] = null;
        }
    }

    this.data = data;

    this.getCell = function(x, y) {
        if (this.data[y] === undefined) {
            return undefined;
        }

        if (this.data[y][x] === undefined) {
            return undefined;
        }

        return this.data[y][x];
    };

    this.setCell = function(x, y, val) {
        if (this.data[y] === undefined) {
            return undefined;
        }

        if (this.data[y][x] === undefined) {
            return undefined;
        }

        this.data[y][x] = val
    };

    this.findNearestEmptyCell = function(x, y) {
        if (this.getCell(x, y + 1) === null) {
            return [x, y + 1];
        }

        if (this.getCell(x + 1, y + 1) === null) {
            return [x + 1, y + 1];
        }

        if (this.getCell(x + 1, y) === null) {
            return [x + 1, y];
        }

        if (this.getCell(x + 1, y - 1) === null) {
            return [x + 1, y - 1];
        }

        if (this.getCell(x, y - 1) === null) {
            return [x, y - 1];
        }

        if (this.getCell(x - 1, y - 1) === null) {
            return [x - 1, y - 1];
        }

        if (this.getCell(x - 1, y) === null) {
            return [x - 1, y];
        }

        if (this.getCell(x - 1, y + 1) === null) {
            return [x - 1, y + 1];
        }

        return undefined;
    }
}

function render(world, ctx) {
    var img = ctx.getImageData(0, 0, worldWidth, worldHeight);

    for (var i = 0; i < img.data.length; i += 4) {
        var di = i / 4,
            y = Math.floor(di / worldWidth),
            x = Math.floor(di - y * worldWidth);

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
    for (var y = 0; y < worldHeight; y++) {
        for (var x = 0; x < worldWidth; x++) {
            var c = world.getCell(x, y);
            if (c != null) {
                executeCreature(c, world);
            }
        }
    }
}

function init() {
    var w = new World();
    for (var i = 0; i < 1000; i++) {
        var x = Math.floor(Math.random() * worldWidth),
            y = Math.floor(Math.random() * worldHeight);

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
    worldWidth = canvas.width;
    worldHeight = canvas.height;

    world = init();
    setInterval(render, 1000, world, ctx);
    setInterval(life, 100, world);
};