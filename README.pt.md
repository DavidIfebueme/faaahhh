# Faaahhh

Faaahhh é uma extensão do VS Code que reproduz um som quando a execução de testes falha.

## Funcionalidades

- Deteta execuções de testes falhadas a partir de comandos de teste no terminal integrado.
- Deteta tarefas orientadas a testes falhadas a partir de eventos de fim de processo de tarefas do VS Code.
- Utiliza eventos de resultado da Testing API quando disponíveis na superfície da API de tempo de execução.
- Aplica lógica de cooldown e deduplicação para evitar spam repetido.
- Suporta áudio integrado e caminhos de ficheiros de áudio personalizados.
- Fornece o comando `Faaahhh: Testar Som` para validação rápida.
- Regista logs de deteção e reprodução no canal de saída `Faaahhh`.

## Configuração

- `faaahhh.enabled`: Ativa ou desativa a reprodução.
- `faaahhh.cooldownMs`: Tempo mínimo entre sons reproduzidos.
- `faaahhh.audioSource`: `bundled` ou `custom`.
- `faaahhh.customAudioPath`: Caminho absoluto para ficheiro de áudio personalizado.
- `faaahhh.terminalCommandPatterns`: Fragmentos de comando reconhecidos como testes.
- `faaahhh.dedupeWindowMs`: Janela de supressão de duplicados para detetores sobrepostos.

## Notas

- O ficheiro `media/faaahhh.mp3` integrado está incluído como recurso de exemplo neste repositório. Substitua-o pelo seu som final preferido antes de publicar.
- No Linux e macOS, a extensão utiliza reprodutores de áudio do sistema (`paplay`, `aplay`, `ffplay`, `afplay`) quando disponíveis.
- No Windows, a reprodução atualmente utiliza o `Media.SoundPlayer` do PowerShell, que é mais confiável com ficheiros WAV.
- A cobertura da Testing API depende do suporte da API de tempo de execução e da integração do fornecedor de testes.

## Desenvolvimento

- Instalar dependências: `npm install`
- Compilar: `npm run build`
- Testar: `npm test`

## Comando

- `Faaahhh: Testar Som` (`faaahhh.testSound`)
