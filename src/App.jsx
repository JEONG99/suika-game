import { useEffect, useRef } from "react";
import { Bodies, Engine, Render, Runner, World, Body, Events } from "matter-js";
import { FRUITS_BASE } from "./fruits.js";
import Swal from "sweetalert2";

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const engine = Engine.create();
    const render = Render.create({
      engine,
      canvas: canvasRef.current,
      options: {
        wireframes: false,
        width: 620,
        height: 850,
        background: "#F7F4C8",
      },
    });

    const world = engine.world;

    const leftWall = Bodies.rectangle(15, 395, 30, 790, {
      isStatic: true,
      render: { fillStyle: "#E6B143" },
    });
    const rightWall = Bodies.rectangle(605, 395, 30, 790, {
      isStatic: true,
      render: { fillStyle: "#E6B143" },
    });
    const ground = Bodies.rectangle(310, 820, 620, 60, {
      isStatic: true,
      render: { fillStyle: "#E6B143" },
    });
    const topLine = Bodies.rectangle(310, 150, 620, 2, {
      name: "topLine",
      isStatic: true,
      isSensor: true,
      render: { fillStyle: "#E6B143" },
    });

    World.add(world, [leftWall, rightWall, ground, topLine]);

    Render.run(render);
    Runner.run(engine);

    let currentFruitBody = null;
    let currentFruit = null;
    let disableAction = false;
    let interval = null;
    let waterMelonCount = 0;

    const addFruit = () => {
      const index = Math.floor(Math.random() * 5);
      const fruit = FRUITS_BASE[index];

      const fruitBody = Bodies.circle(300, 50, fruit.radius, {
        index,
        isSleeping: true,
        render: {
          sprite: { texture: `/${fruit.name}.png` },
        },
        restitution: 0.2,
      });

      currentFruitBody = fruitBody;
      currentFruit = fruit;

      World.add(world, fruitBody);
    };

    window.onkeydown = (event) => {
      if (disableAction) return;
      switch (event.code) {
        case "KeyA":
          if (interval) return;
          interval = setInterval(() => {
            if (currentFruitBody.position.x - currentFruit.radius > 30) {
              Body.setPosition(currentFruitBody, {
                x: currentFruitBody.position.x - 1,
                y: currentFruitBody.position.y,
              });
            }
          }, 5);
          break;
        case "KeyD":
          if (interval) return;
          interval = setInterval(() => {
            if (currentFruitBody.position.x + currentFruit.radius < 590) {
              Body.setPosition(currentFruitBody, {
                x: currentFruitBody.position.x + 1,
                y: currentFruitBody.position.y,
              });
            }
          }, 5);
          break;
        case "KeyS":
          currentFruitBody.isSleeping = false;
          disableAction = true;

          setTimeout(() => {
            addFruit();
            disableAction = false;
          }, 1000);
      }
    };

    window.onkeyup = (event) => {
      switch (event.code) {
        case "KeyA":
        case "KeyD":
          clearInterval(interval);
          interval = null;
      }
    };

    Events.on(engine, "collisionStart", (event) => {
      event.pairs.forEach((collision) => {
        if (collision.bodyA.index === collision.bodyB.index) {
          const index = collision.bodyA.index;
          World.remove(world, [collision.bodyA, collision.bodyB]);
          const newFruit = FRUITS_BASE[index + 1];
          const newFruitBody = Bodies.circle(
            collision.collision.supports[0].x,
            collision.collision.supports[0].y,
            newFruit.radius,
            {
              index: index + 1,
              render: {
                sprite: { texture: `/${newFruit.name}.png` },
              },
            }
          );
          World.add(world, newFruitBody);
          if (index === FRUITS_BASE.length - 2) {
            if (waterMelonCount === 1) {
              Swal.fire({
                icon: "success",
                text: "You Win! You got two watermelons!",
                showCancelButton: false,
                confirmButtonText: "Continue",
              }).then((res) => {
                if (res.isConfirmed) {
                  window.location.reload();
                }
              });
              return;
            }
            waterMelonCount++;
          }
        }
        if (
          !disableAction &&
          (collision.bodyA.name === "topLine" ||
            collision.bodyB.name === "topLine")
        ) {
          Swal.fire({
            icon: "warning",
            text: "Game Over!",
            showCancelButton: false,
            confirmButtonText: "Continue",
          }).then((res) => {
            if (res.isConfirmed) {
              window.location.reload();
            }
          });
        }
      });
    });

    addFruit();
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default App;
