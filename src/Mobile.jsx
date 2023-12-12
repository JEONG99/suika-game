import { useEffect, useLayoutEffect, useRef } from "react";
import { Bodies, Engine, Render, Runner, World, Body, Events } from "matter-js";
import { FRUITS_MOBILE } from "./fruits.js";
import Swal from "sweetalert2";

import cherry from "/mobile/00_cherry.png";
import strawberry from "/mobile/01_strawberry.png";
import grape from "/mobile/02_grape.png";
import gyool from "/mobile/03_gyool.png";
import orange from "/mobile/04_orange.png";
import apple from "/mobile/05_apple.png";
import pear from "/mobile/06_pear.png";
import peach from "/mobile/07_peach.png";
import pineapple from "/mobile/08_pineapple.png";
import melon from "/mobile/09_melon.png";
import watermelon from "/mobile/10_watermelon.png";

const imageMap = {
  "mobile/00_cherry": cherry,
  "mobile/01_strawberry": strawberry,
  "mobile/02_grape": grape,
  "mobile/03_gyool": gyool,
  "mobile/04_orange": orange,
  "mobile/05_apple": apple,
  "mobile/06_pear": pear,
  "mobile/07_peach": peach,
  "mobile/08_pineapple": pineapple,
  "mobile/09_melon": melon,
  "mobile/10_watermelon": watermelon,
};

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

function Mobile() {
  const canvasRef = useRef(null);

  useLayoutEffect(() => {
    for (const key of Object.keys(imageMap)) {
      const image = new Image();
      image.src = imageMap[key];
    }
  }, []);

  useEffect(() => {
    const engine = Engine.create();
    const render = Render.create({
      engine,
      canvas: canvasRef.current,
      options: {
        wireframes: false,
        width: window.innerWidth,
        height: window.innerHeight,
        background: "#F7F4C8",
      },
    });

    const world = engine.world;

    const leftWall = Bodies.rectangle(5, (HEIGHT - 20) / 2, 10, HEIGHT - 20, {
      isStatic: true,
      render: { fillStyle: "#E6B143" },
    });
    const rightWall = Bodies.rectangle(
      WIDTH - 5,
      (HEIGHT - 20) / 2,
      10,
      HEIGHT - 20,
      {
        isStatic: true,
        render: { fillStyle: "#E6B143" },
      }
    );
    const ground = Bodies.rectangle(WIDTH / 2, HEIGHT - 10, WIDTH, 20, {
      isStatic: true,
      render: { fillStyle: "#E6B143" },
    });

    const topLine = Bodies.rectangle(WIDTH / 2, 100, WIDTH, 2, {
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

    const addFruit = () => {
      const index = Math.floor(Math.random() * 5);
      const fruit = FRUITS_MOBILE[index];

      const fruitBody = Bodies.circle(WIDTH / 2, 50, fruit.radius, {
        index,
        isSleeping: true,
        render: {
          sprite: { texture: imageMap[fruit.name] },
        },
        restitution: 0.2,
      });

      currentFruitBody = fruitBody;
      currentFruit = fruit;

      World.add(world, fruitBody);
    };

    const handleMove = (event) => {
      if (disableAction) return;
      const xPos = event.touches[0].clientX;
      if (xPos - currentFruit.radius <= 10) {
        Body.setPosition(currentFruitBody, {
          x: 10 + currentFruit.radius,
          y: currentFruitBody.position.y,
        });
      } else if (xPos + currentFruit.radius >= WIDTH - 10) {
        Body.setPosition(currentFruitBody, {
          x: WIDTH - 10 - currentFruit.radius,
          y: currentFruitBody.position.y,
        });
      } else {
        Body.setPosition(currentFruitBody, {
          x: xPos,
          y: currentFruitBody.position.y,
        });
      }
    };

    window.addEventListener("touchstart", handleMove);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", () => {
      if (disableAction) return;
      currentFruitBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);
    });

    Events.on(engine, "collisionStart", (event) => {
      event.pairs.forEach((collision) => {
        if (collision.bodyA.index === collision.bodyB.index) {
          const index = collision.bodyA.index;
          World.remove(world, [collision.bodyA, collision.bodyB]);
          const newFruit = FRUITS_MOBILE[index + 1];
          const newFruitBody = Bodies.circle(
            collision.collision.supports[0].x,
            collision.collision.supports[0].y,
            newFruit.radius,
            {
              index: index + 1,
              render: {
                sprite: { texture: imageMap[newFruit.name] },
              },
            }
          );
          World.add(world, newFruitBody);
          if (index === FRUITS_MOBILE.length - 2) {
            Swal.fire({
              icon: "success",
              text: "수박 만들기 성공!",
              showCancelButton: false,
              confirmButtonText: "Continue",
              allowOutsideClick: false,
            }).then((res) => {
              if (res.isConfirmed) {
                window.location.reload();
              }
            });
            return;
          }
        }
        if (
          !disableAction &&
          (collision.bodyA.name === "topLine" ||
            collision.bodyB.name === "topLine")
        ) {
          Swal.fire({
            icon: "warning",
            text: "게임 오버!",
            showCancelButton: false,
            confirmButtonText: "Continue",
            allowOutsideClick: false,
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
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default Mobile;
