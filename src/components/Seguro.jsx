import { Component } from 'react';

// se o componente do jogador quebrar, só o pedaço dele mostra o erro
export class Seguro extends Component {
  state = { quebrou: false };

  static getDerivedStateFromError() {
    return { quebrou: true };
  }

  render() {
    if (this.state.quebrou) return <span className="seguro__erro">erro ao desenhar</span>;
    return this.props.children;
  }
}
