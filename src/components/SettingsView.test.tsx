// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { SettingsView } from '../components/SettingsView';
import { MainMenu } from '../components/MainMenu';
import { translations } from '../services/i18n';

describe('SettingsView and MainMenu Integration', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders MainMenu with Settings button', () => {
    const onNavigateToScanner = vi.fn();
    const onNavigateToLibrary = vi.fn();
    const onNavigateToSettings = vi.fn();

    render(
      <MainMenu
        onNavigateToScanner={onNavigateToScanner}
        onNavigateToLibrary={onNavigateToLibrary}
        onNavigateToSettings={onNavigateToSettings}
        bookCount={3}
        t={translations.cs}
        currentLanguage="cs"
        currentTheme="default"
      />
    );

    expect(screen.getByText('Nastavení')).toBeDefined();
    expect(screen.getByText('Spustit skener')).toBeDefined();
    expect(screen.getByText('Moje knihovna')).toBeDefined();

    const settingsBtn = screen.getByText('Nastavení');
    fireEvent.click(settingsBtn);
    expect(onNavigateToSettings).toHaveBeenCalledTimes(1);
  });

  it('renders SettingsView with languages and 8 themes options', () => {
    const onSelectLanguage = vi.fn();
    const onSelectTheme = vi.fn();
    const onBackToMenu = vi.fn();

    render(
      <SettingsView
        currentLanguage="cs"
        onSelectLanguage={onSelectLanguage}
        currentTheme="default"
        onSelectTheme={onSelectTheme}
        onBackToMenu={onBackToMenu}
        t={translations.cs}
      />
    );

    // Check language options
    expect(screen.getByText('Čeština')).toBeDefined();
    expect(screen.getByText('English')).toBeDefined();
    expect(screen.getByText('Español')).toBeDefined();

    // Check theme options
    expect(screen.getByText('Výchozí (Tmavě modrá)')).toBeDefined();
    expect(screen.getByText('Světlý (Bílá)')).toBeDefined();
    expect(screen.getByText('Šedý (Neutral Gray)')).toBeDefined();
    expect(screen.getByText('Zelený (Smaragd)')).toBeDefined();

    // Click English language
    fireEvent.click(screen.getByText('English'));
    expect(onSelectLanguage).toHaveBeenCalledWith('en');

    // Click Light theme
    fireEvent.click(screen.getByText('Světlý (Bílá)'));
    expect(onSelectTheme).toHaveBeenCalledWith('light');

    // Click Back to Menu
    fireEvent.click(screen.getByText('Zpět do nabídky'));
    expect(onBackToMenu).toHaveBeenCalledTimes(1);
  });

  it('translates MainMenu correctly when English language is passed', () => {
    render(
      <MainMenu
        onNavigateToScanner={() => {}}
        onNavigateToLibrary={() => {}}
        onNavigateToSettings={() => {}}
        bookCount={1}
        t={translations.en}
        currentLanguage="en"
        currentTheme="default"
      />
    );

    expect(screen.getByText('Settings')).toBeDefined();
    expect(screen.getByText('Start Scanner')).toBeDefined();
    expect(screen.getByText('My Library')).toBeDefined();
  });
});
