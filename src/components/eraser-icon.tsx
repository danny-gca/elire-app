import Svg, { G, Path, Rect } from 'react-native-svg';

import { Colors } from '@/constants/theme';

// Gomme au trait, même dessin que les icônes d'onglets (grille 512, trait 32), le petit côté grisé comme une gomme à deux faces : modifier un vote.
export function EraserIcon({ size = 20, color }: { size?: number; color: string }) {
  const line = { stroke: color, strokeWidth: 32, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <G transform="translate(-16 32) rotate(-40 272 224)">
        <Path d="M240 144H120a24 24 0 0 0-24 24v112a24 24 0 0 0 24 24h120z" fill={Colors.graphite} fillOpacity={0.35} />
        <Rect x={96} y={144} width={352} height={160} rx={24} {...line} />
        <Path d="M240 144v160" {...line} />
      </G>
    </Svg>
  );
}
