import { ShaderMaterial, Vector2, Vector3, type IUniform } from 'three'
import coreFragment from '../../shaders/coreFragment.glsl?raw'
import coreVertex from '../../shaders/coreVertex.glsl?raw'

interface CoreUniforms {
  uTime: IUniform<number>
  uPointer: IUniform<Vector2>
  uCameraPosition: IUniform<Vector3>
}

export type CoreShaderMaterial = ShaderMaterial & { uniforms: CoreUniforms }

export function createCoreMaterial(): CoreShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPointer: { value: new Vector2() },
      uCameraPosition: { value: new Vector3() },
    },
    vertexShader: coreVertex,
    fragmentShader: coreFragment,
  }) as CoreShaderMaterial
}
