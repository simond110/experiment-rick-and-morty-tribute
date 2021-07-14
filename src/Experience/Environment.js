import gsap from 'gsap'
import * as THREE from 'three'
import EnvironmentMaterial from './Materials/EnvironmentMaterial.js'

export default class Environment
{
    constructor()
    {
        this.experience = window.experience
        this.debug = this.experience.debug
        this.time = this.experience.time
        this.resources = this.experience.resources
        this.scene = this.experience.scene

        // Debug
        this.debugFolder = this.debug.addFolder({
            title: 'environment',
            expanded: true,
        })

        // Model
        this.model = this.resources.items.environmentModel.scene

        // Uniforms
        this.uniforms = {}
        this.uniforms.uTime = { value: 0 }
        this.uniforms.uRevealProgress = { value: 0 }

        const plasmaColor1 = new THREE.Color('#f8fbf3')
        plasmaColor1.convertSRGBToLinear()
        this.uniforms.uPlasmaColor1 = { value: plasmaColor1 }

        const plasmaColor2 = new THREE.Color('#a7cb54')
        plasmaColor2.convertSRGBToLinear()
        this.uniforms.uPlasmaColor2 = { value: plasmaColor2 }

        this.debugFolder
            .addInput(
                this.uniforms.uRevealProgress,
                'value',
                {
                    min: 0,
                    max: 1
                }
            )

        // Materials
        this.materials = {}
        
        // Traverse
        this.model.traverse((_child) =>
        {
            if(_child instanceof THREE.Mesh)
            {
                // Save material
                if(typeof this.materials[_child.material.uuid] === 'undefined')
                {
                    this.materials[_child.material.uuid] = {
                        baseMaterial: _child.material
                    }
                }
                
                // Add shadow
                _child.castShadow = true
                _child.receiveShadow = true
            }
        })

        // Create new materials from base material
        for(const _materialKey in this.materials)
        {
            const material = this.materials[_materialKey]
            const newMaterial = new EnvironmentMaterial({
                map: material.baseMaterial.map,
                alphaMap: material.baseMaterial.alphaMap,
                aoMap: material.baseMaterial.aoMap,
                displacementMap: material.baseMaterial.displacementMap,
                normalMap: material.baseMaterial.normalMap,
                metalnessMap: material.baseMaterial.metalnessMap,
                roughnessMap: material.baseMaterial.roughnessMap,
                envMap: material.baseMaterial.envMap,
                roughness: material.baseMaterial.roughness,
                metalness: material.baseMaterial.metalness,
            })

            newMaterial.uniforms.uTime = this.uniforms.uTime
            newMaterial.uniforms.uRevealProgress = this.uniforms.uRevealProgress
            newMaterial.uniforms.uPlasmaColor1 = this.uniforms.uPlasmaColor1
            newMaterial.uniforms.uPlasmaColor2 = this.uniforms.uPlasmaColor2

            material.newMaterial = newMaterial
        }

        // Traverse again
        this.model.traverse((_child) =>
        {
            if(_child instanceof THREE.Mesh)
            {
                _child.material = this.materials[_child.material.uuid].newMaterial
            }
        })

        this.scene.add(this.model)

        window.requestAnimationFrame(() =>
        {
            gsap.fromTo(this.uniforms.uRevealProgress, { value: 0.13 }, { duration: 10, ease: 'power2.inOut', value: 1 })
        })
    }

    update()
    {
        this.uniforms.uTime.value = this.time.elapsed
    }
}