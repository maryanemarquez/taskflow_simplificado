/** Rotas do app em um só lugar. Os caminhos seguem os nomes dos arquivos em `app/`. */
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/cadastro',
  noTeam: '/sem-equipe',
  dashboard: '/dashboard',
  tasks: '/tarefas',
  members: '/membros',
} as const;
