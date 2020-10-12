document.addEventListener('DOMContentLoaded', () => {
  class Grid {
    constructor() {
      this.color = "white";
      this.limit = 25;
      this.elements = document.getElementsByClassName("gridElement");
    }

    create() {
      const grid = document.getElementById("grid");

      // Fill the grid with elements
      for (let i = 0; i < this.limit * this.limit; i++) {
        const div = document.createElement("div");
        div.setAttribute("class", "gridElement");
        grid.appendChild(div);
      }
    }
  }

  class Player {
    constructor() {
      this.color = "blue";
      this.index = 412;
      this.previousIndex;
    }

    create() {
      grid.elements[this.index].style.backgroundColor = this.color;
    }

    move(e) {
      //console.log("Player index: " + player.index);
      /* Figure out how to remove the delay from keydown without keyup */

      // Erase previous iteration and make obstacle not change color if crossed
      if (!obstacle.coordinates.includes(player.previousIndex)) {
        grid.elements[player.index].style.backgroundColor = grid.color;
      } else grid.elements[player.index].style.backgroundColor = obstacle.color;

      // Increment the grid element by key code
      switch(e.keyCode) {
        case 37:
          if (player.index % grid.limit === 0) {
            player.index += grid.limit - 1;
          } else player.index -= 1;
          break;
        case 38:
          if (player.index <= grid.limit - 1 && player.index >= 0) {
            player.index += (grid.limit * grid.limit) - grid.limit;
          } else player.index -= grid.limit;
          break;
        case 39:
          if (player.index % grid.limit >= grid.limit - 1) {
            player.index -= grid.limit - 1;
          } else player.index += 1;
          break;
        case 40:
          if (player.index >= (grid.limit * grid.limit) - grid.limit) {
            player.index -= (grid.limit * grid.limit) - grid.limit;
          } else  player.index += grid.limit;
          break;
      }

      // Prevent the player from crossing the obstacle
      if (obstacle.coordinates.includes(player.index)) {
        player.index = player.previousIndex;
      }

      // Draw the new grid element
      grid.elements[player.index].style.backgroundColor = player.color;
      player.previousIndex = player.index;

      clearInterval(opponent.id);
      opponent.clearRoute();
    }
  }

  class Opponent {
    constructor() {
      this.color = "green";
      this.index = null;
      this.graph = {};
      this.pathColor = "orange";
      this.moveOpponent = true;
      this.playerMoved = false;
      this.route = null;
      this.itr = 1;
      this.id = null;
      this.switch = false;

      this.move = this.move.bind(this);
    }

    create() {
      this.index = 187;
      grid.elements[this.index].style.backgroundColor = this.color;
    }

    gridToObject() {
      /* An array of dictionaries. The key is the grid element. The value is a dictionary with four key value pairs. The keys of the nested dictionary are left, right, up, and down. Their values are a boolean designation of whether the grid element relative to the current grid element contains an obstacle.

                _____________________________________________
                0
                25
                50
                75
                100
                125
                150
                175
                200
                225
                250                255 ... 269
                275            279|280 ... 294|295
                300                305 ... 319
                325
                350
                375
                400
                ...
                600
                _____________________________________________ */


      const array = [];
      const l = grid.elements.length;
      const l_ = obstacle.coordinates.length;

      for (let i = 0; i < l; i++) {
        let object = {};

        const left = i - 1;
        const up = i - grid.limit;
        const right = i + 1;
        const down = i + grid.limit;

        object[i] = {};
        if (i % grid.limit != 0) object[i][left] = 1;
        if (i - (grid.limit - 1) > 0) object[i][up] = 1;
        if ((i + 1) % grid.limit != 0) object[i][right] = 1;
        if (i + grid.limit <= l) object[i][down] = 1;

        array.push(object);
      }

      // Transform the array into an object and pass it to find path
      const len = array.length;
      for (let i = 0; i < len; i++) this.graph[i] = array[i][i];
    }

    findPath() {
      // Problem: figure out how to start the opponent from the index that was reached when the player moved

      // Put start and finish in graph
      for (let i in this.graph) {
        if (Number(i) === this.index) this.graph["start"] = this.graph[i];
        this.graph["finish"] = {};
      }

      const costs = Object.assign({finish: Infinity}, this.graph.start);
      const visited = [];
      const parents = {finish: null};
      for (let child in this.graph.start) parents[child] = "start";

      const findLow = function(costs, visited) {
        const known = Object.keys(costs);
        const lowCost = known.reduce((low, node) => {
          if (!low && !visited.includes(node)) low = node;
          if (costs[low] > costs[node] && !visited.includes(node)) low = node;
          return low;
        }, null);
        return lowCost;
      }

      let node = findLow(costs, visited);
      while (node) {
        const costToNode = costs[node], children = this.graph[node];
        for (let child in children) {
          if (!obstacle.coordinates.includes(Number(child))) {
            const fromNodeToChild = children[child];
            const costToChild = costToNode + fromNodeToChild;
            if (!costs[child] || costs[child] > costToChild) {
              if (Number(child) === player.index) costs["finish"] = costToChild;
              costs[child] = costToChild;
              parents[child] = node;
            }
          }
        }
        visited.push(node);
        node = findLow(costs, visited);
      }

      const optimalPath = ["finish"];
      let parent = parents[player.index];
      while (parent) {
        optimalPath.push(parent);
        parent = parents[parent];
      }
      optimalPath.reverse();

      const result = {distance: costs.finish, path: optimalPath};

      this.route = result;
      this.printRoute();
    }

    printRoute() {
      const l = this.route.path.length;
      for (let i = 0; i < l; i++) {
        if (grid.elements[this.route.path[i]]) {
          grid.elements[Number(this.route.path[i])].style.backgroundColor = this.pathColor;
        }
      }

      this.id = setInterval(this.move, 100);
    }

    move() {
      if (this.moveOpponent === false) {
        clearInterval(this.id);
        grid.elements[player.index].style.backgroundColor = opponent.color;
      } else {
        this.route.path.push(player.index.toString());

        // Erase previous iteration
        grid.elements[opponent.index].style.backgroundColor = grid.color;
        opponent.index = this.route.path[this.itr];

        // Draw the new grid element
        if (grid.elements[this.route.path[this.itr]]) {
          grid.elements[this.route.path[this.itr]].style.backgroundColor = opponent.color;
          this.index = this.route.path[this.itr];
        }

        this.itr++;

        if (this.route.path[this.itr] === player.index.toString()) {
          this.moveOpponent = false;
        }
      }
    }

    clearRoute() {
      this.itr = 1;
      const l = this.route.path.length;
      for (let i = 0; i < l; i++) {
        if (grid.elements[this.route.path[i]]) {
          grid.elements[this.route.path[i]].style.backgroundColor = grid.color;
        }
      }

      this.route.path = [];
      grid.elements[this.index].style.backgroundColor = opponent.color;

      this.switch = true;
      opponent.findPath();
    }
  }

  class Obstacle {
    constructor() {
      this.color = "gray";
      this.coordinates = [];
    }

    create() {
      for (let i = 280; i < 295; i++) this.coordinates.push(i);
      const l = this.coordinates.length;
      for (let i = 0; i < l; i++) {
        grid.elements[this.coordinates[i]].style.backgroundColor = this.color;
        grid.elements[this.coordinates[i]].setAttribute("obstacle", true);
      }
    }
  }

  const grid = new Grid;
  const player = new Player;
  const opponent = new Opponent;
  const obstacle = new Obstacle;

  grid.create();
  player.create();
  opponent.create();
  obstacle.create();

  // Development
  opponent.gridToObject();
  opponent.findPath();

  document.addEventListener('keydown', player.move);
})
