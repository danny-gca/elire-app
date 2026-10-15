import Svg, { G, Path, Rect } from 'react-native-svg';

// Gomme au trait, même dessin que les icônes d'onglets (grille 512, trait 32) : modifier un vote.
export function EraserIcon({ size = 20, color }: { size?: number; color: string }) {
  const line = { stroke: color, strokeWidth: 32, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <G transform="rotate(-40 272 224)">
        <Rect x={96} y={144} width={352} height={160} rx={24} {...line} />
        <Path d="M240 144v160" {...line} />
      </G>
      <Path d="M176 448h272" {...line} />
    </Svg>
  );
}
