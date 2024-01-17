// Create a Pixi Application
const app = new PIXI.Application({ width: 800, height: 600 });

// Create a first rectangle
const rect = new PIXI.Graphics();
rect.beginFill("white"); // Red color
rect.drawRect(-50, -50, 100, 100);
rect.endFill();
rect.x = 200;
rect.y = 200;

app.stage.addChild(rect);

// define mirror line
const p1_arr = [380,0]
const p2_arr = [400,600]

mir = new PIXI.Graphics();
mir.lineStyle(2, "white", 1.0); 

mir.moveTo(p1_arr[0], p1_arr[1]);
mir.lineTo(p2_arr[0], p2_arr[1]);

app.stage.addChild(mir);

// equation for line crossing the two points
const slMirAx_fl = (p2_arr[1] - p1_arr[1]) / (p2_arr[0] - p1_arr[0]);
const yMirAx_fl = p2_arr[1] - p2_arr[0] * slMirAx_fl;

// get center of child
const cent_arr = [rect.x, rect.y];

const centerPoint = new PIXI.Graphics();
centerPoint.beginFill("green");
centerPoint.drawCircle(cent_arr[0], cent_arr[1], 5);
centerPoint.endFill();
app.stage.addChild(centerPoint);

// compute intersection of center and orthogonal point
const yRec_fl =  cent_arr[1] - cent_arr[0] * (-1 / slMirAx_fl);
const intSectX_fl = (yRec_fl - yMirAx_fl) /  (slMirAx_fl + 1/slMirAx_fl)
const intSecY_fl = yMirAx_fl + intSectX_fl * slMirAx_fl

const pivotPoint = new PIXI.Graphics();
pivotPoint.beginFill("red");
pivotPoint.drawCircle(intSectX_fl, intSecY_fl, 5);
pivotPoint.endFill();
app.stage.addChild(pivotPoint);

// Add the renderer view to the DOM
document.body.appendChild(app.view);

// Render the stage
app.renderer.render(app.stage);


setInterval(() => {

  // set intersection as pivot point and rotate by 180 degrees
  const oldPivot_dic = rect.pivot
  rect.pivot = {x: intSectX_fl, y: intSecY_fl}
  rect.rotation = Math.PI;

  // reset pivot
  rect.pivot = oldPivot_dic

  app.renderer.render(app.stage);
}, 5000);


