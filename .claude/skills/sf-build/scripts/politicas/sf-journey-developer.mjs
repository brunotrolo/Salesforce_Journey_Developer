// Política do odin-guard para esta skill (ADR 0027 do Odin): as mesmas regras dos hooks guard-deploy.mjs e guard-test-content.mjs,
// aplicadas depois do `odin ensure sf-journey-developer`. Deploy só na org alvo (SF_TARGET_ORG), escopado e com portão de evidência.
import { decidirDeploy } from './../guard-deploy.mjs';
import { decidirConteudoTeste } from './../guard-test-content.mjs';

export default function politica(evento) {
  const entrada = evento?.tool_input ?? {};
  if (evento?.tool_name === 'Bash') return decidirDeploy(entrada.command);
  if (evento?.tool_name === 'Write' || evento?.tool_name === 'Edit') return decidirConteudoTeste(entrada);
  return null;
}
