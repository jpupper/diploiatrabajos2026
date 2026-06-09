// p5.js Sketch for the Interactive Apollonian Gasket

// Complex Number Helper Class for Descartes' Theorem centers computation
class Complex {
  constructor(re, im) {
    this.re = re;
    this.im = im;
  }

  add(other) {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  sub(other) {
    return new Complex(this.re - other.re, this.im - other.im);
  }

  mult(other) {
    if (typeof other === 'number') {
      return new Complex(this.re * other, this.im * other);
    }
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    );
  }

  div(other) {
    if (typeof other === 'number') {
      return new Complex(this.re / other, this.im / other);
    }
    let denom = other.re * other.re + other.im * other.im;
    if (denom === 0) return new Complex(0, 0);
    return new Complex(
      (this.re * other.re + this.im * other.im) / denom,
      (this.im * other.re - this.re * other.im) / denom
    );
  }

  sqrt() {
    let r = Math.sqrt(this.re * this.re + this.im * this.im);
    let angle = Math.atan2(this.im, this.re);
    return new Complex(
      Math.sqrt(r) * Math.cos(angle / 2),
      Math.sqrt(r) * Math.sin(angle / 2)
    );
  }
}

// Circle class representing Descartes' curvatures, centers, and radii
class Circle {
  constructor(x, y, k) {
    this.x = x;
    this.y = y;
    this.z = new Complex(x, y);
    this.k = k; // Curvature
    this.r = Math.abs(1 / k); // Radius
  }

  draw(accentRed, accentPurple) {
    // Determine color based on size (smaller = more purple, larger = more red)
    let t = map(this.r, 2, 200, 1, 0, true);
    let circleColor = lerpColor(accentRed, accentPurple, t);
    
    // Add neon glow
    drawingContext.shadowBlur = this.r > 20 ? 10 : 3;
    drawingContext.shadowColor = circleColor.toString();
    stroke(circleColor);
    circle(this.x, this.y, this.r * 2);
  }
}

let countStat;
let c0Radius = 240;

function setup() {
  const canvasContainer = document.getElementById("canvas-container");
  const w = canvasContainer.clientWidth;
  const h = canvasContainer.clientHeight;
  const canvas = createCanvas(w, h);
  canvas.parent("canvas-container");
  
  countStat = document.getElementById("stat-count");
  
  noFill();
  strokeWeight(1);
}

function draw() {
  background(6, 2, 4); // Matching styles.css bg-primary

  // Translate to center of screen
  translate(width / 2, height / 2);

  // Setup Theme Colors
  let accentRed = color('#ff0844');
  let accentPurple = color('#8d44fc');

  // Adjust radius of bounding circle based on screen size
  c0Radius = min(width, height) * 0.44;

  // 1. Set up the dynamic initial 3 circles
  // Bounding Outer Circle c0 (negative curvature since inner circles are tangent inside)
  let c0 = new Circle(0, 0, -1 / c0Radius);
  
  // First inner circle, radius mapped to mouseX
  let r1Min = c0Radius * 0.15;
  let r1Max = c0Radius * 0.85;
  let r1 = map(mouseX, 0, width, r1Min, r1Max, true);
  let c1 = new Circle(-c0Radius + r1, 0, 1 / r1);
  
  // Second inner circle fills the remaining width of the diameter
  let r2 = c0Radius - r1;
  let c2 = new Circle(r1, 0, 1 / r2);

  let circles = [c0, c1, c2];

  // 2. Compute c3 and c4 (tangent to c0, c1, c2)
  let initialCandidates = descartes(c0, c1, c2);
  for (let cand of initialCandidates) {
    if (cand.k > 0 && cand.r > 2 && isTangentToAll(cand, [c0, c1, c2])) {
      circles.push(cand);
    }
  }

  // 3. Build Gasket queue with all mutually tangent triplets
  // We need to find triplets from the initial 5 circles [c0, c1, c2, c3, c4...]
  let queue = [];
  
  // Generate combinations of 3 circles from our initial list
  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      for (let k = j + 1; k < circles.length; k++) {
        let ca = circles[i];
        let cb = circles[j];
        let cc = circles[k];
        if (isTripletTangent(ca, cb, cc)) {
          queue.push([ca, cb, cc]);
        }
      }
    }
  }

  // 4. Run BFS solver up to a safe circle cap
  let maxCircles = 160;
  let index = 0;
  
  while (queue.length > 0 && circles.length < maxCircles && index < 600) {
    let [ca, cb, cc] = queue.shift();
    index++;

    let candidates = descartes(ca, cb, cc);
    for (let cand of candidates) {
      // Must be positive curvature, valid size, tangent, and not already existing
      if (cand.k > 0.001 && cand.r > 1.5 && isTangentToAll(cand, [ca, cb, cc])) {
        if (!circleExists(cand, circles)) {
          circles.push(cand);
          // Queue new triplets
          queue.push([ca, cb, cand]);
          queue.push([cb, cc, cand]);
          queue.push([cc, ca, cand]);
        }
      }
    }
  }

  // Update HTML statistics overlay
  if (countStat) countStat.textContent = circles.length;

  // 5. Draw all circles (skipping c0 negative shadow glow check inside class draw)
  for (let i = 0; i < circles.length; i++) {
    circles[i].draw(accentRed, accentPurple);
  }
}

// Check if a triplet of circles is mutually tangent
function isTripletTangent(c1, c2, c3) {
  return isTangent(c1, c2) && isTangent(c2, c3) && isTangent(c3, c1);
}

// Check if a candidate circle is tangent to a set of circles
function isTangentToAll(cand, list) {
  for (let c of list) {
    if (!isTangent(cand, c)) return false;
  }
  return true;
}

// Descartes circle tangency tolerance check
function isTangent(c1, c2) {
  let d = dist(c1.x, c1.y, c2.x, c2.y);
  let r1 = c1.r;
  let r2 = c2.r;
  
  // If one of the curvatures is negative (outer boundary), we check internal difference
  if (c1.k < 0 || c2.k < 0) {
    let diff = Math.abs(d - Math.abs(r1 - r2));
    return diff < 0.28;
  } else {
    let diff = Math.abs(d - (r1 + r2));
    return diff < 0.28;
  }
}

// Prevent circle duplication check
function circleExists(cand, list) {
  for (let c of list) {
    let dCenter = dist(cand.x, cand.y, c.x, c.y);
    let dRadius = Math.abs(cand.r - c.r);
    if (dCenter < 0.2 && dRadius < 0.2) return true;
  }
  return false;
}

// Solve Descartes' theorem for a triplet of mutually tangent circles
function descartes(c1, c2, c3) {
  let k1 = c1.k;
  let k2 = c2.k;
  let k3 = c3.k;

  let sumK = k1 + k2 + k3;
  // Radicand can occasionally be slightly negative due to floating point error, clamp to 0
  let radicalK = Math.sqrt(Math.max(0, k1 * k2 + k2 * k3 + k3 * k1));
  let k4_a = sumK + 2 * radicalK;
  let k4_b = sumK - 2 * radicalK;

  // Centers represented as complex numbers
  let z1 = c1.z;
  let z2 = c2.z;
  let z3 = c3.z;

  let zk1 = z1.mult(k1);
  let zk2 = z2.mult(k2);
  let zk3 = z3.mult(k3);
  let sumZK = zk1.add(zk2).add(zk3);

  let term1 = z1.mult(z2).mult(k1 * k2);
  let term2 = z2.mult(z3).mult(k2 * k3);
  let term3 = z3.mult(z1).mult(k3 * k1);
  let sumTerms = term1.add(term2).add(term3);
  let radicalZ = sumTerms.sqrt().mult(2);

  let candidates = [];
  let curvatures = [k4_a, k4_b];

  for (let k4 of curvatures) {
    if (Math.abs(k4) < 0.0001) continue;
    
    let z4_1 = sumZK.add(radicalZ).div(k4);
    let z4_2 = sumZK.sub(radicalZ).div(k4);

    candidates.push(new Circle(z4_1.re, z4_1.im, k4));
    candidates.push(new Circle(z4_2.re, z4_2.im, k4));
  }

  return candidates;
}

// Window resizing handler
function windowResized() {
  const canvasContainer = document.getElementById("canvas-container");
  if (canvasContainer) {
    resizeCanvas(canvasContainer.clientWidth, canvasContainer.clientHeight);
  }
}
