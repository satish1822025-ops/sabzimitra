import { Component, Input, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Icon library — outline icons on a 24x24 grid, drawn with `currentColor`.
 * Names marked in SOLID_ICONS render filled instead of stroked.
 */
export const ICONS: Record<string, string> = {
  // ---- Navigation & chrome ----
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  'chevron-down': '<path d="M6 9.5l6 6 6-6"/>',
  'chevron-up': '<path d="M6 14.5l6-6 6 6"/>',
  'chevron-left': '<path d="M14.5 6l-6 6 6 6"/>',
  'chevron-right': '<path d="M9.5 6l6 6-6 6"/>',
  'arrow-right': '<path d="M4 12h15M13 6l6 6-6 6"/>',
  'arrow-left': '<path d="M20 12H5M11 6l-6 6 6 6"/>',
  'arrow-up-right': '<path d="M7 17L17 7M8 7h9v9"/>',
  'external-link': '<path d="M14 4h6v6M20 4l-8 8M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
  home: '<path d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  grid: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  'layout-dashboard': '<path d="M4 4h7v6H4zM13 4h7v10h-7zM4 12h7v8H4zM13 16h7v4h-7z"/>',

  // ---- Search & discovery ----
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  sliders: '<path d="M4 8h10M18 8h2M4 16h4M12 16h8"/><circle cx="16" cy="8" r="2"/><circle cx="10" cy="16" r="2"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2l-1.6 4.4-4.4 1.6 1.6-4.4z"/>',
  'sort-asc': '<path d="M4 7h10M4 12h7M4 17h4M16 17V7M16 7l-2.5 2.5M16 7l2.5 2.5"/>',

  // ---- Location ----
  'map-pin': '<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  map: '<path d="M9 4L4 6v14l5-2 6 2 5-2V4l-5 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
  navigation: '<path d="M20 4L4 11l7 2 2 7z"/>',
  crosshair: '<circle cx="12" cy="12" r="7.5"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.3 3.6 8.5S14.4 18.2 12 20.5c-2.4-2.3-3.6-5.3-3.6-8.5S9.6 5.8 12 3.5z"/>',
  route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18h5a3 3 0 0 0 3-3V8.5"/>',

  // ---- Commerce ----
  store: '<path d="M4 9.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.5"/><path d="M3 9.5L5.2 5A1 1 0 0 1 6.1 4.5h11.8a1 1 0 0 1 .9.5L21 9.5z"/><path d="M9 20v-5.5h6V20"/>',
  cart: '<circle cx="9" cy="19" r="1.6"/><circle cx="17.5" cy="19" r="1.6"/><path d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h9.4a1 1 0 0 0 1-.78L20.5 7H6"/>',
  package: '<path d="M20.5 8.2v7.6a1 1 0 0 1-.53.88l-7.5 3.9a1 1 0 0 1-.94 0l-7.5-3.9a1 1 0 0 1-.53-.88V8.2"/><path d="M3.7 7.6l7.83-3.9a1 1 0 0 1 .94 0l7.83 3.9-8.3 4.2z"/><path d="M12 11.8V20"/>',
  tag: '<path d="M11.6 3.5H19a1.5 1.5 0 0 1 1.5 1.5v7.4a1 1 0 0 1-.3.7l-7.6 7.6a1 1 0 0 1-1.4 0L3.8 13.3a1 1 0 0 1 0-1.4l7.1-7.1a1 1 0 0 1 .7-.3z"/><circle cx="16" cy="8" r="1.4"/>',
  rupee: '<path d="M7 5h10M7 9.5h10M16 5c0 4-3 4.5-6.5 4.5H7l7 9.5"/>',
  wallet: '<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H19a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5z"/><path d="M4 9.5h16M16 13h1.5"/>',
  receipt: '<path d="M6 3h12v18l-3-1.8-3 1.8-3-1.8L6 21z"/><path d="M9.5 8h5M9.5 12h5"/>',
  truck: '<path d="M3 7h10v9H3zM13 11h4l3 3v2h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="16.5" cy="18" r="1.8"/>',

  // ---- Produce ----
  leaf: '<path d="M4 20c0-8 5-14 16-15 1 11-5 16-13 16H4z"/><path d="M4.5 19.5C8 16 12 13.5 16 12"/>',
  carrot: '<path d="M14.5 6.5L20 4l-1.5 5.5"/><path d="M13.2 7.8L4.6 16.4a2 2 0 0 0 0 2.9 2 2 0 0 0 2.9 0l8.6-8.6a2 2 0 0 0-2.9-2.9z"/><path d="M10.5 10.5l2.5 2.5M8 13l2.5 2.5"/>',
  apple: '<path d="M12 8c-4.5-2.5-8 .5-8 5s3.5 8 8 8 8-3.5 8-8-3.5-7.5-8-5z"/><path d="M12 8V4.5M12 4.5c1.6 0 3-1 3-2.5-1.7 0-3 1-3 2.5z"/>',
  sprout: '<path d="M12 21v-8"/><path d="M12 13c0-3.3-2.7-6-6-6 0 3.3 2.7 6 6 6z"/><path d="M12 13c0-3.9 3.1-7 7-7 0 3.9-3.1 7-7 7z"/>',

  // ---- People & account ----
  user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18 20a6.6 6.6 0 0 0-2-4.7"/>',
  'user-plus': '<circle cx="10" cy="8.5" r="3.8"/><path d="M3 20a7 7 0 0 1 14 0"/><path d="M19 8v6M16 11h6"/>',
  'log-in': '<path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/><path d="M15 8l4 4-4 4M9.5 12H19"/>',
  'log-out': '<path d="M13 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7"/><path d="M17 8l4 4-4 4M11.5 12H21"/>',
  'shield-check': '<path d="M12 3l7 3v6c0 4.4-3 8-7 9-4-1-7-4.6-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
  award: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.8L7 21l5-2.5L17 21l-1.5-7.2"/>',

  // ---- Feedback ----
  star: '<path d="M12 3.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.8l6-.8z"/>',
  'star-filled': '<path d="M12 3.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.8l6-.8z"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.5 3c0 5-7.5 9.6-7.5 9.6z"/>',
  'heart-filled': '<path d="M12 20s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.5 3c0 5-7.5 9.6-7.5 9.6z"/>',
  'thumbs-up': '<path d="M7 10.5V20H4.5a.5.5 0 0 1-.5-.5v-8.5a.5.5 0 0 1 .5-.5z"/><path d="M7 11l3.5-7A2 2 0 0 1 14 5.5V10h4.6a1.6 1.6 0 0 1 1.57 1.9l-1.2 6A2 2 0 0 1 17 19.5H7"/>',
  sparkles: '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  flame: '<path d="M12 21c3.6 0 6-2.4 6-5.6 0-4.4-4.5-5.4-4.5-9.4-2.5 1.4-3.2 3.6-3.2 5.4 0 1.3-.9 1.9-1.6 1.3-.7-.6-.7-1.7-.7-1.7C6.7 12.4 6 14 6 15.4 6 18.6 8.4 21 12 21z"/>',

  // ---- Status ----
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  'check-circle': '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8"/>',
  'alert-circle': '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v5M12 16h.01"/>',
  'alert-triangle': '<path d="M12 4l8.5 15H3.5z"/><path d="M12 9.5v4M12 16.5h.01"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
  'x-circle': '<circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5l5 5M14.5 9.5l-5 5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3.2 2"/>',
  calendar: '<path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v11A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5z"/><path d="M4 10.5h16M8.5 4v3.5M15.5 4v3.5"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4h-4"/>',
  loader: '<path d="M12 3.5v3.2M12 17.3v3.2M4.9 4.9l2.3 2.3M16.8 16.8l2.3 2.3M3.5 12h3.2M17.3 12h3.2M4.9 19.1l2.3-2.3M16.8 7.2l2.3-2.3"/>',

  // ---- Contact ----
  phone: '<path d="M5 4h3.2l1.6 4-2 1.4a11 11 0 0 0 5.3 5.3l1.4-2 4 1.6V19a1.5 1.5 0 0 1-1.7 1.5A15.5 15.5 0 0 1 3.5 5.7 1.5 1.5 0 0 1 5 4z"/>',
  whatsapp:
    '<path d="M12 3.5A8.4 8.4 0 0 0 4.7 16.2L3.6 20.4l4.3-1.1A8.4 8.4 0 1 0 12 3.5z"/><path d="M9.2 9c0 3 2 5 4.6 5.6.5-.3.8-.8.8-1.3l-1.6-.8-.8.8a4.6 4.6 0 0 1-1.8-1.8l.8-.8-.8-1.6c-.6 0-1.1.4-1.2.9z"/>',
  message: '<path d="M20 12.5c0 3.9-3.6 7-8 7a9 9 0 0 1-2.3-.3L5 21l1-3.4A6.6 6.6 0 0 1 4 12.5c0-3.9 3.6-7 8-7s8 3.1 8 7z"/>',
  send: '<path d="M20.5 3.5L10 14M20.5 3.5l-6.5 17-3.6-6.8-6.9-3.6z"/>',
  mail: '<path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5z"/><path d="M4.5 7l7.5 6 7.5-6"/>',
  bell: '<path d="M18 15.5V11a6 6 0 1 0-12 0v4.5L4.5 18h15z"/><path d="M9.8 18a2.2 2.2 0 0 0 4.4 0"/>',
  share: '<circle cx="18" cy="6" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>',
  copy: '<path d="M9 9h9.5A1.5 1.5 0 0 1 20 10.5V20a1.5 1.5 0 0 1-1.5 1.5H9A1.5 1.5 0 0 1 7.5 20v-9.5A1.5 1.5 0 0 1 9 9z"/><path d="M5.5 15H5a1.5 1.5 0 0 1-1.5-1.5V4A1.5 1.5 0 0 1 5 2.5h8.5A1.5 1.5 0 0 1 15 4v.5"/>',
  paperclip: '<path d="M20 11.5l-7.8 7.8a4.5 4.5 0 0 1-6.4-6.4l7.4-7.4a3 3 0 0 1 4.3 4.3l-7.4 7.4a1.5 1.5 0 0 1-2.2-2.2l6.8-6.8"/>',
  mic: '<path d="M12 4a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3z"/><path d="M6.5 11a5.5 5.5 0 0 0 11 0M12 16.5V20"/>',

  // ---- Editing ----
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  edit: '<path d="M4 20h4l11-11-4-4L4 16z"/><path d="M13.5 5.5l4 4"/>',
  trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.9 12.1A1.5 1.5 0 0 0 8.9 20.5h6.2a1.5 1.5 0 0 0 1.5-1.4L17.5 7"/>',
  save: '<path d="M5 4h11l3 3v13H5z"/><path d="M8.5 4v5h6V4M8.5 20v-6h7v6"/>',
  camera: '<path d="M4 9.5A1.5 1.5 0 0 1 5.5 8h1.7l1.3-2h7l1.3 2h1.7A1.5 1.5 0 0 1 20 9.5v8A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.2"/>',
  image: '<path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="9" cy="10" r="1.6"/><path d="M4.5 17l5-5 4 4 2.5-2.5 4 4"/>',
  upload: '<path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15"/><path d="M8 8.5L12 4.5l4 4M12 4.5V15"/>',
  eye: '<path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
  'eye-off': '<path d="M4 4l16 16"/><path d="M9.6 5.9A9.4 9.4 0 0 1 12 5.6c6 0 9.5 6.4 9.5 6.4a17 17 0 0 1-2.8 3.6M6.4 8A16.4 16.4 0 0 0 2.5 12s3.5 6.4 9.5 6.4a9 9 0 0 0 3-.5"/><path d="M10 10a2.8 2.8 0 0 0 4 4"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M12 3.5l.8 2.1a7 7 0 0 1 1.7.7l2-1 1.8 1.8-1 2a7 7 0 0 1 .7 1.7l2.1.8v2.5l-2.1.8a7 7 0 0 1-.7 1.7l1 2-1.8 1.8-2-1a7 7 0 0 1-1.7.7l-.8 2.1H9.5l-.8-2.1a7 7 0 0 1-1.7-.7l-2 1-1.8-1.8 1-2a7 7 0 0 1-.7-1.7L1.4 13v-2.5"/>',
  'more-vertical': '<circle cx="12" cy="5.5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="18.5" r="1.4"/>',

  // ---- Data ----
  'trending-up': '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  'trending-down': '<path d="M3 7l6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
  'bar-chart': '<path d="M5 20V11M12 20V4M19 20v-6"/>',
  activity: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  boxes: '<path d="M4 5h6v6H4zM14 5h6v6h-6zM9 13h6v6H9z"/>',

  // ---- Theme ----
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
};

const SOLID_ICONS = new Set(['star-filled', 'heart-filled', 'flame']);

@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      [attr.fill]="isSolid() ? 'currentColor' : 'none'"
      [attr.stroke]="isSolid() ? 'none' : 'currentColor'"
      [attr.stroke-width]="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
      [innerHTML]="markup()"
    ></svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: none;
        line-height: 0;
      }
    `,
  ],
})
export class IconComponent {
  private readonly nameSig = signal<string>('info');

  @Input({ required: true })
  set name(value: string) {
    this.nameSig.set(value);
  }
  get name(): string {
    return this.nameSig();
  }

  @Input() size: number | string = 20;
  @Input() strokeWidth: number | string = 1.6;

  readonly isSolid = computed(() => SOLID_ICONS.has(this.nameSig()));

  readonly markup = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(ICONS[this.nameSig()] ?? ICONS['info'])
  );

  constructor(private sanitizer: DomSanitizer) {}
}
