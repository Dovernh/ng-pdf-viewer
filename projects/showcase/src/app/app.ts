import { Component, computed, signal } from '@angular/core';
import { NgPdfViewerLib } from 'ng-pdf-viewer-lib';
import type { NgPdfViewerTheme } from 'ng-pdf-viewer-lib';

const SAMPLE_PDF =
  'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf';

@Component({
  selector: 'app-root',
  imports: [NgPdfViewerLib],
  template: `
    <main class="harness">
      <header>
        <h1>ng-pdf-viewer — test harness</h1>
        <p>Edit the library source and reload; no build or pack required.</p>
      </header>

      <form class="controls" (submit)="$event.preventDefault()">
        <label>
          <span>PDF source URL</span>
          <input
            type="url"
            name="src"
            [value]="src()"
            (input)="src.set(asInput($event).value)"
            placeholder="https://…/file.pdf"
          />
        </label>

        <label>
          <span>Height</span>
          <input
            type="text"
            name="height"
            [value]="height()"
            (input)="height.set(asInput($event).value)"
            placeholder="650px"
          />
        </label>

        <fieldset class="theme">
          <legend>Theme</legend>
          @for (option of themes; track option) {
            <label class="radio">
              <input
                type="radio"
                name="theme"
                [value]="option"
                [checked]="theme() === option"
                (change)="theme.set(option)"
              />
              <span>{{ option }}</span>
            </label>
          }
        </fieldset>
      </form>

      <section class="viewer" aria-label="PDF viewer preview">
        @if (src()) {
          <ng-pdf-viewer-lib [src]="src()" [height]="height()" [themePreference]="config()" />
        } @else {
          <p class="empty">Enter a PDF source URL to render the viewer.</p>
        }
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100dvh;
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      color: #1a1a1a;
    }
    .harness {
      max-width: 960px;
      margin-inline: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    header h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    header p {
      margin: 0.25rem 0 0;
      color: #555;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: flex-end;
    }
    .controls label {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .controls input[type='url'],
    .controls input[type='text'] {
      padding: 0.5rem 0.6rem;
      border: 1px solid #bbb;
      border-radius: 6px;
      font-size: 0.95rem;
      min-width: 22rem;
    }
    .controls input[type='text'] {
      min-width: 8rem;
    }
    fieldset.theme {
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    fieldset.theme legend {
      font-size: 0.85rem;
      font-weight: 600;
      padding-inline: 0.35rem;
    }
    .radio {
      flex-direction: row !important;
      align-items: center;
      gap: 0.3rem !important;
      font-weight: 400 !important;
    }
    .viewer {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }
    .empty {
      padding: 2rem;
      text-align: center;
      color: #777;
    }
  `,
})
export class App {
  protected readonly src = signal(SAMPLE_PDF);
  protected readonly height = signal('650px');
  protected readonly theme = signal<NgPdfViewerTheme>('system');

  protected readonly themes: readonly NgPdfViewerTheme[] = ['system', 'light', 'dark'];
  protected readonly config = computed(() => ({ theme: this.theme() }));

  protected asInput(event: Event): HTMLInputElement {
    return event.target as HTMLInputElement;
  }
}
