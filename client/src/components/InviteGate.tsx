import { useState } from 'react';
import { redeemInvite } from '../invites';
import Spinner from './Spinner';

function friendlyError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

interface Props {
  onActivated: () => void;
}

export default function InviteGate({ onActivated }: Props) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await redeemInvite(code);
      onActivated();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card sign-in">
      <h2>One more step</h2>
      <p className="setup">Enter an invite code to finish setting up your account.</p>
      <form onSubmit={submit}>
        <label>
          Invite code
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            required
          />
        </label>
        <button type="submit" disabled={busy}>
          {busy && <Spinner />}
          Continue
        </button>
      </form>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
