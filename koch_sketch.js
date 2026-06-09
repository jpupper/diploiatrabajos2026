// p5.js sketch for the Interactive Koch Snowflake

let levelStat, angleStat;

function setup() {
  const canvasContainer = document.getElementById("canvas-container");
  const w = canvasContainer.clientWidth;
  const h = canvasContainer.clientHeight;
  const canvas = createCanvas(w, h);
  canvas.parent("canvas-container");
  
  levelStat = document.getElementById("stat-level");
  angleStat = document.getElementById("stat-angle");

  // Visual options
  strokeWeight(1.2);
  noFill();
}

function draw() {
  background(6, 2, 4); // Matching styles.css bg-primary

  // 1. Calculate interaction metrics based on mouse coordinates
  // Horizontal position controls recursion level (0 to 5)
  // Clamp levels to prevent crash
  let maxLevel = 5;
  let level = floor(map(mouseX, 0, width, 0, maxLevel + 0.99, true));
  
  // Vertical position controls morphing angle (0 to 80 degrees)
  let maxAngleDeg = 80;
  let angleDeg = map(mouseY, 0, height, 0, maxAngleDeg, true);
  let angleRad = radians(angleDeg);

  // Update HTML statistics in overlay
  if (levelStat) levelStat.textContent = level;
  if (angleStat) angleStat.textContent = angleDeg.toFixed(1) + "°";

  // 2. Set up drawing options (neon glow)
  drawingContext.shadowBlur = 10;
  // Blend from red to purple based on mouse Y position
  let glowColor = lerpColor(color('#ff0844'), color('#8d44fc'), mouseY / height);
  drawingContext.shadowColor = glowColor.toString();
  stroke(glowColor);

  // 3. Define standard snowflake dimensions
  let r = min(width, height) * 0.32;
  let cx = width / 2;
  let cy = height / 2 + r * 0.15; // slightly lower center to visual balance

  // 4. Define initial 3 vertices of the equilateral triangle
  let v1 = createVector(cx + r * cos(-HALF_PI), cy + r * sin(-HALF_PI));
  let v2 = createVector(cx + r * cos(-HALF_PI + TWO_PI/3), cy + r * sin(-HALF_PI + TWO_PI/3));
  let v3 = createVector(cx + r * cos(-HALF_PI + 4*PI/3), cy + r * sin(-HALF_PI + 4*PI/3));

  // 5. Draw the 3 Koch curves forming the full snowflake
  drawKochCurve(v1, v2, level, angleRad);
  drawKochCurve(v2, v3, level, angleRad);
  drawKochCurve(v3, v1, level, angleRad);
}

// Recursive function to draw a Koch Curve segment
function drawKochCurve(p1, p2, depth, angle) {
  if (depth === 0) {
    line(p1.x, p1.y, p2.x, p2.y);
    return;
  }

  // Calculate segment divisions
  // p1 ---------- b ---- c ---- d ---------- p2
  let b = p5.Vector.lerp(p1, p2, 1/3);
  let d = p5.Vector.lerp(p1, p2, 2/3);

  // Compute 'c' (the peak of the triangular fold)
  // Midpoint of bd
  let mid = p5.Vector.lerp(b, d, 0.5);
  // Perpendicular vector pointing outward
  let perp = p5.Vector.sub(d, b);
  perp.rotate(-HALF_PI);
  perp.normalize();
  
  // Height of the triangle: baseHalf * tan(angle)
  let baseHalf = p5.Vector.dist(b, mid);
  let h = baseHalf * tan(angle);
  
  let c = p5.Vector.add(mid, p5.Vector.mult(perp, h));

  // Recurse on the 4 smaller segments
  drawKochCurve(p1, b, depth - 1, angle);
  drawKochCurve(b, c, depth - 1, angle);
  drawKochCurve(c, d, depth - 1, angle);
  drawKochCurve(d, p2, depth - 1, angle);
}

// Window resizing handler
function windowResized() {
  const canvasContainer = document.getElementById("canvas-container");
  if (canvasContainer) {
    resizeCanvas(canvasContainer.clientWidth, canvasContainer.clientHeight);
  }
}
