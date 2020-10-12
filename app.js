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
      console.log("Player index: " + player.index);

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
    }
  }

  class Opponent {
    constructor() {
      this.color = "green";
      this.index = 187;
    }

    create() {
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
      const graph = {};
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
      for (let i = 0; i < len; i++) graph[i] = array[i][i]; // array[i] gives obstacle
      opponent.findPath(graph);
    }

    updateObject(graph) {
      /* Add obstacle coordinates */
      const l_ = obstacle.coordinates.length;
      for (let i = 0; i < l_; i++) {
        const obstacleElement = obstacle.coordinates[i];
        graph[obstacleElement - 1][obstacleElement] = true;
        graph[obstacleElement - grid.limit][obstacleElement] = true;
        graph[obstacleElement + 1][obstacleElement] = true;
        graph[obstacleElement + grid.limit][obstacleElement] = true;
      }

      return graph;
    }

    findPath(graph) {
      // Put start and finish in graph
      for (let i in graph) {
        if (Number(i) === opponent.index) graph["start"] = graph[i];
        graph["finish"] = {};
      }

      graph = this.updateObject(graph);
      //console.log(graph);

      const costs = Object.assign({finish: Infinity}, graph.start);
      const visited = [];
      const parents = {finish: null};
      for (let child in graph.start) parents[child] = "start";

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
        const costToNode = costs[node], children = graph[node];
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
      console.log(result);
    }

    move() {
      // const objectFromGrid = this.gridToObject();
      // const path = this.findPath(graph);

      // Erase previous iteration
      grid.elements[player.index].style.backgroundColor = grid.color;

      // Draw the new grid element
      grid.elements[player.index].style.backgroundColor = player.color;
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

  document.addEventListener('keydown', player.move);
})
