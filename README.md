# Migração R2 — login e baixa de boleto no Firebase

Atualizações incluídas:

- Login personalizado com `@usuario` e senha.
- Conversão interna de `@caue` para `caue@sistema.local`.
- Fluxo de primeiro acesso com troca da senha temporária.
- Sessão mantida no navegador até o usuário clicar em **Sair**.
- Status **Baixa Boleto** sincronizado no Firebase Realtime Database.
- Alterações de **PENDENTE/OK** aparecem para todos os usuários logados.
- Registro do usuário e horário da alteração no Firebase.
- Vendas continuam sendo carregadas pelo mesmo Apps Script.

## Primeiro acesso

1. Entre com o usuário, por exemplo `@caue`.
2. Informe a senha temporária cadastrada no Firebase Authentication.
3. Defina uma nova senha com pelo menos 8 caracteres.
4. O painel será liberado e a nova senha será usada nos próximos acessos.
