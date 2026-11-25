import { useGame } from '../../store/useGame'
import { Ground, Roads, Flowers, EdgeForest, Clouds, Butterflies, Birds, Pollen } from './Environment'
import { Trees, House, Lamp, Sign, Bush, Mat } from './Props'
import { Bedroom, Cafe } from './Buildings'
import Park from './Park'
import Shops from './Shops'
import SecretHouse from './SecretHouse'
import Collectibles, { InteractMarker } from './Collectibles'
import NPC, { NPC_LOOKS } from './NPC'
import { TREES, HOUSES, LAMPS } from '../../game/layout'

function Signpost({ position }) {
  const boards = [
    { text: '↑ Friendship Park', rot: 0.0, y: 2.0, border: '#7cc9a6' },
    { text: '→ Café & Shops', rot: 0.25, y: 1.5, border: '#f07aa8' },
    { text: '↖ ??? House', rot: -0.3, y: 1.0, border: '#8f74d6' },
  ]
  return (
    <group position={position}>
      <mesh castShadow position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 2.6, 8]} />
        <Mat color="#b88a6a" />
      </mesh>
      {boards.map((b, i) => (
        <group key={i} rotation={[0, b.rot, 0]}>
          <Sign position={[0, b.y - 0.25, 0.1]} text={b.text} post={0} width={1.9} height={0.42} border={b.border} />
        </group>
      ))}
    </group>
  )
}

export default function Town() {
  const quality = useGame((s) => s.quality)
  const low = quality === 'low'
  return (
    <group>
      <Ground />
      <Roads />
      <Flowers count={low ? 160 : 420} />
      <EdgeForest />
      <Trees list={TREES} />
      {HOUSES.map(([x, z, w, d, wall, roof, rot], i) => (
        <House key={i} x={x} z={z} w={w} d={d} wall={wall} roof={roof} rot={rot} label={i === 1 ? 'Town Hall' : null} />
      ))}
      {LAMPS.map(([x, z], i) => <Lamp key={i} position={[x, 0, z]} />)}
      <Bedroom />
      <Cafe />
      <Park />
      <Shops />
      <SecretHouse />
      <NPC id="mayor" position={[-4, 0, 15.6]} rotation={Math.PI} {...NPC_LOOKS.mayor} bubbleY={2.6} />
      <Signpost position={[-16.6, 0, 15.6]} />
      {[[-12, 16.5], [12, 16.6], [-30, 16.5], [16, -1], [-16.5, -30]].map(([x, z], i) => <Bush key={i} position={[x, 0, z]} />)}
      <Collectibles />
      <InteractMarker />
      <Clouds count={low ? 5 : 10} />
      <Butterflies count={low ? 6 : 14} spread={26} />
      <Birds count={low ? 3 : 6} />
      <Pollen quality={quality} />
    </group>
  )
}
