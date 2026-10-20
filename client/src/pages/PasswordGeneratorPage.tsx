import { KeyRound, RefreshCw } from 'lucide-react';
import { Button } from '../components/common/Button';
import { CopyButton } from '../components/common/CopyButton';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { PrivacyNote } from '../components/common/PrivacyNote';
import { CharacterSetOptions } from '../components/features/password-generator/CharacterSetOptions';
import { LengthSlider } from '../components/features/password-generator/LengthSlider';
import { PasswordDisplay } from '../components/features/password-generator/PasswordDisplay';
import { StrengthMeter } from '../components/features/password-generator/StrengthMeter';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePasswordGenerator } from '../hooks/usePasswordGenerator';

export default function PasswordGeneratorPage() {
  useDocumentTitle('Generatore di password');
  const { options, password, strength, toggleSet, setLength, regenerate } = usePasswordGenerator();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <PageHeader
          icon={KeyRound}
          title="Generatore di password"
          description="Scegli lunghezza e tipi di caratteri: la password si aggiorna subito e l'indicatore ti dice quanto è sicura."
        />
        <PrivacyNote
          title="La password non lascia il tuo dispositivo."
          description="Viene generata nel browser con il generatore casuale crittografico e non viene salvata né inviata."
        />
      </div>

      <Panel className="flex flex-col gap-6 p-6 sm:p-8" aria-label="Password generata">
        <PasswordDisplay password={password} />
        <StrengthMeter strength={strength} />
        <div className="flex flex-wrap gap-3">
          <CopyButton value={password} label="Copia password" variant="primary" size="lg" />
          <Button
            size="lg"
            variant="secondary"
            onClick={regenerate}
            icon={<RefreshCw className="size-[18px]" aria-hidden />}
          >
            Genera di nuovo
          </Button>
        </div>
        
      </Panel>

      <Panel className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]" aria-label="Opzioni">
        <CharacterSetOptions selected={options.sets} onToggle={toggleSet} />
        <LengthSlider value={options.length} onChange={setLength} />
      </Panel>
    </div>
  );
}
