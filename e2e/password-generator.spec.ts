import { expect, test } from '@playwright/test';

test.describe('Generatore di password', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/password-generator');
  });

  test('parte con 16 caratteri di tutti i tipi e una password forte', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Generatore di password');
    await expect(page.getByTestId('password-value')).toHaveText(/^\S{16}$/);
    await expect(page.getByTestId('password-length')).toHaveText('16 caratteri');
    for (const label of ['Lettere maiuscole', 'Lettere minuscole', 'Numeri', 'Caratteri speciali']) {
      await expect(page.getByLabel(label)).toBeChecked();
    }
    const strength = page.getByTestId('password-strength');
    await expect(strength).toHaveAttribute('data-level', 'strong');
    await expect(strength).toContainText('Sicurezza: Forte');
  });

  test('lunghezza e tipi di caratteri cambiano password e sicurezza', async ({ page }) => {
    const slider = page.getByRole('slider', { name: 'Lunghezza' });
    await slider.focus();
    await page.keyboard.press('Home');
    await expect(page.getByTestId('password-length')).toHaveText('10 caratteri');
    await expect(page.getByTestId('password-strength')).toHaveAttribute('data-level', 'fair');
    await expect(page.getByTestId('password-strength')).toContainText('servono almeno 13 caratteri');

    await page.getByLabel('Lettere maiuscole').uncheck();
    await page.getByLabel('Caratteri speciali').uncheck();
    await expect(page.getByTestId('password-value')).toHaveText(/^[a-z0-9]{10}$/);
    await expect(page.getByTestId('password-strength')).toHaveAttribute('data-level', 'weak');
    await expect(page.getByTestId('password-strength')).toContainText('Debole');

    await slider.focus();
    await page.keyboard.press('End');
    await expect(page.getByTestId('password-value')).toHaveText(/^[a-z0-9]{30}$/);
    await expect(page.getByTestId('password-strength')).toHaveAttribute('data-level', 'strong');
  });

  test('almeno un tipo di caratteri resta selezionato', async ({ page }) => {
    await page.getByLabel('Lettere maiuscole').uncheck();
    await page.getByLabel('Lettere minuscole').uncheck();
    await page.getByLabel('Caratteri speciali').uncheck();
    await expect(page.getByLabel('Numeri')).toBeChecked();
    await expect(page.getByLabel('Numeri')).toBeDisabled();
    await expect(page.getByText('Almeno un tipo di caratteri deve restare selezionato.')).toBeVisible();
    await expect(page.getByTestId('password-value')).toHaveText(/^\d{16}$/);
  });

  test('genera di nuovo e copia la password', async ({ page }) => {
    const value = page.getByTestId('password-value');
    const first = await value.textContent();
    await page.getByRole('button', { name: 'Genera di nuovo' }).click();
    await expect(value).not.toHaveText(first!);

    await page.getByRole('button', { name: 'Copia password' }).click();
    await expect(page.getByRole('button', { name: 'Copiato' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await value.textContent());
  });
});
