import {
  afterNextRender,
  Component,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
} from '@angular/core';
import { NgPdfViewerConfig } from './ng-pdf-viewer.config';
import { isPlatformBrowser } from '@angular/common';
import { EmbedPdfContainer } from '@embedpdf/snippet';

@Component({
  selector: 'ng-pdf-viewer-lib',
  imports: [],
  template: `
    @if (isBrowser) {
      <div [style.height]="height()"></div>
    }
  `,
  styles: ``,
})
export class NgPdfViewerLib {
  readonly src = input.required<string>();
  readonly height = input<string>('650px');
  readonly themePreference = input<NgPdfViewerConfig>({ theme: 'system' });

  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  #platformId = inject(PLATFORM_ID);
  #doc = inject(DOCUMENT);
  #elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  #pdfContainer?: EmbedPdfContainer;

  constructor() {
    afterNextRender(() => {
      this.initViewer();
    });
  }

  private async initViewer() {
    const { default: EmbedPDF } = await import('@embedpdf/snippet');
    const container = this.#elementRef.nativeElement.querySelector('div');

    if (container) {
      this.#pdfContainer = EmbedPDF.init({
        type: 'container',
        target: container,
        src: this.src(),
        theme: { preference: this.themePreference() },
      });
    }
  }
}
