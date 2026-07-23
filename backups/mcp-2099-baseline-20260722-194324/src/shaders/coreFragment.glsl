uniform float uTime;
uniform vec3 uCameraPosition;

varying float vDisplacement;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vec3 viewDirection = normalize(uCameraPosition - vWorldPosition);
  float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDirection), 0.0), 2.4);
  float energy = smoothstep(-0.11, 0.22, vDisplacement);
  float pulse = 0.5 + 0.5 * sin(uTime * 2.0 + vWorldPosition.y * 7.0 + vWorldPosition.x * 3.0);
  float glint = smoothstep(0.91, 0.995, pulse) * smoothstep(0.07, 0.2, vDisplacement);
  vec3 shadow = vec3(0.055, 0.006, 0.0);
  vec3 ember = vec3(0.48, 0.045, 0.0);
  vec3 signal = vec3(1.0, 0.27, 0.0);
  vec3 color = mix(shadow, ember, energy);
  color = mix(color, signal, smoothstep(0.18, 0.3, vDisplacement));
  color += vec3(1.0, 0.36, 0.02) * fresnel * 0.52;
  color += vec3(1.0, 0.56, 0.12) * glint * 0.42;
  gl_FragColor = vec4(color, 1.0);
}
