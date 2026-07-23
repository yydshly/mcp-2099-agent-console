uniform float uTime;
uniform float uIntensity;
uniform float uFeral;
uniform float uBoot;
uniform float uThemeShift;
uniform vec2 uPointer;

varying float vDisplacement;
varying vec3 vNormal;
varying vec3 vWorldPosition;

// 3D simplex noise is cheaper and smoother than grid-aligned value noise.
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float simplex3d(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float neuralField(vec3 p) {
  float time = uTime * 0.09;
  float lowFrequency = simplex3d(p * 0.92 + vec3(time, -time * 0.7, time * 0.45));
  float detail = simplex3d(p * 4.1 - vec3(time * 2.1, time * 1.3, -time));
  float microSpikes = simplex3d(p * 10.2 + vec3(time * 3.2));
  float breathing = sin(uTime * 1.04 + p.y * 2.5 + lowFrequency * 1.5) * 0.042;
  return lowFrequency * 0.16 + detail * 0.085 + max(microSpikes, 0.0) * 0.11 + breathing;
}

float sculptedField(vec3 p) {
  float base = neuralField(p);
  float sharpSpikes = max(simplex3d(p * 17.0 - vec3(uTime * 0.45, uTime * 0.22, 0.0)), 0.0);
  return base * 1.35 + pow(sharpSpikes, 2.2) * 0.28;
}

float feralField(vec3 p) {
  float denseNeedles = max(simplex3d(p * 28.0 + vec3(uTime * 0.6, -uTime * 0.38, uTime * 0.22)), 0.0);
  return sculptedField(p) + pow(denseNeedles, 3.7) * 0.44;
}

void main() {
  float baselineField = neuralField(position);
  float field = mix(baselineField, sculptedField(position), min(uIntensity, 1.0));
  field = mix(field, feralField(position), uFeral);
  float pointerInfluence = dot(normalize(position), normalize(vec3(uPointer * 0.42, 1.0))) * 0.035;
  float bootPulse = sin(uTime * 13.0 + length(position) * 16.0) * uBoot * 0.07;
  float themePulse = sin(uTime * 7.0 + position.y * 6.0 + position.x * 3.0) * uThemeShift * 0.024;
  float displacement = field + pointerInfluence * mix(1.0, 1.65, min(uIntensity, 1.0)) + bootPulse + themePulse;
  vec3 tangentAxis = abs(normal.y) > 0.92 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 tangent = normalize(cross(normal, tangentAxis));
  vec3 bitangent = normalize(cross(normal, tangent));
  float sampleDistance = 0.025;
  vec3 tangentPosition = position + tangent * sampleDistance;
  vec3 bitangentPosition = position + bitangent * sampleDistance;
  float tangentField = mix(neuralField(tangentPosition), sculptedField(tangentPosition), min(uIntensity, 1.0));
  float bitangentField = mix(neuralField(bitangentPosition), sculptedField(bitangentPosition), min(uIntensity, 1.0));
  tangentField = mix(tangentField, feralField(tangentPosition), uFeral);
  bitangentField = mix(bitangentField, feralField(bitangentPosition), uFeral);
  vec3 displacedNormal = normalize(normal - tangent * (tangentField - field) / sampleDistance - bitangent * (bitangentField - field) / sampleDistance);
  vec3 displaced = position + normal * displacement;
  vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
  vDisplacement = displacement;
  vNormal = normalize(normalMatrix * displacedNormal);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
