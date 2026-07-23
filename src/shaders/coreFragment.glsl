uniform float uTime;
uniform float uIntensity;
uniform float uFeral;
uniform float uBoot;
uniform float uLightTheme;
uniform float uThemeShift;
uniform float uThemeRise;
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
  vec3 keyLight = normalize(vec3(-0.65, 0.8, 1.0));
  vec3 reflected = reflect(-keyLight, normalize(vNormal));
  float specular = pow(max(dot(reflected, viewDirection), 0.0), 22.0);
  float groove = smoothstep(-0.17, 0.035, vDisplacement);
  vec3 shadow = mix(vec3(0.055, 0.006, 0.0), vec3(0.075, 0.012, 0.003), uLightTheme);
  vec3 ember = mix(vec3(0.48, 0.045, 0.0), vec3(0.31, 0.042, 0.006), uLightTheme);
  vec3 signal = mix(vec3(1.0, 0.27, 0.0), vec3(0.76, 0.15, 0.008), uLightTheme);
  vec3 color = mix(shadow, ember, energy);
  color = mix(color, signal, smoothstep(0.18, 0.3, vDisplacement));
  color += mix(vec3(1.0, 0.36, 0.02), vec3(0.76, 0.16, 0.01), uLightTheme) * fresnel * 0.46;
  color += mix(vec3(1.0, 0.56, 0.12), vec3(0.9, 0.3, 0.045), uLightTheme) * glint * 0.32;
  color = mix(color * (0.36 + groove * 0.64), color, 1.0 - uIntensity * 0.18);
  color += mix(vec3(1.0, 0.83, 0.72), vec3(0.62, 0.22, 0.06), uLightTheme) * specular * uIntensity * (0.16 + energy * 0.66);
  color += vec3(1.0, 0.04, 0.0) * fresnel * uFeral * 0.55;
  color += vec3(1.0, 0.74, 0.28) * pow(pulse, 6.0) * uBoot * 0.8;
  color += vec3(0.045, 0.008, 0.0) * uLightTheme * (0.1 + energy * 0.1);
  color += vec3(1.0, 0.46, 0.08) * pow(pulse, 8.0) * uThemeShift * 0.22;
  color += vec3(1.0, 0.68, 0.32) * (fresnel * 0.3 + glint * 0.45) * uThemeRise * 0.5;
  gl_FragColor = vec4(color, 1.0);
}
