import { useState } from 'react';

// Imitação do React Native com HTML. O data-rn é o que os testes usam pra
// checar as regras do celular, como texto fora de <Text>.

function juntarEstilos(estilo) {
  if (!estilo) return undefined;
  if (Array.isArray(estilo)) return Object.assign({}, ...estilo.map(juntarEstilos));
  return estilo;
}

export function View({ style, children }) {
  return (
    <div data-rn="View" className="rn-view" style={juntarEstilos(style)}>
      {children}
    </div>
  );
}

export function Text({ style, children }) {
  return (
    <span data-rn="Text" className="rn-text" style={juntarEstilos(style)}>
      {children}
    </span>
  );
}

// no RN, style e children podem ser funções que recebem { pressed }
export function Pressable({ onPress, style, children, disabled }) {
  const [pressed, setPressed] = useState(false);
  const estilo = typeof style === 'function' ? style({ pressed }) : style;
  const conteudo = typeof children === 'function' ? children({ pressed }) : children;

  return (
    <button
      type="button"
      data-rn="Pressable"
      className="rn-pressable"
      style={juntarEstilos(estilo)}
      disabled={disabled}
      onClick={onPress}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
    >
      {conteudo}
    </button>
  );
}

export const StyleSheet = {
  create: (estilos) => estilos,
  flatten: juntarEstilos,
};
