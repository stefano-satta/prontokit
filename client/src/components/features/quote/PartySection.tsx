import type { QuoteParty, QuotePartyRole } from '../../../models/quote';
import { TextField } from '../../common/TextField';
import { inlineError, type FieldErrors } from './fieldErrors';
import { QuoteSection } from './QuoteSection';

interface PartySectionProps {
  role: QuotePartyRole;
  party: QuoteParty;
  errors: FieldErrors;
  onChange: (role: QuotePartyRole, key: keyof QuoteParty, value: string) => void;
}

const COPY: Record<QuotePartyRole, { title: string; description: string; name: string; namePlaceholder: string }> = {
  supplier: {
    title: 'I tuoi dati',
    description: 'Chi emette il preventivo: compaiono in alto a sinistra.',
    name: 'Nome o ragione sociale',
    namePlaceholder: 'Es. Rossi Design di Mario Rossi',
  },
  client: {
    title: 'Cliente',
    description: 'A chi è rivolto il preventivo. Per un privato bastano nome e contatti.',
    name: 'Nome o ragione sociale del cliente',
    namePlaceholder: 'Es. Bianchi Srl',
  },
};

export function PartySection({ role, party, errors, onChange }: PartySectionProps) {
  const copy = COPY[role];
  const field = (key: keyof QuoteParty) => ({
    value: party[key],
    onChange: (event: { target: { value: string } }) => onChange(role, key, event.target.value),
  });

  return (
    <QuoteSection title={copy.title} description={copy.description}>
      <TextField label={copy.name} placeholder={copy.namePlaceholder} maxLength={120} autoComplete={role === 'supplier' ? 'organization' : 'off'} {...field('name')} error={inlineError(errors, `${role}.name`, party.name)} />
      <div className="grid gap-5 @lg:grid-cols-2">
        <TextField label="Indirizzo" placeholder="Es. Via Roma 12" maxLength={120} optional {...field('address')} />
        <TextField label="CAP, città e provincia" placeholder="Es. 20121 Milano (MI)" maxLength={120} optional {...field('city')} />
        <TextField label="Partita IVA" placeholder="Es. 01234567890" maxLength={30} optional {...field('vatNumber')} />
        <TextField label="Codice fiscale" maxLength={30} optional autoCapitalize="characters" {...field('taxCode')} />
        <TextField label="Email" type="email" maxLength={120} optional {...field('email')} />
        <TextField label="Telefono" type="tel" maxLength={40} optional {...field('phone')} />
        <TextField label="Paese" placeholder="Solo se diverso dall'Italia" maxLength={60} optional {...field('country')} />
        {role === 'supplier' && <TextField label="Sito web" placeholder="Es. rossidesign.it" maxLength={120} optional {...field('website')} />}
      </div>
    </QuoteSection>
  );
}
