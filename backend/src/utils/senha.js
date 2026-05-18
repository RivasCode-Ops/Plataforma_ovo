import crypto from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(crypto.scrypt);

export async function hashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = (await scrypt(senha, salt, 64)).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export async function verificarSenha(senha, armazenada) {
  if (!armazenada?.startsWith('scrypt$')) return false;
  const [, salt, hash] = armazenada.split('$');
  if (!salt || !hash) return false;
  const derived = (await scrypt(senha, salt, 64)).toString('hex');
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(derived, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
