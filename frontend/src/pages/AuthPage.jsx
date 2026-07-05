import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import { useAuth } from '../state/AuthContext.jsx';

export function AuthPage() {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', profile_type: 'pessoal' });

  if (user) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Nao foi possivel entrar');
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand"><Landmark size={34} /><strong>Gestao Financeira Inteligente</strong></div>
        <h1>{mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}</h1>
        <form onSubmit={submit}>
          {mode === 'register' && (
            <>
              <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input placeholder="Telefone opcional" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <select value={form.profile_type} onChange={(e) => setForm({ ...form, profile_type: e.target.value })}>
                <option value="pessoal">Pessoal</option>
                <option value="empresa">Empresa</option>
                <option value="ambos">Ambos</option>
              </select>
            </>
          )}
          <input type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input type="password" placeholder="Senha" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {error && <div className="error">{error}</div>}
          <button type="submit">{mode === 'login' ? 'Entrar' : 'Cadastrar'}</button>
        </form>
        <button className="link-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Criar nova conta' : 'Ja tenho cadastro'}
        </button>
      </section>
    </div>
  );
}
