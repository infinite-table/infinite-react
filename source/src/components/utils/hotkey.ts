import type { KeyboardEvent } from 'react';

type KeyModifier = 'cmd' | 'alt' | 'ctrl' | 'shift';

const KeyModifierAliases: Record<string, KeyModifier> = {
  control: 'ctrl',
};

const keyModifierChecker: Record<
  KeyModifier,
  (event: HotKeyEventDescriptor) => boolean
> = {
  cmd: (event) => event.metaKey,
  alt: (event) => event.altKey,
  ctrl: (event) => event.ctrlKey,
  shift: (event) => event.shiftKey,
};

const keyModifierNames = Object.keys(keyModifierChecker) as KeyModifier[];
const keyModifierSet = new Set(keyModifierNames);

type HotKeyEventDescriptor = {
  key: KeyboardEvent['key'];
  metaKey: KeyboardEvent['metaKey'];
  altKey: KeyboardEvent['altKey'];
  ctrlKey: KeyboardEvent['ctrlKey'];
  shiftKey: KeyboardEvent['shiftKey'];
};

export function eventMatchesKeyboardShortcut(
  event: HotKeyEventDescriptor,
  keyDescriptors: string | string[],
) {
  if (!Array.isArray(keyDescriptors)) {
    return eventMatchesSingleShortcut(event, keyDescriptors);
  }

  return keyDescriptors.some((keyDescriptor) =>
    eventMatchesSingleShortcut(event, keyDescriptor),
  );
}
export function eventToKeyDescriptor(event: HotKeyEventDescriptor): string {
  let descriptor = ``;

  if (event.metaKey) {
    descriptor += 'cmd+';
  }
  if (event.altKey) {
    descriptor += 'alt+';
  }
  if (event.ctrlKey) {
    descriptor += 'ctrl+';
  }
  if (event.shiftKey) {
    descriptor += 'shift+';
  }
  const keyLowercase = event.key.toLowerCase();
  if (!keyModifierChecker[keyLowercase as KeyModifier]) {
    descriptor += keyLowercase;
  }
  if (descriptor.endsWith('+')) {
    descriptor = descriptor.slice(0, -1);
  }

  return descriptor;
}
function eventMatchesSingleShortcut(
  event: HotKeyEventDescriptor,
  keyDescriptor: string,
) {
  const keyLowercase = event.key.toLowerCase();
  const parts = keyDescriptor
    .split('+')
    .map((part) => part.toLowerCase().trim())
    .map((part) => KeyModifierAliases[part] || part);

  const expectedModifiers = parts.filter((part) =>
    keyModifierSet.has(part as KeyModifier),
  );

  const currentModifierMatches = keyModifierNames.reduce((acc, modifier) => {
    acc[modifier] = keyModifierChecker[modifier](event);
    return acc;
  }, {} as Record<KeyModifier, boolean>);

  const currentModifierMatchesList = Object.keys(currentModifierMatches).filter(
    (key) => currentModifierMatches[key as KeyModifier],
  );

  const hasAllModifiers = expectedModifiers.every(
    (modifier) => currentModifierMatches[modifier as KeyModifier] === true,
  );

  if (!hasAllModifiers) {
    return false;
  }

  if (expectedModifiers.length != currentModifierMatchesList.length) {
    return false;
  }

  return parts.reduce((acc: boolean, part: string) => {
    if (!acc) {
      return false;
    }

    if (keyModifierChecker[part as KeyModifier]) {
      return keyModifierChecker[part as KeyModifier](event);
    }

    return part === '*' || keyLowercase === part;
  }, true);
}

export function keyboardShortcutBinding(
  keyDescriptor: string | string[],
  callback: (event: KeyboardEvent) => void,
) {
  return (event: KeyboardEvent) => {
    if (eventMatchesKeyboardShortcut(event, keyDescriptor)) {
      callback(event);
    }
  };
}
