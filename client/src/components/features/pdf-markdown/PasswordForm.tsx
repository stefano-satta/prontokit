import { KeyRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '../../common/Button';
import { TextField } from '../../common/TextField';

interface PasswordFormProps {
  incorrect: boolean;
  onSubmit: (password: string) => void;
}

/** La password resta in memoria solo per aprire il file e non viene salvata. */
export function PasswordForm({ incorrect, onSubmit }: PasswordFormProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password) onSubmit(password);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end" noValidate>
      <TextField
        label="Il PDF è protetto da password"
        type="password"
        autoComplete="off"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={incorrect ? 'Password errata, riprova.' : null}
        hint="Serve solo per aprire il file nel tuo browser."
        className="flex-1"
        autoFocus
      />
      <Button type="submit" size="lg" disabled={!password} icon={<KeyRound className="size-[18px]" aria-hidden />}>
        Sblocca
      </Button>
    </form>
  );
}
