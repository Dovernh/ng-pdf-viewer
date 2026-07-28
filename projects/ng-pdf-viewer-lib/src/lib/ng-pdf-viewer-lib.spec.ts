import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgPdfViewerLib } from './ng-pdf-viewer-lib';

describe('NgPdfViewerLib', () => {
  let component: NgPdfViewerLib;
  let fixture: ComponentFixture<NgPdfViewerLib>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgPdfViewerLib],
    }).compileComponents();

    fixture = TestBed.createComponent(NgPdfViewerLib);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
