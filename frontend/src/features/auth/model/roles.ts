import type { CurrentUser, Role } from './authTypes';

/** Regras de papel em um só lugar: o Dono gerencia a equipe; o Membro participa dela. */
export function isOwnerRole(role: Role | undefined): boolean {
  return role === 'DONO';
}

export function isOwner(user: CurrentUser): boolean {
  return isOwnerRole(user.equipe?.papel);
}
